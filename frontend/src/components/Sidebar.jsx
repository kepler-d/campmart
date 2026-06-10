import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getMessages, getProfile } from '../db';

export default function Sidebar() {
  const [unreadCount, setUnreadCount] = useState(3);
  const [profile, setProfile] = useState(getProfile());
  const navigate = useNavigate();

  useEffect(() => {
    const updateUnread = () => {
      const threads = getMessages();
      setUnreadCount(threads.length > 0 ? threads.length : 3);
    };
    updateUnread();
    window.addEventListener('messagesUpdated', updateUnread);
    return () => window.removeEventListener('messagesUpdated', updateUnread);
  }, []);

  useEffect(() => {
    const syncProfile = () => {
      setProfile(getProfile());
    };
    window.addEventListener('profileChanged', syncProfile);
    window.addEventListener('authChanged', syncProfile);
    return () => {
      window.removeEventListener('profileChanged', syncProfile);
      window.removeEventListener('authChanged', syncProfile);
    };
  }, []);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "flex items-center gap-md bg-primary-container/20 text-primary border-l-4 border-primary py-3 px-lg font-label-md text-label-md font-bold transition-all"
      : "flex items-center gap-md text-on-surface-variant py-3 px-lg hover:bg-surface-container-low hover:translate-x-1 transition-all duration-200 font-label-md text-label-md group border-l-4 border-transparent";

  const iconClass = (isActive) =>
    isActive ? "material-symbols-outlined icon-fill" : "material-symbols-outlined text-outline group-hover:text-primary transition-colors";

  return (
    <nav className="bg-surface hidden md:flex flex-col h-[calc(100vh-72px)] w-[280px] fixed left-0 top-[72px] border-r border-outline-variant/30 shadow-sm z-40 overflow-y-auto">
      <div className="flex flex-col h-full py-xl">
        {/* Navigation Tabs */}
        <div className="flex flex-col gap-sm mt-md flex-1">
          
          <NavLink to="/dashboard" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <span className={iconClass(isActive)}>dashboard</span>
                Dashboard
              </>
            )}
          </NavLink>

          <NavLink to="/marketplace" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <span className={iconClass(isActive)}>storefront</span>
                Marketplace
              </>
            )}
          </NavLink>

          <NavLink to="/messages" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-md flex-1 justify-between">
                  <div className="flex items-center gap-md">
                    <span className={iconClass(isActive)}>chat_bubble</span>
                    Messages
                  </div>
                  <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    {unreadCount}
                  </span>
                </div>
              </>
            )}
          </NavLink>

          <NavLink to="/profile?tab=transactions" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <span className={iconClass(isActive)}>receipt_long</span>
                Transactions
              </>
            )}
          </NavLink>

          <NavLink to="/leaderboard" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <span className={iconClass(isActive)}>emoji_events</span>
                Leaderboard
              </>
            )}
          </NavLink>

          {profile.isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <span className={iconClass(isActive)}>settings</span>
                  Admin
                </>
              )}
            </NavLink>
          )}

        </div>

        {/* Footer Tabs */}
        <div className="mt-auto pt-lg border-t border-outline-variant/30 px-sm flex flex-col gap-xs">
          <button 
            onClick={() => alert("Support ticket created! A moderator will review your inquiry.")}
            className="flex items-center gap-md text-on-surface-variant w-full py-3 px-lg hover:bg-surface-container-low transition-all hover:translate-x-1 duration-200 font-label-md text-label-md group border-l-4 border-transparent text-left"
          >
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">help</span>
            Support
          </button>
          
          <button 
            onClick={() => {
              localStorage.removeItem('is_logged_in');
              window.dispatchEvent(new Event('authChanged'));
              navigate('/');
            }}
            className="flex items-center gap-md text-on-surface-variant w-full py-3 px-lg hover:bg-error/10 hover:text-error transition-all hover:translate-x-1 duration-200 font-label-md text-label-md group border-l-4 border-transparent text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-outline group-hover:text-error transition-colors">logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
