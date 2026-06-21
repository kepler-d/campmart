import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getListings, saveListings, getProfile, saveProfile, getFavorites, toggleFavorite, getTransactionHistory, confirmHandover, cancelReservation, deleteListing, deleteAccount } from '../db';

const DEFAULT_RENTALS = [];

export default function Dashboard() {
  const navigate = useNavigate();

  // Load profile and listings
  const [profile, setProfile] = useState({});
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [pendingHandovers, setPendingHandovers] = useState([]);

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');

  // Edit profile states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Settings State
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  // Initial Seed & Load
  useEffect(() => {
    const fetchData = async () => {
      const p = await getProfile();
      setProfile(p);
      const l = await getListings();
      setListings(l);
      setFavorites(await getFavorites());

      if (p && p.email) {
        const history = await getTransactionHistory(p.email);
        
        const activeBorrows = history.filter(item => 
          item.status === 'rented' && 
          item.rentedUntil && 
          new Date(item.rentedUntil) > new Date()
        );

        const lentItems = l.filter(item => 
          item.seller === p.name && 
          item.status === 'rented' && 
          item.rentedUntil && 
          new Date(item.rentedUntil) > new Date()
        );

        const formatRental = (item, type, partnerName) => {
          const due = new Date(item.rentedUntil);
          const now = new Date();
          const daysRemaining = Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24)));
          return {
            id: type === 'lent' ? item.id + '-lent' : item.id,
            title: item.title,
            image: item.image,
            type: type,
            partner: partnerName,
            dueDate: due.toLocaleDateString(),
            daysRemaining: daysRemaining,
            totalDays: Math.max(30, daysRemaining) // Approximate for progress bar
          };
        };

        const rentalsData = [
          ...activeBorrows.map(item => formatRental(item, 'borrowed', item.seller)),
          ...lentItems.map(item => formatRental(item, 'lent', item.rentedByEmail || 'Renter'))
        ];

        setRentals(rentalsData);

        const pending = history.filter(item => item.status === 'reserved');
        const userReserved = l.filter(item => item.seller === p.name && item.status === 'reserved');
        const formattedPending = [
          ...pending.map(item => ({ ...item, role: 'buyer', partner: item.seller })),
          ...userReserved.map(item => ({ ...item, role: 'seller', partner: item.buyerEmail || item.rentedByEmail }))
        ];
        // Deduplicate
        const uniquePending = Array.from(new Map(formattedPending.map(item => [item.id, item])).values());
        setPendingHandovers(uniquePending);
      }
    };
    fetchData();
  }, []);

  // Sync state on dynamic updates
  useEffect(() => {
    const handleProfileChange = async () => {
      const p = await getProfile();
      setProfile(p);
      refreshRentals(p, listings);
    };
    
    const handleListingsUpdate = async () => {
      const l = await getListings();
      setListings(l);
      refreshRentals(profile, l);
    };
    
    const handleFavoritesUpdate = async () => setFavorites(await getFavorites());

    const refreshRentals = async (p, l) => {
      if (p && p.email) {
        const history = await getTransactionHistory(p.email);
        const activeBorrows = history.filter(item => item.status === 'rented' && item.rentedUntil && new Date(item.rentedUntil) > new Date());
        const lentItems = l.filter(item => item.seller === p.name && item.status === 'rented' && item.rentedUntil && new Date(item.rentedUntil) > new Date());

        const formatRental = (item, type, partnerName) => {
          const due = new Date(item.rentedUntil);
          const now = new Date();
          const daysRemaining = Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24)));
          return {
            id: type === 'lent' ? item.id + '-lent' : item.id,
            title: item.title,
            image: item.image,
            type: type,
            partner: partnerName,
            dueDate: due.toLocaleDateString(),
            daysRemaining: daysRemaining,
            totalDays: Math.max(30, daysRemaining)
          };
        };

        const rentalsData = [
          ...activeBorrows.map(item => formatRental(item, 'borrowed', item.seller)),
          ...lentItems.map(item => formatRental(item, 'lent', item.rentedByEmail || 'Renter'))
        ];
        setRentals(rentalsData);

        const pending = history.filter(item => item.status === 'reserved');
        const userReserved = l.filter(item => item.seller === p.name && item.status === 'reserved');
        const formattedPending = [
          ...pending.map(item => ({ ...item, role: 'buyer', partner: item.seller })),
          ...userReserved.map(item => ({ ...item, role: 'seller', partner: item.buyerEmail || item.rentedByEmail }))
        ];
        const uniquePending = Array.from(new Map(formattedPending.map(item => [item.id, item])).values());
        setPendingHandovers(uniquePending);
      }
    };

    window.addEventListener('profileChanged', handleProfileChange);
    window.addEventListener('listingsUpdated', handleListingsUpdate);
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    return () => {
      window.removeEventListener('profileChanged', handleProfileChange);
      window.removeEventListener('listingsUpdated', handleListingsUpdate);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [profile, listings]);

  // Filter listings owned by user
  const userListings = listings.filter(item => item.seller === profile.name);

  // Watchlist items
  const watchItems = listings.filter(item => favorites.includes(item.id));

  // Department Recommendations
  const recommendedItems = listings
    .filter(item => item.seller !== profile.name && (item.category === "Textbooks" || item.category === "Electronics"))
    .slice(0, 4);

  // Pricing edit handlers
  const openEditModal = (id, title, currentPrice) => {
    setEditItemId(id);
    setEditItemTitle(title);
    setEditItemPrice(currentPrice.toString());
    setShowEditModal(true);
  };

  const handleSavePrice = () => {
    const newPrice = parseFloat(editItemPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Please enter a valid price.");
      return;
    }

    const updatedListings = listings.map(item => {
      if (item.id === editItemId) {
        return { ...item, price: newPrice };
      }
      return item;
    });

    setListings(updatedListings);
    saveListings(updatedListings);
    setShowEditModal(false);
  };

  // Mark as sold handler
  const handleMarkAsSold = (id, title) => {
    if (window.confirm(`Are you sure you want to mark "${title}" as sold? It will be archived.`)) {
      const updatedListings = listings.filter(item => item.id !== id);
      setListings(updatedListings);
      saveListings(updatedListings);

      // Award XP points
      const updatedProfile = {
        ...profile,
        salesCount: (profile.salesCount || 0) + 1,
        points: (profile.points || 0) + 100
      };
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    }
  };

  const handleConfirmHandover = async (id, title) => {
    if (window.confirm(`Are you sure you want to confirm handover for "${title}"?`)) {
      await confirmHandover(id);
      alert(`Handover confirmed for "${title}"!`);
      
      const updatedProfile = {
        ...profile,
        salesCount: (profile.salesCount || 0) + 1,
        points: (profile.points || 0) + 100
      };
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    }
  };

  const handleCancelReservation = async (id, title) => {
    if (window.confirm(`Are you sure you want to cancel the reservation for "${title}"?`)) {
      await cancelReservation(id);
      alert(`Reservation cancelled for "${title}".`);
    }
  };

  // Delete listing permanently
  const handleDeleteListing = async (id, title) => {
    if (window.confirm(`Delete "${title}" permanently?`)) {
      const updatedListings = listings.filter(item => item.id !== id);
      setListings(updatedListings); // optimistic update
      await deleteListing(id);
    }
  };

  const handleUnfavorite = async (id) => {
    await toggleFavorite(id);
  };

  const openEditProfileModal = () => {
    setEditName(profile.name);
    setEditMajor(profile.major);
    setEditYear(profile.year || '');
    setEditAvatar(profile.avatar || '');
    setEditAbout(profile.about || '');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: editName.trim() || profile.name,
      major: editMajor.trim() || profile.major,
      year: editYear.trim() || profile.year,
      avatar: editAvatar.trim() || profile.avatar,
      about: editAbout.trim()
    };

    setProfile(updated);
    await saveProfile(updated);
    setShowEditProfileModal(false);
  };

  // Sales Made estimate
  const salesMadeTotal = (profile.salesCount || 0) * 40.00;

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-max-width mx-auto flex flex-col gap-lg pb-24 pt-6">
      
      {/* Header / Profile Summary Bento */}
      <section className="flex flex-col lg:flex-row gap-gutter mb-xl">
        {/* Main Profile Card */}
        <div className="flex-1 bg-surface-container-lowest rounded-xl border border-surface-variant p-lg flex flex-col md:flex-row items-center md:items-start gap-lg relative shadow-sm">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative shrink-0">
            <img 
              alt="User Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-sm" 
              src={profile.avatar || "https://via.placeholder.com/128"}
            />
            <div className="absolute -bottom-2 -right-2 bg-secondary-container text-on-secondary-container rounded-full p-1 border-2 border-surface shadow-sm flex items-center justify-center h-10 w-10">
              <span className="material-symbols-outlined text-[20px] icon-fill">verified</span>
            </div>
          </div>

          <div className="flex-grow text-center md:text-left flex flex-col justify-center h-full">
            <div className="flex flex-col md:flex-row md:items-center gap-sm mb-2">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-black leading-none">
                {profile.name}
              </h1>
              <span className="inline-flex items-center gap-1 bg-surface-container px-3 py-1 rounded-full font-label-sm text-label-sm text-primary w-fit mx-auto md:mx-0 font-semibold">
                <span className="material-symbols-outlined text-[16px]">school</span>
                {profile.major} {profile.year && `• ${profile.year}`}
              </span>
            </div>
            
            {profile.about && (
              <p className="font-body-md text-body-md text-on-surface-variant mb-4 max-w-lg leading-relaxed whitespace-pre-line">
                {profile.about}
              </p>
            )}

            <div className="flex flex-wrap gap-sm justify-center md:justify-start">
              <button 
                onClick={openEditProfileModal}
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-primary/95 transition-colors shadow-sm font-semibold border-0 cursor-pointer active:scale-95 duration-100"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Profile link copied to clipboard!");
                }}
                className="border border-outline-variant bg-transparent text-on-surface font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Share Profile
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="border border-outline-variant bg-transparent text-on-surface p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-lg overflow-hidden z-10 flex flex-col">
                    <button 
                      onClick={() => { setShowSettingsModal(true); setShowDropdown(false); }}
                      className="text-left px-4 py-3 font-body-md hover:bg-surface-container-low transition-colors text-on-surface border-0 bg-transparent cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Settings
                    </button>
                    <button 
                      onClick={() => { setShowHelpModal(true); setShowDropdown(false); }}
                      className="text-left px-4 py-3 font-body-md hover:bg-surface-container-low transition-colors text-on-surface border-0 border-b border-surface-variant bg-transparent cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">help</span>
                      Help & Support
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('is_logged_in');
                        localStorage.removeItem('user_email');
                        window.dispatchEvent(new Event('authChanged'));
                        window.dispatchEvent(new Event('profileChanged'));
                        navigate('/login');
                      }}
                      className="text-left px-4 py-3 font-body-md hover:bg-surface-container-low transition-colors text-on-surface border-0 bg-transparent cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log Out
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to permanently delete your account? All your listings will be removed, and pending transactions will be cancelled. This action cannot be undone.")) {
                          const success = await deleteAccount();
                          if (success) {
                            alert("Your account has been deleted.");
                            navigate('/login');
                          } else {
                            alert("Failed to delete account. Please try again.");
                          }
                        }
                      }}
                      className="text-left px-4 py-3 font-body-md hover:bg-error/10 transition-colors text-error border-0 bg-transparent cursor-pointer flex items-center gap-2 font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_remove</span>
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Rank Card */}
        <div className="lg:w-80 bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl border border-surface-variant p-lg flex flex-col justify-center items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-tr from-tertiary-container to-tertiary-fixed-dim rounded-full flex items-center justify-center mb-4 shadow-sm shrink-0">
            <span className="material-symbols-outlined text-white text-[32px] icon-fill">trophy</span>
          </div>
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1 font-bold">Campus Trust Rank</h3>
          <div className="font-display text-display text-on-surface mb-2 font-black">Top 5%</div>
          <div className="w-full bg-surface-variant rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-primary h-2 rounded-full w-[95%]"></div>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">15 more sales to reach Elite Tier</p>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
            <span className="material-symbols-outlined text-[28px] icon-fill">storefront</span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">My Listings</p>
            <h3 className="text-2xl font-black text-on-surface mt-0.5">{userListings.length}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-secondary/10 text-secondary rounded-xl shrink-0">
            <span className="material-symbols-outlined text-[28px] icon-fill">payments</span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Sales Made</p>
            <h3 className="text-2xl font-black text-on-surface mt-0.5">₹{salesMadeTotal.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-tertiary-container/10 text-tertiary rounded-xl shrink-0">
            <span className="material-symbols-outlined text-[28px] icon-fill">autorenew</span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Active Rentals</p>
            <h3 className="text-2xl font-black text-on-surface mt-0.5">{rentals.length}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-error/10 text-error rounded-xl shrink-0">
            <span className="material-symbols-outlined text-[28px] icon-fill">favorite</span>
          </div>
          <div>
            <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Watchlist</p>
            <h3 className="text-2xl font-black text-on-surface mt-0.5">{favorites.length}</h3>
          </div>
        </div>
      </section>

      {/* Main widgets split layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        
        {/* Left: My Listings Manager */}
        <div className="lg:col-span-7 flex flex-col gap-md">
          
          {/* Pending Handovers Section */}
          {pendingHandovers.length > 0 && (
            <div className="mb-6">
              <h2 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-orange-500">lock_clock</span>
                Pending Handovers
              </h2>
              <div className="flex flex-col gap-4">
                {pendingHandovers.map(item => (
                  <div 
                    key={`pending-${item.id}`}
                    className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md shadow-sm"
                  >
                    <div 
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="flex items-center gap-md cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/20">
                        <img alt={item.title} className="w-full h-full object-cover" src={item.image || 'https://via.placeholder.com/80'}/>
                      </div>
                      <div>
                        <h4 className="font-headline-md text-sm font-bold text-on-surface line-clamp-1">{item.title}</h4>
                        <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                          Reserved {item.role === 'buyer' ? 'from' : 'by'} <span className="font-bold">{item.partner}</span>
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                            Action Required
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0 justify-end">
                      {item.role === 'seller' && (
                        <button 
                          onClick={() => handleConfirmHandover(item.id, item.title)}
                          className="flex-1 sm:flex-none bg-primary text-on-primary hover:bg-primary/90 font-label-md text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1 font-semibold cursor-pointer border-0 active:scale-95 duration-100 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">verified</span> Confirm Handover
                        </button>
                      )}
                      <button 
                        onClick={() => handleCancelReservation(item.id, item.title)}
                        className="flex-1 sm:flex-none border border-error text-error hover:bg-error/10 font-label-md text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 duration-100"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span> Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">edit_note</span>
              Manage My Listings
            </h2>
            <Link to="/create" className="text-primary font-label-md text-label-md hover:underline flex items-center gap-0.5">
              Create New <span class="material-symbols-outlined text-[16px]">add</span>
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {userListings.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center text-on-surface-variant font-body-md shadow-sm">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">storefront</span>
                <p>You don't have any active listings. Tap 'Create New' to list items.</p>
              </div>
            ) : (
              userListings.map(item => (
                <div 
                  key={item.id}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md shadow-sm hover:-translate-y-0.5 transition-transform"
                >
                  <div 
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="flex items-center gap-md cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-xl bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/20">
                      <img alt={item.title} className="w-full h-full object-cover" src={item.image || 'https://via.placeholder.com/80'}/>
                    </div>
                    <div>
                      <h4 className="font-headline-md text-sm font-bold text-on-surface line-clamp-1">{item.title}</h4>
                      <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                        {item.category} • <span className="text-primary font-semibold">₹{item.price.toFixed(2)}</span>
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary-container/20 px-2 py-0.5 rounded">
                          {item.condition}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <button 
                      onClick={() => openEditModal(item.id, item.title, item.price)}
                      className="flex-1 sm:flex-none border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-low font-label-md text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 duration-100"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span> Edit Price
                    </button>
                    <button 
                      onClick={() => handleMarkAsSold(item.id, item.title)}
                      className="flex-1 sm:flex-none bg-secondary text-on-secondary hover:bg-secondary/90 font-label-md text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1 font-semibold cursor-pointer border-0 active:scale-95 duration-100 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span> Sold
                    </button>
                    <button 
                      onClick={() => handleDeleteListing(item.id, item.title)}
                      className="text-error hover:bg-error/10 p-2 rounded-xl flex items-center justify-center border-0 bg-transparent cursor-pointer active:scale-90"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Rental Tracker */}
        <div className="lg:col-span-5 flex flex-col gap-md">
          <h2 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined">calendar_today</span>
            Rental Tracker
          </h2>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md flex flex-col gap-md shadow-sm">
            {rentals.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-sm font-body-md flex flex-col items-center">
                <span className="material-symbols-outlined text-[32px] text-outline mb-2">autorenew</span>
                <p>No active borrows or lent items tracked currently.</p>
              </div>
            ) : (
              rentals.map(rent => {
                const progressPercent = Math.min(100, Math.max(0, ((rent.totalDays - rent.daysRemaining) / rent.totalDays) * 100));
                
                return (
                  <div key={rent.id} className="flex flex-col gap-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden shrink-0">
                        <img alt={rent.title} className="w-full h-full object-cover" src={rent.image}/>
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-label-md text-xs font-bold text-on-surface truncate">{rent.title}</h4>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0 ${rent.type === 'borrowed' ? 'bg-primary/10 text-primary' : 'bg-secondary/15 text-secondary'}`}>
                            {rent.type === 'borrowed' ? 'Borrowed' : 'Lent Out'}
                          </span>
                        </div>
                        <p className="font-body-md text-[11px] text-on-surface-variant mt-0.5">
                          {rent.type === 'borrowed' ? `From: ${rent.partner}` : `To: ${rent.partner}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1">
                      <div className="flex justify-between font-label-sm text-[10px] text-on-surface-variant mb-1">
                        <span>Progress ({rent.daysRemaining} days left)</span>
                        <span>Due: {rent.dueDate}</span>
                      </div>
                      <div className="w-full bg-surface-variant/50 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Watchlist Section */}
      <section className="flex flex-col gap-md mt-md">
        <h2 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined">favorite</span>
          My Watchlist
        </h2>
        {watchItems.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center text-on-surface-variant font-body-md shadow-sm">
            <span className="material-symbols-outlined text-[36px] text-outline mb-2">favorite_border</span>
            <p>Your watchlist is empty. Bookmark items on the marketplace to watch prices.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {watchItems.map(item => (
              <article 
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col relative group hover:-translate-y-0.5 transition-transform"
              >
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUnfavorite(item.id); }}
                  className="absolute top-2 right-2 z-20 p-1.5 bg-surface/85 backdrop-blur-md rounded-full text-error shadow-sm border-0 cursor-pointer active:scale-90"
                >
                  <span className="material-symbols-outlined text-[18px] icon-fill">favorite</span>
                </button>
                <Link to={`/product/${item.id}`} className="aspect-[4/3] bg-surface-variant overflow-hidden cursor-pointer">
                  <img alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={item.image}/>
                </Link>
                <div className="p-3 flex flex-col flex-grow">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-secondary mb-1">{item.category}</span>
                  <Link 
                    to={`/product/${item.id}`} 
                    className="font-label-md text-xs font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                  <p className="font-headline-md text-sm font-black text-primary mt-2">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Department Recommendations */}
      <section className="flex flex-col gap-md mt-md border-t border-outline-variant/20 pt-lg">
        <div>
          <h2 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            Recommended for CS Majors
          </h2>
          <p className="font-body-md text-[13px] text-on-surface-variant mt-0.5">
            Required course books and study devices recommended by peers in your department.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedItems.length === 0 ? (
            <div className="col-span-full py-4 text-center font-body-md text-on-surface-variant">
              No recommendations matching your department filters.
            </div>
          ) : (
            recommendedItems.map(item => (
              <article 
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col cursor-pointer group hover:-translate-y-0.5 transition-transform"
              >
                <div className="aspect-[4/3] bg-surface-variant overflow-hidden">
                  <img alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={item.image}/>
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-secondary mb-1">{item.category}</span>
                  <h4 className="font-label-md text-xs font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="font-headline-md text-sm font-black text-primary mt-2">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Edit Price Modal Dialog */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-md">
          <div className="bg-white dark:bg-inverse-surface border border-outline-variant/30 rounded-2xl max-w-sm w-full p-lg shadow-2xl flex flex-col gap-md transform scale-100 transition-all duration-200">
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface">Update Price</h3>
              <p className="font-body-md text-sm text-on-surface-variant mt-1 truncate">{editItemTitle}</p>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-bold">₹</span>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:ring-2 focus:ring-primary focus:border-primary font-bold text-lg"
                value={editItemPrice}
                onChange={(e) => setEditItemPrice(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-sm mt-md">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-md py-2 border border-outline-variant rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-colors text-on-surface cursor-pointer bg-transparent"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePrice}
                className="px-md py-2 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:bg-primary/95 transition-colors shadow-sm font-semibold border-0 cursor-pointer active:scale-95"
              >
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal Dialog */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[100] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-md">
          <div className="bg-white dark:bg-inverse-surface border border-outline-variant/30 rounded-xl max-w-md w-full p-lg shadow-2xl flex flex-col gap-md">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-md text-left">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-2.5 text-body-md font-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Branch / Major</label>
                <input 
                  type="text" 
                  value={editMajor}
                  onChange={(e) => setEditMajor(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-2.5 text-body-md font-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Year</label>
                <input 
                  type="text" 
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-2.5 text-body-md font-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">About Me</label>
                <textarea 
                  value={editAbout}
                  onChange={(e) => setEditAbout(e.target.value)}
                  placeholder="Tell people a bit about yourself..."
                  rows="3"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-2.5 text-body-md font-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                ></textarea>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Avatar</label>
                <div className="flex flex-wrap gap-3">
                  {["Felix", "Aneka", "Jack", "Sarah", "Milo"].map(seed => {
                    const url = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
                    return (
                      <button 
                        type="button"
                        key={seed}
                        onClick={() => setEditAvatar(url)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer p-0 bg-surface-container transition-all ${editAvatar === url ? 'border-primary scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'}`}
                      >
                        <img src={url} alt={seed} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                  
                  {/* File Upload Button */}
                  <label className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${editAvatar && editAvatar.startsWith('data:image') ? 'border-primary scale-110 shadow-md' : 'border-outline-variant bg-surface-container-lowest hover:border-primary text-on-surface-variant hover:text-primary'}`}>
                    {editAvatar && editAvatar.startsWith('data:image') ? (
                      <img src={editAvatar} alt="Custom Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">upload</span>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setEditAvatar(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-sm mt-md pt-2">
                <button 
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-md py-2 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors text-on-surface cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-md py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/95 transition-colors shadow-sm cursor-pointer border-0 font-semibold active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-md">
          <div className="bg-white dark:bg-inverse-surface border border-outline-variant/30 rounded-xl max-w-md w-full p-lg shadow-2xl flex flex-col gap-md">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer border-0 bg-transparent p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4 my-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-label-lg font-bold text-on-surface">Dark Mode</div>
                  <div className="font-body-sm text-on-surface-variant">Switch to dark aesthetic</div>
                </div>
                <button 
                  onClick={() => {
                    setDarkMode(!darkMode);
                    document.documentElement.classList.toggle('dark');
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0 ${darkMode ? 'bg-primary' : 'bg-surface-variant'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-label-lg font-bold text-on-surface">Email Notifications</div>
                  <div className="font-body-sm text-on-surface-variant">Get alerts for new messages</div>
                </div>
                <button 
                  onClick={() => setEmailNotifs(!emailNotifs)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0 ${emailNotifs ? 'bg-primary' : 'bg-surface-variant'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-label-lg font-bold text-on-surface">Public Profile</div>
                  <div className="font-body-sm text-on-surface-variant">Allow non-students to see you</div>
                </div>
                <button 
                  onClick={() => setPublicProfile(!publicProfile)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0 ${publicProfile ? 'bg-primary' : 'bg-surface-variant'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${publicProfile ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-sm mt-4 pt-4 border-t border-surface-variant">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/95 transition-colors shadow-sm cursor-pointer border-0 font-semibold active:scale-95 w-full"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-md">
          <div className="bg-white dark:bg-inverse-surface border border-outline-variant/30 rounded-xl max-w-md w-full p-lg shadow-2xl flex flex-col gap-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Help & Support</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer border-0 bg-transparent p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              alert("Your message has been sent to our support team!");
              setShowHelpModal(false);
            }} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">How can we help?</label>
                <select className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-2.5 text-body-md font-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer">
                  <option>Account Issue</option>
                  <option>Report a Listing</option>
                  <option>Payment Dispute</option>
                  <option>Feature Request</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Message</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Describe your issue in detail..."
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-2.5 text-body-md font-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-sm mt-md pt-2">
                <button 
                  type="submit"
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/95 transition-colors shadow-sm cursor-pointer border-0 font-semibold active:scale-95 w-full flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
