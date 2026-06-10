import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
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
    </div>
  );
}
