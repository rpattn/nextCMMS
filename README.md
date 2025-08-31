CMMS Next.js Client (Server Components)

This folder contains a Next.js App Router scaffold to migrate the current SPA to server-side auth and data fetching.

What’s included:
- App Router structure with public, auth, and protected segments
- HttpOnly cookie session via `/api/session` and `/api/logout`
- Middleware guard for `/app/*`
- Example protected page: `/app/work-orders` fetching from your backend on the server

Setup

1. Copy `.env.local.example` to `.env.local` and set `API_URL` (your backend base URL):

```
API_URL=http://localhost:8080/
```

2. Install deps and run:

```
cd client
npm install
npm run dev
```

3. Visit `http://localhost:3000/`
- `/login` posts to `/api/session` and sets the HttpOnly cookie
- `/app/work-orders` is protected; middleware redirects unauthenticated users to `/login`

Next Steps
- Proxy other backend endpoints with Route Handlers under `app/api/*`
- Port protected routes one-by-one under `app/(protected)/*`
- Replace direct backend calls from the browser with calls to your Next API
- Keep non-sensitive UI prefs in localStorage; move auth/data to server
