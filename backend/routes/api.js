const express = require('express');
const router = express.Router();
const { getDb, Listing, Profile, MessageThread, Favorite } = require('../db');

// In-memory cache to speed up reads and reduce MongoDB Atlas latency
const cache = {
  listings: null,
  profile: {},
  messages: null,
  favorites: {}
};

// --- AUTH ---
router.post('/auth/register', async (req, res) => {
  await getDb();
  try {
    const { email, password, name, major, year, avatar } = req.body;
    const existing = await Profile.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const newProfile = await Profile.create({
      email, password, name, major, year, avatar,
      rating: 5.0, rank: 99, points: 100,
      listingsCount: 0, salesCount: 0, purchasedCount: 0,
      isAdmin: false
    });
    
    res.json({ success: true, profile: newProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  await getDb();
  try {
    const { email, password } = req.body;
    const profile = await Profile.findOne({ email, password }, { _id: 0, __v: 0 }).lean();
    if (!profile) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- LISTINGS ---
router.get('/listings', async (req, res) => {
  await getDb();
  try {
    if (cache.listings) return res.json(cache.listings);
    // Return listings without the internal mongo _id and __v
    const listings = await Listing.find({}, { _id: 0, __v: 0 }).lean();
    cache.listings = listings;
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
    } else {
      await Listing.findOneAndUpdate(
        { id: newListings.id },
        newListings,
        { upsert: true, new: true }
      );
    }
    cache.listings = null; // Invalidate cache
    res.json({ success: true });
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
  try {
    if (cache.messages) return res.json(cache.messages);
    const messages = await MessageThread.find({}, { _id: 0, __v: 0 }).lean();
    cache.messages = messages;
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/messages', async (req, res) => {
  await getDb();
  const threads = req.body;
  try {
    await MessageThread.deleteMany({});
    if (threads && threads.length > 0) {
      await MessageThread.insertMany(threads);
    }
    cache.messages = null; // Invalidate cache
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

router.clearMessagesCache = () => { cache.messages = null; };

module.exports = router;
