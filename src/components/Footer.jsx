import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest dark:bg-inverse-surface w-full py-xl border-t border-outline-variant/30 dark:border-outline/20 mt-auto">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-lg">
        <div className="flex items-center gap-sm">
          <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">CampusMarket</span>
        </div>
        <div className="flex flex-wrap justify-center gap-md md:gap-lg font-label-sm text-label-sm">
          <a className="text-on-surface-variant dark:text-outline-variant hover:text-on-surface dark:hover:text-surface-bright hover:underline decoration-primary dark:decoration-primary-fixed-dim opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</a>
          <a className="text-on-surface-variant dark:text-outline-variant hover:text-on-surface dark:hover:text-surface-bright hover:underline decoration-primary dark:decoration-primary-fixed-dim opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a>
          <a className="text-on-surface-variant dark:text-outline-variant hover:text-on-surface dark:hover:text-surface-bright hover:underline decoration-primary dark:decoration-primary-fixed-dim opacity-80 hover:opacity-100 transition-opacity" href="#">Campus Safety</a>
          <a className="text-on-surface-variant dark:text-outline-variant hover:text-on-surface dark:hover:text-surface-bright hover:underline decoration-primary dark:decoration-primary-fixed-dim opacity-80 hover:opacity-100 transition-opacity" href="#">Contact Us</a>
        </div>
        <p className="font-body-md text-body-md text-outline dark:text-outline-variant text-center md:text-right">
          © 2024 CampusMarket Inc. Built for Students.
        </p>
      </div>
    </footer>
  );
}
