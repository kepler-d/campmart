# 🛒 Campus Marketplace Hub

A modern, responsive, and gamified peer-to-peer marketplace platform built for university students to buy, sell, or rent items locally on campus. From textbooks and electronics to dorm furniture and apparel, the Campus Marketplace Hub connects students, encourages sustainability, and builds campus community through gamified rewards.

---

## 🌟 Key Features

- **🛍️ Dynamic Marketplace**: Browse listings with search filters by category, price, condition, and transaction type.
- **💬 Real-Time Direct Messaging**: Instant threaded messaging between buyers and sellers powered by Socket.io, displaying context-aware item info directly in the chat panel.
- **🔐 Secure User Authentication**: Restricts access to authenticated college students using robust university email verification (`.edu`) and secure JWT tokens.
- **🔔 Interactive Notifications**: Stay updated with push notifications and email alerts for new messages and listing offers.
- **📊 Analytics Dashboard**: Track active listings, purchase history, total sales, current earnings, and platform points.
- **📈 Gamified Leaderboards**: Earn points and level up by selling items, renting out equipment, and promoting sustainable campus recycling.
- **📦 Effortless Listing Creation**: List new products for sale or rent with categories, rental intervals, descriptions, conditions, and images.
- **🛡️ Admin Moderation Panel**: Moderate listings, track platform statistics, view user reports, and toggle listing approvals.
- **👤 Student Profiles**: Custom student profiles with majors, graduation years, seller ratings, and transaction history.
- **☁️ Cloud Database**: Powered by Node.js/Express and MongoDB Atlas for persistent storage and data management across clients.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Backend API**: Node.js + Express
- **Database**: MongoDB Atlas + Mongoose
- **Real-Time WebSockets**: Socket.io
- **Styling**: [TailwindCSS v3](https://tailwindcss.com/) + [PostCSS](https://postcss.org/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)

---

## 📂 Project Structure

```text
minor/
├── backend/
│   ├── routes/
│   │   └── api.js              # Express API endpoints
│   ├── db.js                   # Mongoose schemas and MongoDB connection logic
│   ├── package.json            # Node backend dependencies
│   └── server.js               # Express server and Socket.io initialization
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI Layout Elements
│   │   ├── pages/              # Main Route Views (Marketplace, Messages, Dashboard, etc.)
│   │   ├── App.jsx             # Main Router and protected routes guard
│   │   ├── db.js               # Frontend API wrapper
│   │   ├── index.css           # Global stylesheet & Tailwind directives
│   │   └── main.jsx            # React entry mounting point
│   ├── index.html              # Main HTML entry file
│   ├── package.json            # Frontend dependencies
│   ├── tailwind.config.js      # Tailwind customization settings
│   └── vite.config.js          # Vite configuration
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

Follow these steps to run the full-stack application locally.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Start the Backend Server

Open a terminal window and navigate to the backend folder:

```bash
cd backend
npm install
node server.js
```
*The backend will run on `http://localhost:5000` and connect to MongoDB.*

### 2. Start the Frontend App

Open a **new** terminal window and navigate to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5500`. Open this URL in your browser.*

---

## 🔮 Roadmap / Future Enhancements

- **💳 Payment Gateway**: Secure in-app payments using Stripe or cash-on-delivery escrow verification.
- **🤖 AI-Powered Listing Generation**: Auto-categorize items and suggest pricing based on image recognition.
- **📅 Integrated Meetup Scheduler**: Propose and agree upon safe, public meeting spots on campus with calendar sync.
- **📱 Native Mobile App**: Develop iOS and Android applications for native features like camera access and push notifications.
- **🔍 "In Search Of" (ISO) Board**: Allow students to post requests for items they need, letting sellers fulfill them directly.
- **🌍 Multi-University Expansion**: Support multiple universities with distinct geofenced zones.
- **⭐ Enhanced Trust & Safety**: Introduce automated seller badges (e.g., "Fast Responder") and automated moderation for listings.
- **🌙 Personalization & Dark Mode**: Add robust dark mode support and personalized feeds based on a student's major.

---

## 📝 License

This project is licensed under the MIT License - feel free to use and adapt it for educational or personal use.
