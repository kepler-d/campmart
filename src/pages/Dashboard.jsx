import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getListings, saveListings, getProfile, saveProfile, getFavorites, toggleFavorite } from '../db';

const DEFAULT_RENTALS = [
  {
    id: "rnt-1",
    title: "Wacom Intuos Pro Drawing Tablet",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiKF-D4yzQGV6u_iWTPq1w05BoQwD9EiZV_NzMrU1BJFVFT9b9BrFsKkjID92vD8rx6qHEK1XaLqaqwZFcW1TAHSypCVZvNu0GLFXzAmQpGuwE2gRMf4rjhj92AGOtFugNalqQ2m3YtmE5lYkqmC5bWqmDUH_o0yPAUwdiGvimfrwatXzvzXW7YAnRuYoHlo2gyZSSfh5nW9SpESQIrQyk0C06dBjfyrwN6pTb_vBBzbWTWmvH-6zQOCn7zsjO3NCSM3FllN-pmLdw",
    type: "borrowed",
    partner: "Sarah Jenkins",
    dueDate: "2026-06-15",
    daysRemaining: 6,
    totalDays: 14
  },
  {
    id: "rnt-2",
    title: "Calculus: Early Transcendentals, 9th Edition",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBA8hiRQWq9w5PRkjiI8Do0vyV-ZWZPH983o5oxbh0glCUD159_cwHrSCouXmUcF1Kpp7_3ZdfmgGjJd8VnEh-n2TVX2OiWRCSrMnoLjN8Q--AurQfAyxCX2faMgtrXFJJmkeAMAei87ySLGdbzDFS9lmX4J_YO0UWgIuZ2QK5EsqKUbL3L_aWRf5MtusuVk27HGRF-3wjPzzYiNe6UYHrzOU-Zif2NbiQIbTCSwhibXqVzYKnCy4cbim5c67OZ1rxwUu7zhmoCCm6v",
    type: "lent",
    partner: "Alex Chen",
    dueDate: "2026-06-25",
    daysRemaining: 16,
    totalDays: 30
  }
];

export default function Dashboard() {
  const navigate = useNavigate();

  // Load profile and listings
  const [profile, setProfile] = useState(getProfile());
  const [listings, setListings] = useState(getListings());
  const [favorites, setFavorites] = useState(getFavorites());
  const [rentals, setRentals] = useState([]);

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');

  // Initial Seed & Load
  useEffect(() => {
    // 1. Seed user listings if empty
    const currentListings = getListings();
    const userOwned = currentListings.filter(item => item.seller === profile.name);
    if (userOwned.length === 0) {
      const mockListings = [
        {
          id: "lst-h1",
          title: "Introduction to Algorithms (CLRS), 4th Edition",
          category: "Textbooks",
          price: 65.00,
          condition: "Like New",
          rating: 4.9,
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBA8hiRQWq9w5PRkjiI8Do0vyV-ZWZPH983o5oxbh0glCUD159_cwHrSCouXmUcF1Kpp7_3ZdfmgGjJd8VnEh-n2TVX2OiWRCSrMnoLjN8Q--AurQfAyxCX2faMgtrXFJJmkeAMAei87ySLGdbzDFS9lmX4J_YO0UWgIuZ2QK5EsqKUbL3L_aWRf5MtusuVk27HGRF-3wjPzzYiNe6UYHrzOU-Zif2NbiQIbTCSwhibXqVzYKnCy4cbim5c67OZ1rxwUu7zhmoCCm6v",
          seller: profile.name,
          sellerAvatar: profile.avatar,
          description: "Used for CS 301. Minimal markings, like new condition. Can deliver on campus."
        },
        {
          id: "lst-h2",
          title: "TI-84 Plus CE Graphing Calculator",
          category: "Electronics",
          price: 85.00,
          rentPrice: 10.00,
          condition: "Good",
          rating: 5.0,
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzckiG-qpY7WkidwL73YJ4uxGLxg9gy0qpOoZ9HUysT7_kyhNlcpSWBXRqFVImltioHuWKVB15XrUK_UfnULCG0Ql_VbJ5r5SjcD2VZ2xXxAPeyH9td4Rs1rbHGYsE2Lk9qubEEBHq0moAzeCwMR_T2minJlJOYS8-nE0_1pve_0ClEffzOkj2iime5nb6Fa5LOyhy5QM1bZRy_TvYMd1_UnaA76rfiJX-9aMNlLmVdvoPDMc0AeSV9jikuPK8WOte7hIYrWaQJczh",
          seller: profile.name,
          sellerAvatar: profile.avatar,
          description: "Calculator in great working condition. Includes charger."
        },
        {
          id: "lst-h3",
          title: "Computer Science Study Desk Lamp",
          category: "Furniture",
          price: 15.00,
          condition: "Fair",
          rating: 4.0,
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIZYdnOcuujHPRYidfLxYGjIMeKcvEvIktVnpU9jGcjnyZzrJsDbx0YbGXOYro7ZQhVIJGJ4Tlf-YsWnF0DKCkGTogI3_iJwLBGOlpEnZ46D_lQhquVbBs24Jf6VBznP8Okm21iuLgtCxbaQgj1uITXyuYBPxpfbnwsJcWHlaD1bcjt1a3mLKsAnpnPCQwP6KySBCcJ5bicGrTjiUSULYi1_any7Kx3SLC4kt97YPWotjuROcdlLMEP2U9Cq-eli-T9FCiyudI_foA",
          seller: profile.name,
          sellerAvatar: profile.avatar,
          description: "Basic desk lamp. Works fine, bulb included."
        }
      ];
      const combined = [...mockListings, ...currentListings];
      saveListings(combined);
      setListings(combined);
    }

    // 2. Load rentals from storage or seed
    const savedRentals = localStorage.getItem("campus_rentals");
    if (!savedRentals) {
      localStorage.setItem("campus_rentals", JSON.stringify(DEFAULT_RENTALS));
      setRentals(DEFAULT_RENTALS);
    } else {
      setRentals(JSON.parse(savedRentals));
    }
  }, [profile.name, profile.avatar]);

  // Sync state on dynamic updates
  useEffect(() => {
    const handleProfileChange = () => setProfile(getProfile());
    const handleListingsUpdate = () => setListings(getListings());
    const handleFavoritesUpdate = () => setFavorites(getFavorites());

    window.addEventListener('profileChanged', handleProfileChange);
    window.addEventListener('listingsUpdated', handleListingsUpdate);
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    return () => {
      window.removeEventListener('profileChanged', handleProfileChange);
      window.removeEventListener('listingsUpdated', handleListingsUpdate);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

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

  // Delete listing permanently
  const handleDeleteListing = (id, title) => {
    if (window.confirm(`Delete "${title}" permanently?`)) {
      const updatedListings = listings.filter(item => item.id !== id);
      setListings(updatedListings);
      saveListings(updatedListings);
    }
  };

  const handleUnfavorite = (id) => {
    toggleFavorite(id);
  };

  // Sales Made estimate
  const salesMadeTotal = (profile.salesCount || 8) * 40.00;

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-max-width mx-auto flex flex-col gap-lg pb-24 pt-6">
      
      {/* Welcome Panel */}
      <section className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-md overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-[300px] bg-gradient-to-l from-primary/5 to-transparent rounded-r-2xl pointer-events-none"></div>
        <div className="flex items-center gap-md text-center md:text-left flex-col md:flex-row">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm shrink-0">
            <img alt="User Avatar" className="w-full h-full object-cover" src={profile.avatar || "https://via.placeholder.com/80"}/>
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-on-surface flex items-center gap-2 justify-center md:justify-start">
              Welcome back, <span>{profile.name}</span>! 👋
            </h1>
            <p className="font-body-md text-on-surface-variant text-sm mt-1 flex items-center justify-center md:justify-start gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">school</span>
              <span>{profile.major}</span>
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-tr from-primary/10 to-primary/5 border border-primary/20 px-6 py-4 rounded-xl flex items-center gap-md shrink-0">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-sm shrink-0">
            <span className="material-symbols-outlined icon-fill">trophy</span>
          </div>
          <div>
            <p className="font-label-sm text-[11px] text-primary uppercase tracking-widest font-extrabold">Trust Ranking</p>
            <p className="font-headline-md text-lg font-bold text-on-surface">Top 12% ({profile.points ? profile.points.toLocaleString() : '1,540'} pts)</p>
          </div>
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
                  onClick={() => handleUnfavorite(item.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-surface/85 backdrop-blur-md rounded-full text-error icon-fill shadow-sm border-0 cursor-pointer active:scale-90"
                >
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
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

    </div>
  );
}
