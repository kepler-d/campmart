// Campus Marketplace Hub - Shared State & Backend Database Manager
// Refactored to fetch from the Node.js backend

const API_URL = 'http://localhost:5000/api';

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to login');
  }
  return await res.json();
}

export async function registerUser(profileData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to register');
  }
  return await res.json();
}

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
    const email = localStorage.getItem('user_email');
    if (!email) return {};
    const res = await fetch(`${API_URL}/profile?email=${encodeURIComponent(email)}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    return {};
  }
}

export async function saveProfile(profile) {
  try {
    await fetch(`${API_URL}/profile?email=${encodeURIComponent(profile.email)}`, {
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
    const email = localStorage.getItem('user_email');
    if (!email) return [];
    const res = await fetch(`${API_URL}/favorites?email=${encodeURIComponent(email)}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch favorites:', err);
    return [];
  }
}

export async function toggleFavorite(listingId) {
  try {
    const email = localStorage.getItem('user_email');
    if (!email) return false;
    
    const res = await fetch(`${API_URL}/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, userEmail: email })
    });
    const data = await res.json();
    window.dispatchEvent(new Event('favoritesUpdated'));
    return data.isFavorite;
  } catch (err) {
    console.error('Failed to toggle favorite:', err);
    return false;
  }
}
