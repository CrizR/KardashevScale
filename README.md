# Kardashev Scale

An interactive exploration of the Kardashev scale, plus a calculator based on Carl Sagan's interpolation formula.

## Stack

- React 19
- Vite 8
- Native CSS scroll snap and IntersectionObserver
- Vercel static deployment

## Local development

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Import `CrizR/KardashevScale` in Vercel.
2. Use the repository root as the root directory.
3. Vercel will detect the included Vite configuration.
4. Deploy. No environment variables are required.

`vercel.json` configures the `dist` output directory, immutable asset caching, and an SPA rewrite so `/calculator` works when opened directly.

## Performance notes

The experience uses native browser scrolling rather than a JavaScript page-scroller dependency. Only the current video and its immediate neighbors receive media URLs, preventing every full-screen background video from downloading and decoding at startup.

<!-- Temporary branch build trigger for soundtrack source verification. -->
