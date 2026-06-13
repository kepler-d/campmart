const mongoose = require('mongoose');

// --- Schemas ---

const listingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  category: String,
  price: Number,
  rentPrice: Number,
  isRentOnly: Boolean,
  rentInterval: String,
  condition: String,
  rating: Number,
  image: String,
  seller: String,
  sellerAvatar: String,
  description: String
}, { strict: false }); // Allow dynamic fields if needed

const profileSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  major: String,
  year: String,
  email: String,
  avatar: String,
  rating: Number,
  rank: Number,
  points: Number,
  listingsCount: Number,
  salesCount: Number,
  purchasedCount: Number,
  isAdmin: Boolean
}, { strict: false });

const messageThreadSchema = new mongoose.Schema({
  threadId: { type: String, required: true, unique: true },
  senderName: String,
  senderAvatar: String,
  productContext: Object,
  online: Boolean,
  lastActive: String,
  messages: Array
}, { strict: false });

const favoriteSchema = new mongoose.Schema({
  listingId: { type: String, required: true, unique: true }
});

// --- Models ---
const Listing = mongoose.model('Listing', listingSchema);
const Profile = mongoose.model('Profile', profileSchema);
const MessageThread = mongoose.model('MessageThread', messageThreadSchema);
const Favorite = mongoose.model('Favorite', favoriteSchema);

// --- Defaults ---
const DEFAULT_LISTINGS = [
  {
    id: "lst-1",
    title: "Calculus: Early Transcendentals, 9th Edition",
    category: "Textbooks",
    price: 45.00,
    rentPrice: 15.00,
    condition: "Like New",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400",
    seller: "Sarah Jenkins",
    sellerAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=zh95gy",
    description: "Used for MATH 101/102. Extremely clean copy, no annotations, markings or highlighted text. Code is used but book itself is in immaculate shape. Happy to meet up anywhere on campus."
  },
  {
    id: "lst-2",
    title: "MacBook Pro M1 2020 - 16GB RAM, 512GB SSD",
    category: "Electronics",
    price: 850.00,
    condition: "Good",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400",
    seller: "Alex Chen",
    sellerAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=9puw0m",
    description: "Space gray MacBook Pro 13-inch. Selling because I upgraded. Battery health is at 88%. Minor cosmetic scratch on bottom lid but keyboard, trackpad and screen are perfect. Charger included."
  },
  {
    id: "lst-3",
    title: "Ergonomic Office Chair - Mesh Back",
    category: "Furniture",
    price: 60.00,
    condition: "Fair",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=400",
    seller: "Marcus Johnson",
    sellerAvatar: "",
    description: "Highly adjustable armrests, lumbar support, and tilt. The mesh back is clean. Some squeaking when tilting back quickly but overall solid. Selling because I am moving out."
  },
  {
    id: "lst-4",
    title: "Wacom Intuos Pro Digital Graphic Drawing Tablet",
    category: "Electronics",
    price: 20.00,
    isRentOnly: true,
    rentInterval: "wk",
    condition: "Like New",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1561069934-eeaff9a5933e?auto=format&fit=crop&w=400",
    seller: "Sarah Jenkins",
    sellerAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=1sciug",
    description: "Professional creative pen tablet. Renting out for students who need it for design assignments. Stylus, pen stand, extra nibs, and USB-C cable included. Rentals limited to 2 weeks max."
  },
  {
    id: "lst-5",
    title: "Vintage Leather Jacket - Oversized Fit",
    category: "Apparel",
    price: 45.00,
    condition: "Good",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400",
    seller: "Sarah Jenkins",
    sellerAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=w2f1l",
    description: "Genuine brown leather jacket, classic varsity bomber style. Fits size Medium/Large. Quilted lining is in great shape. No rips or holes. Pick up at Student Union."
  }
];

const DEFAULT_PROFILE = {
  id: 1,
  name: "Hardik",
  major: "Computer Science",
  year: "4th Year",
  email: "hardik@university.edu",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=tk8uon",
  rating: 4.9,
  rank: 12,
  points: 1540,
  listingsCount: 4,
  salesCount: 8,
  purchasedCount: 14,
  isAdmin: true
};

const DEFAULT_MESSAGES = [
  {
    threadId: "th-1",
    senderName: "Sarah Jenkins",
    senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=tcck4d",
    productContext: {
      title: "Vintage Leather Jacket",
      price: "₹45.00",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400"
    },
    online: true,
    lastActive: "Now",
    messages: [
      { sender: "them", text: "Hey! I saw your listing for the leather jacket. Is it still available?", time: "10:42 AM" },
      { sender: "me", text: "Hi Sarah, yes it is! It's in great condition.", time: "10:43 AM" },
      { sender: "them", text: "Awesome. Would you be willing to meet up on campus today so I can check the fit?", time: "10:45 AM" },
      { sender: "me", text: "Yes, I can meet at the library at 3.", time: "10:46 AM" },
      { sender: "them", text: "Perfect, see you there!", time: "10:48 AM" }
    ]
  },
  {
    threadId: "th-2",
    senderName: "Alex Chen",
    senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=5e85hl",
    productContext: {
      title: "MacBook Pro M1 2020",
      price: "₹850.00",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400"
    },
    online: false,
    lastActive: "2h ago",
    messages: [
      { sender: "them", text: "Hello! Is the price negotiable on the MacBook?", time: "Yesterday" },
      { sender: "me", text: "Hi! I could do ₹820, but not much lower than that since it has 16GB of RAM.", time: "Yesterday" },
      { sender: "them", text: "Is the monitor still available?", time: "2h ago" }
    ]
  },
  {
    threadId: "th-3",
    senderName: "Marcus Johnson",
    senderAvatar: "",
    productContext: {
      title: "Mesh Office Chair",
      price: "₹60.00",
      image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=400"
    },
    online: false,
    lastActive: "Yesterday",
    messages: [
      { sender: "me", text: "Hey Marcus, did the chair work out well for your dorm?", time: "2 days ago" },
      { sender: "them", text: "Yes it's perfect! Fits nicely under my desk.", time: "2 days ago" },
      { sender: "me", text: "Awesome! Please leave a review when you have time.", time: "Yesterday" },
      { sender: "them", text: "Thanks! I'll leave a review.", time: "Yesterday" }
    ]
  }
];

async function initDb() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/campmart');
    console.log('Connected to MongoDB');

    // Seed logic
    const listingsCount = await Listing.countDocuments();
    if (listingsCount === 0) {
      await Listing.insertMany(DEFAULT_LISTINGS);
      await Profile.create(DEFAULT_PROFILE);
      await MessageThread.insertMany(DEFAULT_MESSAGES);
      await Favorite.create({ listingId: 'lst-2' });
      console.log('MongoDB successfully seeded with default data.');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

async function getDb() {
  if (mongoose.connection.readyState !== 1) {
    await initDb();
  }
}

module.exports = {
  initDb,
  getDb,
  Listing,
  Profile,
  MessageThread,
  Favorite
};
