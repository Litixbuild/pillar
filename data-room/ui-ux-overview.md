# Pillar — UI/UX Overview
**Data Room Document** | Confidential | June 2026

---

## Design Philosophy

Pillar is built around two distinct user audiences — property managers and their guests/tenants — each with fundamentally different needs, contexts, and devices. The UI/UX is split accordingly: a **manager portal** designed for efficiency and control, and a **guest experience page** designed for immediate clarity on a mobile screen. Both surfaces are fully responsive, mobile-first, and support light and dark mode with persistent user preference storage.

---

## The Guest Experience Page

When a guest or tenant arrives at a property, they scan a QR code (printed and placed by the manager) or follow a direct link. They land on the property's branded experience page — no login, no app download, no friction.

**First impression — the hero view:** The page opens with a full-screen hero image, the property name, address, and a short bio. A smooth expand animation transitions the user from the preview into the full content view. The aesthetic is intentionally clean and high-quality, matching what guests expect from a premium short-term rental.

**Navigation and content:** Content is organized into tiles and expandable windows — each representing a piece of information the manager has configured. WiFi credentials, access codes, house rules, and checkout instructions are surfaced at the top level for immediate access. Deeper content (room guides, appliance instructions, local recommendations, PDFs, videos) lives in the Windows section, organized by room or category. Copy-to-clipboard functionality is present on credentials and codes to eliminate typo errors.

**The AI Concierge:** An embedded chat interface (the Pillar Concierge) sits on the page and is available to answer any guest question — property-specific or general — at any hour. The interface uses a typing indicator, streamed responses, and a light themed conversation UI optimized for short, practical exchanges.

**Help and actions:** Guests can submit a maintenance or work order request directly from the page through a categorized modal with a description field. They can also request a late checkout with a single tap. Both actions trigger real-time notifications (SMS and email) to the property manager or designated contact — without the guest needing a phone number.

**Photos:** A photo carousel in the amenities section displays property images in an auto-cycling gallery, giving guests a visual orientation to the space.

---

## The Manager Portal

The manager portal is a web application accessed at the manager's login. It is designed for fast, low-friction daily use — especially on mobile — with a bottom navigation bar providing one-tap access to the five core sections: Dashboard, Properties, Activity, Billing, and Account.

**Dashboard:** The home screen shows a portfolio overview — total properties, open work order counts, subscription status, referral code, and property slot usage. It is a at-a-glance summary designed to answer "what needs my attention right now?" in under five seconds.

**Property Editor:** Managers configure every aspect of a property through a single, comprehensive edit page — name, address, credentials, hero image, logos, color theme, background style, room list, and Windows (content blocks). Five preset background themes (Azure, Sage, Ember, Blush, Sandstone) and a full color picker for headings, body text, and accents allow meaningful brand customization without design expertise.

**Activity (Work Orders):** The activity view shows all properties as cards with open work order badges. Tapping a property reveals the full list of open and resolved orders — category, description, timestamp, and resolution notes. Managers mark items resolved inline with a note. The history is collapsible to keep the active queue clean.

**Branding and customization language:** Every design decision is made to lower the skill floor. A property manager who has never used a CMS can configure a polished, branded experience page in under ten minutes. Drag-and-drop ordering, icon pickers, and image uploaders are used throughout in place of raw fields.

**Transitions and motion:** Subtle page fade transitions and smooth expand/collapse animations are used throughout both the guest and manager interfaces to communicate context and reduce cognitive jarring between states. Motion is purposeful — never decorative for its own sake.

---

## Accessibility and Performance

- Full dark/light mode across both surfaces, persisted via localStorage
- Responsive layouts designed to be functional at all screen sizes from 320px up
- Images served via Next.js Image optimization
- Minimal JavaScript blocking — the guest experience page is intentionally lightweight for guests on spotty property WiFi
- Internationalization (i18n) infrastructure in place via next-intl for future language support

---

*Pillar is built by Cameron Roth. For inquiries, contact: cjrothid@gmail.com*
