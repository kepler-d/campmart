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
  description: String,
  status: { type: String, default: 'available' }, // 'available', 'rented', 'sold'
  buyerEmail: String,
  rentedByEmail: String,
  rentedUntil: Date
}, { strict: false }); // Allow dynamic fields if needed

const profileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: String,
  name: String,
  major: String,
  year: String,
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
  participants: [String],
  senderName: String,
  senderAvatar: String,
  productContext: Object,
  online: Boolean,
  lastActive: String,
  messages: Array
}, { strict: false });

const favoriteSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  listingId: { type: String, required: true }
});

const allowedDomainSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  institutionName: String
});

const campusRequestSchema = new mongoose.Schema({
  domain: { type: String, required: true },
  institutionName: { type: String, required: true },
  requesterEmail: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  link: String
});

const reportSchema = new mongoose.Schema({
  listingId: { type: String, required: true },
  listingTitle: String,
  reporterEmail: { type: String, required: true },
  reason: { type: String, required: true },
  description: String,
  status: { type: String, default: 'Pending' },
  image: String,
  createdAt: { type: Date, default: Date.now }
});

const chatReportSchema = new mongoose.Schema({
  threadId: { type: String, required: true },
  reporterEmail: { type: String, required: true },
  reportedUserEmail: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Dismissed, Resolved
  createdAt: { type: Date, default: Date.now }
});

// --- Models ---
const Listing = mongoose.model('Listing', listingSchema);
const Profile = mongoose.model('Profile', profileSchema);
const MessageThread = mongoose.model('MessageThread', messageThreadSchema);
const Favorite = mongoose.model('Favorite', favoriteSchema);
const AllowedDomain = mongoose.model('AllowedDomain', allowedDomainSchema);
const CampusRequest = mongoose.model('CampusRequest', campusRequestSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Report = mongoose.model('Report', reportSchema);
const ChatReport = mongoose.model('ChatReport', chatReportSchema);

// --- Defaults ---
const DEFAULT_LISTINGS = [
  {
    id: "lst-1",
    title: "Calculus: Early Transcendentals, 9th Edition",
    category: "Textbooks",
    price: 45.00,
    rentPrice: 15.00,
    condition: "Like New",
    rating: 0.0,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400",
    seller: "Sarah Jenkins",
    sellerAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=zh95gy",
    description: "Used for MATH 101/102. Extremely clean copy, no annotations, markings or highlighted text. Code is used but book itself is in immaculate shape. Happy to meet up anywhere on campus."
  },
  {
    id: "lst-2",
    title: "MacBook Pro M1 2020 - 16GB RAM, 512GB SSD",
    category: "Electronics",
    price: 850.00,
    condition: "Good",
    rating: 0.0,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400",
    seller: "Alex Chen",
    sellerAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=9puw0m",
    description: "Space gray MacBook Pro 13-inch. Selling because I upgraded. Battery health is at 88%. Minor cosmetic scratch on bottom lid but keyboard, trackpad and screen are perfect. Charger included."
  },
  {
    id: "lst-3",
    title: "Ergonomic Office Chair - Mesh Back",
    category: "Furniture",
    price: 60.00,
    condition: "Fair",
    rating: 0.0,
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
    rating: 0.0,
    image: "https://images.unsplash.com/photo-1561069934-eeaff9a5933e?auto=format&fit=crop&w=400",
    seller: "Sarah Jenkins",
    sellerAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=1sciug",
    description: "Professional creative pen tablet. Renting out for students who need it for design assignments. Stylus, pen stand, extra nibs, and USB-C cable included. Rentals limited to 2 weeks max."
  },
  {
    id: "lst-5",
    title: "Vintage Leather Jacket - Oversized Fit",
    category: "Apparel",
    price: 45.00,
    condition: "Good",
    rating: 0.0,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400",
    seller: "Sarah Jenkins",
    sellerAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=w2f1l",
    description: "Genuine brown leather jacket, classic varsity bomber style. Fits size Medium/Large. Quilted lining is in great shape. No rips or holes. Pick up at Student Union."
  }
];

const DEFAULT_PROFILE = {
  email: "hardik@university.edu",
  password: "password123", // Note: will need hashing if saving via route, but initDb skips hooks. Let's keep raw for now, or just leave it. In reality demo users are mock-auth'd.
  isVerified: true,
  name: "Hardik",
  major: "Computer Science",
  year: "4th Year",
  avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=tk8uon",
  rating: 0.0,
  rank: 0,
  points: 0,
  listingsCount: 0,
  salesCount: 0,
  purchasedCount: 0,
  isAdmin: true
};

const DEFAULT_MESSAGES = [
  {
    threadId: "th-1",
    senderName: "Sarah Jenkins",
    senderAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=tcck4d",
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
    senderAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=5e85hl",
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
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB Atlas`);

    // Seed logic
    const listingsCount = await Listing.countDocuments();
    if (listingsCount === 0) {
      await Listing.insertMany(DEFAULT_LISTINGS);
      
      const aaravProfile = {
        email: "student@university.edu",
        password: "password123",
        isVerified: true,
        name: "Aarav Sharma",
        major: "Mechanical Engineering",
        year: "2nd Year",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Aarav",
        rating: 0.0,
        rank: 0,
        points: 0,
        listingsCount: 0,
        salesCount: 0,
        purchasedCount: 0,
        isAdmin: false
      };
      
      await Profile.create([DEFAULT_PROFILE, aaravProfile]);
      await MessageThread.insertMany(DEFAULT_MESSAGES);
      await Favorite.create({ userEmail: 'hardik@university.edu', listingId: 'lst-2' });
      await AllowedDomain.create({ domain: '@indoreinstitute.com', institutionName: 'Indore Institute' });
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
  Favorite,
  AllowedDomain,
  CampusRequest,
  Notification,
  Report,
  ChatReport
};
