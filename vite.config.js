import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        marketplace: resolve(__dirname, 'marketplace.html'),
        messages: resolve(__dirname, 'messages.html'),
        productDetails: resolve(__dirname, 'product-details.html'),
        createListing: resolve(__dirname, 'create-listing.html'),
        leaderboard: resolve(__dirname, 'leaderboard.html'),
        admin: resolve(__dirname, 'admin.html'),
        profile: resolve(__dirname, 'profile.html'),
      },
    },
  },
});
