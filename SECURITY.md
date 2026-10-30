# Security Policy & OWASP ASVS Level 2 Verification

The Pimple Saudagar Directory platform is engineered to comply with **OWASP Application Security Verification Standard (ASVS) Level 2** and industry best practices.

---

## Reporting a Vulnerability

If you discover a security vulnerability, please send an advisory email to `security@pimplesaudagar.org`. Do not open public GitHub issues for security vulnerabilities. We will acknowledge reports within 24 hours and provide an estimated remediation timeline.

---

## Threat Modeling & STRIDE Defense Summary

| Threat Category | Potential Attack Vector | Platform Countermeasure |
| :--- | :--- | :--- |
| **Spoofing** | Session hijacking, forged cookie tokens | Cryptographically secure random tokens (32 bytes), HttpOnly, Secure, SameSite=Lax flags, constant-time token lookup. |
| **Tampering** | Parameter tampering on status or ownership | Strict Data Access Layer (DAL) isolation (`where: { ownerId }`), role checks in Server Actions, Prisma prepared statements. |
| **Repudiation** | Denying claim approvals or plan changes | Append-only `audit_log` recording actorId, action, entity, diff payload, and client IP hash. |
| **Information Disclosure** | Leakage of private contact emails or hashed passwords | Argon2id password hashing, private fields omitted from public API selects, review email peppered HMAC hashing. |
| **Denial of Service** | Scraping, brute force login, search flooding | Sliding-window Upstash Redis rate limiting with local in-memory fallback; bot honeypots & 2-second time-traps. |
| **Elevation of Privilege** | Visitor elevating to admin | Role hierarchy validation (`visitor < owner < moderator < admin`) enforced in `lib/auth/rbac.ts` on every Server Action. |

---

## OWASP ASVS Level 2 Checkpoints Verified

- **V2: Authentication**: Argon2id (memoryCost 64MB, 3 iterations, 1 parallelism). Timing-safe comparisons. Account lockout after 5 consecutive failed attempts.
- **V3: Session Management**: Cryptographically strong session identifiers. Rolling expiration (7 days). Session destruction on logout.
- **V4: Access Control**: Principle of least privilege. Role enforcement on API routes and Server Actions.
- **V5: Validation & Sanitization**: Strict input validation using Zod schemas. XSS sanitization via `sanitize-html` with safe tag allowlist.
- **V14: Configuration**: Strict Content Security Policy (CSP) with dynamic per-request cryptographic nonces (`x-nonce`). HSTS, X-Content-Type-Options, X-Frame-Options: DENY, and Referrer-Policy configured in Edge Middleware and `next.config.ts`.
