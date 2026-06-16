# Pillar — Application Security Overview

**Document Version:** 1.0
**Last Updated:** June 2026
**Classification:** Confidential — Data Room Use Only

---

## Executive Summary

Pillar is a multi-tenant property management SaaS built on modern, security-hardened infrastructure. This document summarizes the security controls, architectural decisions, and practices implemented to protect manager accounts, guest interactions, and payment data.

The application has been assessed against the **OWASP Top 10:2025** framework and hardened across all major risk categories including authentication, access control, data encryption, input validation, rate limiting, and security monitoring.

---

## Infrastructure

| Component | Provider | Notes |
|-----------|----------|-------|
| Hosting | Netlify | Edge network, automatic HTTPS/TLS, global CDN, DDoS mitigation |
| Database | Supabase (PostgreSQL) | Row Level Security enabled on all tables |
| Payments | Stripe | PCI-compliant; card data never touches Pillar servers |
| File Storage | Supabase Storage | Property media on managed, redundant infrastructure |
| SMS Notifications | Twilio | Server-side only; credentials never client-exposed |
| Email | Zoho SMTP | Server-side only; credentials never client-exposed |
| AI Concierge | Google Gemini API | Server-side proxy only; API key never exposed to clients |

---

## Authentication

### Manager Authentication — MFA Required on Every Login

All manager accounts require two factors to authenticate:

1. **Email + Password** — verified against Supabase Auth (bcrypt-hashed, managed by Supabase's authentication service)
2. **Email One-Time Password (OTP)** — a cryptographically random 6-digit code generated using `crypto.randomInt`, HMAC-SHA256 hashed before storage, valid for 15 minutes

**Trusted Device Flow:** After successful MFA, a cryptographically random 32-byte device token is issued and stored in the database. Subsequent logins from a recognised device skip the OTP step for up to 30 days. Expired device tokens are automatically invalidated.

### Session Management

- Sessions are signed using **HMAC-SHA256** with a server-side secret that never leaves the environment
- Manager sessions expire after **24 hours**; admin sessions expire after **8 hours**
- Session token signatures are verified cryptographically on **every page navigation** (middleware layer) and on **every API call** (route layer) — two independent verification points
- Session cookies are `HttpOnly`, `Secure` (production only), and `SameSite=Lax`
- A forged or tampered cookie is rejected at the middleware layer before any page or data is served

### Admin Authentication

- Completely separate authentication flow with its own signing secret
- Admin role is **re-verified against the database on every admin API request**, not just at login — demotion takes effect immediately
- Admin session expiry is 8 hours regardless of activity

---

## Authorization & Access Control

**Multi-tenant isolation** is enforced at every layer:

- Every manager-facing API route verifies session ownership before executing any database operation
- All property queries are filtered by `manager_id` — a manager cannot read, write, or enumerate another manager's properties, work orders, or settings
- Every property operation calls `requirePropertyAccess()` to confirm the requesting manager owns that property before proceeding
- **Row Level Security (RLS)** is enabled on all Supabase tables — direct database access without the service role key is denied

**Guest access** to property portals is scoped by UUID v4 slugs (122 bits of entropy). Enumerating valid slugs by brute force would require more attempts than are computationally feasible.

---

## Data Protection

### Encryption at Rest — Sensitive Fields

The following property fields are encrypted at the **application layer** before being written to the database, using **AES-256-GCM** (authenticated encryption providing both confidentiality and tamper detection):

- WiFi passwords
- Garage / door codes
- Manager phone numbers

Each value is encrypted with a unique randomly generated 96-bit IV. Encryption keys are stored exclusively in Netlify's secret environment variables — never in source code, database, or logs. A database breach without the application key yields only ciphertext.

### Encryption in Transit

All traffic is served over HTTPS/TLS enforced by Netlify's edge network. **HTTP Strict Transport Security (HSTS)** with a 2-year max-age and `includeSubDomains` is set in production, preventing HTTPS downgrade attacks.

### Payment Data

Card numbers and payment details are never processed or stored by Pillar. All billing flows exclusively through Stripe's PCI DSS-compliant infrastructure. Pillar retains only Stripe subscription IDs, statuses, and anonymised billing metadata.

---

## HTTP Security Headers

The following headers are applied to all responses in production:

| Header | Value | Protection Against |
|--------|-------|--------------------|
| `Content-Security-Policy` | Strict allowlist | XSS, code injection, data exfiltration |
| `X-Frame-Options` | DENY | Clickjacking |
| `X-Content-Type-Options` | nosniff | MIME-type sniffing attacks |
| `Referrer-Policy` | strict-origin-when-cross-origin | Referrer information leakage |
| `Permissions-Policy` | camera=(), microphone=(), geolocation=() | Browser feature abuse |
| `Strict-Transport-Security` | max-age=63072000; includeSubDomains | HTTPS downgrade attacks |

The Content Security Policy restricts script execution to same-origin sources, limits network connections to Supabase and the application itself, and prevents the application from being embedded in external frames.

---

## Rate Limiting & Abuse Prevention

Rate limiting is applied at the API level on all sensitive and resource-intensive endpoints:

| Endpoint | Limit | Window | Protects Against |
|----------|-------|--------|-----------------|
| Manager login | 5 attempts | 15 min / email | Password brute force |
| MFA code verification | 5 attempts | 15 min / user | OTP brute force |
| Guest work order | 5 requests | 1 hour / property + IP | Notification spam |
| Guest late checkout | 3 requests | 1 hour / property + IP | Notification spam |
| AI concierge | 30 messages | 1 hour / property | API cost abuse |

The rate limiter is designed to **fail open** — if the backing store is temporarily unavailable, requests are allowed through rather than blocking legitimate users.

---

## Input Validation & File Security

### File Uploads
All uploaded files are validated against their actual **binary content (magic bytes)**, independent of filename extension or browser-reported MIME type. An attacker cannot bypass validation by renaming a malicious file.

- **Accepted types:** JPEG, PNG, WebP, GIF (images) · PDF (documents) · MP4, WebM, MOV (video)
- **Maximum file size:** 50 MB per file
- Detected MIME type is used as the stored content-type, not the client-supplied value

### API Input Validation
- Property field updates are validated against a strict whitelist of allowed field names — arbitrary columns cannot be written
- All user-supplied strings are type-checked before any database operation
- SQL injection is structurally prevented — all database access uses Supabase's parameterized query client with no raw SQL in application code
- React's JSX rendering automatically HTML-escapes all user-supplied content, preventing XSS in the browser

---

## Security Logging & Monitoring

All authentication events are written in real time to an append-only `audit_logs` table:

| Event | Data Captured |
|-------|---------------|
| Manager login attempt | Status, IP address, timestamp |
| Manager login success | User ID, method (OTP / trusted device), IP address |
| MFA code failure | User ID, IP address, timestamp |
| MFA code success | User ID, IP address, timestamp |
| Admin login attempt | Status, failure reason, IP address |
| Admin login success | User ID, IP address, timestamp |

Logs are retained in the database and queryable at any time for incident investigation.

---

## Third-Party Integration Security

**Stripe Webhooks**
- All incoming webhook payloads are verified against Stripe's HMAC-SHA256 signature before processing
- Processed event IDs are stored and checked for duplicates — replay attacks are blocked

**Twilio / Zoho / Google APIs**
- All third-party credentials are stored exclusively in Netlify's secret environment variables
- No API keys are exposed in client-side code, build artifacts, or logs
- All third-party API calls are proxied server-side

---

## Dependency & Supply Chain Security

- `npm audit --audit-level=high` runs automatically on **every Netlify deployment**
- Builds are **blocked** if high or critical severity vulnerabilities are detected in the dependency tree
- Dependencies are reviewed and updated on a regular cadence

---

## OWASP Top 10:2025 Coverage

| # | Category | Status | Primary Controls |
|---|----------|--------|-----------------|
| A01 | Broken Access Control | ✅ Addressed | Multi-tenant isolation, property ownership checks, RLS, middleware token verification |
| A02 | Security Misconfiguration | ✅ Addressed | Security headers, CSP, HSTS, RLS on all tables, no default credentials |
| A03 | Software Supply Chain Failures | ✅ Addressed | Automated npm audit on every deploy, blocked builds on high/critical CVEs |
| A04 | Cryptographic Failures | ✅ Addressed | AES-256-GCM field encryption, HMAC-SHA256 session signing, HTTPS/HSTS everywhere |
| A05 | Injection | ✅ Addressed | Parameterized queries throughout, field whitelist validation, no raw SQL |
| A06 | Insecure Design | ✅ Addressed | MFA on all manager logins, rate limiting, file content validation, session expiry |
| A07 | Authentication Failures | ✅ Addressed | MFA required, 24h/8h session expiry, rate limiting, device trust, cryptographic verification |
| A08 | Software & Data Integrity Failures | ✅ Addressed | Stripe webhook signature verification + replay prevention, file magic byte validation |
| A09 | Security Logging & Alerting Failures | ✅ Addressed | Real-time audit log for all auth events with IP, user ID, and timestamp |
| A10 | Mishandling of Exceptional Conditions | ✅ Addressed | Consistent error responses, rate limiter fails open, decryption failures handled gracefully |

---

## Responsible Disclosure

Security researchers and customers who discover potential vulnerabilities are encouraged to report them responsibly. Reports may be sent directly to the founder. We commit to acknowledging reports within **48 hours** and resolving confirmed critical issues within **7 days**.

---

*This document reflects the security posture as of the date noted above. Security controls are reviewed, tested, and updated on an ongoing basis.*
