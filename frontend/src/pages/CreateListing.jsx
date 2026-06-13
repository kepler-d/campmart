import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getListings, saveListings, getProfile, saveProfile } from '../db';

const RANDOM_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=400"
];

export default function CreateListing() {
  const navigate = useNavigate();

  // State parameters
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [customCategory, setCustomCategory] = useState('');
  const [condition, setCondition] = useState('Good');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('120.00');
  const [rentPrice, setRentPrice] = useState('');
  const [rentOnly, setRentOnly] = useState(false);
  const [imageUrl, setImageUrl] = useState(RANDOM_IMAGES[0]);

  // Read local image file and convert to base64
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Set random mock image
  const loadRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_IMAGES.length);
    setImageUrl(RANDOM_IMAGES[randomIndex]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const listings = await getListings();
    const profile = await getProfile();

    const buyPrice = parseFloat(price);
    const rentalPrice = parseFloat(rentPrice);

    const newListing = {
      id: `lst-${Date.now()}`,
      title: title || 'Untitled Listing',
      category: category === 'Other' ? (customCategory.trim() || 'Other') : category,
      price: rentOnly ? 0 : (isNaN(buyPrice) ? 0 : buyPrice),
      rentPrice: isNaN(rentalPrice) ? undefined : rentalPrice,
      isRentOnly: rentOnly || undefined,
      rentInterval: rentOnly ? 'mo' : undefined,
      condition: condition,
      rating: 5.0,
      image: imageUrl,
      seller: profile.name || 'Hardik',
      sellerAvatar: profile.avatar || '',
      description: desc
    };

    // Prepend new listing to lists
    listings.unshift(newListing);
    await saveListings(listings);

    // Update profile listings count
    const updatedProfile = {
      ...profile,
      listingsCount: (profile.listingsCount || 0) + 1
    };
    await saveProfile(updatedProfile);

    alert(`Successfully listed "${newListing.title}"! Redirecting to marketplace.`);
    navigate('/marketplace');
  };

  // Rent Only checklist state syncing
  const handleRentOnlyChange = (checked) => {
    setRentOnly(checked);
    if (checked) {
      setPrice('');
      if (!rentPrice) setRentPrice('15.00');
    } else {
      setPrice('120.00');
    }
  };

  // Calculate pricing elements for preview card
  const priceDisplay = rentOnly
    ? `₹${(parseFloat(rentPrice) || 0).toFixed(2)}`
    : `₹${(parseFloat(price) || 0).toFixed(2)}`;

  const secondaryPriceText = (!rentOnly && rentPrice)
    ? `or ₹${parseFloat(rentPrice).toFixed(0)}/month rent`
    : '';

  return (
    <div className="bg-surface-container-low min-h-screen relative overflow-x-hidden pt-4 pb-12">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-secondary/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      {/* Minimalistic Header */}
      <header className="relative z-10 w-full px-margin-mobile md:px-margin-desktop py-md flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            storefront
          </span>
          <div className="font-headline-md text-headline-md font-extrabold text-primary dark:text-primary-fixed-dim tracking-tight">
            CampusMarket
          </div>
        </div>
        <button 
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-xs text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md py-sm px-md rounded-full hover:bg-surface-container-highest bg-transparent border-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
          <span className="hidden sm:inline">Cancel</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop pb-xl pt-lg">
        <div className="mb-xl">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-black">
            Create New Listing
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Sell or rent your items to the campus community.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-gutter items-start">
          {/* Left Column: Form Container */}
          <div className="w-full lg:w-[65%] flex flex-col gap-lg">
            
            {/* Progress indicators layout */}
            <div className="flex items-center justify-between w-full px-md">
              <div className="flex flex-col items-center gap-xs relative z-10">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm shadow-sm ring-4 ring-surface-container-low">1</div>
                <span className="font-label-sm text-label-sm text-primary">Media</span>
              </div>
              <div className="flex-1 h-[2px] bg-primary/20 mx-xs relative top-[-10px]"></div>
              <div className="flex flex-col items-center gap-xs relative z-10">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm ring-4 ring-surface-container-low">2</div>
                <span className="font-label-sm text-label-sm text-primary">Details</span>
              </div>
              <div className="flex-1 h-[2px] bg-primary/20 mx-xs relative top-[-10px]"></div>
              <div className="flex flex-col items-center gap-xs relative z-10">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm ring-4 ring-surface-container-low">3</div>
                <span className="font-label-sm text-label-sm text-primary">Price</span>
              </div>
              <div className="flex-1 h-[2px] bg-primary/20 mx-xs relative top-[-10px]"></div>
              <div className="flex flex-col items-center gap-xs relative z-10">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm ring-4 ring-surface-container-low">4</div>
                <span className="font-label-sm text-label-sm text-primary">Review</span>
              </div>
            </div>

            {/* Form Glassmorphic Frame */}
            <div className="bg-surface/80 backdrop-blur-xl border border-outline-variant/30 rounded-xl shadow-sm p-margin-mobile md:p-xl">
              <form onSubmit={handleSubmit} className="space-y-lg">
                
                {/* 1. Add Image */}
                <div>
                  <h2 className="font-headline-md text-headline-md mb-md">1. Add Photo</h2>
                  <div className="flex flex-col gap-sm">
                    <div className="flex gap-md">
                      <input 
                        type="text" 
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-grow rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md outline-none" 
                        placeholder="Paste image URL here, or load a random image..." 
                      />
                      <button 
                        type="button" 
                        onClick={loadRandomImage}
                        className="px-md py-3 bg-secondary text-on-secondary rounded-lg font-label-md text-label-md hover:bg-secondary/90 transition-colors border-0 cursor-pointer active:scale-95 duration-100"
                      >
                        Load Random
                      </button>
                    </div>
                    <p className="text-[12px] text-outline">Optionally, select a local image file:</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileChange}
                      className="text-sm text-outline file:mr-md file:py-2 file:px-md file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container/20 file:text-primary hover:file:bg-primary-container/30 cursor-pointer"
                    />
                  </div>
                </div>

                <hr className="border-outline-variant/30 my-lg"/>

                {/* 2. Listing Details */}
                <div className="space-y-md">
                  <h2 className="font-headline-md text-headline-md mb-md">2. Listing Details</h2>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-xs font-semibold">Listing Title</label>
                    <input 
                      required 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md outline-none focus:border-primary" 
                      placeholder="e.g. Calculus: Early Transcendentals 9th Edition" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-xs font-semibold">Category</label>
                      <div className="relative">
                        <select 
                          value={category}
                          onChange={(e) => {
                            setCategory(e.target.value);
                            if (e.target.value !== 'Other') {
                              setCustomCategory('');
                            }
                          }}
                          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md appearance-none outline-none cursor-pointer"
                        >
                          <option value="Textbooks">Textbooks</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Furniture">Furniture</option>
                          <option value="Apparel">Apparel</option>
                          <option value="Other">Other</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                      </div>
                      {category === 'Other' && (
                        <div className="mt-sm">
                          <input 
                            required
                            type="text"
                            placeholder="Specify category (e.g. Sports, Art, Vehicles)"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-2.5 text-body-md font-body-md outline-none focus:border-primary placeholder-outline-variant/60"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-xs font-semibold">Condition</label>
                      <div className="relative">
                        <select 
                          value={condition}
                          onChange={(e) => setCondition(e.target.value)}
                          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md appearance-none outline-none cursor-pointer"
                        >
                          <option value="Like New">Like New</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-xs font-semibold">Description</label>
                    <textarea 
                      rows="3" 
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md outline-none focus:border-primary resize-none" 
                      placeholder="Describe your item, including condition notes, syllabus context, or pickup meeting points..."
                    />
                  </div>
                </div>

                <hr className="border-outline-variant/30 my-lg"/>

                {/* 3. Pricing */}
                <div className="space-y-md">
                  <h2 className="font-headline-md text-headline-md mb-md">3. Pricing Options</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-xs font-semibold">Purchase Price (₹)</label>
                      <input 
                        type="number" 
                        required={!rentOnly}
                        disabled={rentOnly}
                        min="0" 
                        step="0.01" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className={`w-full rounded-lg border border-outline-variant px-md py-3 text-body-md font-body-md outline-none focus:border-primary ${rentOnly ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' : 'bg-surface-container-lowest'}`}
                        placeholder="0.00" 
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-xs font-semibold">Rent Price (₹/month, optional)</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={rentPrice}
                        onChange={(e) => setRentPrice(e.target.value)}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md outline-none focus:border-primary" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-md p-2 rounded-md hover:bg-surface-container-low cursor-pointer transition-colors mt-xs">
                    <input 
                      type="checkbox"
                      checked={rentOnly}
                      onChange={(e) => handleRentOnlyChange(e.target.checked)}
                      className="rounded border-outline text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="font-body-md text-[14px] text-on-surface font-semibold">
                      This item is Rent Only (no purchase price option)
                    </span>
                  </label>
                </div>

                <hr className="border-outline-variant/30 my-lg"/>

                {/* Submit button */}
                <button 
                  type="submit" 
                  className="w-full bg-primary text-on-primary hover:bg-primary/95 font-label-md text-label-md py-4 rounded-xl transition-all shadow-md hover:shadow-lg font-bold text-center active:scale-95 duration-100 cursor-pointer border-0"
                >
                  Publish Listing
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Sticky Live Preview */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-[100px] flex flex-col gap-md">
            <h2 className="font-headline-md text-headline-md text-on-surface-variant pl-md">Live Preview</h2>
            
            <article className="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-md relative flex flex-col mx-auto w-full max-w-[340px]">
              {/* Dummy Favorite Tag */}
              <button 
                type="button" 
                className="absolute top-3 right-3 z-10 p-2 bg-surface/85 backdrop-blur-md rounded-full text-outline hover:text-error transition-colors shadow-sm cursor-default"
              >
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
              
              {/* Image box */}
              <div className="relative w-full aspect-[4/3] bg-surface-container-high overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  <img 
                    alt="Preview object" 
                    className="w-full h-full object-cover" 
                    src={imageUrl} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-[48px]">image</span>
                    <span className="font-label-sm text-[12px] mt-1">Image Preview</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm opacity-0 flex items-center justify-center">
                  <span className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md font-semibold">
                    Quick View
                  </span>
                </div>
              </div>

              {/* Descriptions */}
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-sm mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    {category === 'Other' ? (customCategory || 'Other') : category}
                  </span>
                  <div className="flex items-center text-outline text-[12px]">
                    <span className="material-symbols-outlined text-[14px] icon-fill text-tertiary-fixed-dim mr-0.5">star</span>
                    5.0
                  </div>
                </div>

                <h3 className="font-label-md text-[16px] leading-[22px] font-bold text-on-surface line-clamp-2 mb-2">
                  {title || 'Listing Title...'}
                </h3>
                
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-normal">
                  {desc || 'Description will appear here as you type...'}
                </p>

                <div className="mt-auto flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="font-headline-md text-[20px] leading-none text-primary font-black">
                      {priceDisplay}
                      {rentOnly && (
                        <span className="text-[14px] text-outline font-normal">/mo</span>
                      )}
                    </span>
                    {secondaryPriceText && (
                      <span className="font-label-sm text-[11px] text-outline-variant mt-1">
                        {secondaryPriceText}
                      </span>
                    )}
                    {rentOnly && (
                      <span className="font-label-sm text-[11px] text-secondary mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] icon-fill">verified</span>
                        Rental Only
                      </span>
                    )}
                  </div>
                  <span className="font-label-sm text-[12px] text-outline bg-surface-container py-1 px-2 rounded-md">
                    {condition}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
