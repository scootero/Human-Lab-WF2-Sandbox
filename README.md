# iOS App Validation Landing Page Template

A premium, config-driven Next.js landing page template for validating iOS app ideas. Swap content, images, themes, mockup URLs, and tracking webhooks via `app-data/` — no code edits required. Designed for automation with n8n.

## What This Template Does

This template powers **fake-door validation** for iOS app concepts. It presents a polished, Apple-inspired landing page with:

- Live embedded app mockup (iframe)
- Benefit, feature, and screenshot sections
- Pricing with purchase-intent tracking
- Email capture and FAQ
- Configurable themes and accent colors

All content comes from `app-data/app-config.json`. n8n can replace config, images, and webhook URLs for each new app idea.

## Folder Structure

```
app/
  layout.tsx          # Root layout, fonts, theme provider
  page.tsx            # Main landing page composition
  globals.css         # Global styles, glass utilities
components/
  Header.tsx
  Hero.tsx
  LiveMockupEmbed.tsx
  BenefitGrid.tsx
  ProblemSolution.tsx
  FeatureSection.tsx
  ScreenshotGallery.tsx
  HowItWorks.tsx
  PricingSection.tsx
  BuyNowTracker.tsx
  EmailCapture.tsx
  FAQSection.tsx
  TestimonialSection.tsx
  Footer.tsx
  ThemeProvider.tsx
lib/
  appData.ts          # Config types and loaders
  validation.ts       # Email validation
  tracking.ts         # Webhook payload helpers and event types
  TrackingProvider.tsx # Client tracking context (page_view, session metrics)
  themes.ts           # Theme system
app-data/
  app-config.json     # All app-specific content
  images/             # Screenshot images (1.png – 4.png)
public/               # Static assets (images copied here on dev/build)
scripts/
  copy-app-data-images.js
  generate-placeholder-images.js
```

## Editing app-config.json

All app-specific content lives in `app-data/app-config.json`:

| Field | Purpose |
|-------|---------|
| `appId`, `appName` | Identity for tracking |
| `heroHeadline`, `heroSubheadline` | Hero copy |
| `benefits`, `features`, `screenshots` | Section content |
| `problem`, `solution`, `targetAudience` | Problem/solution block |
| `theme` | Visual style (see below) |
| `mockup.embedUrl` | Deployed mockup app URL |
| `pricing`, `emailCapture`, `faq` | Optional sections (`enabled: true/false`) |
| `tracking` | Webhook URLs and experiment attribution IDs |

Set `enabled: false` on optional sections to hide them. Missing arrays or strings won't crash the page.

### Tracking config

| Field | Purpose |
|-------|---------|
| `tracking.webhookUrl` | Canonical unified n8n webhook for all events |
| `tracking.buyNowWebhookUrl` | Legacy fallback for `buy_now_clicked` |
| `tracking.emailWebhookUrl` | Legacy fallback for `email_captured` |
| `tracking.experimentId` | Experiment family ID for dashboard routing |
| `tracking.experimentRunId` | Immutable run ID for one validation cycle |
| `tracking.projectId` | Analytics project ID |
| `tracking.landingVersion` | Landing deploy timestamp |
| `tracking.landingVariantId` | Landing copy/layout variant |
| `tracking.mockupVersionId` | Mockup build variant |
| `tracking.deploymentId` | Landing Vercel project or deployment URL |
| `tracking.campaignName` | Ad campaign name for attribution |

## Replacing Images

1. Drop PNG/JPG files into `app-data/images/` (e.g. `1.png`, `2.png`, `3.png`, `4.png`)
2. Reference them in config: `"image": "/app-data/images/1.png"`
3. On `npm run dev` or `npm run build`, images are copied to `public/app-data/images/`

To generate placeholder images:

```bash
node scripts/generate-placeholder-images.js
```

## Setting the Mockup URL

In `app-config.json`:

```json
"mockup": {
  "embedUrl": "https://your-mockup-app.vercel.app",
  "baseWidth": 375,
  "baseHeight": 820,
  "useOuterDeviceFrame": false
}
```

The mockup app is deployed separately and controls its own iPhone UI. Set `useOuterDeviceFrame: false` (default) to avoid double-framing. The landing page only wraps the iframe with a subtle glow/shadow.

## Theme Styles

Configure in `app-config.json`:

```json
"theme": {
  "style": "liquid-glass",
  "accentColor": "violet",
  "mode": "light"
}
```

**Available styles:**

| Style | Description |
|-------|-------------|
| `liquid-glass` | Frosted panels, soft glow (default) |
| `apple-light` | Clean white/gray Apple aesthetic |
| `apple-dark` | Dark gray, high contrast |
| `midnight` | Deep navy gradient |
| `aurora` | Purple/teal gradient |
| `black-titanium` | Near-black metallic |
| `minimal-white` | Ultra-clean minimal |

**Accent colors:** `violet`, `blue`, `emerald`, `rose`, `amber`, `cyan`

## Conversion tracking

The landing page sends four event types to n8n webhooks:

| eventType | When |
|-----------|------|
| `page_view` | Once on load |
| `buy_now_clicked` | Pricing fake-door submit |
| `email_captured` | Waitlist form submit |
| `mockup_interacted` | First mockup expand/click |

If no webhook URL is configured, events are logged to the console in development and the UI still succeeds for local testing.

## Webhook payloads

All events share the same JSON shape. n8n should append each payload as one row in a unified Google Sheet, using `eventType` to filter or pivot.

```json
{
  "eventType": "buy_now_clicked",
  "appId": "example-app",
  "appName": "Example App",
  "experimentId": "exp_example-app_001",
  "experimentRunId": "run_example-app_001",
  "projectId": "proj_example-app",
  "deploymentId": "prj_landing_abc123",
  "landingVersion": "2026-06-29T12:00:00.000Z",
  "landingVariantId": "v1",
  "mockupVersionId": "v1",
  "campaignName": "example-app-validation",
  "visitorId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "email": "user@example.com",
  "price": "$4.99",
  "pageUrl": "https://yoursite.com/?utm_source=facebook",
  "referrer": "https://facebook.com/",
  "utmSource": "facebook",
  "utmMedium": "paid_social",
  "utmCampaign": "example-validation",
  "utmContent": "",
  "utmTerm": "",
  "timeOnPageSeconds": 42,
  "mockupInteracted": true,
  "timestamp": "2026-06-29T12:00:42.000Z"
}
```

UTM parameters and `referrer` are captured automatically from the browser.

## n8n Automation

n8n should replace these files per app idea:

1. **`app-data/app-config.json`** — full config with copy, theme, pricing, webhooks
2. **`app-data/images/`** — 1–4 screenshot PNGs
3. **`mockup.embedUrl`** — URL of the deployed mockup app
4. **`tracking.webhookUrl`** — unified n8n webhook (preferred), or legacy `buyNowWebhookUrl` / `emailWebhookUrl`

After replacement, redeploy to Vercel (or run locally). No code changes needed.

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Framework preset: **Next.js**
4. Build command: `npm run build` (default)
5. Deploy

Environment variables are optional. Webhook URLs go in `app-config.json`, not env vars.

## Commands

```bash
npm install
npm run dev
npm run build
```

- `npm run dev` — copies images, starts dev server at http://localhost:3000
- `npm run build` — copies images, builds for production
- `npm start` — runs production server locally
