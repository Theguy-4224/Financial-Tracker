# Pocket Ledger

Pocket Ledger is a mobile-first personal finance PWA. Accounts, transactions, budgets, recurring items, subscriptions, goals, bills, reports, and settings are stored privately in the browser with IndexedDB.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install` in this folder.
3. Run `npm run dev`.
4. Open the local address shown in the terminal.

## Production and offline test

1. Run `npm run build`.
2. Run `npm run preview`.
3. Open the preview address and refresh once so the service worker controls the page.
4. In browser developer tools, switch the network to Offline and refresh. The application shell and locally stored finance data should remain available.
5. Open Settings → Preferences. Use **Install app** when offered, or the browser’s **Add to Home Screen** option.

Service workers run only in the production build and on secure origins. `localhost` is treated as secure for local testing.

## Deploy to Vercel

1. Push this folder to a Git repository.
2. Import the repository at Vercel.
3. Vercel reads `vercel.json`, runs `npm run build`, and publishes `dist`.
4. Open the HTTPS deployment, refresh once, and test installation and offline mode.

## Deploy to Netlify

1. Push this folder to a Git repository.
2. Add a new site from that repository in Netlify.
3. Netlify reads `netlify.toml`, runs `npm run build`, and publishes `dist`.
4. Open the HTTPS deployment, refresh once, and test installation and offline mode.

## Stage 8 additions

- Installable web app manifest and Pocket Ledger app icon
- Offline application-shell and runtime asset caching
- Offline status message and install guidance in Preferences
- Vercel and Netlify production configuration
- Mobile, dark-mode, accessibility, and production-build verification

## Important privacy note

Data is stored on the current browser profile and is not synchronized to a server. Export a CSV backup before clearing browser storage or changing devices. The optional PIN hides the interface but does not encrypt the IndexedDB database.
