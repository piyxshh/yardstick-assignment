# Yardstick Notes - Multi-Tenant SaaS Application

A full-stack, multi-tenant notes application built for a timed assignment. This project demonstrates a secure, scalable backend with a clean, functional frontend, deployed on Vercel.

**Live URL:** [Your Deployed Vercel URL]
**Backend Base URL:** [Your Deployed Vercel URL]

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

## Running Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
   cd your-repo-name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory.
   - Add your Vercel Postgres connection string and a JWT secret:
     ```env
     POSTGRES_URL="..."
     JWT_SECRET="..."
     ```

4. **Set up the database:**
   - Connect to your Postgres instance and run the schema script located in the `README`.
   - Run the seed script to populate the database with test users:
     ```bash
     node seed.js
     ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.