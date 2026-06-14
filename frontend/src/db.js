// Campus Marketplace Hub - Shared State & Backend Database Manager
// Refactored to fetch from the Node.js backend

const API_URL = 'http://localhost:5000/api';

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to login');
    err.requiresOtp = data.requiresOtp;
    throw err;
  }
  return data;
}

export async function registerUser(profileData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to register');
    err.code = data.error; // e.g. 'domain_not_allowed'
    throw err;
  }
  return data;
}

export async function verifyOtp(email, otp) {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to verify OTP');
  }
  return data;
}

export async function requestCampus(domain, institutionName, requesterEmail) {
  const res = await fetch(`${API_URL}/campus-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, institutionName, requesterEmail })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to request campus');
  }
  return data;
}

export async function getCampusRequests() {
  try {
    const res = await fetch(`${API_URL}/campus-requests`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch campus requests:', err);
    return [];
  }
}

export async function approveCampusRequest(requestId) {
  const res = await fetch(`${API_URL}/campus-requests/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to approve campus');
  }
  return data;
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

export async function getOtherProfile(email) {
  try {
    const res = await fetch(`${API_URL}/profile?email=${encodeURIComponent(email)}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    return null;
  }
}

export async function getMessages(email) {
  if (!email) return [];
  try {
    const res = await fetch(`${API_URL}/messages?email=${encodeURIComponent(email)}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch messages:', err);
    return [];
  }
}

export async function markThreadAsRead(threadId, email) {
  try {
    await fetch(`${API_URL}/messages/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, email })
    });
    window.dispatchEvent(new Event('messagesUpdated'));
  } catch (err) {
    console.error('Failed to mark thread as read:', err);
  }
}

export async function createMessageThread(buyerEmail, sellerEmail, productContext, sellerName, sellerAvatar) {
  try {
    const res = await fetch(`${API_URL}/messages/thread`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerEmail, sellerEmail, productContext, sellerName, sellerAvatar })
    });
    const thread = await res.json();
    window.dispatchEvent(new Event('messagesUpdated'));
    return thread;
  } catch (err) {
    console.error('Failed to create message thread:', err);
    return null;
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
