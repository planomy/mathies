# Mathies

Primary maths practice for the classroom — timed question sets, class tally, and progress charts.

**Live app:** https://planomy.github.io/mathies/

## Develop

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

The site is built into `/docs` and published from the `main` branch via GitHub Pages (no Actions).

```bash
npm run build
git add docs/
git commit -m "Update GitHub Pages build"
git push origin main
```

In the repo settings, ensure **Pages → Build and deployment → Source** is set to **Deploy from a branch**, branch **main**, folder **/docs**.
