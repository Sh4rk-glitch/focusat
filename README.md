# Focusat

A free web app for SAT students who lose the study session to their phone: one **8-minute**, **8-question** SAT-style session, a running clock that does not pause when you leave, and a streak saved on the device.

Original SAT-style practice (not College Board items). Math sessions embed Desmos. Authenticated progress syncs across devices with Supabase.

Official released questions live on the [SAT Suite Question Bank](https://satsuitequestionbank.collegeboard.org/) — we cannot copy those into the app.

## Supabase setup

The client uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` when supplied, with the project connection configured as the local fallback. Run [supabase.sql](supabase.sql) in the Supabase SQL editor, then enable Google under Authentication > Providers. Add your deployed URL and `http://localhost:5173` to the Supabase URL configuration and Google OAuth redirect allowlist.

For Google Cloud Console, add exactly `https://ahlkdbxtebsltrxhrbyz.supabase.co/auth/v1/callback` as an authorized redirect URI. Do not add the Google client secret to this frontend or commit it to the repository.

## Local

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deploy (static)

The site is a static Vite build (`dist/`). SPA fallback is included for Vercel and Netlify.

**Vercel:** import this folder, framework preset Vite, output `dist`.

**Netlify:** drag `dist` after `npm run build`, or connect the repo (build command `npm run build`, publish directory `dist`).

**GitHub Pages:** set the Vite `base` if the app is not at the domain root.

After deploy, open the URL on a phone. Use “Add to Home Screen” for the installable app.

## Product notes

- Local storage is an offline cache; signed-in progress is synced to Supabase and hydrated on another device.
- Leaving the tab counts as a focus leak; the timer keeps running.
- A completed session (not a forfeit) updates the daily streak.

