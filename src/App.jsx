import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import CreateListing from './pages/CreateListing';
import Messages from './pages/Messages';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page has its own clean design without the standard Dashboard Layout */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard Pages wrap inside Layout (Header + Left Navigation Sidebar) */}
        <Route element={<Layout />}>
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
