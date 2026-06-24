import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { getPendingRatings, submitSellerRating } from '../db';

export default function Layout() {
  const [pendingRatings, setPendingRatings] = useState([]);
  const [currentRating, setCurrentRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchPendingRatings = async () => {
    const email = localStorage.getItem('user_email');
    if (!email) return;
    const ratings = await getPendingRatings(email);
    setPendingRatings(ratings);
  };

  useEffect(() => {
    fetchPendingRatings();
    
    // Also listen for listings updates to catch any new handovers
    window.addEventListener('listingsUpdated', fetchPendingRatings);
    return () => window.removeEventListener('listingsUpdated', fetchPendingRatings);
  }, []);

  const handleRatingSubmit = async () => {
    if (currentRating === 0) {
      alert("Please select a rating from 1 to 5 stars.");
      return;
    }
    
    const item = pendingRatings[0];
    setSubmitting(true);
    try {
      await submitSellerRating(item.id, item.resolvedSellerEmail, currentRating);
      // Remove this item from the list
      setPendingRatings(prev => prev.slice(1));
      setCurrentRating(0);
      alert("Thank you for your feedback!");
    } catch (err) {
      alert("Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased relative">
      {/* Fixed Top Nav Bar */}
      <Header />
      
      {/* Layout Split Container */}
      <div className="flex flex-1 pt-[72px]">
        {/* Left fixed Sidebar */}
        <Sidebar />
        
        {/* Scrollable Main Area */}
        <div className="flex-grow md:ml-[280px] flex flex-col min-h-[calc(100vh-72px)]">
          <main className="flex-grow w-full">
            <Outlet />
          </main>
          {/* Footer aligns correctly in scroll zone */}
          <Footer />
        </div>
      </div>

      {/* Mandatory Rating Modal overlaying everything */}
      {pendingRatings.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-md">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 border border-outline-variant">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px] text-primary">star</span>
              </div>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-2">Rate Your Experience</h2>
              <p className="text-on-surface-variant text-sm">
                You recently completed a transaction for <span className="font-bold">"{pendingRatings[0].title}"</span>. 
                Please rate the seller <span className="font-bold">{pendingRatings[0].seller}</span> to continue using the app.
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setCurrentRating(star)}
                  className={`border-0 bg-transparent cursor-pointer p-1 transition-transform hover:scale-110 ${
                    star <= currentRating ? 'text-yellow-400' : 'text-outline-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: star <= currentRating ? "'FILL' 1" : "'FILL' 0" }}>
                    star
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleRatingSubmit}
              disabled={submitting || currentRating === 0}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
