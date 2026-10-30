# India Digital Personal Data Protection (DPDP) Act 2023 Compliance Audit

This document verifies the technical and organizational measures implemented across the Pimple Saudagar Directory platform to satisfy the requirements of India's **Digital Personal Data Protection Act 2023** (DPDP Act).

---

## 1. Compliance Matrix

| DPDP Act Requirement | Implementation in Platform | Code Location / Verification |
| :--- | :--- | :--- |
| **Notice & Informed Consent (Sec 5)** | Clear notice in English, Marathi, and Hindi before collecting user data during registration, lead enquiries, and review submissions. | `app/(auth)/register/page.tsx`, `components/forms/enquiry-modal.tsx`, `messages/*.json` |
| **Data Minimization (Sec 6)** | Only necessary data collected (business phone, address, name). Anonymous review hashing with HMAC-SHA256 peppers prevents plain-text email exposure. | `lib/services/review.service.ts` |
| **Right to Access & Correction (Sec 12)** | Business owners have full self-service dashboards to review, update, or edit all company information and phone numbers. | `app/(account)/dashboard/listings/page.tsx` |
| **Right to Erasure & Data Portability (Sec 12)** | Dedicated `PersonalDataRequest` model supporting SAR (Subject Access Request) and account erasure workflows. Cascade deletion removes user sessions and tokens. | `prisma/schema.prisma` (`model PersonalDataRequest`) |
| **Grievance Redressal (Sec 13)** | Designated grievance officer contact channel with automated ticket tracking and 72-hour acknowledgment SLA. | `app/(public)/contact` and privacy policy notices |
| **Data Breach Notification (Sec 8)** | Audit logs record critical actions (`audit_log` table). Security incidents trigger automated admin alert protocol. | `prisma/schema.prisma` (`model AuditLog`), `app/api/cron/` |

---

## 2. Reviewer Privacy & Identity Protection

Reviewer emails are **never exposed** publicly or to business owners:
- A secret server-side pepper `AUTH_SECRET` is combined with the email.
- The resulting HMAC SHA-256 hash is stored as `authorIpHash` or identifier.
- Reviews display only the chosen display name and verified badge.

---

## 3. Data Retention & Automatic Purging

- **Session Data**: Expired authentication sessions automatically deleted every 24 hours via `/api/cron/cleanup-sessions`.
- **Password Reset Tokens**: One-time tokens expire within 60 minutes and are purged.
- **Audit Logs**: Retained for 180 days for security traceability before archival.
