# CarMine

CarMine is a vehicle marketplace web application for discovering listings and supporting the workflows around buying, selling, and renting vehicles. The repository contains a Next.js application and server-side API routes that integrate with vehicle-data providers, PostgreSQL, and a separately hosted application backend.

> **Project status:** This repository is intended for development and demonstration. Before using it in production, review the security, authentication, data-retention, and deployment considerations below.

## What’s included

- Vehicle marketplace with search, filters, sorting, and listing details
- Auto.dev-powered external inventory, fetched through server-side routes
- User-facing buy, sell, rent, account, profile, and inbox workflows
- Administrative pages and supporting API endpoints
- Vehicle catalog lookups through CarAPI
- Shared responsive UI, light/dark theme, and accessibility-conscious motion

The application does not include an ASP.NET service or AWS infrastructure definition. Some workflows call a separately hosted backend; configure that service using the environment variables below.

## Technology

- Next.js 15 App Router and React 18
- TypeScript and Tailwind CSS
- Radix UI and Lucide icons
- PostgreSQL (`pg`) for routes that query the database directly
- Auto.dev and CarAPI integrations for vehicle data
- Vercel Blob integration for supported upload workflows

## Requirements

- Node.js 20 LTS recommended (Next.js 15.5 requires Node.js 18.18 or newer)
- npm
- PostgreSQL and/or the external backend for the features that use them
- API credentials for the vehicle-data providers you enable

## Getting started

Run the following commands from `carmine-app/`:

```bash
npm ci
```

Create `carmine-app/.env.local` and add the configuration needed for your environment. Do not copy real credentials into source control.

```dotenv
# Auto.dev inventory (required for external marketplace listings)
AUTO_DEV_API_KEY=your-auto-dev-key

# CarAPI catalog lookups (optional, depending on provider access)
CAR_API_KEY=your-carapi-key

# PostgreSQL-backed routes (configure all values when using these routes)
PGHOST=localhost
PGPORT=5432
PGDATABASE=carmine
PGUSER=your-database-user
PGPASSWORD=your-database-password

# Separately hosted application backend
NEXT_PUBLIC_BASE_API_URL=http://localhost:5208
API_BASE_URL=http://localhost:3100

# Public origin used to generate absolute social-sharing image URLs
NEXT_PUBLIC_SITE_URL=https://carmine-my.vercel.app
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose | Required when |
| --- | --- | --- |
| `AUTO_DEV_API_KEY` | Authenticates server-side requests to Auto.dev listing endpoints. | Using external marketplace inventory |
| `CAR_API_KEY` | Authenticates supported CarAPI catalog lookups. | Using catalog endpoints that require a key |
| `PGHOST` | PostgreSQL server host. | Using PostgreSQL-backed API routes |
| `PGPORT` | PostgreSQL server port; defaults to `5432`. | Using PostgreSQL-backed API routes |
| `PGDATABASE` | PostgreSQL database name. | Using PostgreSQL-backed API routes |
| `PGUSER` | PostgreSQL account name. | Using PostgreSQL-backed API routes |
| `PGPASSWORD` | PostgreSQL account password. | Using PostgreSQL-backed API routes |
| `NEXT_PUBLIC_BASE_API_URL` | Base URL for the separately hosted backend used by account, inventory, and related proxy routes. | Using backend-proxied features |
| `API_BASE_URL` | Backend base URL used by the sell route; defaults to `http://localhost:3100`. | Using the sell workflow |
| `NEXT_PUBLIC_SITE_URL` | Public site origin used for Open Graph and social-sharing metadata; defaults to `https://carmine-my.vercel.app`. | Change it when sharing from a different production domain |

Set the URLs to services reachable from the Next.js server. Although `NEXT_PUBLIC_BASE_API_URL` has a `NEXT_PUBLIC_` prefix, it is used by server-side API routes in this application; do not put credentials or tokens in it. Keep API keys and database credentials server-side, out of browser code and Git.

Some routes depend on different services. A successful Next.js build does not verify that those services are configured or reachable.

## Application layout

```text
carmine-app/
  src/
    app/                 Pages, layouts, and App Router API endpoints
      api/               Server-side handlers and upstream service proxies
      marketplace/       Search and listing detail pages
    components/          Shared layout and feature UI
    lib/                 Database access, types, and utilities
  public/                Static assets, icons, and web manifest
  package.json           Scripts and dependency manifest
  package-lock.json      npm dependency lockfile
```

The root `README.md` documents the application in `carmine-app/`. API routes are implemented under `carmine-app/src/app/api/`; they are not a replacement for the separately hosted backend where a route proxies requests to that service.

## Data integrations

### Auto.dev

The marketplace calls the local `/api/car-listings` endpoint. That server-side route requests listings from Auto.dev and normalizes the response for the UI. Listing details are handled by `/api/car-listings/[id]`. Configure `AUTO_DEV_API_KEY` on the server; do not expose it through a client-side environment variable.

Refer to the [Auto.dev v2 documentation](https://docs.auto.dev/v2) for provider behavior, authentication, and API limits.

### PostgreSQL and application backend

Routes that access PostgreSQL use the `PG*` variables. Other routes proxy requests to the separately deployed backend using `NEXT_PUBLIC_BASE_API_URL` or, for the sell route, `API_BASE_URL`. Start and configure those services independently; otherwise the associated workflows will return an error even when the Next.js app is running.

## Development and deployment

Available npm scripts:

```bash
npm run dev       # Start the local development server
npm run lint      # Run the configured Next.js ESLint checks
npm run build     # Create and type-check the production build
npm run start     # Serve a completed production build
```

Before deploying:

1. Run `npm run lint` and `npm run build`.
2. Set the required environment variables in the hosting provider’s secret/configuration settings.
3. Confirm the hosting environment can reach PostgreSQL and each configured backend or data provider.
4. Verify the marketplace and the workflows that depend on external services in the deployed environment.

The application is compatible with Next.js hosting platforms such as Vercel. Deployment does not provision PostgreSQL, the separate backend, or provider accounts.

## Operational and security notes

- Never commit `.env.local`, provider credentials, database passwords, or other secrets.
- Use least-privilege credentials and TLS for database and service connections.
- Review authentication and authorization on administrative and user-data routes before production use.
- Configure appropriate CORS and request protections for the deployment. The current API configuration allows broad cross-origin access; restrict it to trusted origins where cross-origin requests are required.
- Treat user-submitted listings and uploaded files as untrusted input.
- Review provider terms, quotas, and data usage before publishing externally sourced vehicle data.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Marketplace has no Auto.dev inventory | Confirm `AUTO_DEV_API_KEY` is configured in the Next.js server environment and that the provider account can access the listings endpoint. |
| Buy, account, or inbox requests fail | Confirm the backend is running and `NEXT_PUBLIC_BASE_API_URL` points to its reachable base URL. |
| Sell requests fail | Confirm the backend is running at `API_BASE_URL` (or the default `http://localhost:3100`). |
| Catalog lookups fail | Confirm `CAR_API_KEY` is configured if required by the provider and inspect the server logs for the upstream response. |
| PostgreSQL-backed requests fail | Verify all `PG*` values, database network access, and TLS configuration for the target environment. |
| Build succeeds but a workflow is unavailable | The build does not test external API credentials, database access, or backend availability; verify each dependency separately. |
