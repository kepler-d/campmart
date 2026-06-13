const express = require('express');
const router = express.Router();
const { getDb, Listing, Profile, MessageThread, Favorite } = require('../db');

// --- LISTINGS ---
router.get('/listings', async (req, res) => {
  await getDb();
  try {
    // Return listings without the internal mongo _id and __v
    const listings = await Listing.find({}, { _id: 0, __v: 0 }).lean();
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROFILE ---
router.get('/profile', async (req, res) => {
  await getDb();
  try {
    const profile = await Profile.findOne({ id: 1 }, { _id: 0, __v: 0 }).lean();
    res.json(profile || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  await getDb();
  try {
    await Profile.findOneAndUpdate(
      { id: 1 },
      req.body,
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MESSAGES ---
router.get('/messages', async (req, res) => {
  await getDb();
  try {
    const messages = await MessageThread.find({}, { _id: 0, __v: 0 }).lean();
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- FAVORITES ---
router.get('/favorites', async (req, res) => {
  await getDb();
  try {
    const favs = await Favorite.find({}, { _id: 0, __v: 0 }).lean();
    res.json(favs.map(f => f.listingId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/favorites/toggle', async (req, res) => {
  await getDb();
  const { listingId } = req.body;
  
  try {
    const existing = await Favorite.findOne({ listingId });
    if (existing) {
      await Favorite.deleteOne({ listingId });
      res.json({ isFavorite: false });
    } else {
      await Favorite.create({ listingId });
      res.json({ isFavorite: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
