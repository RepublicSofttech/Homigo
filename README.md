# HomeServ – Web Frontend

React 18 + Vite + Tailwind CSS + React Query + React Hook Form.
One web app with four areas:

| Area | URL | Who |
|---|---|---|
| Customer website | `/`, `/services`, `/services/:id`, `/bookings`, `/account`, `/support` | Customers (guest browsing, OTP login at checkout) |
| Partner panel | `/partner/*` | Area Partner owner |
| Professional (coworker) app | `/coworker/*` | Field staff |
| Admin panel | `/admin/*` | Super admin, verification, ops, support, finance, marketing |

Built as a fresh project from the ideas in `RepublicSofttech/labor_project_frontend`
(Tailwind, React Query, react-hook-form, API client + ApiError pattern, vendor/coworker screens). The old repo was not changed.

## Quick start

```bash
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:8000/api/v1
npm run dev                 # http://localhost:5173
npm run build               # production build in dist/
```

Start the backend first (see the backend README) and run `python manage.py seed_demo` there.

### Demo logins (from backend seed, local only)

- Customer `9000000005`, Partner `9000000002`, Coworker `9000000003` — OTP login. In dev mode the OTP pops up on screen.
- Admin `9000000001` / `Admin@12345` — "Staff (password)" tab.

## Features

**Customer:** location picker (city or GPS), categories, search with synonyms, service page with the nearest verified partner
and alternatives (distance, rating, verified team), item selection from the partner's rate card, 7-day slot picker from real capacity,
coupon, server-side price preview, cash or online payment, booking tracking with timeline, start/completion OTP, add-on approval,
cancel with fee preview, rating & review, saved addresses, support tickets, notifications, offers page.

**Partner:** onboarding (business profile with GPS, services, KYC documents, bank, submit for verification, go-live checklist),
dashboard (SLA queue, earnings, wallet, alerts), bookings (accept/reject → fallback, assign coworker), team (add coworkers, documents,
submit for verification, activate/deactivate), rate card inside admin price range, subscription plans + payment, earnings
(commission ledger, wallet, settlements, pay dues), partner offers, reviews with reply/report.

**Coworker:** today/upcoming/completed jobs, on the way → arrived → start with OTP → add extra work/material → complete with OTP,
cash collected, no-show, Google Maps link.

**Admin:** KPI dashboard, verification queue (claim, per-document verify/reject, approve / resubmit / reject), all bookings with
force-cancel, partners (go-live checklist, suspend), coworker directory (suspend, blacklist), catalogue (categories, services, items
with price guard-rails, booking types, JSON questions), plans, offers, finance (settlement run, mark paid with UTR, payments,
commissions, grant subscription), review moderation, support tickets, users & staff, platform settings, audit logs.

## Structure

```
src/api/client.js            axios instance ("Token <key>" auth), error helpers
src/context/                 AuthContext, LocationContext
src/components/ui/           Badge, Modal, DataTable, Tabs, StatCard..., CrudPage (config-driven CRUD)
src/components/              BookingDetail (role-aware), BookingList, AddressForm, PayModal (mock / Razorpay)
src/components/layout/       PublicLayout, PanelLayout (sidebar), RequireAuth (role guard)
src/pages/public|customer|partner|coworker|admin
```

## Deploy

Any static host (Netlify config included, Vercel, S3 + CloudFront). Set `VITE_API_URL` to the live API at build time,
and add the site URL to `CORS_ALLOWED_ORIGINS` on the backend.

## Next (not in this version)

Flutter mobile apps (customer + partner/coworker) using the same API, live location tracking, push notifications (FCM),
Hindi translations, recurring subscriptions UI (BT4), quotes/milestones UI (BT5), rental/event flow (BT6).
