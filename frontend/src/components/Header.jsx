import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getProfile, getNotifications, markNotificationRead } from '../db';

export default function Header() {
  const [profile, setProfile] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('is_logged_in') === 'true');
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const syncAuth = async () => {
      setIsLoggedIn(localStorage.getItem('is_logged_in') === 'true');
      setProfile(await getProfile());
      setNotifications(await getNotifications());
    };
    syncAuth();
    window.addEventListener('authChanged', syncAuth);
    window.addEventListener('profileChanged', syncAuth);
    window.addEventListener('notificationsUpdated', syncAuth);
    return () => {
      window.removeEventListener('authChanged', syncAuth);
      window.removeEventListener('profileChanged', syncAuth);
      window.removeEventListener('notificationsUpdated', syncAuth);
    };
  }, []);

  useEffect(() => {
    // Set initial theme state
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      navigate(`/marketplace?search=${encodeURIComponent(searchVal)}`);
    }
  };

  // Keep search input in sync with URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchVal(params.get('search') || '');
  }, [location.search]);

  return (
    <header className="bg-surface/85 dark:bg-inverse-surface/85 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/30 shadow-sm transition-colors duration-200">
      <div class="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4">
        <div class="flex items-center gap-md lg:gap-xl flex-1">
          {/* Brand */}
          <Link 
            to="/marketplace" 
            className="font-headline-md text-headline-md font-extrabold text-primary dark:text-primary-fixed-dim shrink-0 tracking-tight select-none cursor-pointer"
          >
            CampusMarket
          </Link>
          
          {/* Search Bar */}
          <div class="hidden md:flex flex-1 max-w-2xl relative ml-lg group">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input 
              id="search-input" 
              className="w-full bg-surface-container-low text-on-surface placeholder:text-outline border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:bg-surface transition-all font-body-md text-body-md" 
              placeholder="Search textbooks, tech, housing..." 
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        {/* Trailing Actions */}
        <div class="flex items-center gap-sm md:gap-md shrink-0">
          {/* Notifications Button */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-on-surface-variant hover:bg-surface-container-low hover:text-primary p-2 rounded-full transition-colors relative active:scale-95 duration-100"
            >
              <span className="material-symbols-outlined">notifications</span>
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant/30 shadow-lg rounded-xl overflow-hidden z-50">
                <div className="p-3 border-b border-outline-variant/30 bg-surface-container-lowest font-headline-sm text-sm font-bold">
                  Notifications
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-on-surface-variant">No notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        onClick={() => {
                          markNotificationRead(notif._id);
                          if (notif.link) {
                            navigate(notif.link);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 border-b border-outline-variant/10 text-sm cursor-pointer hover:bg-surface-container-lowest transition-colors ${notif.read ? 'opacity-70' : 'bg-primary/5'}`}
                      >
                        <p className="text-on-surface mb-1">{notif.message}</p>
                        <p className="text-[10px] text-outline">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Favorites Button */}
          <Link 
            to="/profile?tab=saved"
            className="text-on-surface-variant hover:bg-surface-container-low hover:text-primary p-2 rounded-full transition-colors active:scale-95 duration-100"
          >
            <span className="material-symbols-outlined">favorite</span>
          </Link>

          <div class="h-8 w-px bg-outline-variant/50 mx-sm hidden md:block"></div>

          {/* Sell Button */}
          <button 
            onClick={() => navigate('/create')}
            className="hidden md:flex items-center gap-sm bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-label-md hover:bg-primary-fixed-dim transition-colors shadow-sm hover:shadow-md active:scale-95 duration-100"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            List Item
          </button>

          {/* Profile Avatar */}
          {isLoggedIn ? (
            <button 
              onClick={() => navigate('/profile')}
              className="ml-sm rounded-full overflow-hidden border-2 border-surface-container hover:border-primary transition-colors w-10 h-10 shrink-0 shadow-sm active:scale-95 duration-100"
            >
              <img 
                alt="User avatar" 
                className="w-full h-full object-cover" 
                src={profile.avatar || 'https://via.placeholder.com/40'}
              />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="ml-sm bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-md text-label-md hover:bg-primary/95 transition-colors shadow-sm font-semibold active:scale-95 duration-100 border-0 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
