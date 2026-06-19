const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { getDb, Listing, Profile, MessageThread, Favorite, AllowedDomain, CampusRequest, Notification } = require('../db');

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

router.post('/listings/:id/transaction', async (req, res) => {
  await getDb();
  try {
    const { id } = req.params;
    const { action, buyerEmail, duration } = req.body;
    
    if (!action || !buyerEmail) return res.status(400).json({ error: 'Missing required fields' });
    
    const listing = await Listing.findOne({ id });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    if (action === 'buy') {
      listing.status = 'sold';
      listing.buyerEmail = buyerEmail;
    } else if (action === 'rent') {
      listing.status = 'rented';
      listing.rentedByEmail = buyerEmail;
      
      const until = new Date();
      if (duration === '1 week') {
        until.setDate(until.getDate() + 7);
      } else if (duration === '1 month') {
        until.setMonth(until.getMonth() + 1);
      } else if (duration === '3 months') {
        until.setMonth(until.getMonth() + 3);
      } else if (duration === '6 months') {
        until.setMonth(until.getMonth() + 6);
      } else if (duration === '1 year') {
        until.setFullYear(until.getFullYear() + 1);
      }
      listing.rentedUntil = until;
    }
    
    await listing.save();
    
    // Invalidate caches
    cache.listings = {};
    
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROFILE ---
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
      participants: { $all: [buyerEmail, sellerEmail] }
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
           { sender: sellerEmail, text: `Hi! I saw you are interested in "${productContext?.title || 'this item'}". How can I help?`, time: "Now" }
        ],
        unreadCount: { [buyerEmail]: 1 }
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

router.clearMessagesCache = () => { cache.messages = null; };

module.exports = router;
