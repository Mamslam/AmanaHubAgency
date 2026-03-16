# AmanaHub — Digital Agency Website

A multilingual Next.js digital agency landing page with a hidden internal audit portal.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables

Edit `.env.local` and fill in your values:

- **ANTHROPIC_API_KEY** — Get from [console.anthropic.com](https://console.anthropic.com)
- **PORTAL_CODE** — Change to any secure passphrase (default: `AMANAHUB2026`)

### 3. Run development server
```bash
npm run dev
```

## Accessing the Portal

The portal is hidden from all public navigation. To access it:

1. Visit the landing page at `http://localhost:3000/en`
2. Type the key sequence: **A → M → A → N → A** on your keyboard
3. A modal will appear — enter the portal code (`AMANAHUB2026` by default)
4. You will be redirected to `/portal`

Alternatively, navigate directly to `/portal` and enter the code.

## Changing the Portal Code

In `.env.local`:
```
PORTAL_CODE=YOURNEWCODE
```

## Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `PORTAL_CODE`
4. Deploy

The portal is automatically excluded from search engines via `robots.txt` and `X-Robots-Tag` headers.

## Languages

The site supports:
- English (`/en`)
- French (`/fr`)
- German (`/de`)
