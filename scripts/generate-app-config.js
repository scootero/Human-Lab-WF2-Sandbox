#!/usr/bin/env node
/**
 * Generate landing-template app-data/app-config.json from an App Package.
 *
 * Usage (from landing-template/):
 *   node scripts/generate-app-config.js <path-to-app-package>
 *   node scripts/generate-app-config.js ../test-app-packages/human-lab
 *   node scripts/generate-app-config.js --app-json /path/to/app.json
 *
 * Spec 1.5.0: production prefers inline landingPage.content + sections[].inline
 * and media url/githubPath. Local copy/*.md and media path remain local-dev fallbacks.
 *
 * See APP_PACKAGE_TRANSFORM.md.
 */

const fs = require("fs");
const path = require("path");

const ACCENT_HEX_TO_NAME = {
  "#06d6a0": "emerald",
  "#059669": "emerald",
  "#3b82f6": "blue",
  "#2563eb": "blue",
  "#7c3aed": "violet",
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function extractSection(markdown, heading) {
  const re = new RegExp(
    `## ${heading}\\s*\\n\\n([\\s\\S]*?)(?=\\n## |\\n\\*\\*|\\n---|$)`,
    "i"
  );
  const match = markdown.match(re);
  if (!match) return "";
  const raw = match[1].trim();
  if (heading.toLowerCase() === "body") {
    return raw.replace(/\n\*\*Primary CTA:\*\*[\s\S]*$/, "").trim();
  }
  return raw.split("\n\n")[0].trim();
}

function parseHeroSection(markdown) {
  return {
    headline: extractSection(markdown, "Headline"),
    subheadline: extractSection(markdown, "Subheadline"),
    body: extractSection(markdown, "Body"),
  };
}

function parseFeatures(markdown) {
  const features = [];
  const blocks = markdown.split(/^## Feature \d+\s*$/m).slice(1);
  for (const block of blocks) {
    const titleMatch = block.match(/\*\*Title:\*\*\s*(.+)/);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();
    const rest = block.slice(titleMatch.index + titleMatch[0].length).trim();
    const description = rest.split("\n\n")[0].trim();
    features.push({ title, description });
  }
  return features;
}

function parseBenefits(markdown) {
  const benefits = [];
  const blocks = markdown.split(/^## Benefit \d+\s*$/m).slice(1);
  for (const block of blocks) {
    const titleMatch = block.match(/\*\*Title:\*\*\s*(.+)/);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();
    const iconMatch = block.match(/\*\*Icon:\*\*\s*(.+)/);
    const icon = iconMatch ? iconMatch[1].trim() : "check";
    const rest = block.slice(titleMatch.index + titleMatch[0].length).trim();
    const afterIcon = iconMatch
      ? rest.slice(rest.indexOf(iconMatch[0]) + iconMatch[0].length).trim()
      : rest;
    const description = afterIcon.split("\n\n")[0].trim();
    benefits.push({ title, description, icon });
  }
  return benefits;
}

function parseFaq(markdown) {
  const items = [];
  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ") && !line.startsWith("## Feature")) {
      const question = line.slice(3).trim();
      i++;
      const answerLines = [];
      while (i < lines.length && !lines[i].startsWith("## ")) {
        if (lines[i].trim()) answerLines.push(lines[i].trim());
        i++;
      }
      if (question && answerLines.length) {
        items.push({ question, answer: answerLines.join(" ") });
      }
      continue;
    }
    i++;
  }
  return items;
}

function getSection(app, id) {
  return (app.landingPage?.sections ?? []).find((s) => s.id === id);
}

function formatPrice(pricing) {
  if (!pricing?.amount) return "";
  const symbol = pricing.currency === "USD" ? "$" : `${pricing.currency} `;
  return `${symbol}${pricing.amount}`;
}

function formatBuyNowCta(cta, price) {
  const base = cta?.buyNowText ?? "Buy Now on the App Store";
  if (!price) return base;
  if (base.includes("{price}")) {
    return base.replace(/\{price\}/g, price);
  }
  if (cta?.buyNowIncludePrice) {
    if (/\bfor\b/i.test(base)) return base;
    return `${base} for ${price}`;
  }
  return base;
}

function pricingHeadlineLabel(app, pricingSection) {
  return (
    app.commerce?.pricing?.headlineLabel ??
    pricingSection?.inline?.headlineLabel ??
    "Get for"
  );
}

function mapAccentColor(app) {
  const accentName = app.branding?.theme?.accentName;
  if (accentName) return accentName.toLowerCase();
  const hex = app.branding?.theme?.accentColor;
  if (!hex) return "violet";
  return ACCENT_HEX_TO_NAME[hex.toLowerCase()] ?? "violet";
}

function mapLandingStyle(app) {
  const landingStyle = app.branding?.theme?.landingStyle;
  if (landingStyle) return landingStyle;
  return app.branding?.theme?.mode === "dark" ? "midnight" : "liquid-glass";
}

function mapBadgeText(app) {
  if (app.identity?.badgeText) return app.identity.badgeText;
  return app.identity?.platform === "ios"
    ? "Coming soon to the App Store"
    : "Coming soon";
}

function mapTargetAudience(app) {
  return (
    app.audience?.landingPhrase ??
    app.audience?.primary ??
    ""
  );
}

function resolveMockupUrl(app) {
  const deployment = app.deployment ?? {};
  return (
    deployment.mockup?.url ??
    deployment.mockupUrl ??
    app.mockup?.previewUrl ??
    ""
  );
}

function mapTracking(app) {
  const deployment = app.deployment ?? {};
  const landing = deployment.landing ?? {};
  return {
    webhookUrl: app.tracking?.webhookUrl ?? "",
    buyNowWebhookUrl: app.tracking?.webhooks?.buyNowClicked ?? "",
    emailWebhookUrl: app.tracking?.webhooks?.emailCaptured ?? "",
    experimentId: app.analytics?.experimentId ?? "",
    experimentRunId: app.analytics?.experimentRunId ?? "",
    projectId: app.analytics?.projectId ?? "",
    landingVariantId: app.analytics?.landingVariantId ?? "",
    mockupVersionId: app.analytics?.mockupVersionId ?? "",
    landingVersion: landing.lastDeployedAt ?? deployment.lastDeployedAt ?? "",
    deploymentId:
      landing.vercelProjectId ??
      landing.deploymentUrl ??
      deployment.vercelProjectId ??
      deployment.vercelDeploymentUrl ??
      "",
    campaignName: app.ads?.campaignName ?? "",
  };
}

function resolveAssetsRepo(app) {
  const source = app.source ?? {};
  return {
    repo: source.assetsGithubRepo ?? source.mockupGithubRepo ?? "",
    branch: source.assetsBranch ?? source.mockupBranch ?? "main",
    root: (source.assetsRootDirectory ?? "").replace(/^\/+|\/+$/g, ""),
  };
}

/**
 * Build a raw.githubusercontent.com URL for a githubPath asset.
 * WF2 may instead use the GitHub Contents API; this helper is for transforms/docs.
 */
function resolveGithubAssetUrl(app, githubPath) {
  const { repo, branch, root } = resolveAssetsRepo(app);
  if (!repo || !githubPath) return "";
  const cleanedRepo = String(repo)
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/\/$/, "");
  const joined = [root, githubPath.replace(/^\/+/, "")]
    .filter(Boolean)
    .join("/");
  return `https://raw.githubusercontent.com/${cleanedRepo}/${branch}/${joined}`;
}

function assetLocator(asset) {
  if (!asset) return null;
  if (asset.url) return { kind: "url", value: asset.url };
  if (asset.githubPath) return { kind: "githubPath", value: asset.githubPath };
  if (asset.path) return { kind: "path", value: asset.path };
  return null;
}

function screenshotBasename(locatorValue) {
  return path.basename(locatorValue || "screenshot.png");
}

function resolveLocalPath(packageDir, relativePath) {
  if (!packageDir || !relativePath) return "";
  return path.join(packageDir, relativePath);
}

function resolvePublicImageRef(app, asset, packageDir, defaultPublicName) {
  const loc = assetLocator(asset);
  if (!loc) {
    return { image: "", sourcePath: "", missing: true, localSrc: "" };
  }

  if (loc.kind === "url") {
    return {
      image: loc.value,
      sourcePath: loc.value,
      missing: false,
      localSrc: "",
    };
  }

  if (loc.kind === "githubPath") {
    const url = resolveGithubAssetUrl(app, loc.value);
    return {
      image: defaultPublicName
        ? `/app-data/images/${defaultPublicName}`
        : `/app-data/images/${screenshotBasename(loc.value)}`,
      sourcePath: loc.value,
      missing: !url,
      localSrc: "",
      fetchUrl: url,
      publicName:
        defaultPublicName || screenshotBasename(loc.value),
    };
  }

  // path — local-dev
  const localSrc = resolveLocalPath(packageDir, loc.value);
  const exists = Boolean(localSrc && fs.existsSync(localSrc));
  const publicName =
    defaultPublicName || screenshotBasename(loc.value);
  return {
    image: exists ? `/app-data/images/${publicName}` : "",
    sourcePath: loc.value,
    missing: !exists,
    localSrc: exists ? localSrc : "",
    publicName,
  };
}

function copyPackageImages(app, packageDir, imagesDir) {
  fs.mkdirSync(imagesDir, { recursive: true });
  let copied = 0;

  const copyOne = (asset, defaultName) => {
    const resolved = resolvePublicImageRef(app, asset, packageDir, defaultName);
    if (resolved.localSrc && resolved.publicName) {
      fs.copyFileSync(
        resolved.localSrc,
        path.join(imagesDir, resolved.publicName)
      );
      copied++;
    }
  };

  for (const shot of app.media?.screenshots ?? []) {
    copyOne(shot, screenshotBasename(assetLocator(shot)?.value));
  }
  copyOne(app.media?.logo, "logo.png");
  copyOne(app.media?.ogImage, "og-image.png");
  copyOne(app.media?.icon, "icon.png");

  return copied;
}

function resolveHero(app, packageDir) {
  const heroSection = getSection(app, "hero");
  if (heroSection?.source === "inline" && heroSection.inline) {
    return {
      headline: heroSection.inline.headline ?? "",
      subheadline: heroSection.inline.subheadline ?? "",
      body: heroSection.inline.body ?? "",
    };
  }

  if (packageDir) {
    const filePath =
      heroSection?.source === "file" && heroSection.file
        ? path.join(packageDir, heroSection.file)
        : path.join(packageDir, "copy", "hero.md");
    const md = readText(filePath);
    if (md) return parseHeroSection(md);
  }

  return { headline: "", subheadline: "", body: "" };
}

function resolveBenefits(app, packageDir) {
  const inline = app.landingPage?.content?.benefits;
  if (Array.isArray(inline) && inline.length) {
    return inline.map((b) => ({
      title: b.title ?? "",
      description: b.description ?? "",
      icon: b.icon ?? "check",
    }));
  }
  if (packageDir) {
    const md = readText(path.join(packageDir, "copy", "benefits.md"));
    if (md) return parseBenefits(md);
  }
  return [];
}

function resolveFeatures(app, packageDir) {
  const inline = app.landingPage?.content?.features;
  if (Array.isArray(inline) && inline.length) {
    return inline.map((f) => ({
      title: f.title ?? "",
      description: f.description ?? "",
    }));
  }
  if (packageDir) {
    const featuresSection = getSection(app, "features");
    const filePath =
      featuresSection?.source === "file" && featuresSection.file
        ? path.join(packageDir, featuresSection.file)
        : path.join(packageDir, "copy", "features.md");
    const md = readText(filePath);
    if (md) return parseFeatures(md);
  }
  return [];
}

function resolveFaq(app, packageDir) {
  const inline = app.landingPage?.content?.faq;
  if (Array.isArray(inline) && inline.length) {
    return inline.map((item) => ({
      question: item.question ?? "",
      answer: item.answer ?? "",
    }));
  }
  if (packageDir) {
    const faqSection = getSection(app, "faq");
    const filePath =
      faqSection?.source === "file" && faqSection.file
        ? path.join(packageDir, faqSection.file)
        : path.join(packageDir, "copy", "faq.md");
    const md = readText(filePath);
    if (md) return parseFaq(md);
  }
  return [];
}

function resolveTestimonials(app) {
  const inline = app.landingPage?.content?.testimonials;
  if (!Array.isArray(inline) || !inline.length) return [];
  return inline.map((t) => ({
    quote: t.quote ?? "",
    author: t.name ?? t.author ?? "",
    role: t.role ?? "",
  }));
}

function mapSeo(app, packageDir, heroSubheadline) {
  const seo = app.landingPage?.seo ?? {};
  const og = resolvePublicImageRef(
    app,
    app.media?.ogImage,
    packageDir,
    "og-image.png"
  );

  return {
    title: seo.title ?? "",
    description: seo.description ?? "",
    keywords: seo.keywords ?? [],
    ogImageUrl: og.missing ? "" : og.image.startsWith("http")
      ? og.image
      : og.image || "",
  };
}

function mapFooter(app) {
  const footerSection = getSection(app, "footer");
  return {
    text: footerSection?.inline?.body ?? "",
  };
}

function generateAppConfig(app, options = {}) {
  const packageDir = options.packageDir ?? null;

  const hero = resolveHero(app, packageDir);
  const pricingSection = getSection(app, "pricing");
  const ctaSection = getSection(app, "cta");
  const faqSection = getSection(app, "faq");
  const socialSection = getSection(app, "socialProof");

  const mockupUrl = resolveMockupUrl(app);
  const features = resolveFeatures(app, packageDir);
  const benefits = resolveBenefits(app, packageDir);
  const faqItems = resolveFaq(app, packageDir);
  const testimonials = resolveTestimonials(app);

  const heroSubheadline =
    hero.subheadline || app.identity?.description?.slice(0, 120) || "";

  const screenshots = (app.media?.screenshots ?? []).map((shot) => {
    const resolved = resolvePublicImageRef(app, shot, packageDir);
    return {
      title: shot.title ?? "",
      description: shot.description ?? "",
      image: resolved.image,
      sourcePath: resolved.sourcePath,
      missing: resolved.missing,
    };
  });

  const logoResolved = resolvePublicImageRef(
    app,
    app.media?.logo,
    packageDir,
    "logo.png"
  );
  const iconResolved = resolvePublicImageRef(
    app,
    app.media?.icon,
    packageDir,
    "icon.png"
  );

  return {
    appId: app.appId,
    appName: app.identity?.appName ?? app.appId,
    tagline: app.identity?.tagline ?? "",
    heroHeadline: hero.headline || app.identity?.tagline || "",
    heroSubheadline,
    heroBody: hero.body ?? "",
    badgeText: mapBadgeText(app),
    primaryCtaText: app.commerce?.cta?.primaryText ?? "Buy Now",
    secondaryCtaText: app.commerce?.cta?.secondaryText ?? "Learn More",
    theme: {
      style: mapLandingStyle(app),
      accentColor: mapAccentColor(app),
      mode: app.branding?.theme?.mode ?? "light",
      fontFamily: app.branding?.theme?.fontFamily ?? "",
    },
    logo: {
      text: (app.identity?.appName ?? "A").charAt(0),
      imageUrl: logoResolved.missing ? "" : logoResolved.image,
    },
    icon: {
      imageUrl: iconResolved.missing ? "" : iconResolved.image,
    },
    mockup: {
      embedUrl: mockupUrl,
      baseWidth: app.mockup?.baseWidth ?? 375,
      baseHeight: app.mockup?.baseHeight ?? 820,
      useOuterDeviceFrame: app.mockup?.useOuterDeviceFrame ?? false,
      clipBottomPx: app.mockup?.clipBottomPx ?? 0,
    },
    problem: app.audience?.painPoints?.[0] ?? "",
    solution: app.identity?.description ?? "",
    targetAudience: mapTargetAudience(app),
    benefits,
    features: features.length ? features : [],
    screenshots,
    howItWorks: { enabled: false, steps: [] },
    pricing: {
      enabled: pricingSection?.enabled !== false,
      headlineLabel: pricingHeadlineLabel(app, pricingSection),
      price: formatPrice(app.commerce?.pricing),
      billingLabel: app.commerce?.pricing?.period?.replace("ly", "") ?? "month",
      ctaText: formatBuyNowCta(
        app.commerce?.cta,
        formatPrice(app.commerce?.pricing)
      ),
      finePrint:
        pricingSection?.inline?.subheadline ??
        `${formatPrice(app.commerce?.pricing)}/${app.commerce?.pricing?.period ?? "month"}`,
    },
    emailCapture: {
      enabled: ctaSection?.enabled !== false,
      headline: ctaSection?.inline?.headline ?? "Want launch updates?",
      subheadline: ctaSection?.inline?.subheadline ?? "Get launch updates.",
      placeholder:
        ctaSection?.inline?.placeholder ??
        app.commerce?.cta?.emailPlaceholder ??
        "Enter your email",
      buttonText: app.commerce?.cta?.waitlistText ?? "Keep Me Updated",
    },
    faq: {
      enabled: faqSection?.enabled !== false,
      items: faqItems,
    },
    testimonials: {
      enabled: socialSection?.enabled === true && testimonials.length > 0,
      headline: socialSection?.inline?.headline ?? "",
      items: testimonials,
    },
    seo: mapSeo(app, packageDir, heroSubheadline),
    footer: mapFooter(app),
    tracking: mapTracking(app),
  };
}

function parseArgs(argv) {
  const args = { packageArg: null, appJsonPath: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--app-json" && argv[i + 1]) {
      args.appJsonPath = argv[++i];
    } else if (!argv[i].startsWith("-") && !args.packageArg) {
      args.packageArg = argv[i];
    }
  }
  return args;
}

function main() {
  const { packageArg, appJsonPath } = parseArgs(process.argv.slice(2));

  let packageDir = null;
  let resolvedAppJson = null;

  if (appJsonPath) {
    resolvedAppJson = path.resolve(process.cwd(), appJsonPath);
  } else if (packageArg) {
    packageDir = path.resolve(process.cwd(), packageArg);
    resolvedAppJson = path.join(packageDir, "app.json");
  } else {
    console.error(
      "Usage: node scripts/generate-app-config.js <path-to-app-package>\n" +
        "   or: node scripts/generate-app-config.js --app-json <path-to-app.json>"
    );
    process.exit(1);
  }

  if (!fs.existsSync(resolvedAppJson)) {
    console.error(`app.json not found: ${resolvedAppJson}`);
    process.exit(1);
  }

  const app = readJson(resolvedAppJson);
  const config = generateAppConfig(app, { packageDir });

  const outPath = path.join(process.cwd(), "app-data", "app-config.json");
  fs.writeFileSync(outPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`Wrote ${outPath}`);

  if (packageDir) {
    const imagesDir = path.join(process.cwd(), "app-data", "images");
    const copied = copyPackageImages(app, packageDir, imagesDir);
    if (copied > 0) {
      console.log(`Copied ${copied} image(s) to app-data/images/`);
    } else {
      console.log(
        "No local image files found in package (config paths still set; githubPath/url may apply)."
      );
    }
  }
}

module.exports = {
  generateAppConfig,
  resolveGithubAssetUrl,
  resolveAssetsRepo,
  parseHeroSection,
  parseBenefits,
  parseFeatures,
  parseFaq,
};

if (require.main === module) {
  main();
}
