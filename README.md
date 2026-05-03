# Falling Sand Workspace

This workspace now keeps three versions side by side:

- `index.html` and `fallingsand.js`: the original root browser version, preserved in place.
- `apps/web/`: a split-out desktop/browser app that mirrors the current non-mobile experience.
- `apps/mobile/`: a mobile-oriented app shell where touch and responsive behavior can evolve without changing the original.

Open either app directly in a browser:

- `apps/web/index.html`
- `apps/mobile/index.html`

The root files remain available as the original baseline.

For mobile PWA work, serve `apps/mobile/` over HTTP rather than opening it with `file://`. For example, from the workspace root:

`c:/Github/falling_sand/.venv/Scripts/python.exe -m http.server 4173`

Then open `http://localhost:4173/apps/mobile/`.

## GitHub Setup

This repo now includes a `.gitignore` for local Python environment files and Vercel local metadata.

If you want to push it to GitHub manually:

```powershell
git status
git add .
git commit -m "Prepare falling sand apps for GitHub and Vercel"
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

If `origin` already exists, use:

```powershell
git remote set-url origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

## Vercel Deploy

The cleanest Vercel target is the mobile app in `apps/mobile/`.

Recommended import flow for a free Vercel account:

1. Push this repo to GitHub.
2. In Vercel, choose `Add New...` -> `Project`.
3. Import the GitHub repository.
4. In the project settings, set `Root Directory` to `apps/mobile`.
5. Leave the framework preset as `Other`.
6. Leave the build command empty.
7. Leave the output directory empty.
8. Deploy.

After deploy, Vercel will serve the PWA from the mobile app folder directly, which is the simplest fit for the current structure.

If you later want to deploy the desktop/browser version instead, change the Vercel `Root Directory` to `apps/web`.# falling-sand
