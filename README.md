# FarmTrack – Farming Management System (Next.js + Clerk + MongoDB)

FarmTrack is a production-ready farming management starter built with the Next.js App Router. It helps farmers manage animal records, inventory (feed & medicines), finances, daily tasks, and reporting with secure Clerk authentication and a MongoDB backend.

## Features

- 🔐 **Authentication with Clerk** – Sign-in/up flows, middleware-protected routes, user-aware API handlers.
- 👨‍🌾 **Farmer onboarding** – Maintain farm profile (name, location, contact) to personalise dashboards and reports.
- 🐄 **Animal management** – Categories, detailed animal profiles, weight & health history, example CRUD UI.
- 💊 **Inventory tracking** – Medicines and feed stock levels, usage logs to link inventory consumption to animals.
- 💰 **Sales & expenses** – Capture transactions for profit & loss tracking with CSV exports.
- ✅ **Daily tasking** – Create, assign, and mark farm activities complete.
- 📊 **Dashboards & reports** – Summary cards, charts (Recharts), feed consumption analytics, CSV download endpoints.
- 🌱 **Seed script** – Populate the database with demo farmers, animals, inventory, and financial data.

## Tech stack

- [Next.js 14 (App Router)](https://nextjs.org/) – React 18, server components, API routes
- [Clerk](https://clerk.com/) – Authentication and user management
- [MongoDB + Mongoose](https://mongoosejs.com/) – Data modelling and persistence
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first styling
- [Recharts](https://recharts.org/) – Data visualisation
- [React Hook Form](https://react-hook-form.com/) – Accessible forms and validation

## Prerequisites

- Node.js 18+ (works great on 20+)
- npm 9+ (bundled with Node 18+)
- MongoDB Atlas cluster or self-hosted MongoDB URI
- Clerk application (create via [Clerk dashboard](https://dashboard.clerk.com/))

## 1. Install dependencies

```powershell
npm install
```

## 2. Configure environment variables

Copy `.env.example` to `.env.local`, then supply values for the keys below. Anything marked _optional_ can be left blank if you don't need the feature.

| Variable                                             | Purpose                                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`                  | Clerk publishable key used by the browser bundle                                    |
| `CLERK_SECRET_KEY`                                   | Clerk secret for server-side auth checks                                            |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` _(optional)_         | Custom sign-in route (defaults to `/sign-in`)                                       |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` _(optional)_         | Custom sign-up route (defaults to `/sign-up`)                                       |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` _(optional)_   | Post-auth redirect (defaults to `/dashboard`)                                       |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` _(optional)_   | Post-registration redirect                                                          |
| `MONGODB_URI`                                        | Connection string for your MongoDB cluster                                          |
| `MONGODB_ALLOW_INSECURE_TLS` _(optional)_            | Set to `true` only for development networks with SSL interception                   |
| `NEXT_PUBLIC_BASE_URL`                               | App origin (e.g. `http://localhost:3000` locally, your Vercel domain in production) |
| `SEED_OWNER_ID`, `SEED_SECOND_OWNER_ID` _(optional)_ | Clerk user IDs used by the seed script                                              |

## 3. Run the dev server

```powershell
npm run dev
```

The app boots at [http://localhost:3000](http://localhost:3000). Clerk hosted components handle authentication; sign-in/sign-up routes live under `/(auth)/sign-in` and `/(auth)/sign-up`.

## 4. Seed the database (optional but recommended)

The seed script clears & repopulates data for the owner IDs you provide. Before running:

- Ensure `MONGODB_URI` is set in `.env.local`.
- Set `SEED_OWNER_ID` (and `SEED_SECOND_OWNER_ID`) to the Clerk `userId` values that should own the demo data. You can find these in the Clerk dashboard once you create users.

Then run:

```powershell
npm run seed
```

> 💡 The script wipes existing records for those owner IDs, then inserts demo farmers, categories, animals, inventory, tasks, sales, expenses, and recent activity timelines. Adjust the script if you need bespoke fixtures.

## 5. Clerk integration notes

- `middleware.js` protects all app routes except the public landing and auth flows.
- Use `requireUserId()` inside API routes for server-side protection (`lib/auth.js`).
- Client components access user state via Clerk React hooks/components (see `components/Navbar.jsx`).
- When creating resources, the API attaches `ownerId` from Clerk and wires the current farmer profile automatically (`ensureFarmerProfile`).

## 6. Local testing checklist

- Sign in with a Clerk account.
- Visit `/dashboard` to confirm aggregates, charts, and activity feed.
- Use `/animals`, `/animals/new`, `/animals/[id]` for full CRUD workflow.
- Review other resource pages (medicines, feeds, sales, expenses, tasks, reports) for create/list/delete flows.
- Hit report endpoints (e.g. `/api/reports/profit-loss`) to verify JSON responses and CSV exports.

## 7. Deploy to Vercel

1. **Verify locally** – run `npm run build` to confirm the production bundle succeeds (API handlers are pinned to the Node.js runtime and marked dynamic, so Vercel won’t attempt static pre-rendering).
2. **Push to GitHub** (or another Git provider supported by Vercel).
3. **Import the repo in Vercel** – choose the Next.js preset (automatically sets `npm run build` and `npm start`).
4. **Populate environment variables** – copy the values from `.env.local` into Vercel → _Settings → Environment Variables_. Remember to set them for Production, Preview, and Development scopes if you rely on Vercel preview URLs.
5. **Connect Clerk** – add the deployment domain(s) under Clerk **Allowed Origins & Redirect URLs**. If you prefer automation, install the [Clerk Vercel integration](https://clerk.com/docs/nextjs/vercel-deploy) so keys stay in sync.
6. **Trigger the first deploy** – Vercel will install dependencies, run `npm run build`, and host the site.

### Post-deploy checklist

- Update `NEXT_PUBLIC_BASE_URL` in Vercel to the production domain (e.g. `https://your-team.vercel.app`).
- If you run the seed script against production, execute it locally (or via a secure job runner) with the production `MONGODB_URI`. Never expose `.seed.js` as a public endpoint.
- Monitor the first requests in Vercel’s logs to confirm MongoDB connections and Clerk auth succeed.

## 8. Project structure

```
app/
  (auth)/sign-in, sign-up        # Clerk hosted auth pages
  dashboard/                     # Authenticated farmer dashboard
  animals/, medicines/, ...      # Resource CRUD pages
  api/                           # REST endpoints (App Router handlers)
components/                      # UI building blocks (navbar, cards, tables, modals)
lib/                             # Helpers (db connection, auth utils, reporting, csv)
models/                          # Mongoose schemas
.seed.js                         # Demo data seeding script
```

## 9. Extending the MVP

- Add photo uploads (e.g. Cloudinary) for animal profiles.
- Introduce role-based authorisation for multi-user farms.
- Schedule reminders (cron jobs) for overdue tasks or vaccinations.
- Build mobile-first offline support with local caching.

## 10. Troubleshooting

- **Unknown @tailwind directive** – Ensure Tailwind is configured via `postcss.config.js` and Next.js dev server is running; the CSS preprocessor resolves directives at build time.
- **MongoDB connection errors** – Double-check credentials/whitelist IPs in Atlas.
- **TLS handshake failures on Windows** – Ensure Node 18+ is installed. If your network adds a custom SSL proxy, either install the CA certificate locally or set `MONGODB_ALLOW_INSECURE_TLS=true` in `.env.local` (development only) so the driver accepts the proxy certificate.
- **Clerk unauthorized** – Confirm frontend origin and redirect URLs are registered with Clerk, and env keys are present during build.
- **CSV download blocked** – Check that you are signed in; export endpoints require authentication.

Happy farming 👨‍🌾🌾! Let me know how you extend FarmTrack.
