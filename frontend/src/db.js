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
    const email = localStorage.getItem('user_email');
    const url = email ? `${API_URL}/listings?email=${encodeURIComponent(email)}` : `${API_URL}/listings`;
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch listings:', err);
    return [];
  }
}

export async function saveListing(listing) {
  try {
    const res = await fetch(`${API_URL}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save listing');
    }
    window.dispatchEvent(new Event('listingsUpdated'));
  } catch (err) {
    console.error('Failed to save listing:', err);
    throw err;
  }
}

export async function getListingById(id) {
  try {
    const res = await fetch(`${API_URL}/listings/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch listing ${id}:`, err);
    return null;
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

export async function getNotifications() {
  try {
    const email = localStorage.getItem('user_email');
    if (!email) return [];
    const res = await fetch(`${API_URL}/notifications?email=${encodeURIComponent(email)}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    return [];
  }
}

export async function markNotificationRead(notificationId) {
  try {
    await fetch(`${API_URL}/notifications/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId })
    });
    window.dispatchEvent(new Event('notificationsUpdated'));
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
  }
}

export async function createNotification(userEmail, message, link) {
  try {
    await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, message, link })
    });
    window.dispatchEvent(new Event('notificationsUpdated'));
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

export async function reserveItem(listingId, buyerEmail) {
  try {
    const res = await fetch(`${API_URL}/listings/${listingId}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reserve', buyerEmail })
    });
    window.dispatchEvent(new Event('listingsUpdated'));
    return await res.json();
  } catch (err) {
    console.error('Failed to reserve item:', err);
  }
}

export async function reserveRentItem(listingId, buyerEmail, duration) {
  try {
    const res = await fetch(`${API_URL}/listings/${listingId}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reserve_rent', buyerEmail, duration })
    });
    window.dispatchEvent(new Event('listingsUpdated'));
    return await res.json();
  } catch (err) {
    console.error('Failed to reserve rental item:', err);
  }
}

export async function confirmHandover(listingId) {
  try {
    const res = await fetch(`${API_URL}/listings/${listingId}/handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    window.dispatchEvent(new Event('listingsUpdated'));
    return await res.json();
  } catch (err) {
    console.error('Failed to confirm handover:', err);
  }
}

export async function cancelReservation(listingId) {
  try {
    const res = await fetch(`${API_URL}/listings/${listingId}/cancel-reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    window.dispatchEvent(new Event('listingsUpdated'));
    return await res.json();
  } catch (err) {
    console.error('Failed to cancel reservation:', err);
  }
}

export async function getTransactionHistory(email) {
  try {
    const res = await fetch(`${API_URL}/listings/history?email=${encodeURIComponent(email)}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch transaction history:', err);
    return [];
  }
}

export async function deleteListing(id) {
  try {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error('Failed to delete listing');
    }
    window.dispatchEvent(new Event('listingsUpdated'));
  } catch (err) {
    console.error('Failed to delete listing:', err);
  }
}
export async function deleteAccount() {
  try {
    const email = localStorage.getItem('user_email');
    if (!email) return false;
    
    const res = await fetch(`${API_URL}/profile?email=${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      throw new Error('Failed to delete account');
    }
        // Clear local storage
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('user_email');
    
    window.dispatchEvent(new Event('authChanged'));
    return true;
  } catch (err) {
    console.error('Failed to delete account:', err);
    return false;
  }
}

export async function createReport(reportData) {
  try {
    const res = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return await res.json();
  } catch (err) {
    console.error('Error submitting report:', err);
    throw err;
  }
}

export async function getReports() {
  try {
    const res = await fetch(`${API_URL}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return await res.json();
  } catch (err) {
    console.error('Error fetching reports:', err);
    return [];
  }
}

export async function updateReportStatus(id, action) {
  try {
    const res = await fetch(`${API_URL}/reports/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return await res.json();
  } catch (err) {
    console.error('Error updating report:', err);
    throw err;
  }
}

export async function createChatReport(reportData) {
  try {
    const res = await fetch(`${API_URL}/chat-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!res.ok) throw new Error('Failed to submit chat report');
    return await res.json();
  } catch (err) {
    console.error('Error submitting chat report:', err);
    throw err;
  }
}

export async function getChatReports() {
  try {
    const res = await fetch(`${API_URL}/chat-reports`);
    if (!res.ok) throw new Error('Failed to fetch chat reports');
    return await res.json();
  } catch (err) {
    console.error('Error fetching chat reports:', err);
    return [];
  }
}

export async function updateChatReportStatus(id, action) {
  try {
    const res = await fetch(`${API_URL}/chat-reports/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error('Failed to update chat report status');
    return await res.json();
  } catch (err) {
    console.error('Error updating chat report:', err);
    throw err;
  }
}

export async function getAdminThreadMessages(threadId) {
  try {
    const res = await fetch(`${API_URL}/admin/messages/${threadId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error fetching admin messages:', err);
    return null;
  }
}
