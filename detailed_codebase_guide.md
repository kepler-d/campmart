# Comprehensive Codebase Guide - Campus Marketplace Hub (Campmart)

This document provides an exhaustive, line-by-line and concept-by-concept breakdown of every major file and system in the Campmart codebase.

---

## 1. Backend Architecture (`minor/backend/`)

The backend is an Express.js application connected to a MongoDB Atlas database using Mongoose. It also hosts a Socket.io server for real-time messaging.

### 1.1 `server.js` (Entry Point)
- **Dependencies**: Imports `express`, `cors`, `http`, `socket.io`, `dotenv` (to load `.env`), and custom modules `routes/api.js` and `db.js`.
- **Initialization**: 
  - Creates the `app` instance using `express()`.
  - Creates an HTTP server wrapping the Express app using `http.createServer(app)`.
  - Attaches `Server` from `socket.io` to this HTTP server. It configures CORS to allow connections from any origin `*` since the frontend (Vite) runs on a different port during development (5500 vs 5000).
- **Middleware**:
  - `app.use(cors())`: Allows cross-origin requests.
  - `app.use(express.json({ limit: '10mb' }))`: Parses incoming JSON payloads, with a high limit (10mb) likely to support base64 encoded images.
- **Routing**: `app.use('/api', apiRoutes)` routes all API traffic through the endpoints defined in `api.js`.
- **Socket.io Real-time Logic**:
  - `io.on('connection')`: Listens for new WebSocket clients connecting.
  - `socket.on('joinThread')`: When a user opens a chat, they join a specific "thread" room based on the `threadId`.
  - `socket.on('sendMessage')`: When a message is sent, the backend fetches the `MessageThread` from MongoDB. It enforces a maximum of 20 messages per thread. It pushes the new message into the thread's array, increments the `unreadCount` for the receiving user, saves to MongoDB, and then broadcasts the message using `io.emit('receiveMessage', data)` so the React frontend can update immediately.
- **Startup**: It calls `initDb()` from `db.js`. Only after the database connection is successfully established does it call `server.listen(PORT)`, ensuring the app doesn't run without a database.

### 1.2 `db.js` (Database & Schemas)
- **Schemas**: Uses `mongoose.Schema` to define the shape of documents in MongoDB.
  - `listingSchema`: Defines products. Includes `title`, `price`, `rentPrice`, `isRentOnly`, `image`, `seller` info, and `status` ('available', 'rented', 'sold'). It uses `{ strict: false }` meaning fields not explicitly defined can still be saved.
  - `profileSchema`: User details including `email`, `password` (currently stored plain-text but noted for future hashing), `rank`, `points`, `listingsCount`.
  - `messageThreadSchema`: Stores chat data. Includes `participants` array, `productContext` (an object showing what product they are chatting about), and an array of `messages`.
  - `campusRequestSchema`: For new universities requesting to be allowed onto the platform.
  - `reportSchema` & `chatReportSchema`: Used by the moderation system to flag bad listings or toxic users.
- **Seeding Logic (`initDb`)**: 
  - Connects to `process.env.MONGO_URI`.
  - Checks `Listing.countDocuments()`. If it's 0 (meaning a fresh database), it automatically inserts `DEFAULT_LISTINGS`, `DEFAULT_PROFILE`, and `DEFAULT_MESSAGES`. This guarantees that anyone checking out the project always sees mock data instead of a blank screen.

### 1.3 `routes/api.js` (API Endpoints)
This file uses `express.Router()` to define all REST endpoints.
- **Auth Routes (`/auth/login`, `/auth/register`)**: Handles basic authentication. Checks the `Profile` model to see if an email/password matches. Returns user data or an error.
- **Listing Routes (`/listings`)**: 
  - `GET /listings`: Fetches all listings.
  - `POST /listings`: Creates a new listing.
  - `POST /listings/:id/transaction`: Highly complex route managing the state machine of an item. It changes the `status` to 'reserved', 'sold', or 'rented'. It also updates the seller's `points` and `salesCount`, integrating the gamification system directly into transactions.
- **Profile Routes (`/profile`)**: Fetches profile data, updates user information (like changing their major or avatar). Contains logic for the "Seller Rating" system where buyers can submit a rating out of 5 stars, which recalculates the seller's overall average rating.
- **Moderation Routes (`/reports`, `/chat-reports`)**: Used by the `Admin.jsx` dashboard to fetch pending moderation flags and change their status (e.g., 'Resolved', 'Dismissed').

---

## 2. Frontend Architecture (`minor/frontend/`)

Built with React 19, Vite, and TailwindCSS. Uses a highly modular approach separating UI layout, page logic, and API calls.

### 2.1 API Wrapper (`src/db.js`)
Instead of putting `fetch()` calls inside React components, Campmart wraps them all here.
- **Why?**: It keeps components clean, centralized, and easy to debug. 
- **How it works**: Functions like `export async function getListings()` perform `fetch('http://localhost:5000/api/listings')`.
- **Event Dispatching**: When a write operation happens (like `saveListing()` or `toggleFavorite()`), this file calls `window.dispatchEvent(new Event('listingsUpdated'))`. This is a highly advanced pattern acting as a lightweight global state manager. React components listen for these custom DOM events and auto-refresh their local state without needing Redux or Context API.

### 2.2 Routing & App Shell (`src/App.jsx`)
- Uses `react-router-dom`.
- **`ProtectedRoute`**: A custom component that checks `localStorage.getItem('is_logged_in')`. If it's false, it forces the user back to the `/login` page using `<Navigate replace />`.
- **Layout Wrap**: All protected routes (like `/marketplace`, `/dashboard`) are nested inside a `<Layout />` route. This ensures the Sidebar and Header are consistently rendered around the page content. The landing page (`/`) sits outside this, allowing it to have a completely custom, full-screen design.

### 2.3 Page: `Marketplace.jsx`
The primary browsing interface.
- **State**: Uses heavily synchronized state for `mode` ('buy' or 'rent'), `selectedCategories`, `minPrice`, `maxPrice`, and `searchQuery`.
- **Filtering Logic**: The `filteredListings` array is computed dynamically on every render. It filters out 'sold' items, matches the search query against the title/description, checks if the price falls within the min/max range, and verifies if the category matches checkboxes.
- **Sorting & Pagination**: Uses `.sort()` based on the user's dropdown choice (Newest, Price Low/High). Calculates `paginatedListings` by slicing the array based on `currentPage` and `ITEMS_PER_PAGE`.
- **Gamification Badges**: Uses UI flags to indicate if a product is "Rented" or "Rental Only".

### 2.4 Page: `Dashboard.jsx`
The personal control center for a user.
- **Data Consolidation**: Fetches data from multiple endpoints: `getProfile()`, `getListings()` (filtered for only the user's listings), `getFavorites()`, and `getTransactionHistory()`.
- **UI Sections**: 
  - **Stats Overview**: Shows total points, active listings, items sold, and items rented.
  - **My Listings**: A grid where the user can manage their active items (edit price, delete listing).
  - **Rentals Out**: Tracks items the user has rented to others, showing the `rentedUntil` date.
  - **Saved Items**: Displays items the user has bookmarked.
- **Profile Edit Modal**: A hidden form (`showEditProfileModal`) that allows users to update their avatar, major, and graduation year, submitting it back via `saveProfile()`.

### 2.5 Page: `Admin.jsx`
Restricted to users where `isAdmin === true`.
- **Bento Grid Analytics**: Displays platform metrics (Total Users, Active Listings, Platform Revenue).
- **Moderation Table**: Maps over the `reports` array. Displays flagged listings with the reason. The admin can click "Approve Report" (which triggers the backend to remove the listing and penalize the seller) or "Dismiss" (keeps the listing).
- **Chat Moderation**: Allows admins to fetch specific message thread history using `handleViewChatHistory(report.threadId)` to investigate toxicity reports between users.
- **Campus Requests**: Approves or denies new university email domains requesting access to the platform.

### 2.6 Real-Time Chat: `Messages.jsx`
- Connects to the Socket.io server instantiated in the backend.
- Uses `useEffect` to attach listeners for `receiveMessage`. When an event fires, it appends the new message text to the local state, triggering an instant UI re-render.
- Integrates `productContext`, showing a small embedded card of the product being discussed right inside the chat window.

### 2.7 Page: `Login.jsx` & `LandingPage.jsx`
- **LandingPage**: A completely unauthenticated view acting as the marketing site. It showcases platform features and directs users to sign up.
- **Login**: Handles switching between 'Sign In' and 'Create Account' modes. It captures the user's `.edu` email and password, submitting them via `loginUser()` or `registerUser()`. On success, it writes `is_logged_in=true` and `user_email` to `localStorage` and redirects the user to `/marketplace`.

### 2.8 Page: `ProductDetails.jsx`
- Responsible for showing the full, expanded view of a specific listing.
- Checks the URL parameter for the `id` and fetches the matching item via `getListingById()`.
- Provides an interface for buyers to either "Buy Now" or "Rent Now". When initiated, it calls the backend `/transaction` endpoint which triggers a status change (e.g., from 'available' to 'reserved' or 'rented').
- Features a "Message Seller" button which constructs a new `MessageThread` if one doesn't exist, passing the item details as `productContext`, and redirects the user to the `Messages` page.

### 2.9 Page: `CreateListing.jsx`
- A form interface for users to upload items.
- Gathers data: `title`, `price`, `category`, `condition`, `description`, and base64 encoded images.
- Contains a toggle for "Is this for Rent?", which optionally captures `rentPrice` and `rentInterval` instead of a flat purchase price.
- Dispatches a `listingsUpdated` custom event after the API POST request succeeds so the Marketplace knows there is new inventory.

### 2.10 Page: `Profile.jsx` & `Leaderboard.jsx`
- **Profile**: A read/write interface for personal user details. It calculates UI elements like the "Level" based on the gamification system (e.g., Level 1-50 based on points).
- **Leaderboard**: Displays an ordered list of users ranked by `points`. It pulls all users from the backend and sorts them. This incentivizes users to sell more items or rent out equipment (which grants points) to climb the ranks.

### 2.11 Core UI Layout (`components/`)
- **`Layout.jsx`**: The foundational shell. It dynamically renders the `Sidebar` on the left (hidden behind a hamburger menu on mobile) and the `Header` on top. The page content itself is injected into the `<Outlet />`.
- **`Header.jsx`**: Displays a search bar (which syncs query parameters to the URL so `Marketplace.jsx` can filter results), a notification bell, and a user profile dropdown.
- **`Sidebar.jsx`**: Contains navigation links (`<Link to="/marketplace">`) with an active-state highlighter so users know which page they are currently on.

### 2.12 Styling & CSS (`index.css` & Tailwind)
- Campmart uses **Tailwind CSS v3** entirely for styling. Custom design tokens (like `colors.primary`, `colors.surface`, `colors.on-surface`) are defined in `tailwind.config.js`.
- `index.css` is strictly reserved for Tailwind imports (`@tailwind base;`) and highly specific custom animations or scrollbar hiding overrides that Tailwind cannot easily do inline. All visual design heavily leverages CSS custom properties (variables) to support theming and Dark Mode capabilities seamlessly.

---
*Generated by your Agentic IDE to ensure you have a perfect, local, easily accessible reference of the entire architecture!*
