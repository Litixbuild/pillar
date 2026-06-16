# Pillar — Infrastructure & Technology Stack
**Data Room Document** | Confidential | June 2026

---

## Overview

Pillar is a cloud-native, serverless web application built entirely on managed services and modern open-source frameworks. There is no self-hosted infrastructure, no proprietary servers, and no custom devops overhead. Every component is a best-in-class vendor or open standard chosen for reliability, developer velocity, and horizontal scalability.

---

## Hosting & Deployment

| Service | Role |
|---|---|
| **Netlify** | Application hosting, serverless function execution, CDN, and CI/CD pipeline. All builds and deploys run through Netlify. The `@netlify/plugin-nextjs` plugin handles Next.js-specific serverless function routing. |
| **Netlify CDN** | Global edge delivery of static assets, images, and cached responses |

**Domain:** pmpillar.com

---

## Core Framework & Language

| Technology | Version | Role |
|---|---|---|
| **Next.js** | 15.5.18 | Full-stack React framework. Uses the App Router (file-system based routing), server components, server actions, and API route handlers for all backend logic. Built with Turbopack for fast local development. |
| **React** | 19.2.4 | UI component library. All UI is built with React functional components and hooks. |
| **TypeScript** | 5.x | Statically typed JavaScript across the entire codebase — components, API routes, database queries, and utility functions. |
| **Node.js** | Runtime | JavaScript runtime powering all serverless API route handlers on Netlify |

---

## Styling & UI

| Technology | Version | Role |
|---|---|---|
| **Tailwind CSS** | v4 | Utility-first CSS framework used for all styling. Zero custom CSS frameworks or component libraries — every style is composed from Tailwind utility classes. |
| **PostCSS** | via `@tailwindcss/postcss` | CSS build pipeline for processing Tailwind |
| **CSS Custom Properties** | Native | Used for dynamic theming — color palette values (heading, body text, accent) are written as CSS variables at runtime from manager-defined values |

---

## Database & Authentication

| Service / Library | Role |
|---|---|
| **Supabase** | Hosted PostgreSQL database (primary data store). All property data, work orders, manager accounts, and billing metadata live in Supabase. Also provides real-time capabilities and storage infrastructure. |
| **@supabase/supabase-js** | Official Supabase JavaScript SDK used for all database queries, mutations, and admin operations |
| **@supabase/ssr** | Supabase's server-side rendering integration for use with Next.js App Router and server components |
| **Custom JWT Session Management** | Manager and admin authentication use a custom cookie-based session system (not Supabase Auth). Sessions are signed with a secret key and stored as HTTP-only cookies. |
| **Field-Level Encryption** | A dedicated encryption key (`FIELD_ENCRYPTION_KEY`) is used to encrypt sensitive property fields at rest — including WiFi passwords, garage/access codes, and manager phone numbers — before they are written to the database. |

---

## Payments & Billing

| Service / Library | Role |
|---|---|
| **Stripe** | Full payment processing, subscription lifecycle management, invoice handling, and customer portal. Pillar uses Stripe Checkout for purchasing property slots and the Stripe Billing Portal for subscription self-management. |
| **Stripe Webhooks** | Stripe events (subscription created, updated, cancelled, payment succeeded/failed) are received and processed via a dedicated webhook endpoint to keep subscription state in sync with the Supabase database. |
| **stripe (npm package)** | v22.1.1 — Official Stripe Node.js SDK used server-side for all Stripe API calls |

---

## Communications & Notifications

| Service / Library | Role |
|---|---|
| **Twilio** | SMS delivery. Used for two purposes: (1) notifying property managers when a guest submits a work order, and (2) delivering MFA (multi-factor authentication) verification codes to manager accounts. |
| **Twilio SMS Number** | Dedicated Pillar phone number (+1 855-578-3757) used as the sender for all outbound SMS |
| **twilio (npm package)** | v6.0.2 — Official Twilio Node.js SDK |
| **Zoho Mail (SMTP)** | Transactional email delivery via SMTP through Zoho Mail (noreply@pmpillar.com). Used for work order email notifications, MFA codes, and support contact form delivery. |
| **Nodemailer** | v8.0.7 — Node.js email library used to compose and send all transactional emails through the Zoho SMTP server |

---

## AI & Machine Learning

| Service / Library | Role |
|---|---|
| **Google Gemini (Generative AI)** | Powers the Pillar Concierge — the AI chatbot embedded in every guest-facing property page. The model responds to guest questions using the property's configured information as context. Accessed via the Gemini API. |
| **Vertex AI (Gemini fallback)** | Google Cloud Vertex AI is configured as a fallback model endpoint to maintain AI Concierge availability if the Gemini API is overloaded or rate-limited. |
| **@google/generative-ai** | v0.24.1 — Official Google Generative AI JavaScript SDK |
| **Google Places API** | Google Maps Platform Places API. Used within the AI Concierge to provide location-aware recommendations (nearby restaurants, attractions, services) when guests ask about the local area. |
| **Google Weather API** | Google Maps Platform Weather API. Used within the AI Concierge to surface real-time or forecast weather data relevant to the property's location when contextually appropriate. |

---

## QR Code Generation

| Library | Role |
|---|---|
| **qrcode.react** | v4.2.0 — React component library for generating QR codes in the browser. Used to produce downloadable, print-ready QR codes for each property that link to the guest experience page. |

---

## Internationalization

| Library | Role |
|---|---|
| **next-intl** | v4.13.0 — Internationalization framework for Next.js. The full message/translation infrastructure is in place across both the manager portal and guest experience pages, enabling future multi-language support without architectural changes. |

---

## Security Infrastructure

| Mechanism | Detail |
|---|---|
| **Multi-Factor Authentication (MFA)** | Email and SMS-based two-factor authentication for all manager accounts, delivered via Nodemailer and Twilio |
| **HTTP-Only Cookies** | All session tokens stored as HTTP-only, secure cookies — inaccessible to client-side JavaScript |
| **Signed Sessions** | Manager and admin sessions signed with dedicated secret keys to prevent forgery |
| **Field Encryption** | Sensitive property fields (WiFi passwords, access codes, phone numbers) encrypted at the database layer using a symmetric encryption key |
| **Rate Limiting** | Work order submissions rate-limited per property per IP to prevent spam and abuse |
| **npm Audit** | `npm audit --audit-level=high` runs as part of every production build pipeline on Netlify — builds fail if high-severity vulnerabilities are present |
| **Trusted Devices** | MFA-cleared devices are remembered per manager session to reduce friction for repeat logins on known hardware |

---

## Development Tooling

| Tool | Role |
|---|---|
| **ESLint** | v9 — Static code analysis and linting, configured with `eslint-config-next` for Next.js-specific rules |
| **TypeScript Compiler** | Type checking across the full codebase at build time |
| **Turbopack** | Next.js's Rust-based bundler used in local development for fast hot module replacement |
| **Git** | Version control |
| **VS Code** | Primary development IDE |

---

## Summary — Vendor & Service List

| Vendor | Category |
|---|---|
| Netlify | Hosting & deployment |
| Supabase | Database & storage |
| Stripe | Payments & billing |
| Twilio | SMS & MFA |
| Zoho Mail | Transactional email |
| Google Gemini / Generative AI | AI Concierge |
| Google Vertex AI | AI fallback |
| Google Places API | Location data |
| Google Weather API | Weather data |
| Vercel (Next.js) | Framework (Vercel-maintained open source) |

---

*Pillar is built by Cameron Roth. For inquiries, contact: cjrothid@gmail.com*
