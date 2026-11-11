# WorkOra

WorkOra is a PWA application for logging work hours, managing clients, a calendar (agenda), calculating earnings, and generating PDF reports.

## Features

- **Work hours logging:** record work logs by date and client.
- **Clients:** each client can have an hourly rate or a daily rate.
- **Agenda / calendar:** appointments can be converted into a work log.
- **Monthly reports:** overview of hours and earnings per month.
- **PDF export:** reports are exported to PDF using the jsPDF library.
- **Bilingual interface:** Bosnian and Italian (i18next).
- **Light and dark theme.**
- **Installable as a PWA:** the application can be installed on a device (vite-plugin-pwa).

## Tech stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Supabase (PostgreSQL database and authentication)
- i18next
- jsPDF
- vite-plugin-pwa

## Project structure

The application is located in the `WorkOra/` folder. All npm and bun commands are run from that folder.

## Running locally

1. Clone the repository and enter the application folder:

   ```bash
   cd WorkOra
   ```

2. Install dependencies. The repository contains `bun.lock`, so Bun is recommended:

   ```bash
   bun install
   ```

   Alternatively, you can use npm:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The application is available on port 3000.

### Environment variables

The application uses the following environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Enter the values in the local file `WorkOra/.env.local`. This file must NOT be committed to the repository.

Without these variables, the application runs in demo mode, and data is stored in the browser's localStorage.

## Scripts

- `npm run dev` - starts the development server (port 3000).
- `npm run build` - creates a production build.
- `npm run preview` - starts a local preview of the production build.
- `npm run lint` - type checking using `tsc --noEmit`.

## Security

- Never commit `.env` files to the repository.
- Keep keys only in environment variables: locally in `.env.local` and in the Vercel dashboard.
- The Supabase database `service_role` key must NEVER be placed in `VITE_` variables or in client-side code. Variables with the `VITE_` prefix are visible in the browser.
- Data security depends on the Row Level Security (RLS) policies in the Supabase database. Make sure RLS policies are enabled for all tables.

## Deploy

The application is deployed to Vercel from the GitHub repository, from the `main` branch.

## License

License: [TO BE FILLED IN]
