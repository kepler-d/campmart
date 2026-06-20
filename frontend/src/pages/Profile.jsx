import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, saveProfile, getListings, getTransactionHistory } from '../db';

export default function Profile() {
  const navigate = useNavigate();

  // Load from database
  const [profile, setProfile] = useState({});
  const [listings, setListings] = useState([]);
  const [historyListings, setHistoryListings] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const prof = await getProfile();
      setProfile(prof);
      setListings(await getListings());
      if (prof && prof.email) {
        setHistoryListings(await getTransactionHistory(prof.email));
      }
    };
    fetchInitialData();
  }, []);



  // Sync profile & listings internally
  useEffect(() => {
    const handleProfileChange = async () => {
      const prof = await getProfile();
      setProfile(prof);
      if (prof && prof.email) {
        setHistoryListings(await getTransactionHistory(prof.email));
      }
    };
    const handleListingsUpdate = async () => {
      setListings(await getListings());
      const prof = await getProfile();
      if (prof && prof.email) {
        setHistoryListings(await getTransactionHistory(prof.email));
      }
    };

    window.addEventListener('profileChanged', handleProfileChange);
    window.addEventListener('listingsUpdated', handleListingsUpdate);

    return () => {
      window.removeEventListener('profileChanged', handleProfileChange);
      window.removeEventListener('listingsUpdated', handleListingsUpdate);
    };
  }, []);



  // Listings matching current seller
  const userListings = listings.filter(item => item.seller === profile.name);

  return (
    <div className="pt-6 px-margin-mobile md:px-margin-desktop pb-24 max-w-max-width mx-auto w-full">


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
                    ₹{(item.isRentOnly ? (item.rentPrice || 0) : item.price).toFixed(2)}
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

      {/* Buying & Rental History Section */}
      <section className="mb-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface font-black">Buying & Rental History</h2>
          <span className="text-outline text-label-md font-semibold">{historyListings.length} items</span>
        </div>
        
        {historyListings.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant font-body-md bg-surface border border-outline-variant/30 rounded-xl">
            You haven't bought or rented any items yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {historyListings.map(item => {
              const isRented = item.rentedByEmail === profile.email && item.status === 'rented';
              const isBought = item.buyerEmail === profile.email && item.status === 'sold';
              let rentedUntilStr = '';
              if (isRented && item.rentedUntil) {
                rentedUntilStr = new Date(item.rentedUntil).toLocaleDateString();
              }

              return (
                <div 
                  key={item.id}
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden shadow-sm flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                >
                  <div className="h-48 bg-surface-variant w-full relative">
                    <img alt={item.title} className="w-full h-full object-cover" src={item.image}/>
                    {isRented && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-label-sm font-bold shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        Rented
                      </span>
                    )}
                    {isBought && (
                      <span className="absolute top-3 left-3 bg-primary text-on-primary px-2 py-1 rounded text-label-sm font-bold shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">shopping_bag</span>
                        Purchased
                      </span>
                    )}
                  </div>
                  <div className="p-md flex flex-col flex-1">
                    <h3 className="font-label-md text-label-md font-bold text-on-surface mb-1 line-clamp-1">{item.title}</h3>
                    {isRented && (
                      <p className="font-label-sm text-label-sm text-orange-600 font-semibold mb-4 flex items-center gap-1">
                        Expires: {rentedUntilStr}
                      </p>
                    )}
                    {isBought && (
                      <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">
                        Sold by: {item.seller}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>



    </div>
  );
}
