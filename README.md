# 🛒 Campus Marketplace Hub

A modern, responsive, and gamified peer-to-peer marketplace platform built for university students to buy, sell, or rent items locally on campus. From textbooks and electronics to dorm furniture and apparel, the Campus Marketplace Hub connects students, encourages sustainability, and builds campus community through gamified rewards.

---

## 🌟 Key Features

- **🛍️ Dynamic Marketplace**: Browse listings with search filters by category, price, condition (e.g., *New*, *Like New*, *Good*, *Fair*), and transaction type (Buy vs. Rent).
- **💬 Direct In-App Messaging**: Instant threaded messaging between buyers and sellers, displaying context-aware item info directly in the chat panel.
- **📊 Analytics Dashboard**: Track active listings, purchase history, total sales, current earnings, and platform points.
- **📈 Gamified Leaderboards**: Earn points and level up by selling items, renting out equipment, and promoting sustainable campus recycling.
- **📦 Effortless Listing Creation**: List new products for sale or rent with categories, rental intervals (e.g., daily/weekly), descriptions, conditions, and images.
- **🛡️ Admin Moderation Panel**: Moderate listings, track platform statistics, view user reports, and toggle listing approvals.
- **👤 Student Profiles**: Custom student profiles with majors, graduation years, seller ratings, and transaction history.
- **💾 LocalStorage Persisted State**: Runs entirely client-side with a mock database manager (`db.js`) that automatically seeds sample data on the first load and persists all interactions.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (Fast Development Server & Bundling)
- **Styling**: [TailwindCSS v3](https://tailwindcss.com/) (Utility-First Responsive Styling) + [PostCSS](https://postcss.org/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/) (HashRouter configuration for standalone client hosting)
- **State Management**: Standalone Database Module (`db.js`) managing simulated relational state on top of the browser's `LocalStorage`.

---

## 📂 Project Structure

```text
minor/
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI Layout Elements
│   │   │   ├── Header.jsx      # Navigation header with user profiles & active routes
│   │   │   ├── Footer.jsx      # Page footer
│   │   │   ├── Layout.jsx      # Outer layout containing sidebar & header wrapper
│   │   │   └── Sidebar.jsx     # Side navigation bar for app pages
│   │   ├── pages/              # Main Route Views
│   │   │   ├── LandingPage.jsx # Entry splash/marketing page
│   │   │   ├── Login.jsx       # Student authentication simulation
│   │   │   ├── Marketplace.jsx # Item exploration, search, and category listing
│   │   │   ├── ProductDetails.jsx# Detailed listing spec page with message triggers
│   │   │   ├── CreateListing.jsx # Form to add items for sale or rent
│   │   │   ├── Messages.jsx    # Live chat layout with context panels
│   │   │   ├── Dashboard.jsx   # Personal student metrics & favorites summary
│   │   │   ├── Profile.jsx     # Student profile view and active listings manager
│   │   │   ├── Leaderboard.jsx # Gamified top-users ranks and metrics
│   │   │   └── Admin.jsx       # Platform moderation & administration dashboard
│   │   ├── App.jsx             # Main Router and protected routes guard
│   │   ├── index.css           # Global stylesheet & Tailwind directives
│   │   ├── main.jsx            # React entry mounting point
│   │   └── db.js               # Mock Database Manager (local storage seeding & API wrapper)
│   ├── index.html              # Main HTML entry file
│   ├── package.json            # Node dependencies and scripts
│   ├── tailwind.config.js      # Tailwind customization settings
│   └── vite.config.js          # Vite configuration
└── README.md                   # Project documentation (This file)
```

---

## 🚀 Getting Started

Follow these steps to run the application locally on your computer.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (recommended version 18+ or 20+).

### Installation

1. **Clone the Repository** (or navigate to your local folder):
   ```bash
   git clone <your-github-repo-url>
   cd campus-marketplace-hub
   ```

2. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

### Running the App

Start the local development server:
```bash
npm run dev
```

Once started, the command line will output a local network address (typically `http://localhost:5173`). Open that URL in your browser to view the application.

### Building for Production

To build optimized production assets, run:
```bash
npm run build
```
This generates a production-ready `dist` folder inside `frontend/` containing precompiled static assets (HTML, CSS, JS) that can be easily hosted on platforms like GitHub Pages, Vercel, Netlify, or any static hosting service.

---

## 💡 How the Mock DB Works (`db.js`)

To keep this application serverless, fast, and easy to deploy:
- On the first load of the app, `db.js` checks if database keys (like `campus_listings`, `campus_profile`, `campus_messages`) exist in `localStorage`.
- If not, it seeds the database with a pre-configured set of items, user details, and initial chat threads.
- All actions—such as creating a new listing, toggling a product in favorites, sending messages, editing the profile, or deleting listings—are updated directly inside `localStorage`.
- Custom `window.dispatchEvent` triggers notify components when listings, profiles, or messages change to update the UI instantly without needing a full-page reload.

---

## 🔮 Roadmap / Future Enhancements

- **🔗 Real Database Integration**: Migrate from `localStorage` to a server backend (Node.js/Express + MongoDB or PostgreSQL).
- **💬 Real-Time Chats**: Add WebSocket (Socket.io) support for real-time buyer-seller conversations.
- **🔐 User Verification**: Require university email verification (`.edu`) to restrict access to authenticated college students.
- **💳 Payment Gateway**: Secure in-app payments using Stripe or cash-on-delivery escrow verification.
- **🔔 Interactive Notifications**: Add push notifications and email alerts for messages and listing offers.

---

## 📝 License

This project is licensed under the MIT License - feel free to use and adapt it for educational or personal use.
