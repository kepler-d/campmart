---
name: Campus Exchange
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#464555'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#7b3300'
  on-tertiary: '#ffffff'
  tertiary-container: '#a04500'
  on-tertiary-container: '#ffd2bd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1280px
---

## Brand & Style

This design system is engineered for a high-trust, high-velocity peer-to-peer marketplace. The brand personality is **modern, professional, and sophisticated**, moving away from the "cluttered" feel of traditional classifieds toward a curated, premium startup aesthetic.

The visual style utilizes a **Refined Minimalism** foundation infused with **Glassmorphism**. Surfaces are light and airy, prioritizing content (items for sale) while using subtle depth markers to establish hierarchy. The emotional response should be one of reliability and ease—making the act of secondary-market trading feel as safe and polished as a primary retail experience. 

Key stylistic pillars include:
- **Translucency:** Subtle backdrop blurs on navigation and floating panels.
- **Micro-interactions:** High-response states for product cards and action buttons.
- **Clarity:** Generous whitespace to reduce cognitive load in data-rich environments.

## Colors

The palette is anchored by **Indigo**, signaling professional stability and tech-forwardness. **Emerald** is utilized strictly for transactional success states, "In Stock" indicators, and growth-related metrics. **Orange** serves as a high-visibility accent for urgent calls to action, limited-time offers, or gamified "trending" badges.

- **Primary (Indigo):** Brand presence, primary buttons, and active navigation states.
- **Secondary (Emerald):** Positive financial actions (Sell, Earned), and verification badges.
- **Accent (Orange):** Alerts, "Hot" listings, and gamification highlights.
- **Neutrals:** A scale of cool grays provides the structural scaffolding, ensuring the interface feels "clean" rather than "heavy."

For **Dark Mode**, the background shifts to a deep charcoal (#111827) with surfaces utilizing a slightly lighter elevation tint (#1F2937).

## Typography

The design system uses **Inter** exclusively to achieve a systematic, utilitarian, yet highly readable aesthetic. 

- **Display & Headlines:** Use tight letter-spacing and heavy weights (700-800) to create a bold, "startup" impact for hero sections and product titles.
- **Body Text:** Standard weight (400) with generous line heights to ensure readability during long browsing sessions.
- **Labels:** Use Medium (500) or Semi-bold (600) weights for metadata, such as price tags and category chips, to ensure they stand out against body copy.
- **Scalability:** Large headlines scale down significantly on mobile to maintain visual balance and prevent awkward line breaks in the product grid.

## Layout & Spacing

This design system employs a **Fluid Grid** with fixed maximum constraints. 

- **Grid:** A 12-column layout for desktop, 8-column for tablet, and 4-column for mobile.
- **Rhythm:** An 8px linear scale (base 4px) governs all padding and margins to ensure mathematical harmony.
- **Product Grids:** Utilize a standard 24px gutter. On mobile, cards switch to a 2-column format or a single-column list depending on the category.
- **Sidebar:** The navigation sidebar is fixed at 280px on desktop, collapsing to a bottom navigation bar on mobile to prioritize thumb-zone reachability.

## Elevation & Depth

Depth is established through **Glassmorphism** and **Ambient Shadows** rather than stark borders.

- **Level 0 (Base):** Background layer (#F9FAFB).
- **Level 1 (Cards):** White background with a 1px soft gray border (#F3F4F6) and a very low-opacity shadow (Y: 2, Blur: 4, Color: rgba(0,0,0,0.05)).
- **Level 2 (Hover/Floating):** Use a backdrop-filter (blur: 12px) and a semi-transparent white background (rgba(255,255,255,0.8)). Shadow increases (Y: 10, Blur: 20, Color: rgba(0,0,0,0.1)).
- **Level 3 (Modals):** High-diffusion shadows with a subtle Indigo tint in the shadow color to tie back to the brand.

## Shapes

The shape language is **Rounded (0.5rem base)**, reflecting an approachable and modern software feel.

- **Buttons & Inputs:** Follow the 0.5rem (8px) standard.
- **Product Cards:** Use `rounded-lg` (16px) to soften the large grid layout and create a "container" feel for photography.
- **Chips & Badges:** Use `rounded-full` (pill-shaped) to distinguish them from actionable buttons and interactive cards.
- **Images:** All item photography should inherit the container's border radius to maintain the unified silhouette.

## Components

### Buttons
- **Primary:** Solid Indigo with white text. On hover, darken by 10%.
- **Secondary:** Emerald ghost buttons (transparent background, emerald border) for "Success-adjacent" actions like "Message Seller."
- **Tertiary:** Subtle gray background for "Add to Wishlist" or "Compare."

### Product Cards
- Feature a "quick-view" hover state that lifts the card (Elevation Level 2) and reveals a "Buy Now" button. 
- Image aspect ratio is fixed at 4:3 for consistency.

### Dashboard & Analytics
- Data-rich elements use high-contrast typography (Inter Semi-bold) for numerals.
- Trend lines use the secondary (Emerald) for positive growth and Primary (Indigo) for neutral activity.
- Leaderboard elements feature "Floating Trophy" icons with a subtle gold gradient and glassmorphic backgrounds.

### Split-Screen Auth
- Left side: High-quality campus lifestyle imagery with a 40% Indigo overlay.
- Right side: Clean, centered form with generous vertical spacing and Level 1 elevation cards for the input fields.

### Navigation
- Sidebar: Uses active-state indicators (a 4px Indigo vertical bar on the left) to show the current location.
- Top Bar: Glassmorphic (blur: 20px) with a persistent Search bar for item discovery.