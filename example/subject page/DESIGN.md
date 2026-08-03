---
name: Vibrant Academic Pulse
colors:
  surface: '#f6fafe'
  surface-dim: '#d6dade'
  surface-bright: '#f6fafe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f8'
  surface-container: '#eaeef2'
  surface-container-high: '#e4e9ed'
  surface-container-highest: '#dfe3e7'
  on-surface: '#171c1f'
  on-surface-variant: '#464555'
  inverse-surface: '#2c3134'
  inverse-on-surface: '#edf1f5'
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
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
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
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f6fafe'
  on-background: '#171c1f'
  surface-variant: '#dfe3e7'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  nepali-body:
    fontFamily: Mukta
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The brand personality is high-energy, modern, and deeply encouraging. It balances the precision of a professional educational tool with the warmth of a supportive mentor. The visual language utilizes **Corporate Modern** foundations infused with **Glassmorphism** and **Tactile** elements to create a sense of depth and progress.

The target audience consists of students and educators seeking a friction-less, motivating learning environment. The UI should evoke a sense of clarity and "unstoppable momentum." We achieve this through generous whitespace, rhythmic grid layouts, and vibrant interactive states that provide immediate positive reinforcement.

## Colors
The palette is rooted in a vibrant Indigo to establish trust and depth. Electric Teal is used for success states and secondary actions, while Warm Amber is reserved exclusively for high-priority CTAs and achievement highlights to ensure they pop against the cool-toned background.

In **Light Mode**, the background uses a cool Slate (#F1F5F9) to reduce eye strain during long study sessions. In **Dark Mode**, the interface shifts to a Deep Charcoal (#0F172A), where the primary and secondary colors take on a "neon" luminosity through subtle outer glows and increased saturation to maintain energy levels in low-light environments.

## Typography
This design system utilizes **Plus Jakarta Sans** for all Latin characters to provide a friendly, geometric, and modern aesthetic. For Devanagari script, **Mukta** is the designated partner font, specifically chosen for its exceptional legibility and shared humanist qualities with the primary typeface.

Headlines should use heavy weights (700-800) with tight letter spacing to create a bold, authoritative hierarchy. Body text is set with generous line heights (1.6) to facilitate effortless reading of educational content. For Nepali text blocks, the font size should be slightly increased (minimum 18px) to account for the intricate glyph details of the Mukta typeface.

## Layout & Spacing
The design system employs a **Fluid 12-column grid** for desktop and a **4-column grid** for mobile. The rhythm is based on an 8px linear scale. 

- **Desktop:** 1280px max-width container with 48px side margins. Gutters are fixed at 24px to ensure breathing room between complex educational cards.
- **Tablet:** 8-column layout with 32px margins. 
- **Mobile:** 4-column layout with 16px margins. 

Vertical spacing between sections should be aggressive (80px - 120px on desktop) to maintain a "high-whitespace" feel that prevents cognitive overload for the learner.

## Elevation & Depth
Depth is created through a combination of **Glassmorphism** and **Ambient Shadows**. 

1. **Surface 0 (Background):** Solid #F1F5F9 or #0F172A.
2. **Surface 1 (Cards/Floating Elements):** Pure white (or #1E293B in dark mode) with a very soft, diffused shadow: `0 10px 25px -5px rgba(79, 70, 229, 0.05)`.
3. **Surface 2 (Overlays/Modals):** Glassmorphic effect with 12px backdrop blur and a semi-transparent white border (0.5px, 20% opacity).

Interactive elements like cards should use a "lift" metaphor: on hover, the shadow becomes more pronounced and the element scales by 1.02x to simulate physical proximity.

## Shapes
The shape language is "Extra Rounded" to feel approachable and safe. 
- **Cards:** Use a consistent `1.5rem` (24px) corner radius. 
- **Buttons:** All buttons are `rounded-full` (9999px) to contrast against the structured grid and emphasize their role as touch-friendly interactive points.
- **Inputs:** Use `0.75rem` (12px) to balance the extreme roundness of buttons with functional precision.

## Components

**Navbar:**
A fixed-position container with a glassmorphism effect (Backdrop blur: 16px, BG: white/70%). Navigation links are centered with a 600 weight. The "Get Started" CTA uses the Warm Amber accent to draw immediate attention.

**Buttons:**
- **Primary:** Indigo to Teal gradient (45-degree angle) with white text.
- **Accent:** Warm Amber solid with a subtle inner glow.
- **Behavior:** On hover, buttons should have a slight "pulse" or scale-up effect. Icons should be used to provide context (e.g., an arrow for "Continue").

**Cards:**
Course and module cards must feature a 1.5rem border radius. Images inside cards should be clipped to the top corners. Text content within cards should have a minimum of 24px padding.

**Input Fields:**
Large, 56px height fields with a light gray border. On focus, the border transitions to a 2px Indigo stroke with a soft Indigo outer glow.

**Progress Bars:**
Thick (12px), rounded-full tracks using a light version of the primary color as the background and the Electric Teal for the active progress to signify completion and success.