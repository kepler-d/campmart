// Campus Marketplace Hub - Shared State & Backend Database Manager
// Refactored to fetch from the Node.js backend

const API_URL = 'http://localhost:5000/api';

export async function getListings() {
  try {
    const res = await fetch(`${API_URL}/listings`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch listings:', err);
    return [];
  }
}

export async function saveListings(listings) {
  try {
    await fetch(`${API_URL}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listings)
    });
    window.dispatchEvent(new Event('listingsUpdated'));
  } catch (err) {
    console.error('Failed to save listings:', err);
  }
}

export async function getProfile() {
  try {
    const res = await fetch(`${API_URL}/profile`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    return {};
  }
}

export async function saveProfile(profile) {
  try {
    await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    window.dispatchEvent(new Event('profileChanged'));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export async function getMessages() {
  try {
    const res = await fetch(`${API_URL}/messages`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch messages:', err);
    return [];
  }
}

export async function saveMessages(threads) {
  try {
    await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threads)
    });
    window.dispatchEvent(new Event('messagesUpdated'));
  } catch (err) {
    console.error('Failed to save messages:', err);
  }
}

export async function getFavorites() {
  try {
    const res = await fetch(`${API_URL}/favorites`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch favorites:', err);
    return [];
  }
}

export async function toggleFavorite(listingId) {
  try {
    const res = await fetch(`${API_URL}/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId })
    });
    const data = await res.json();
    window.dispatchEvent(new Event('favoritesUpdated'));
    return data.isFavorite;
  } catch (err) {
    console.error('Failed to toggle favorite:', err);
    return false;
  }
}
