import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, saveProfile, getListings } from '../db';

export default function Profile() {
  const navigate = useNavigate();

  // Load from database
  const [profile, setProfile] = useState(getProfile());
  const [listings, setListings] = useState(getListings());

  // Edit profile states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // Sync profile & listings internally
  useEffect(() => {
    const handleProfileChange = () => setProfile(getProfile());
    const handleListingsUpdate = () => setListings(getListings());

    window.addEventListener('profileChanged', handleProfileChange);
    window.addEventListener('listingsUpdated', handleListingsUpdate);

    return () => {
      window.removeEventListener('profileChanged', handleProfileChange);
      window.removeEventListener('listingsUpdated', handleListingsUpdate);
    };
  }, []);

  const openEditModal = () => {
    setEditName(profile.name);
    setEditMajor(profile.major);
    setEditAvatar(profile.avatar || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: editName.trim() || profile.name,
      major: editMajor.trim() || profile.major,
      avatar: editAvatar.trim() || profile.avatar
    };

    setProfile(updated);
    saveProfile(updated);
    setShowEditModal(false);
  };

  // Listings matching current seller
  const userListings = listings.filter(item => item.seller === profile.name);

  return (
    <div className="pt-6 px-margin-mobile md:px-margin-desktop pb-24 max-w-max-width mx-auto w-full">
      {/* Header / Profile Summary Bento */}
      <section className="flex flex-col lg:flex-row gap-gutter mb-xl">
        {/* Main Profile Card */}
        <div className="flex-1 bg-surface-container-lowest rounded-xl border border-surface-variant p-lg flex flex-col md:flex-row items-center md:items-start gap-lg relative overflow-hidden shadow-sm">
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
                {profile.major}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4 max-w-lg leading-relaxed">
              Active member since Fall 2021. Usually replies within 15 minutes. Preferred meeting spot: Student Union North Entrance.
            </p>
            <div className="flex flex-wrap gap-sm justify-center md:justify-start">
              <button 
                onClick={openEditModal}
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
              <button className="border border-outline-variant bg-transparent text-on-surface p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
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

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="bg-primary-container/10 p-3 rounded-lg text-primary shrink-0">
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
          </div>
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">Total Sales</div>
            <div className="font-headline-md text-headline-md text-on-surface font-black">{profile.salesCount || 0}</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="bg-secondary-container/30 p-3 rounded-lg text-secondary shrink-0">
            <span className="material-symbols-outlined text-[24px]">storefront</span>
          </div>
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">Active Listings</div>
            <div className="font-headline-md text-headline-md text-on-surface font-black">{userListings.length}</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="bg-tertiary-container/10 p-3 rounded-lg text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[24px] icon-fill">star</span>
          </div>
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">Avg Rating</div>
            <div className="font-headline-md text-headline-md text-on-surface font-black flex items-baseline gap-1">
              {(profile.rating || 4.9).toFixed(1)} 
              <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="bg-error-container/20 p-3 rounded-lg text-error shrink-0">
            <span className="material-symbols-outlined text-[24px]">bolt</span>
          </div>
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">Purchased</div>
            <div className="font-headline-md text-headline-md text-on-surface font-black">{profile.purchasedCount || 0}</div>
          </div>
        </div>
      </section>

      {/* Active Listings Grid */}
      <section className="mb-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface font-black">Active Listings</h2>
          <span className="text-outline text-label-md font-semibold">{userListings.length} items</span>
        </div>
        
        {userListings.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant font-body-md bg-surface border border-outline-variant/30 rounded-xl">
            You haven't listed any items yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {userListings.map(item => (
              <div 
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden shadow-sm flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                <div className="h-48 bg-surface-variant w-full relative">
                  <img alt={item.title} className="w-full h-full object-cover" src={item.image}/>
                  <span className="absolute top-3 right-3 bg-surface/90 backdrop-blur px-2 py-1 rounded text-label-sm font-bold text-primary border border-outline-variant/10 shadow-sm">
                    ${(item.isRentOnly ? (item.rentPrice || 0) : item.price).toFixed(2)}
                    {item.isRentOnly && '/mo'}
                  </span>
                </div>
                <div className="p-md flex flex-col flex-1">
                  <h3 className="font-label-md text-label-md font-bold text-on-surface mb-1 line-clamp-1">{item.title}</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">{item.condition} • {item.category}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-label-sm text-secondary font-semibold flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Reviews */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface font-black">Recent Reviews</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-1 text-tertiary-fixed-dim">
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n} className="material-symbols-outlined icon-fill text-[18px]">star</span>
                ))}
              </div>
              <span className="text-label-sm text-on-surface-variant">1 day ago</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface mb-4 leading-relaxed">
              "Alex was super responsive and met me exactly on time. The textbook was in perfect condition just like the listing said. Would definitely buy from again!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">SJ</div>
              <span className="font-label-md text-on-surface font-semibold">Sarah J.</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-1 text-tertiary-fixed-dim">
                {[1, 2, 3, 4].map(n => (
                  <span key={n} className="material-symbols-outlined icon-fill text-[18px]">star</span>
                ))}
                <span className="material-symbols-outlined text-[18px] text-outline">star</span>
              </div>
              <span className="text-label-sm text-on-surface-variant">3 days ago</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface mb-4 leading-relaxed">
              "Great transaction. The bike rental was smooth and the bike was well-maintained. Deducted a star just because we had to reschedule the drop-off time, but otherwise excellent."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">MK</div>
              <span className="font-label-md text-on-surface font-semibold">Mike K.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal Dialog */}
      {showEditModal && (
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
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Major & Year</label>
                <input 
                  type="text" 
                  value={editMajor}
                  onChange={(e) => setEditMajor(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-2.5 text-body-md font-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Avatar URL</label>
                <input 
                  type="text" 
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-2.5 text-body-md font-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-sm mt-md pt-2">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
    </div>
  );
}
