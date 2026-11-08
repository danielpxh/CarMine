# CarMine

CarMine is a vehicle marketplace built with Next.js. The application brings together vehicle listings, user-submitted inventory, and supporting account and marketplace workflows behind a responsive web interface.

## Technology

- Next.js 15 App Router and React 18
- TypeScript and Tailwind CSS
- Radix UI primitives and Lucide icons
- Auto.dev v2 for external vehicle listings
- PostgreSQL and an application backend for user-managed data and workflows
- Clerk provider integration

## Requirements

- Node.js 18.18 or later
- Corepack (included with supported Node.js distributions)
- Access to the services required by the features you intend to run: PostgreSQL, the application backend, and/or Auto.dev

## Setup

Run commands from the `carmine-app` directory:

```bash
corepack pnpm install
```

Create `.env.local` in the `carmine-app` directory and add the configuration required for your environment. For example:

```dotenv
AUTO_DEV_API_KEY=your-auto-dev-key
CAR_API_KEY=your-car-api-key

PGHOST=your-postgres-host
PGPORT=5432
PGDATABASE=your-database
PGUSER=your-database-user
PGPASSWORD=your-database-password

NEXT_PUBLIC_BASE_API_URL=http://localhost:3100
API_BASE_URL=http://localhost:3100

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

Replace placeholders with values from your service providers, and remove entries for services you are not using. Keep real credentials in your local environment or deployment secret store; never commit them.

Start the development server:

```bash
corepack pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

| Variable | Used for | Notes |
| --- | --- | --- |
| `AUTO_DEV_API_KEY` | Auto.dev v2 vehicle listings | Server-side secret. Do not prefix with `NEXT_PUBLIC_`. |
| `CAR_API_KEY` | CarAPI vehicle catalog endpoints | Used by the makes, models, trims, engines, and body-style routes. |
| `PGHOST` | PostgreSQL host | Required by routes that connect directly to PostgreSQL. |
| `PGPORT` | PostgreSQL port | Defaults to `5432` in the database connection. |
| `PGDATABASE` | PostgreSQL database | Required by routes that connect directly to PostgreSQL. |
| `PGUSER` | PostgreSQL user | Required by routes that connect directly to PostgreSQL. |
| `PGPASSWORD` | PostgreSQL password | Required by routes that connect directly to PostgreSQL. |
| `NEXT_PUBLIC_BASE_API_URL` | Application backend base URL | Used by several API proxy routes. Despite the variable name, do not put credentials in this value. |
| `API_BASE_URL` | Application backend base URL for selling vehicles | Defaults to `http://localhost:3100` when unset. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client configuration | Used by the root Clerk provider. |
| `CLERK_SECRET_KEY` | Clerk server configuration | Keep this value private. |

Set only the variables required by the features and routes you use. For example, the marketplace's Auto.dev inventory requires `AUTO_DEV_API_KEY`; PostgreSQL-backed routes and backend-proxied features also require their respective services to be reachable.

## Application structure

```text
src/
  app/                 App Router pages, layouts, and API routes
    api/               Server-side API endpoints and upstream service proxies
    marketplace/       Vehicle search and listing detail routes
  components/          Shared UI and feature components
  hooks/               Reusable React hooks
  lib/                 Database access, shared types, and utilities
public/                Static images, icons, and web manifest
```

### Vehicle listings

The marketplace loads external inventory through the server-side `/api/car-listings` route and combines it with user-managed listings. Auto.dev credentials remain on the server. Listing detail requests use `/api/car-listings/[id]`; external inventory identifiers are VINs.

The listing proxy maps Auto.dev v2's nested vehicle and retail-listing response into the shape consumed by the marketplace. See the [Auto.dev v2 listing search reference](https://docs.auto.dev/v2/reference/searchVehicleListings) and [listing-by-VIN reference](https://docs.auto.dev/v2/reference/getVehicleListingByVin).

### API routes

Routes under `src/app/api` provide the application's server endpoints. They include vehicle listings and catalog lookups, account and profile operations, selling and buying workflows, uploads, contact, checkout, and inbox operations. Several routes proxy requests to the separately configured application backend; PostgreSQL-backed routes use the `PG*` variables.

## Development commands

Run these from `carmine-app`:

```bash
corepack pnpm dev       # Start the local development server
corepack pnpm lint      # Run the configured Next.js lint command
corepack pnpm build     # Create and type-check the production build
corepack pnpm start     # Serve a completed production build
```

Before deploying, run the production build and configure all required service URLs and secrets in the hosting provider's environment settings. The app needs network access to PostgreSQL and any configured backend or vehicle-data services.
