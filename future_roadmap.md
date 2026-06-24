# Future Roadmap & Security Enhancements

This document outlines the planned future upgrades for the CampusMarket platform, specifically focusing on security and scaling for multiple universities.

## 1. Robust University Email Validation (Multi-Tenant)
Currently, the system only hardchecks for `.edu` domains on the frontend.
**Plan:**
- **Tier 1 (Catch-all):** Automatically accept globally recognized academic TLDs (e.g., `.edu`, `.ac.in`, `.ac.uk`).
- **Tier 2 (Database List):** Create an `AllowedDomains` collection in MongoDB for specific college domains that don't follow standard academic formats (e.g., `@indoreinstitute.com`).
- **Backend Enforcement:** Move all validation logic to the backend API (`routes/api.js`) to prevent frontend bypasses.

## 2. "Request Campus" Funnel
For students whose emails fail Tier 1 and Tier 2 checks:
**Plan:**
- Implement a UI form during registration: "Your campus isn't on our network yet! Request access."
- Collect the requests in an Admin Dashboard.
- Admin can manually verify the institution and add their domain to the `AllowedDomains` database.

## 3. Email OTP Verification (Fake Account Prevention)
Currently, anyone can type a fake email like `fake123@college.ac.in` and bypass validation.
**Plan:**
- Integrate `Nodemailer` (or a service like Resend/SendGrid) in Node.js.
- Upon registration, set the user's status to `unverified`.
- Send a 6-digit OTP or a unique magic link to their official college email.
- The user must verify the OTP to activate their account and log in.

## 4. Password Security
Currently, passwords are saved as plain text for demonstration purposes.
**Plan:**
- Implement `bcrypt` to hash and salt passwords before storing them in MongoDB.
- Use `jsonwebtoken` (JWT) for secure, stateless API authentication instead of simple email/password matching on every request.

## 5. AI-Powered Listing Generation
To simplify the process of posting items for students.
**Plan:**
- Implement image recognition APIs to auto-categorize uploads.
- Add smart price suggestions based on similar existing items on the marketplace.

## 6. Integrated Meetup Scheduler
To ensure safe handoffs between buyers and sellers.
**Plan:**
- Create an interactive campus map indicating well-lit, public "safe zones".
- Sync with external calendars (Google/Apple) to let users negotiate meetup times directly in the app.

## 7. Native Mobile App Development
Transitioning from a responsive web app to native platforms.
**Plan:**
- Rebuild the frontend using React Native or Flutter.
- Integrate native device APIs (camera, precise geolocation, native push notifications).

## 8. "In Search Of" (ISO) / Wishlist Board
To help fulfill demand on campus efficiently.
**Plan:**
- Add a reverse-marketplace board where users list things they want to buy.
- Send notifications to users who have previously sold similar items.

## 9. Enhanced Trust & Safety System
Beyond basic student emails, add layered trust.
**Plan:**
- Build automated seller badges ("Fast Responder", "Eco-Friendly").
- Add automated chat moderation to filter out spam or inappropriate phrases.

## 10. Deep Personalization & Accessibility
To improve user experience and engagement.
**Plan:**
- Build out full CSS Dark Mode support across all UI elements.
- Recommend products based on a student's profile data (e.g., major or graduation year).
