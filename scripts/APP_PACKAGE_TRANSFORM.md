# App Package → app-config.json transform

This document describes how n8n (or `scripts/generate-app-config.js`) maps an [App Package](../../app-validation-spec/APP_PACKAGE_SPEC.md) into `app-data/app-config.json` for the landing template.

The transform **translates package data only** — it must not contain app-specific content.

**Spec 1.5.0:** Production Drive is `app.json` only. Prefer `landingPage.content` + `sections[].inline` and media `url` / `githubPath`. Local `copy/*.md` and `media.path` remain local-dev fallbacks.

## Run locally

From `landing-template/`:

```bash
# Local-dev package (copy/ + media/ on disk)
node scripts/generate-app-config.js ../test-app-packages/human-lab

# Production-shaped app.json only
node scripts/generate-app-config.js --app-json /path/to/app.json

npm run dev
```

## Input modes

| Mode | Inputs |
|------|--------|
| **Production (WF2)** | Drive `app.json` only — inline copy + `url`/`githubPath` media |
| **Local-dev** | Package directory with `app.json`, optional `copy/*.md`, optional `media/*` files |

## Input files (local-dev)

| App Package path | Used for |
|------------------|----------|
| `app.json` | Identity, audience, commerce, branding, media refs, sections, content, webhooks, deployment URLs |
| `copy/hero.md` | Fallback when hero is not inline |
| `copy/benefits.md` | Fallback when `landingPage.content.benefits` missing |
| `copy/features.md` | Fallback when `landingPage.content.features` missing |
| `copy/faq.md` | Fallback when `landingPage.content.faq` missing |
| `media/*` | Local `path` binaries copied to `app-data/images/` |

## Output

| Output | Purpose |
|--------|---------|
| `app-data/app-config.json` | Consumed by `lib/appData.ts` and all landing components |
| `app-data/images/*` | Copied screenshots, logo, og-image, icon (when local binaries exist) |

## Content resolution priority

| Output field | Priority |
|--------------|----------|
| Hero | `sections[hero].inline` → local `copy/hero.md` → `identity.tagline` fallbacks |
| Benefits | `landingPage.content.benefits` → local `copy/benefits.md` |
| Features | `landingPage.content.features` → local `copy/features.md` |
| FAQ | `landingPage.content.faq` → local `copy/faq.md` |
| Testimonials | `landingPage.content.testimonials` (no markdown fallback) |

## Media resolution priority

| Asset | Priority |
|-------|----------|
| Screenshots / logo / og / icon | local `path` file → `url` → `githubPath` via `assetsGithubRepo ?? mockupGithubRepo` |

Default assets repo: `source.assetsGithubRepo ?? source.mockupGithubRepo` on `source.assetsBranch ?? source.mockupBranch`.

WF2 downloads `githubPath` / `url` binaries into `app-data/images/` before committing the landing repo. Declared asset paths only — never mockup source.

## Field mapping reference

| app.json / copy | app-config.json |
|-----------------|-----------------|
| `appId` | `appId` |
| `identity.appName` | `appName` |
| `identity.tagline` | `tagline` |
| `identity.badgeText` | `badgeText` |
| `sections[hero].inline` or `copy/hero.md` | `heroHeadline`, `heroSubheadline`, `heroBody` |
| `commerce.cta.primaryText` | `primaryCtaText` |
| `commerce.cta.secondaryText` | `secondaryCtaText` |
| `commerce.cta.buyNowText` | `pricing.ctaText` |
| `commerce.cta.waitlistText` | `emailCapture.buttonText` |
| `commerce.cta.emailPlaceholder` or `sections[cta].inline.placeholder` | `emailCapture.placeholder` |
| `commerce.pricing` | `pricing.price`, `pricing.billingLabel` |
| `audience.painPoints[0]` | `problem` |
| `identity.description` | `solution` |
| `audience.landingPhrase` | `targetAudience` (fallback: `audience.primary`) |
| `branding.theme.landingStyle` | `theme.style` |
| `branding.theme.accentName` | `theme.accentColor` |
| `branding.theme.mode` | `theme.mode` |
| `branding.theme.fontFamily` | `theme.fontFamily` |
| `landingPage.content.benefits` | `benefits[]` |
| `landingPage.content.features` | `features[]` |
| `landingPage.content.faq` | `faq.items[]` |
| `landingPage.content.testimonials` | `testimonials.items[]` (`name` → `author`) |
| `media.screenshots[]` | `screenshots[]` |
| `media.logo` | `logo.imageUrl` |
| `media.icon` | `icon.imageUrl` (favicon / apple-touch) |
| `media.ogImage` | `seo.ogImageUrl` |
| `landingPage.sections[pricing]` | `pricing.finePrint`, `pricing.enabled` |
| `landingPage.sections[cta]` | `emailCapture.*` |
| `landingPage.sections[faq]` | `faq.enabled` |
| `landingPage.sections[socialProof]` | `testimonials.enabled` + optional headline |
| `landingPage.sections[footer].inline.body` | `footer.text` |
| `landingPage.seo` | `seo.title`, `seo.description`, `seo.keywords` |
| `mockup.baseWidth`, `baseHeight`, `clipBottomPx` | `mockup.*` |
| `deployment.mockup.url` or `mockup.previewUrl` | `mockup.embedUrl` |
| `tracking.webhookUrl` | `tracking.webhookUrl` (owned by **WF0**) |
| `analytics.*` | `tracking.experimentId`, etc. |
| `deployment.landing.lastDeployedAt` | `tracking.landingVersion` |
| `ads.campaignName` | `tracking.campaignName` |

## Generic transform fallbacks (not app-specific)

| app-config field | Fallback |
|------------------|----------|
| `badgeText` | `"Coming soon to the App Store"` if `platform === "ios"`, else `"Coming soon"` |
| `theme.style` | `"midnight"` if `mode === "dark"`, else `"liquid-glass"` |
| `theme.accentColor` | Hex → name map, then `"violet"` |
| `theme.fontFamily` | `""` (landing uses Geist / CSS default) |
| `mockup.baseWidth` / `baseHeight` | `375` / `820` |
| `mockup.clipBottomPx` | `0` |
| `primaryCtaText` | `"Buy Now"` |
| `pricing.ctaText` | `"Buy Now on the App Store"` |
| `emailCapture.placeholder` | `"Enter your email"` |
| `emailCapture.buttonText` | `"Keep Me Updated"` |
| `emailCapture.subheadline` | `"Get launch updates."` |
| `pricing.headlineLabel` | `"Get for"` |
| `logo.text` | First letter of `appName` |

## WF2 port notes

Port these functions into the n8n Code node:

- `resolveHero`, `resolveBenefits`, `resolveFeatures`, `resolveFaq`, `resolveTestimonials`
- `resolveGithubAssetUrl`, `resolveAssetsRepo`, `resolvePublicImageRef`
- `mapTracking`, `mapAccentColor`, `mapLandingStyle`, `mapBadgeText`, `mapSeo`, `mapFooter`
- `resolveMockupUrl` → `mockup.embedUrl`

Do **not** download Drive `copy/` or Drive `media/` folders.
