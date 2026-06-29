# FoodOps Admin Dashboard

An Angular 20 administration panel for the Sangam Delivery (KT Mart) food delivery platform. Gives platform administrators full operational control over users, riders, restaurants, orders, complaints, notifications, analytics, and platform settings.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Setup](#setup)
- [Features](#features)
- [Admin Routes](#admin-routes)
- [Scripts](#scripts)

---

## Overview

FoodOps Admin connects to the Sangam Delivery backend (`/api/admin` routes) using a separate admin JWT. The panel is protected by an `isAdmin` middleware on the backend and by Angular route guards on the frontend.

Key capabilities:

- Real-time rider tracking via Socket.IO
- Platform-wide analytics with Chart.js
- Role-targeted notification delivery
- Full CRUD over users, riders, restaurants, orders, and complaints
- Configurable delivery charges, GST, and commission via platform settings

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Angular 20 |
| Language | TypeScript |
| UI Components | Angular Material |
| State Management | NgRx |
| Real-time | Socket.IO Client |
| Maps | Google Maps |
| Charts | Chart.js |
| Styling | Tailwind CSS, SCSS |
| Auth | JWT (admin-scoped, stored in localStorage) |
| HTTP | Angular HttpClient + interceptors |

---

## Project Structure

```
Foodops-admin/
├── angular.json
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── environments/
    │   ├── environment.ts          # dev: apiUrl, socketUrl
    │   └── environment.prod.ts     # prod overrides
    ├── styles.css                  # global styles
    ├── material-theme.scss         # Angular Material theme
    └── app/
        ├── app.config.ts           # provideRouter, provideHttpClient, etc.
        ├── app.routes.ts           # top-level lazy routes
        ├── core/
        │   ├── guards/
        │   │   ├── auth.guard.ts   # redirects unauthenticated to /login
        │   │   └── guest.guard.ts  # redirects authenticated away from /login
        │   ├── interceptors/
        │   │   ├── auth.interceptor.ts   # attaches admin JWT to requests
        │   │   └── error.interceptor.ts  # global HTTP error handling
        │   ├── models/
        │   │   └── admin.model.ts
        │   └── services/
        │       ├── api.service.ts    # base HTTP wrapper
        │       ├── auth.service.ts   # login / logout / token storage
        │       └── socket.service.ts # Socket.IO connection
        ├── features/
        │   ├── auth/pages/login/
        │   ├── dashboard/
        │   ├── users/
        │   ├── riders/
        │   ├── rider-tracking/     # live map
        │   ├── restaurants/
        │   ├── orders/
        │   ├── fleet/
        │   ├── complaints/
        │   ├── notifications/
        │   ├── analytics/
        │   ├── settings/
        │   └── audit-logs/
        ├── layouts/
        │   ├── admin-layout/       # sidebar + topbar shell
        │   └── auth-layout/        # login page shell
        └── shared/
            ├── components/
            │   ├── sidebar/
            │   └── topbar/
            └── shared.module.ts
```

---

## Prerequisites

- **Node.js** v18+
- **Angular CLI** v21+ — `npm install -g @angular/cli`
- The Sangam Delivery **Backend** running at the URL configured in `environment.ts`

---

## Environment Configuration

Edit `src/environments/environment.ts` for development:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api/admin',
  socketUrl: 'http://localhost:5000',
};
```

Edit `src/environments/environment.prod.ts` for production builds.

---

## Setup

```bash
cd Foodops-admin
npm install
```

Seed the admin account on the backend (first time only):

```bash
cd ../Backend
node scripts/seedAdmin.js
```

Start the dev server:

```bash
ng serve
```

The admin panel runs at `http://localhost:4200`. Log in with the credentials created by `seedAdmin.js`.

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Stats overview — total users, active riders, pending orders, revenue |
| **User Management** | List, search, filter users; view order history; activate / deactivate / block / ban |
| **Rider Management** | List riders; view profile, earnings, stats; approve / suspend / activate / deactivate |
| **Live Rider Tracking** | Real-time map with Socket.IO rider markers, status popups, last-seen timestamps |
| **Restaurant Management** | List restaurants; view owner + menu + revenue; approve / reject / suspend / activate |
| **Order Management** | List with filters; view full order detail; force cancel, reassign rider, process refund, update status |
| **Fleet Monitoring** | Online / offline / busy counts, average delivery time, orders-per-rider, delivery heatmap |
| **Complaints & Support** | List by type; view detail; assign to staff; update status; resolve |
| **Notifications** | Send to users / riders / restaurants by role; create templates; view history |
| **Analytics** | Revenue, orders, customer growth, rider performance, restaurant performance, peak hours, export |
| **Platform Settings** | Delivery base charge, per-km rate, free-above threshold, min order amount, GST, commission |
| **Audit Logs** | Track all admin actions with filters |

---

## Admin Routes

| Path | Component |
|------|-----------|
| `/login` | Login page |
| `/dashboard` | Stats overview |
| `/users` | User listing |
| `/riders` | Rider listing |
| `/riders/:id` | Rider detail |
| `/rider-tracking` | Live fleet map |
| `/restaurants` | Restaurant listing |
| `/restaurants/:id` | Restaurant detail |
| `/orders` | Order listing |
| `/orders/:id` | Order detail |
| `/fleet` | Fleet monitoring |
| `/complaints` | Complaints listing |
| `/complaints/:id` | Complaint detail |
| `/notifications` | Notification center |
| `/analytics` | Analytics dashboard |
| `/settings` | Platform settings |
| `/audit-logs` | Admin action logs |

All routes except `/login` are protected by `AuthGuard`. The `/login` route is protected by `GuestGuard`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `ng serve` | Start dev server on port 4200 |
| `ng build` | Production build (output: `dist/`) |
| `ng test` | Run unit tests with Vitest |
| `ng e2e` | End-to-end tests (framework of your choice) |
| `ng generate component <name>` | Scaffold a new component |
