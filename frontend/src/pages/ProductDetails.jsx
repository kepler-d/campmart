import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getListings, getFavorites, toggleFavorite, getProfile, createMessageThread } from '../db';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load state
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setListings(await getListings());
      setFavorites(await getFavorites());
    };
    fetchInitialData();
  }, []);

  // Find active product
  const product = listings.find(item => item.id === id);

  useEffect(() => {
    // Scroll to top on page navigation
    window.scrollTo(0, 0);
  }, [id]);

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

  if (!product) {
    return (
      <div className="p-margin-mobile md:p-margin-desktop text-center py-20">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">warning</span>
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Listing not found</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 mb-6">
          The item you are looking for does not exist or has been removed.
        </p>
        <Link 
          to="/marketplace" 
          className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-md hover:bg-primary/95 transition-all inline-block"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(product.id);

  const handleFavoriteClick = async () => {
    await toggleFavorite(product.id);
  };

  const handleBuyClick = () => {
    alert(`Thank you for purchasing "${product.title}"! Your transaction is being processed.`);
  };

  const handleRentClick = () => {
    alert(`Starting rental process for "${product.title}".`);
  };

  const handleMessageClick = async () => {
    const profile = await getProfile();
    if (!profile || !profile.email) {
      navigate('/login');
      return;
    }
    
    // For now, product.seller is the name, but we need their email.
    // In a real app, listing would have sellerEmail. We'll use a mocked email for the seller based on their name for demonstration.
    const sellerEmail = product.sellerEmail || product.seller.toLowerCase().replace(' ', '.') + '@indoreinstitute.com';

    const thread = await createMessageThread(
      profile.email,
      sellerEmail,
      {
        title: product.title,
        price: product.isRentOnly 
          ? `₹${(product.rentPrice || 0).toFixed(2)}/mo`
          : `₹${product.price.toFixed(2)}`,
        image: product.image
      },
      product.seller,
      product.sellerAvatar
    );

    if (thread) {
      navigate(`/messages?threadId=${thread.threadId}`);
    } else {
      alert("Failed to create message thread");
    }
  };

  // Get related items
  const relatedItems = listings
    .filter(item => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-max-width mx-auto flex flex-col pt-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center text-label-md font-label-md text-on-surface-variant mb-lg">
        <Link to="/marketplace" className="hover:text-primary transition-colors">Explore</Link>
        <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
        <span className="hover:text-primary transition-colors capitalize">{product.category}</span>
        <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
        <span className="text-on-surface truncate max-w-[150px] md:max-w-none">{product.title}</span>
      </nav>

      {/* Product Details Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-xl">
        {/* Left Column: Image Frame */}
        <div className="lg:col-span-7 flex flex-col gap-md">
          {/* Main Image */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden relative aspect-[4/3] w-full shadow-sm">
            <img alt={product.title} className="w-full h-full object-cover" src={product.image || 'https://via.placeholder.com/600x450'} />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-surface/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm px-3 py-1 rounded-full border border-outline-variant/20 shadow-sm">
                {product.condition}
              </span>
              <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full border border-secondary/20 shadow-sm flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px] icon-fill">verified</span>
                Verified Seller
              </span>
            </div>
          </div>

          {/* Dummy Thumbnails to match bento grid style */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            <button className="flex-shrink-0 w-24 h-24 rounded-lg border-2 border-primary overflow-hidden shadow-sm">
              <img alt="Thumbnail 1" className="w-full h-full object-cover" src={product.image || 'https://via.placeholder.com/96'} />
            </button>
            <button className="flex-shrink-0 w-24 h-24 rounded-lg border border-outline-variant/50 overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
              <img alt="Thumbnail 2" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=96" />
            </button>
            <button className="flex-shrink-0 w-24 h-24 rounded-lg border border-outline-variant/50 overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
              <img alt="Thumbnail 3" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=96" />
            </button>
            <button 
              onClick={() => alert("Upload secondary gallery photos in creation settings.")}
              className="flex-shrink-0 w-24 h-24 rounded-lg border border-outline-variant/50 overflow-hidden opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-outline">add_photo_alternate</span>
            </button>
          </div>
        </div>

        {/* Right Column: Details & Seller Actions */}
        <div className="lg:col-span-5 flex flex-col gap-lg">
          {/* Header */}
          <div>
            <div className="flex justify-between items-start gap-sm mb-2">
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-black leading-tight">
                {product.title}
              </h1>
              <button 
                onClick={handleFavoriteClick}
                className={`p-2 rounded-full border transition-all active:scale-95 duration-100 ${isFav ? 'bg-error/10 border-error/25 text-error' : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant'}`}
              >
                <span className={`material-symbols-outlined ${isFav ? 'icon-fill' : ''}`}>
                  {isFav ? 'favorite' : 'bookmark_border'}
                </span>
              </button>
            </div>
            
            <p className="font-display text-[32px] text-primary font-black mb-4 leading-none">
              {product.isRentOnly 
                ? `₹${(product.rentPrice || 0).toFixed(2)}/mo` 
                : `₹${product.price.toFixed(2)}`}
              {product.rentPrice && !product.isRentOnly && (
                <span className="font-body-md text-body-md text-outline font-normal ml-3">
                  (or ₹{product.rentPrice}/mo rent)
                </span>
              )}
            </p>
            
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Seller Card Wrapper */}
          <div className="bg-white/80 dark:bg-inverse-surface/60 backdrop-blur-xl border border-outline-variant/30 rounded-xl p-lg shadow-sm flex flex-col gap-md">
            <div className="flex items-center gap-md mb-2">
              <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant shrink-0">
                <img 
                  alt="Seller Avatar" 
                  className="w-full h-full object-cover" 
                  src={product.sellerAvatar || 'https://via.placeholder.com/48'} 
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-headline-md text-[18px] text-on-surface leading-snug">{product.seller || 'Sarah Jenkins'}</h3>
                <div className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                  <span>Student • Seller</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center text-primary">
                  <span className="material-symbols-outlined icon-fill text-[18px] text-tertiary-fixed-dim">star</span>
                  <span className="font-label-md text-label-md font-bold ml-1">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">(42 reviews)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-2">
              {product.isRentOnly ? (
                <button 
                  disabled
                  className="w-full bg-outline-variant text-on-surface-variant font-label-md text-label-md py-3 rounded-lg cursor-not-allowed flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-outlined">block</span>
                  Rent Only
                </button>
              ) : (
                <button 
                  onClick={handleBuyClick}
                  className="w-full bg-primary text-on-primary hover:bg-primary/95 font-label-md text-label-md py-3 rounded-lg transition-colors font-semibold flex justify-center items-center gap-2 active:scale-95 duration-100 shadow-sm"
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Buy Now
                </button>
              )}

              <div className="flex gap-3">
                {(product.rentPrice || product.isRentOnly) && (
                  <button 
                    onClick={handleRentClick}
                    className="flex-1 bg-surface border border-outline hover:bg-surface-container-low text-primary font-label-md text-label-md py-3 rounded-lg transition-colors font-semibold flex justify-center items-center gap-2 active:scale-95 duration-100"
                  >
                    <span className="material-symbols-outlined">calendar_today</span>
                    Rent Item
                  </button>
                )}
                
                <button 
                  onClick={handleMessageClick}
                  className="flex-grow flex-shrink bg-transparent text-secondary border border-secondary hover:bg-secondary/5 font-label-md text-label-md py-3 rounded-lg transition-all font-semibold flex justify-center items-center gap-2 active:scale-95 duration-100"
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                  Message Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Items Section */}
      {relatedItems.length > 0 && (
        <section className="border-t border-outline-variant/30 pt-xl mt-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Related Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
            {relatedItems.map(item => (
              <article 
                key={item.id} 
                className="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)] transition-all duration-300 relative flex flex-col shadow-sm"
              >
                {/* Image Link */}
                <Link to={`/product/${item.id}`} className="relative w-full aspect-[4/3] bg-surface-container-high overflow-hidden">
                  <img alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={item.image} />
                </Link>
                {/* Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary mb-1">{item.category}</span>
                  <Link 
                    to={`/product/${item.id}`} 
                    className="font-label-md text-[14px] leading-snug font-bold text-on-surface line-clamp-2 mb-2 group-hover:text-primary transition-colors cursor-pointer"
                  >
                    {item.title}
                  </Link>
                  <div className="mt-auto flex justify-between items-baseline pt-2">
                    <span className="font-label-md text-primary font-bold">
                      {item.isRentOnly ? `₹${(item.rentPrice || 0).toFixed(2)}/mo` : `₹${item.price.toFixed(2)}`}
                    </span>
                    <span className="text-[11px] text-outline font-semibold px-2 py-0.5 bg-surface-container rounded-md">
                      {item.condition}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
