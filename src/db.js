// Campus Marketplace Hub - Shared State & LocalStorage Database Manager

const DEFAULT_LISTINGS = [
  {
    id: "lst-1",
    title: "Calculus: Early Transcendentals, 9th Edition",
    category: "Textbooks",
    price: 45.00,
    rentPrice: 15.00,
    condition: "Like New",
    rating: 4.8,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBA8hiRQWq9w5PRkjiI8Do0vyV-ZWZPH983o5oxbh0glCUD159_cwHrSCouXmUcF1Kpp7_3ZdfmgGjJd8VnEh-n2TVX2OiWRCSrMnoLjN8Q--AurQfAyxCX2faMgtrXFJJmkeAMAei87ySLGdbzDFS9lmX4J_YO0UWgIuZ2QK5EsqKUbL3L_aWRf5MtusuVk27HGRF-3wjPzzYiNe6UYHrzOU-Zif2NbiQIbTCSwhibXqVzYKnCy4cbim5c67OZ1rxwUu7zhmoCCm6v",
    seller: "Sarah Jenkins",
    sellerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCddLeL5NGVY9hPMgt2jNXb68b8Wej1lIjzeAC3C63VVLmjsFKhSMjwRLsofh53I1xuYZ8VMKTYCi_IJLB9DkIYec6gPC_PkQ0nYORX3uaq823XNOYc1s7WjJnELCL_LLrmnVaxJMZNXbxv9dTbpWOn2KhEhVVmlWfMTPGQDhEOwKDFMmdQkucmcGwNE3N6oibdlgOUVE1dS1uMva0xBJSpDOAn_vKZS4MoHzYoAR68SlbBxJtBHn6tOQfxFGyNdtXyp7_hCVKVK5I8",
    description: "Used for MATH 101/102. Extremely clean copy, no annotations, markings or highlighted text. Code is used but book itself is in immaculate shape. Happy to meet up anywhere on campus."
  },
  {
    id: "lst-2",
    title: "MacBook Pro M1 2020 - 16GB RAM, 512GB SSD",
    category: "Electronics",
    price: 850.00,
    condition: "Good",
    rating: 5.0,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzckiG-qpY7WkidwL73YJ4uxGLxg9gy0qpOoZ9HUysT7_kyhNlcpSWBXRqFVImltioHuWKVB15XrUK_UfnULCG0Ql_VbJ5r5SjcD2VZ2xXxAPeyH9td4Rs1rbHGYsE2Lk9qubEEBHq0moAzeCwMR_T2minJlJOYS8-nE0_1pve_0ClEffzOkj2iime5nb6Fa5LOyhy5QM1bZRy_TvYMd1_UnaA76rfiJX-9aMNlLmVdvoPDMc0AeSV9jikuPK8WOte7hIYrWaQJczh",
    seller: "Alex Chen",
    sellerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0WBZrHvUilcRJu0qjYYsJjgeCCBa3AwsGDA5vraAy8XJ3UdXsJjeaoBYR5zCN4fpJ3Zt_J_yt1w-wLcw9xbBoTYIc0aPVvr_muO3vUH6QJvyyw0Mrp6SBaGIlKwnhUhvghvrAFZ6jkpVFZskRLe9R9Kr8GdRbILkQK2viyolRz0YbcqlunOBGt0X5Lc23fvVi4XxBDgEwETcQCeP0KXGBNYOS-3_qY9pBnyGp77vEi1QiuY5Bc1G5UNRGMaLYMF2f2lgoUhfxgvAK",
    description: "Space gray MacBook Pro 13-inch. Selling because I upgraded. Battery health is at 88%. Minor cosmetic scratch on bottom lid but keyboard, trackpad and screen are perfect. Charger included."
  },
  {
    id: "lst-3",
    title: "Ergonomic Office Chair - Mesh Back",
    category: "Furniture",
    price: 60.00,
    condition: "Fair",
    rating: 4.2,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIZYdnOcuujHPRYidfLxYGjIMeKcvEvIktVnpU9jGcjnyZzrJsDbx0YbGXOYro7ZQhVIJGJ4Tlf-YsWnF0DKCkGTogI3_iJwLBGOlpEnZ46D_lQhquVbBs24Jf6VBznP8Okm21iuLgtCxbaQgj1uITXyuYBPxpfbnwsJcWHlaD1bcjt1a3mLKsAnpnPCQwP6KySBCcJ5bicGrTjiUSULYi1_any7Kx3SLC4kt97YPWotjuROcdlLMEP2U9Cq-eli-T9FCiyudI_foA",
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
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiKF-D4yzQGV6u_iWTPq1w05BoQwD9EiZV_NzMrU1BJFVFT9b9BrFsKkjID92vD8rx6qHEK1XaLqaqwZFcW1TAHSypCVZvNu0GLFXzAmQpGuwE2gRMf4rjhj92AGOtFugNalqQ2m3YtmE5lYkqmC5bWqmDUH_o0yPAUwdiGvimfrwatXzvzXW7YAnRuYoHlo2gyZSSfh5nW9SpESQIrQyk0C06dBjfyrwN6pTb_vBBzbWTWmvH-6zQOCn7zsjO3NCSM3FllN-pmLdw",
    seller: "Sarah Jenkins",
    sellerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCddLeL5NGVY9hPMgt2jNXb68b8Wej1lIjzeAC3C63VVLmjsFKhSMjwRLsofh53I1xuYZ8VMKTYCi_IJLB9DkIYec6gPC_PkQ0nYORX3uaq823XNOYc1s7WjJnELCL_LLrmnVaxJMZNXbxv9dTbpWOn2KhEhVVmlWfMTPGQDhEOwKDFMmdQkucmcGwNE3N6oibdlgOUVE1dS1uMva0xBJSpDOAn_vKZS4MoHzYoAR68SlbBxJtBHn6tOQfxFGyNdtXyp7_hCVKVK5I8",
    description: "Professional creative pen tablet. Renting out for students who need it for design assignments. Stylus, pen stand, extra nibs, and USB-C cable included. Rentals limited to 2 weeks max."
  },
  {
    id: "lst-5",
    title: "Vintage Leather Jacket - Oversized Fit",
    category: "Apparel",
    price: 45.00,
    condition: "Good",
    rating: 4.5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2stOcusiQ6KHp-SqQVhKhfKtb8uiqHfYI4YUAkDxxdmQQG9cytrNPi0QXXYZRRbnbh9uZSDmAH_TAGw52y5xU7iWVIv9vSZ9nOe3IeZW4FyS0bDVnicaEIyjx9-nfJgaX9AZhsTe-ysniCYcWcdN-phWQViSj0bRItqSRwRWrfAWjfraDa347fAH9jeaPapomUQiI1Vyd6FU1Vn61_YfY0bqN-WGqawarnTTWxYFyAnJISo6e_lycHUlI3joGc00AE9hk-3568dS9",
    seller: "Sarah Jenkins",
    sellerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCddLeL5NGVY9hPMgt2jNXb68b8Wej1lIjzeAC3C63VVLmjsFKhSMjwRLsofh53I1xuYZ8VMKTYCi_IJLB9DkIYec6gPC_PkQ0nYORX3uaq823XNOYc1s7WjJnELCL_LLrmnVaxJMZNXbxv9dTbpWOn2KhEhVVmlWfMTPGQDhEOwKDFMmdQkucmcGwNE3N6oibdlgOUVE1dS1uMva0xBJSpDOAn_vKZS4MoHzYoAR68SlbBxJtBHn6tOQfxFGyNdtXyp7_hCVKVK5I8",
    description: "Genuine brown leather jacket, classic varsity bomber style. Fits size Medium/Large. Quilted lining is in great shape. No rips or holes. Pick up at Student Union."
  }
];

const DEFAULT_PROFILE = {
  name: "Hardik",
  major: "Computer Science",
  email: "hardik@university.edu",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwozUBToAeWm6qEAFt4XpKTKQvJVko-_u9NhR9mUQpKXAy9c2payVVkBjnDI90kfoyEki07Rro02oX02iytGaoYmn0Ej6DETSil0VE-Sj6nJvg-XP4YKXjRAGkTobHlnEdMM4TrFNLy0A4XvQRDVpYGl84ocnA5aZlpNMwbgvfrZHLbCMcm67T2pPU0f0f9uyuE0o5WKpFxjI0NjyUv7POLY5Y55bEfr5Z4yzT5hTi0B419ePRJori6c39wesX8XLchKTKxUxWGXdM",
  rating: 4.9,
  rank: 12,
  points: 1540,
  listingsCount: 4,
  salesCount: 8,
  purchasedCount: 14
};

const DEFAULT_MESSAGES = [
  {
    threadId: "th-1",
    senderName: "Sarah Jenkins",
    senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCddLeL5NGVY9hPMgt2jNXb68b8Wej1lIjzeAC3C63VVLmjsFKhSMjwRLsofh53I1xuYZ8VMKTYCi_IJLB9DkIYec6gPC_PkQ0nYORX3uaq823XNOYc1s7WjJnELCL_LLrmnVaxJMZNXbxv9dTbpWOn2KhEhVVmlWfMTPGQDhEOwKDFMmdQkucmcGwNE3N6oibdlgOUVE1dS1uMva0xBJSpDOAn_vKZS4MoHzYoAR68SlbBxJtBHn6tOQfxFGyNdtXyp7_hCVKVK5I8",
    productContext: {
      title: "Vintage Leather Jacket",
      price: "₹45.00",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2stOcusiQ6KHp-SqQVhKhfKtb8uiqHfYI4YUAkDxxdmQQG9cytrNPi0QXXYZRRbnbh9uZSDmAH_TAGw52y5xU7iWVIv9vSZ9nOe3IeZW4FyS0bDVnicaEIyjx9-nfJgaX9AZhsTe-ysniCYcWcdN-phWQViSj0bRItqSRwRWrfAWjfraDa347fAH9jeaPapomUQiI1Vyd6FU1Vn61_YfY0bqN-WGqawarnTTWxYFyAnJISo6e_lycHUlI3joGc00AE9hk-3568dS9"
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
    senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0WBZrHvUilcRJu0qjYYsJjgeCCBa3AwsGDA5vraAy8XJ3UdXsJjeaoBYR5zCN4fpJ3Zt_J_yt1w-wLcw9xbBoTYIc0aPVvr_muO3vUH6QJvyyw0Mrp6SBaGIlKwnhUhvghvrAFZ6jkpVFZskRLe9R9Kr8GdRbILkQK2viyolRz0YbcqlunOBGt0X5Lc23fvVi4XxBDgEwETcQCeP0KXGBNYOS-3_qY9pBnyGp77vEi1QiuY5Bc1G5UNRGMaLYMF2f2lgoUhfxgvAK",
    productContext: {
      title: "MacBook Pro M1 2020",
      price: "₹850.00",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzckiG-qpY7WkidwL73YJ4uxGLxg9gy0qpOoZ9HUysT7_kyhNlcpSWBXRqFVImltioHuWKVB15XrUK_UfnULCG0Ql_VbJ5r5SjcD2VZ2xXxAPeyH9td4Rs1rbHGYsE2Lk9qubEEBHq0moAzeCwMR_T2minJlJOYS8-nE0_1pve_0ClEffzOkj2iime5nb6Fa5LOyhy5QM1bZRy_TvYMd1_UnaA76rfiJX-9aMNlLmVdvoPDMc0AeSV9jikuPK8WOte7hIYrWaQJczh"
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
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIZYdnOcuujHPRYidfLxYGjIMeKcvEvIktVnpU9jGcjnyZzrJsDbx0YbGXOYro7ZQhVIJGJ4Tlf-YsWnF0DKCkGTogI3_iJwLBGOlpEnZ46D_lQhquVbBs24Jf6VBznP8Okm21iuLgtCxbaQgj1uITXyuYBPxpfbnwsJcWHlaD1bcjt1a3mLKsAnpnPCQwP6KySBCcJ5bicGrTjiUSULYi1_any7Kx3SLC4kt97YPWotjuROcdlLMEP2U9Cq-eli-T9FCiyudI_foA"
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

// Seed databases if they are empty
export function initDB() {
  if (!localStorage.getItem("campus_listings")) {
    localStorage.setItem("campus_listings", JSON.stringify(DEFAULT_LISTINGS));
  }
  if (!localStorage.getItem("campus_profile")) {
    localStorage.setItem("campus_profile", JSON.stringify(DEFAULT_PROFILE));
  }
  if (!localStorage.getItem("campus_messages")) {
    localStorage.setItem("campus_messages", JSON.stringify(DEFAULT_MESSAGES));
  }
  if (!localStorage.getItem("campus_favorites")) {
    localStorage.setItem("campus_favorites", JSON.stringify(["lst-2"])); // Default favorite MacBook Pro
  }
}

// Ensure database is initialized immediately when this module loads
initDB();

// --- Helper Functions to Interact with Database ---

export function getListings() {
  return JSON.parse(localStorage.getItem("campus_listings")) || [];
}

export function saveListings(listings) {
  localStorage.setItem("campus_listings", JSON.stringify(listings));
  // Dispatch dynamic event for updates
  window.dispatchEvent(new Event('listingsUpdated'));
}

export function getProfile() {
  return JSON.parse(localStorage.getItem("campus_profile")) || DEFAULT_PROFILE;
}

export function saveProfile(profile) {
  localStorage.setItem("campus_profile", JSON.stringify(profile));
  // Dispatch custom profile update event
  window.dispatchEvent(new Event('profileChanged'));
}

export function getMessages() {
  return JSON.parse(localStorage.getItem("campus_messages")) || [];
}

export function saveMessages(threads) {
  localStorage.setItem("campus_messages", JSON.stringify(threads));
  window.dispatchEvent(new Event('messagesUpdated'));
}

export function getFavorites() {
  return JSON.parse(localStorage.getItem("campus_favorites")) || [];
}

export function toggleFavorite(listingId) {
  let favs = getFavorites();
  if (favs.includes(listingId)) {
    favs = favs.filter(id => id !== listingId);
  } else {
    favs.push(listingId);
  }
  localStorage.setItem("campus_favorites", JSON.stringify(favs));
  window.dispatchEvent(new Event('favoritesUpdated'));
  return favs.includes(listingId);
}
