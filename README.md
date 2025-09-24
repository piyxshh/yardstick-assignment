# Yardstick Notes - Multi-Tenant SaaS Application

A full-stack, multi-tenant notes application built for a timed assignment. This project demonstrates a secure, scalable backend with a clean, functional frontend, deployed on Vercel.

**Live URL:** [(https://yardstick-assignment-one.vercel.app/)]
**Backend Base URL:** [https://yardstick-assignment-one.vercel.app/]

---

## Features

- **Multi-Tenancy:** Strict data isolation between tenants (e.g., Acme, Globex) using a shared-schema, tenant ID approach.
- **Authentication:** Secure JWT-based authentication with password hashing (`bcryptjs`).
- **Authorization:** Two distinct user roles:
  - **Admin:** Can upgrade the tenant subscription.
  - **Member:** Can perform CRUD operations on notes.
- **Subscription Gating:** Tenants on the 'free' plan are limited to 3 notes, while 'pro' plan users have no limit.
- **RESTful API:** A complete set of CRUD endpoints for managing notes, with all business logic handled on the backend.
- **Polished UI:** A responsive frontend with professional toast notifications for a smooth user experience.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Backend:** Next.js API Routes
- **Database:** Vercel Postgres (powered by Neon)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## Architectural Decisions

For multi-tenancy, I chose a **shared schema with a `tenant_id` column** on all relevant tables (`users`, `notes`). This approach was selected for its simplicity and efficiency, providing robust data isolation without the overhead of managing multiple schemas or databases, making it ideal for a rapid development cycle.

All data access is scoped by the `tenant_id` extracted from the user's JWT on the backend, ensuring no data can leak between tenants.

---
