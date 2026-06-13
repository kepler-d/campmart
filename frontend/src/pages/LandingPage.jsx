import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background font-body-md antialiased overflow-x-hidden min-h-screen flex flex-col">
      {/* Header Navigation */}
      <Header />
      
      {/* Main Panel */}
      <main className="flex-grow w-full pt-24 pb-xl">
        {/* Hero Section */}
        <section className="relative w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl md:py-24 flex flex-col md:flex-row items-center gap-xl overflow-hidden">
          {/* Decorative Background Circles */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/4"></div>
          
          {/* Left Column Text */}
          <div className="flex-1 flex flex-col items-start z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/50 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Over 10,000 active students</span>
            </div>
            
            <h1 className="font-display text-display text-on-surface mb-6 leading-tight">
              Buy, Sell & Rent <br/>
              <span className="bg-gradient-to-r from-primary to-secondary-fixed-dim text-gradient">Within Your Campus</span>
            </h1>
            
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-lg">
              The premium marketplace exclusive to verified students. Trade textbooks, electronics, and dorm essentials safely and quickly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                to="/marketplace" 
                className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md text-label-md hover:bg-primary/90 transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-center"
              >
                <span>Explore Marketplace</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              
              <Link 
                to="/create" 
                className="bg-transparent text-secondary border border-secondary px-8 py-3 rounded-full font-label-md text-label-md hover:bg-secondary/5 transition-all active:scale-95 flex items-center justify-center gap-2 text-center"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Sell an Item</span>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed-dim">verified_user</span>
                <span className="font-label-sm text-label-sm">Verified Students</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed-dim">lock</span>
                <span className="font-label-sm text-label-sm">Secure Transactions</span>
              </div>
            </div>
          </div>
          
          {/* Right Column Image */}
          <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[600px] z-10 flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                alt="Students exchanging electronics" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800"
              />
              
              {/* Floating Glass Panels */}
              <div className="absolute bottom-8 left-[-20px] glass-panel px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container">check_circle</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface mb-0.5">Item Sold</p>
                  <p className="text-xs font-semibold text-primary">MacBook Pro M1</p>
                </div>
              </div>
              
              <div className="absolute top-12 right-[-10px] glass-panel px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container">local_offer</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface mb-0.5">New Listing</p>
                  <p className="text-xs font-semibold text-secondary-fixed-dim">₹45 • Textbook</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer Details */}
      <Footer />
    </div>
  );
}
