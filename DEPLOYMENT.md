# TrackThis Deployment Guide

TrackThis is engineered as a **100% client-side, local-first Single Page Application (SPA)**. 

---

## 1. Do You Need a Backend Deployed?

**No.** TrackThis requires **zero backend servers**, zero cloud databases, and zero container infrastructure:

- **Local Persistence**: All user decisions, undo stacks, and session checkpoints write directly to the user's browser via **IndexedDB** (`idb`).
- **Catalog Dataset**: The verified 500-anime catalog and artwork metadata are compiled directly into the client bundle at build time.
- **Cloud Sync Engine**: The sync worker communicates directly from the client's browser to external endpoints (AniList GraphQL, MyAnimeList OAuth2 PKCE) with built-in client-side rate limit queues.
- **Feedback Form**: Submits directly from the client to Formspree (`https://formspree.io/f/xldleqja`).

You only need to deploy the static build artifacts (`dist` folder). Hosting is **completely free ($0/month)** on modern static hosting platforms.

---

## 2. Recommended Hosting Platforms

| Platform | Best For | Bandwidth / Limits | Setup Difficulty |
| :--- | :--- | :--- | :--- |
| **Vercel** (Recommended) | Instant GitHub integration, global edge CDN, automated previews | 100 GB/month (Free Tier) | 1 click (Turnkey) |
| **Cloudflare Pages** | Maximum scale, zero bandwidth caps, global Anycast network | **Unlimited** bandwidth | 1 click (Turnkey) |
| **GitHub Pages** | Native hosting directly within your GitHub repository | 100 GB/month | GitHub Action workflow |
| **Netlify** | Continuous deployment, drag-and-drop deployment | 100 GB/month | 1 click (Turnkey) |

---

## 3. Deploying to Vercel (Recommended)

### Method A: Via Vercel Web Dashboard (Easiest)

1. Push your repository to GitHub: `https://github.com/lunagus/trackthis`
2. Go to [vercel.com](https://vercel.com/) and sign in with your GitHub account.
3. Click **"Add New..."** -> **"Project"**.
4. Import your `trackthis` repository from the list.
5. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click **Deploy**. Within 60 seconds, your site is live with a secure `https://<project-name>.vercel.app` URL.

*(Note: The repository already includes a [vercel.json](file:///d:/Proyectos/TrackThis/vercel.json) file configured to route all paths to `index.html` for clean client-side routing).*

### Method B: Via Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to your account
vercel login

# 3. Deploy from the repository root
vercel --prod
```

---

## 4. Deploying to Cloudflare Pages

Cloudflare Pages provides unlimited bandwidth and runs across Cloudflare's 300+ city global edge network.

### Method A: Via Cloudflare Dashboard

1. Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/) and select **Workers & Pages**.
2. Click **Create Application** -> **Pages** -> **Connect to Git**.
3. Select your GitHub repository (`trackthis`).
4. In Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.

*(Note: The repository includes [public/_redirects](file:///d:/Proyectos/TrackThis/public/_redirects) with `/* /index.html 200` to handle SPA routing on Cloudflare Pages).*

---

## 5. Deploying to GitHub Pages

If you want the project hosted directly under your GitHub username (e.g., `https://lunagus.github.io/trackthis`):

1. In your GitHub repository, navigate to **Settings** -> **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Create a workflow file in your repo at `.github/workflows/deploy.yml`:

```yaml
name: Deploy TrackThis to GitHub Pages

on:
  push:
    branches: [ master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Production Assets
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 6. Connecting a Custom Domain (e.g. `trackthis.cc`)

Once you acquire a domain name:

1. **On Vercel**:
   - Go to **Project Settings** -> **Domains**.
   - Enter your domain (e.g. `trackthis.cc` or `app.trackthis.cc`).
   - Vercel will give you the exact DNS records to add:
     - For Apex (`trackthis.cc`): An **A Record** pointing to `76.76.21.21`.
     - For Subdomain (`www` or `app`): A **CNAME Record** pointing to `cname.vercel-dns.com`.
2. **On Cloudflare Pages**:
   - Go to **Project** -> **Custom Domains**.
   - Enter your domain. If your DNS is already managed by Cloudflare, it configures automatically in one click.
   - Cloudflare provisions a free SSL certificate automatically.

---

## 7. Local Production Preview Test

Before deploying, you can verify the optimized production build on your local machine:

```bash
# 1. Compile production bundle
npm run build

# 2. Launch local production server
npm run preview
```
Visit `http://localhost:4173/` to inspect the minified, production-grade build.
