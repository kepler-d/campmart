import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getListings, getFavorites, toggleFavorite } from '../db';

export default function Marketplace() {
  const location = useLocation();
  const navigate = useNavigate();

  // Load from db
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setListings(await getListings());
      setFavorites(await getFavorites());
    };
    fetchInitialData();
  }, []);

  // Filter state variables
  const [mode, setMode] = useState('buy');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [sortBy, setSortBy] = useState('Newest First');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile drawer visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync search input with url search parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

  // Sync changes to listings or favorites across pages
  useEffect(() => {
    const handleListingsUpdate = async () => setListings(await getListings());
    const handleFavoritesUpdate = async () => setFavorites(await getFavorites());

    window.addEventListener('listingsUpdated', handleListingsUpdate);
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    return () => {
      window.removeEventListener('listingsUpdated', handleListingsUpdate);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  const handleFavoriteToggle = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(id);
  };

  const handleResetFilters = () => {
    setMode('buy');
    setSelectedCategories(['Textbooks', 'Electronics']);
    setMinPrice('');
    setMaxPrice('');
    setSelectedConditions([]);
    setSortBy('Newest First');
    navigate('/marketplace');
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleCondition = (cond) => {
    setSelectedConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  // Perform filtration
  const filteredListings = listings.filter(item => {
    // 1. Search Query filter
    if (searchQuery) {
      const matchTitle = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = item.description ? item.description.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Buy/Rent filter
    if (mode === 'buy') {
      if (item.isRentOnly) return false;
    } else {
      if (item.isRentOnly === undefined && item.rentPrice === undefined) return false;
    }

    // 3. Category filter
    if (selectedCategories.length > 0) {
      const standardCategories = ['Textbooks', 'Electronics', 'Furniture', 'Apparel'];
      const matchesStandard = selectedCategories.includes(item.category);
      const matchesOther = selectedCategories.includes('Other') && !standardCategories.includes(item.category);
      if (!matchesStandard && !matchesOther) return false;
    }

    // 4. Price range filter
    const price = mode === 'rent' ? (item.rentPrice || item.price) : item.price;
    if (minPrice !== '' && !isNaN(parseFloat(minPrice))) {
      if (price < parseFloat(minPrice)) return false;
    }
    if (maxPrice !== '' && !isNaN(parseFloat(maxPrice))) {
      if (price > parseFloat(maxPrice)) return false;
    }

    // 5. Condition filter
    if (selectedConditions.length > 0) {
      if (!selectedConditions.includes(item.condition)) return false;
    }

    return true;
  });

  // Sorting
  const sortedListings = [...filteredListings];
  if (sortBy === 'Price: Low to High') {
    sortedListings.sort((a, b) => {
      const priceA = mode === 'rent' ? (a.rentPrice || a.price) : a.price;
      const priceB = mode === 'rent' ? (b.rentPrice || b.price) : b.price;
      return priceA - priceB;
    });
  } else if (sortBy === 'Price: High to Low') {
    sortedListings.sort((a, b) => {
      const priceA = mode === 'rent' ? (a.rentPrice || a.price) : a.price;
      const priceB = mode === 'rent' ? (b.rentPrice || b.price) : b.price;
      return priceB - priceA;
    });
  } else {
    // Default: Newest first (listings are prepended in array, so let's preserve default order or use timestamps)
    sortedListings.sort((a, b) => {
      const tA = a.id.startsWith('lst-') ? parseInt(a.id.split('-')[1]) : 0;
      const tB = b.id.startsWith('lst-') ? parseInt(b.id.split('-')[1]) : 0;
      return tB - tA;
    });
  }

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-max-width mx-auto flex flex-col lg:flex-row gap-xl pt-6">
      {/* Advanced Filters Sidebar (Left Side) */}
      <aside className="w-full lg:w-[260px] shrink-0 flex flex-col gap-xl">
        {/* Mobile Filter Toggle Button */}
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden flex items-center justify-center gap-sm w-full bg-surface-container-low text-on-surface py-3 rounded-lg font-label-md text-label-md border border-outline-variant/30 active:scale-95 duration-100"
        >
          <span className="material-symbols-outlined">tune</span>
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Filters Panel */}
        <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col gap-lg bg-surface border border-outline-variant/30 rounded-xl p-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)]`}>
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-md">
            <h2 className="font-headline-md text-[18px] leading-[24px] font-semibold text-on-surface">Filters</h2>
            <button 
              onClick={handleResetFilters}
              className="text-primary font-label-sm text-label-sm hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Buy / Rent Switcher */}
          <div className="bg-surface-container-low p-1 rounded-lg flex gap-1">
            <button 
              onClick={() => setMode('buy')}
              className={`flex-1 rounded-md py-2 font-label-md text-label-md text-center transition-all ${mode === 'buy' ? 'bg-surface shadow-sm text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
            >
              Buy
            </button>
            <button 
              onClick={() => setMode('rent')}
              className={`flex-1 rounded-md py-2 font-label-md text-label-md text-center transition-all ${mode === 'rent' ? 'bg-surface shadow-sm text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
            >
              Rent
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Category</h3>
            <div className="flex flex-col gap-xs">
              {['Textbooks', 'Electronics', 'Furniture', 'Apparel', 'Other'].map(cat => (
                <label 
                  key={cat}
                  className="flex items-center gap-md p-2 rounded-md hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <input 
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="rounded border-outline text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className={`font-body-md text-[14px] ${selectedCategories.includes(cat) ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Price Range</h3>
            <div className="flex items-center gap-sm">
              <input 
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-md p-2 text-center font-body-md text-[14px] focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                placeholder="Min" 
                type="text"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="text-outline-variant">-</span>
              <input 
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-md p-2 text-center font-body-md text-[14px] focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                placeholder="Max" 
                type="text"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Condition Buttons */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Condition</h3>
            <div className="flex flex-wrap gap-2">
              {['Like New', 'Good', 'Fair'].map(cond => {
                const isActive = selectedConditions.includes(cond);
                return (
                  <button 
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`px-3 py-1.5 border rounded-full font-label-sm text-label-sm transition-colors active:scale-95 duration-100 ${isActive ? 'border-primary text-primary bg-primary-container/10 font-semibold' : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid Section */}
      <section className="flex-1 flex flex-col gap-xl">
        {/* Grid Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Explore Marketplace</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {sortedListings.length} active listing{sortedListings.length !== 1 && 's'} matching your criteria.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <span className="font-label-sm text-label-sm text-outline">Sort by:</span>
            <select 
              className="bg-surface border border-outline-variant/50 rounded-lg py-2 pl-3 pr-8 font-label-md text-label-md text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Layout */}
        {sortedListings.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">search_off</span>
            <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">No results found</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-sm">
              We couldn't find anything matching your filters. Try adjusting your categories or price range.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {sortedListings.map(item => {
              const isFav = favorites.includes(item.id);
              
              const priceDisplay = mode === 'rent'
                ? `₹${(item.rentPrice || item.price).toFixed(2)}`
                : `₹${item.price.toFixed(2)}`;

              return (
                <article 
                  key={item.id} 
                  className="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)] transition-all duration-300 relative flex flex-col shadow-sm"
                >
                  {/* Bookmark Button */}
                  <button 
                    onClick={(e) => handleFavoriteToggle(item.id, e)}
                    className={`absolute top-3 right-3 z-20 p-2 bg-surface/80 backdrop-blur-md rounded-full shadow-sm active:scale-95 duration-100 transition-colors ${isFav ? 'text-error' : 'text-outline hover:text-error'}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isFav ? 'icon-fill' : ''}`}>favorite</span>
                  </button>
                  
                  {/* Image Frame */}
                  <Link 
                    to={`/product/${item.id}`} 
                    className="relative w-full aspect-[4/3] bg-surface-container-high overflow-hidden cursor-pointer"
                  >
                    <img 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      src={item.image || 'https://via.placeholder.com/400x300'}
                    />
                    <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all shadow-lg">
                        Quick View
                      </span>
                    </div>
                  </Link>
                  
                  {/* Detail Panel */}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-sm mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        {item.category}
                      </span>
                      <div className="flex items-center text-outline text-[12px]">
                        <span className="material-symbols-outlined text-[14px] icon-fill text-tertiary-fixed-dim mr-0.5">star</span>
                        {item.rating.toFixed(1)}
                      </div>
                    </div>
                    
                    <Link 
                      to={`/product/${item.id}`} 
                      className="font-label-md text-[16px] leading-[22px] font-bold text-on-surface line-clamp-2 mb-2 group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {item.title}
                    </Link>
                    
                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="font-headline-md text-[20px] leading-none text-primary font-black">
                          {priceDisplay}
                          {mode === 'rent' && (
                            <span className="text-[14px] text-outline font-normal">/{item.rentInterval || 'mo'}</span>
                          )}
                        </span>
                        {mode === 'buy' && item.rentPrice && (
                          <span className="font-label-sm text-[11px] text-outline-variant mt-1">
                            or ₹{item.rentPrice}/month rent
                          </span>
                        )}
                        {mode === 'rent' && item.isRentOnly && (
                          <span className="font-label-sm text-[11px] text-secondary mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] icon-fill">verified</span>
                            Rental Only
                          </span>
                        )}
                      </div>
                      <span className="font-label-sm text-[12px] text-outline bg-surface-container py-1 px-2 rounded-md">
                        {item.condition}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination Indicator (Mock) */}
        {sortedListings.length > 0 && (
          <div className="flex justify-center items-center gap-xs mt-xl border-t border-outline-variant/30 pt-lg">
            <button className="p-2 text-outline hover:text-primary hover:bg-surface-container-low rounded-md transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-on-primary font-label-md font-semibold shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-on-surface hover:bg-surface-container-low font-label-md transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-on-surface hover:bg-surface-container-low font-label-md transition-colors">3</button>
            <span className="text-outline mx-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-on-surface hover:bg-surface-container-low font-label-md transition-colors">12</button>
            <button className="p-2 text-outline hover:text-primary hover:bg-surface-container-low rounded-md transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
