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
