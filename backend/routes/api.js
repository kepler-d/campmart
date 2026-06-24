const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { getDb, Listing, Profile, MessageThread, Favorite, AllowedDomain, CampusRequest, Notification, Report, ChatReport, ActivityLog } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_campus_key';

// Ethereal mail configuration
let transporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return;
  }
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
});

// In-memory cache to speed up reads and reduce MongoDB Atlas latency
const cache = {
  listings: {},
  profile: {},
  messages: null,
  favorites: {}
};

// --- AUTH ---
router.post('/auth/register', async (req, res) => {
  await getDb();
  try {
    const { email, password, name, major, year, avatar } = req.body;
    
    // Domain validation
    const emailParts = email.toLowerCase().split('@');
    if (emailParts.length !== 2) return res.status(400).json({ error: 'Invalid email format' });
    const domain = '@' + emailParts[1];
    
    // Tier 1: Check standard academic TLDs
    const isAcademicTLD = domain.endsWith('.edu') || domain.endsWith('.ac.in') || domain.endsWith('.ac.uk');
    
    // Tier 2: Check allowed custom domains
    let isAllowedDomain = false;
    if (!isAcademicTLD) {
      const allowed = await AllowedDomain.findOne({ domain });
      if (allowed) isAllowedDomain = true;
    }

    if (!isAcademicTLD && !isAllowedDomain) {
      return res.status(403).json({ error: 'domain_not_allowed', domain });
    }

    const existing = await Profile.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    const newProfile = await Profile.create({
      email, password: hashedPassword, name, major, year, avatar,
      isVerified: false, otp,
      rating: 5.0, rank: 99, points: 100,
      listingsCount: 0, salesCount: 0, purchasedCount: 0,
      isAdmin: false
    });

    // Send OTP email
    if (transporter) {
      const info = await transporter.sendMail({
        from: '"CampusMarket Security" <security@campusmarket.edu>',
        to: email,
        subject: 'Verify your CampusMarket Account',
        text: `Your OTP is: ${otp}`,
        html: `<b>Your OTP is: ${otp}</b>`
      });
      console.log('OTP Email Sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } else {
      console.log(`Fallback: Transporter not ready. OTP for ${email} is ${otp}`);
    }
    
    res.json({ success: true, requiresOtp: true, email: newProfile.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/verify-otp', async (req, res) => {
  await getDb();
  try {
    const { email, otp } = req.body;
    const profile = await Profile.findOne({ email });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    if (profile.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    profile.isVerified = true;
    profile.otp = null;
    await profile.save();

    const token = jwt.sign({ email: profile.email }, JWT_SECRET, { expiresIn: '7d' });
    
    const profileData = profile.toObject();
    delete profileData.password;
    delete profileData.otp;

    res.json({ success: true, profile: profileData, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  await getDb();
  try {
    const { email, password } = req.body;
    const profile = await Profile.findOne({ email });
    if (!profile) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let isMatch = false;
    if (profile.password === password) {
       isMatch = true; // Fallback for raw seeded data
    } else if (profile.password) {
       isMatch = await bcrypt.compare(password, profile.password);
    }
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!profile.isVerified) {
      // Re-send OTP here ideally, but for demo just require OTP.
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      profile.otp = otp;
      await profile.save();
      
      if (transporter) {
        const info = await transporter.sendMail({
          from: '"CampusMarket Security" <security@campusmarket.edu>',
          to: email,
          subject: 'Verify your CampusMarket Account',
          text: `Your new OTP is: ${otp}`,
          html: `<b>Your new OTP is: ${otp}</b>`
        });
        console.log('OTP Email Sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      return res.status(403).json({ error: 'Account not verified. OTP sent.', requiresOtp: true });
    }

    const token = jwt.sign({ email: profile.email }, JWT_SECRET, { expiresIn: '7d' });
    
    const profileData = profile.toObject();
    delete profileData.password;
    delete profileData.otp;

    res.json({ success: true, profile: profileData, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- LISTINGS ---
router.get('/listings', async (req, res) => {
  await getDb();
  try {
    const { email } = req.query;
    const domain = email ? '@' + email.split('@')[1] : null;

    if (domain && cache.listings && cache.listings[domain]) {
      return res.json(cache.listings[domain]);
    }

    const query = domain ? { domain } : {};
    const listings = await Listing.find(query, { _id: 0, __v: 0 }).lean();
    
    // Auto-expire reservations
    const now = new Date();
    let cacheNeedsUpdate = false;
    for (let listing of listings) {
      if (listing.status === 'reserved' && listing.reservedUntil && new Date(listing.reservedUntil) < now) {
        await Listing.updateOne({ id: listing.id }, {
          $set: { status: 'available' },
          $unset: { buyerEmail: "", rentedByEmail: "", rentedUntil: "", reservedUntil: "" }
        });
        listing.status = 'available';
        listing.buyerEmail = undefined;
        listing.rentedByEmail = undefined;
        listing.rentedUntil = undefined;
        listing.reservedUntil = undefined;
        cacheNeedsUpdate = true;
      }
    }
    
    if (cacheNeedsUpdate) cache.listings = {};
    
    if (domain) {
      if (!cache.listings) cache.listings = {};
      cache.listings[domain] = listings;
    }

    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/listings', async (req, res) => {
  await getDb();
  const newListings = req.body;
  
  try {
    if (Array.isArray(newListings)) {
      await Listing.deleteMany({});
      await Listing.insertMany(newListings);
      cache.listings = {}; // Invalidate entire cache
    } else {
      if (newListings.sellerEmail) {
        newListings.domain = '@' + newListings.sellerEmail.split('@')[1];
      }
      
      // Prevent duplicate active listings for the same item by the same user
      const duplicateQuery = {
        id: { $ne: newListings.id },
        title: newListings.title,
        status: 'available'
      };
      
      if (newListings.sellerEmail) {
        duplicateQuery.sellerEmail = newListings.sellerEmail;
      } else if (newListings.seller) {
        duplicateQuery.seller = newListings.seller;
      }

      const duplicate = await Listing.findOne(duplicateQuery);
      if (duplicate) {
        return res.status(400).json({ error: 'You already have an active listing for this exact item.' });
      }

      await Listing.findOneAndUpdate(
        { id: newListings.id },
        newListings,
        { upsert: true, new: true }
      );
      if (newListings.domain && cache.listings) {
        delete cache.listings[newListings.domain];
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/listings/history', async (req, res) => {
  await getDb();
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    const historyListings = await Listing.find({
      $or: [
        { buyerEmail: email },
        { rentedByEmail: email }
      ]
    }).lean();
    
    res.json(historyListings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/listings/:id', async (req, res) => {
  await getDb();
  try {
    const listing = await Listing.findOne({ id: req.params.id });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/listings/:id', async (req, res) => {
  await getDb();
  try {
    const { id } = req.params;
    const listing = await Listing.findOne({ id });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    // Check if in transaction and notify buyer
    if (listing.status === 'reserved' || listing.status === 'rented') {
      const notifyEmail = listing.buyerEmail || listing.rentedByEmail;
      if (notifyEmail) {
        await Notification.create({
          userEmail: notifyEmail,
          message: `The listing "${listing.title}" you reserved has been deleted by the seller.`,
          link: '/marketplace'
        });
      }
    }
    
    await Listing.deleteOne({ id });
    await MessageThread.deleteMany({ 'productContext.title': listing.title });
    
    cache.listings = {};
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post('/listings/:id/transaction', async (req, res) => {
  await getDb();
  try {
    const { id } = req.params;
    const { action, buyerEmail, duration } = req.body;
    
    if (!action || !buyerEmail) return res.status(400).json({ error: 'Missing required fields' });
    
    const listing = await Listing.findOne({ id });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    if (action === 'reserve') {
      listing.status = 'reserved';
      listing.buyerEmail = buyerEmail;
      const until = new Date();
      until.setHours(until.getHours() + 48); // 48 hours time limit
      listing.reservedUntil = until;
    } else if (action === 'reserve_rent') {
      listing.status = 'reserved';
      listing.rentedByEmail = buyerEmail;
      
      const rentEnd = new Date();
      if (duration === '1 week') {
        rentEnd.setDate(rentEnd.getDate() + 7);
      } else if (duration === '1 month') {
        rentEnd.setMonth(rentEnd.getMonth() + 1);
      } else if (duration === '3 months') {
        rentEnd.setMonth(rentEnd.getMonth() + 3);
      } else if (duration === '6 months') {
        rentEnd.setMonth(rentEnd.getMonth() + 6);
      } else if (duration === '1 year') {
        rentEnd.setFullYear(rentEnd.getFullYear() + 1);
      }
      listing.rentedUntil = rentEnd;
      
      const reserveEnd = new Date();
      reserveEnd.setHours(reserveEnd.getHours() + 48);
      listing.reservedUntil = reserveEnd;
    }
    
    await listing.save();
    
    // Invalidate caches
    cache.listings = {};
    
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- HANDOVER & CANCELLATION ---
router.post('/listings/:id/handover', async (req, res) => {
  await getDb();
  try {
    const { id } = req.params;
    const listing = await Listing.findOne({ id });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    if (listing.status !== 'reserved') {
      return res.status(400).json({ error: 'Listing is not reserved' });
    }
    
    if (listing.rentedUntil && listing.rentedByEmail) {
       listing.status = 'rented';
    } else {
       listing.status = 'sold';
    }
    
    listing.reservedUntil = undefined;
    await listing.save();
    
    // Delete associated chat thread
    await MessageThread.deleteMany({ 'productContext.title': listing.title });
    
    cache.listings = {};
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/listings/:id/cancel-reservation', async (req, res) => {
  await getDb();
  try {
    const { id } = req.params;
    const listing = await Listing.findOne({ id });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    listing.status = 'available';
    listing.buyerEmail = undefined;
    listing.rentedByEmail = undefined;
    listing.rentedUntil = undefined;
    listing.reservedUntil = undefined;
    
    await listing.save();
    
    // Delete associated chat thread
    await MessageThread.deleteMany({ 'productContext.title': listing.title });
    
    cache.listings = {};
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROFILE & RATINGS ---
router.get('/profile/pending-ratings', async (req, res) => {
  await getDb();
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const pending = await Listing.find({
      $or: [{ buyerEmail: email }, { rentedByEmail: email }],
      status: { $in: ['sold', 'rented'] },
      buyerRated: { $ne: true }
    }).lean();

    // Map to include seller email if not directly available
    // In our current schema, sellerEmail isn't explicitly on Listing, but we use `seller` (name) or `sellerEmail`.
    // Let's resolve sellerEmail for each if needed.
    const enrichedPending = await Promise.all(pending.map(async (item) => {
      let sellerEmail = item.sellerEmail;
      if (!sellerEmail) {
        const profile = await Profile.findOne({ name: item.seller }).lean();
        if (profile) sellerEmail = profile.email;
      }
      return { ...item, resolvedSellerEmail: sellerEmail || 'unknown' };
    }));

    res.json(enrichedPending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/profile/rate-seller', async (req, res) => {
  await getDb();
  const { listingId, sellerEmail, rating } = req.body;
  if (!listingId || !sellerEmail || !rating) return res.status(400).json({ error: 'Missing required fields' });

  try {
    // 1. Mark listing as rated
    await Listing.updateOne({ id: listingId }, { buyerRated: true });

    // 2. Update seller profile
    const sellerProfile = await Profile.findOne({ email: sellerEmail });
    if (sellerProfile) {
      const currentRating = sellerProfile.rating || 5;
      const count = sellerProfile.ratingCount || 1; // Start at 1 to account for default 5 rating

      const newRating = ((currentRating * count) + rating) / (count + 1);
      sellerProfile.rating = parseFloat(newRating.toFixed(1));
      sellerProfile.ratingCount = count + 1;
      await sellerProfile.save();
      delete cache.profile[sellerEmail];
    }
    
    // Invalidate listings cache
    cache.listings = {};
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', async (req, res) => {
  await getDb();
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  try {
    if (cache.profile[email]) return res.json(cache.profile[email]);
    const profile = await Profile.findOne({ email }, { _id: 0, __v: 0 }).lean();
    cache.profile[email] = profile || {};
    res.json(cache.profile[email]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  await getDb();
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    await Profile.findOneAndUpdate(
      { email },
      req.body,
      { upsert: true }
    );
    delete cache.profile[email]; // Invalidate cache
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/profile', async (req, res) => {
  await getDb();
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // 1. Find all listings where this user is the buyer/renter
    const activePurchases = await Listing.find({
      $or: [ { buyerEmail: email }, { rentedByEmail: email } ]
    });

    // Notify sellers and reset those listings
    for (const item of activePurchases) {
      if (item.status === 'reserved' || item.status === 'rented') {
        const sellerEmail = item.sellerEmail || item.domain ? item.sellerEmail || `user${item.domain}` : null;
        if (sellerEmail) {
          await Notification.create({
            userEmail: sellerEmail,
            message: `The user who reserved your item "${item.title}" has deleted their account. Your item is now available again.`,
            link: '/marketplace'
          });
        }
      }
      // Revert listing to available
      item.status = 'available';
      item.buyerEmail = undefined;
      item.rentedByEmail = undefined;
      item.rentedUntil = undefined;
      item.reservedUntil = undefined;
      await item.save();
    }

    // 2. Find all listings where this user is the seller
    const userListings = await Listing.find({
      $or: [ { sellerEmail: email }, { seller: (await Profile.findOne({email}))?.name } ]
    });

    // Notify buyers and delete listings
    for (const item of userListings) {
      if (item.status === 'reserved' || item.status === 'rented') {
        const notifyEmail = item.buyerEmail || item.rentedByEmail;
        if (notifyEmail) {
          await Notification.create({
            userEmail: notifyEmail,
            message: `The seller of the item "${item.title}" you reserved has deleted their account. The listing has been removed.`,
            link: '/marketplace'
          });
        }
      }
      await Listing.deleteOne({ _id: item._id });
    }

    // 3. Delete Message Threads involving this user
    await MessageThread.deleteMany({ participants: email });

    // 4. Delete Favorites
    await Favorite.deleteMany({ userEmail: email });

    // 5. Delete Profile
    await Profile.deleteOne({ email });

    // Clear caches
    delete cache.profile[email];
    cache.listings = {};
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LEADERBOARD ---
router.get('/leaderboard', async (req, res) => {
  await getDb();
  const { period } = req.query; // 'allTime' or 'thisMonth'

  try {
    if (period === 'thisMonth') {
      // 1. Get start of current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // 2. Aggregate activity logs for this month
      const monthlyPoints = await ActivityLog.aggregate([
        { $match: { timestamp: { $gte: startOfMonth } } },
        { $group: { _id: "$userEmail", totalPointsThisMonth: { $sum: "$pointsEarned" } } },
        { $sort: { totalPointsThisMonth: -1 } },
        { $limit: 10 }
      ]);

      // 3. Fetch profile details for these users
      const emails = monthlyPoints.map(p => p._id);
      const profiles = await Profile.find({ email: { $in: emails } }).lean();
      
      const leaderboardData = monthlyPoints.map((mp, index) => {
        const prof = profiles.find(p => p.email === mp._id) || {};
        return {
          rank: index + 1,
          email: mp._id,
          name: prof.name || 'Unknown',
          avatar: prof.avatar || '',
          points: mp.totalPointsThisMonth,
          rating: prof.rating || 5.0,
          salesCount: prof.salesCount || 0,
          label: prof.salesCount > 10 ? 'Power Seller' : 'Rising Star'
        };
      });

      return res.json(leaderboardData);

    } else {
      // All Time: Just sort by total points on Profile
      const topUsers = await Profile.find()
        .sort({ points: -1 })
        .limit(10)
        .lean();

      const leaderboardData = topUsers.map((prof, index) => ({
        rank: index + 1,
        email: prof.email,
        name: prof.name,
        avatar: prof.avatar,
        points: prof.points || 0,
        rating: prof.rating || 5.0,
        salesCount: prof.salesCount || 0,
        label: prof.salesCount > 10 ? 'Power Seller' : 'Rising Star'
      }));

      return res.json(leaderboardData);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --- MESSAGES ---
router.get('/messages', async (req, res) => {
  await getDb();
  const { email } = req.query;
  try {
    let filter = {};
    if (email) {
      filter = { participants: email };
    }
    const messages = await MessageThread.find(filter, { _id: 0, __v: 0 }).lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/messages/thread', async (req, res) => {
  await getDb();
  const { buyerEmail, sellerEmail, productContext, sellerName, sellerAvatar } = req.body;
  
  if (!buyerEmail || !sellerEmail) {
    return res.status(400).json({ error: "Missing participants" });
  }

  try {
    let thread = await MessageThread.findOne({
      participants: { $all: [buyerEmail, sellerEmail] },
      'productContext.title': productContext.title
    }, { _id: 0, __v: 0 }).lean();

    if (!thread) {
      const threadId = `th-${Date.now()}`;
      const newThread = new MessageThread({
        threadId,
        participants: [buyerEmail, sellerEmail],
        senderName: sellerName,
        senderAvatar: sellerAvatar || "",
        productContext,
        online: true,
        lastActive: "Now",
        messages: [
           { sender: buyerEmail, text: `Hi! I have reserved "${productContext?.title || 'this item'}". Let's arrange a time and place to meet for the handover!`, time: "Now" }
        ],
        unreadCount: { [sellerEmail]: 1 }
      });
      await newThread.save();
      thread = newThread.toObject();
    }
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/messages/read', async (req, res) => {
  await getDb();
  const { threadId, email } = req.body;
  if (!threadId || !email) return res.status(400).json({ error: "Missing fields" });

  try {
    const thread = await MessageThread.findOne({ threadId });
    if (thread) {
      if (!thread.unreadCount) thread.unreadCount = {};
      thread.unreadCount[email] = 0;
      thread.markModified('unreadCount');
      await thread.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- FAVORITES ---
router.get('/favorites', async (req, res) => {
  await getDb();
  const { email } = req.query;
  if (!email) return res.json([]);

  try {
    if (cache.favorites[email]) return res.json(cache.favorites[email]);
    const favs = await Favorite.find({ userEmail: email }, { _id: 0, __v: 0 }).lean();
    cache.favorites[email] = favs.map(f => f.listingId);
    res.json(cache.favorites[email]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/favorites/toggle', async (req, res) => {
  await getDb();
  const { listingId, userEmail } = req.body;
  if (!userEmail) return res.status(400).json({ error: 'userEmail required' });
  
  try {
    const existing = await Favorite.findOne({ listingId, userEmail });
    if (existing) {
      await Favorite.deleteOne({ listingId, userEmail });
      delete cache.favorites[userEmail]; // Invalidate cache
      res.json({ isFavorite: false });
    } else {
      await Favorite.create({ listingId, userEmail });
      delete cache.favorites[userEmail]; // Invalidate cache
      res.json({ isFavorite: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NOTIFICATIONS ---
router.get('/notifications', async (req, res) => {
  await getDb();
  const { email } = req.query;
  if (!email) return res.json([]);

  try {
    const notifs = await Notification.find({ userEmail: email }).sort({ createdAt: -1 }).lean();
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notifications', async (req, res) => {
  await getDb();
  try {
    const { userEmail, message, link } = req.body;
    const newNotif = await Notification.create({ userEmail, message, link });
    res.json({ success: true, notification: newNotif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notifications/read', async (req, res) => {
  await getDb();
  try {
    const { notificationId } = req.body;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN / CAMPUS REQUESTS ---
router.post('/campus-requests', async (req, res) => {
  await getDb();
  try {
    const { domain, institutionName, requesterEmail } = req.body;
    const newRequest = await CampusRequest.create({ domain, institutionName, requesterEmail });
    res.json({ success: true, request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/campus-requests', async (req, res) => {
  await getDb();
  try {
    const requests = await CampusRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/campus-requests/approve', async (req, res) => {
  await getDb();
  try {
    const { requestId } = req.body;
    const request = await CampusRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    
    // Add to AllowedDomains
    await AllowedDomain.findOneAndUpdate(
      { domain: request.domain },
      { domain: request.domain, institutionName: request.institutionName },
      { upsert: true }
    );

    request.status = 'Approved';
    await request.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REPORTS ---
router.post('/reports', async (req, res) => {
  await getDb();
  try {
    const { listingId, listingTitle, reporterEmail, reason, description, image } = req.body;
    
    // Create report
    const newReport = await Report.create({
      listingId,
      listingTitle,
      reporterEmail,
      reason,
      description,
      image
    });

    // Notify all admins
    const admins = await Profile.find({ isAdmin: true });
    for (const admin of admins) {
      await Notification.create({
        userEmail: admin.email,
        message: `New report filed by ${reporterEmail} against listing "${listingTitle}". Reason: ${reason}.`,
        link: '/admin'
      });
    }

    res.json({ success: true, report: newReport });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports', async (req, res) => {
  await getDb();
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reports/:id/action', async (req, res) => {
  await getDb();
  try {
    const { id } = req.params;
    const { action } = req.body;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (action === 'approve') {
      report.status = 'Approved (Removed)';
      // Delete the listing
      await Listing.deleteOne({ id: report.listingId });
      cache.listings = {}; // Invalidate cache
    } else if (action === 'dismiss') {
      report.status = 'Dismissed';
    }

    await report.save();
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CHAT REPORTS ---
router.post('/chat-reports', async (req, res) => {
  await getDb();
  try {
    const { threadId, reporterEmail, reportedUserEmail, reason } = req.body;
    
    const newReport = await ChatReport.create({
      threadId,
      reporterEmail,
      reportedUserEmail,
      reason
    });

    // Notify all admins
    const admins = await Profile.find({ isAdmin: true });
    for (const admin of admins) {
      await Notification.create({
        userEmail: admin.email,
        message: `New chat report filed by ${reporterEmail} against ${reportedUserEmail}. Reason: ${reason}.`,
        link: '/admin'
      });
    }

    res.json({ success: true, report: newReport });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/chat-reports', async (req, res) => {
  await getDb();
  try {
    const reports = await ChatReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chat-reports/:id/action', async (req, res) => {
  await getDb();
  try {
    const { id } = req.params;
    const { action } = req.body; // 'dismiss' or 'resolve'

    const report = await ChatReport.findById(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (action === 'dismiss') {
      report.status = 'Dismissed';
    } else if (action === 'resolve') {
      report.status = 'Resolved';
      // Potential side effect: Warn/Ban user. For now just resolve.
    }

    await report.save();
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/messages/:threadId', async (req, res) => {
  await getDb();
  try {
    const thread = await MessageThread.findOne({ threadId: req.params.threadId });
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.clearMessagesCache = () => { cache.messages = null; };

module.exports = router;
