#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { generateAppConfig, resolveGithubAssetUrl } = require("./generate-app-config");

const LANDING_REPO = "scootero/Human-Lab-WF2-Sandbox";
const LANDING_REPO_URL = "https://github.com/scootero/Human-Lab-WF2-Sandbox";
const LANDING_BRANCH = "main";
const LANDING_PROJECT_NAME = "human-lab-wf2-sandbox";
const LANDING_PROJECT_ID = "prj_9gbSkYZTlRMF3iLVxOIM40OswVMU";
const VERCEL_TEAM_ID = "team_CvzW7iL13TaNbaIiaCHfjafe";
const LANDING_PUBLIC_URL = "https://human-lab-wf2-sandbox.vercel.app";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--") && argv[i + 1] && !argv[i + 1].startsWith("--")) {
      args[arg.slice(2)] = argv[++i];
    }
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function isPublicHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function getSection(app, id) {
  return (app.landingPage?.sections ?? []).find((section) => section.id === id);
}

function addCheck(checks, key, ok, detail, severity = "missing") {
  checks.push({ key, ok: Boolean(ok), severity: ok ? "ok" : severity, detail });
}

function validateRequiredContent(app) {
  const checks = [];
  const hero = getSection(app, "hero")?.inline;
  const pricing = app.commerce?.pricing;
  const cta = app.commerce?.cta;
  const seo = app.landingPage?.seo;
  const testimonials = app.landingPage?.content?.testimonials ?? [];
  const socialProof = getSection(app, "socialProof");

  addCheck(checks, "hero", hero?.headline && hero?.subheadline && hero?.body, "Requires hero headline, subheadline, and body from landingPage.sections[hero].inline.");
  addCheck(checks, "benefits", (app.landingPage?.content?.benefits ?? []).length > 0, "Requires landingPage.content.benefits[].");
  addCheck(checks, "features", (app.landingPage?.content?.features ?? []).length > 0, "Requires landingPage.content.features[].");
  addCheck(checks, "faq", (app.landingPage?.content?.faq ?? []).length > 0, "Requires landingPage.content.faq[].");
  addCheck(checks, "pricing", pricing?.currency && pricing?.amount && pricing?.period, "Requires commerce.pricing currency, amount, and period.");
  addCheck(checks, "cta", cta?.primaryText && cta?.buyNowText && cta?.waitlistText, "Requires commerce.cta primary, buy-now, and waitlist labels.");
  addCheck(
    checks,
    "social proof/testimonials",
    socialProof?.enabled !== true || testimonials.length > 0,
    socialProof?.enabled === true
      ? "Requires landingPage.content.testimonials[] when socialProof is enabled."
      : "Not required because socialProof.enabled is false.",
    "gap"
  );
  addCheck(checks, "seo", seo?.title && seo?.description && (seo?.keywords ?? []).length > 0, "Requires landingPage.seo title, description, and keywords.");
  addCheck(checks, "font family", app.branding?.theme?.fontFamily, "Requires branding.theme.fontFamily.");
  addCheck(checks, "tracking configuration", (app.tracking?.events ?? []).length > 0 && app.analytics?.experimentId, "Requires tracking.events[] and analytics experiment identifiers.");

  return checks;
}

function assetLocator(asset) {
  if (!asset) return null;
  if (asset.url) return { kind: "url", value: asset.url };
  if (asset.githubPath) return { kind: "githubPath", value: asset.githubPath };
  return null;
}

function collectAssets(app) {
  const assets = [];
  assets.push({ key: "logo", required: true, asset: app.media?.logo, publicName: "logo.png" });
  assets.push({ key: "icon/favicon", required: true, asset: app.media?.icon, publicName: "icon.png" });
  assets.push({ key: "og image", required: true, asset: app.media?.ogImage, publicName: "og-image.png" });
  for (const [index, screenshot] of (app.media?.screenshots ?? []).entries()) {
    const loc = assetLocator(screenshot);
    assets.push({
      key: `screenshot ${index + 1}`,
      required: true,
      asset: screenshot,
      publicName: path.basename(loc?.value || `screenshot-${index + 1}.png`),
    });
  }
  return assets;
}

async function download(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function resolveAsset(app, item, imagesDir, localAssetsDir) {
  const loc = assetLocator(item.asset);
  const destPath = path.join(imagesDir, item.publicName);
  const publicPath = `/app-data/images/${item.publicName}`;
  const result = {
    key: item.key,
    required: item.required,
    publicName: item.publicName,
    publicPath,
    locator: loc,
    sourceUrl: "",
    resolved: false,
    error: "",
  };

  if (!loc) {
    result.error = "No media.url or media.githubPath declared.";
    return result;
  }

  if (loc.kind === "githubPath") {
    result.sourceUrl = resolveGithubAssetUrl(app, loc.value);
    const localPath = localAssetsDir ? path.join(localAssetsDir, loc.value) : "";
    if (localPath && fs.existsSync(localPath)) {
      fs.copyFileSync(localPath, destPath);
      result.resolved = true;
      result.resolution = "local sandbox GitHub copy";
      return result;
    }
  } else if (loc.kind === "url") {
    result.sourceUrl = loc.value;
  }

  if (!result.sourceUrl || !isPublicHttpsUrl(result.sourceUrl)) {
    result.error = "Resolved source is not a public HTTPS URL.";
    return result;
  }

  try {
    await download(result.sourceUrl, destPath);
    result.resolved = true;
    result.resolution = "download";
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

function applyAssetResults(config, results) {
  const byKey = Object.fromEntries(results.map((result) => [result.key, result]));
  const logo = byKey.logo;
  const icon = byKey["icon/favicon"];
  const og = byKey["og image"];

  config.logo.imageUrl = logo?.resolved ? logo.publicPath : "";
  config.icon = { imageUrl: icon?.resolved ? icon.publicPath : "" };
  config.seo.ogImageUrl = og?.resolved ? og.publicPath : "";

  config.screenshots = config.screenshots.map((screenshot, index) => {
    const result = byKey[`screenshot ${index + 1}`];
    return {
      ...screenshot,
      image: result?.resolved ? result.publicPath : "",
      missing: !result?.resolved,
    };
  });
}

function writeMarkdownReport(filePath, data) {
  const missingChecks = data.contentChecks.filter((check) => !check.ok);
  const missingAssets = data.assetResults.filter((asset) => !asset.resolved);
  const lines = [
    "# WF2 Sandbox Rehearsal Report",
    "",
    `Generated at: ${data.generatedAt}`,
    `App JSON read: ${data.appJsonPath}`,
    `Landing project: ${data.landingProjectPath}`,
    "",
    "## WF2 Inputs",
    "",
    `- Mockup URL: ${data.mockupUrl}`,
    `- Assets repo fallback: ${data.assetsRepo.repo}`,
    `- Assets branch fallback: ${data.assetsRepo.branch}`,
    "",
    "## Missing Fields Or Content",
    "",
    ...(missingChecks.length
      ? missingChecks.map((check) => `- ${check.key}: ${check.detail}`)
      : ["- None"]),
    "",
    "## Missing Assets",
    "",
    ...(missingAssets.length
      ? missingAssets.map((asset) => `- ${asset.key}: ${asset.locator?.kind ?? "none"} ${asset.locator?.value ?? ""} (${asset.error})`)
      : ["- None"]),
    "",
    "## External Stop Point",
    "",
    "- GitHub repo creation, push, and Vercel project/deployment are prepared only. No external write was performed.",
  ];
  fs.writeFileSync(filePath, lines.join("\n") + "\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const landingProjectPath = process.cwd();
  const sandboxRoot = path.resolve(landingProjectPath, "..");
  const appJsonPath = path.resolve(
    landingProjectPath,
    args["app-json"] || "../drive-fixture/App Validation/human-lab-wf1-sandbox/app.json"
  );
  const localAssetsDir = args["local-assets-dir"]
    ? path.resolve(landingProjectPath, args["local-assets-dir"])
    : path.resolve(landingProjectPath, "../../github/Human-Lab-WF1-Sandbox");
  const logDir = path.join(sandboxRoot, "execution-log");
  const imagesDir = path.join(landingProjectPath, "app-data", "images");
  const publicImagesDir = path.join(landingProjectPath, "public", "app-data", "images");

  const app = readJson(appJsonPath);
  const mockupUrl = app.deployment?.mockup?.url ?? app.mockup?.previewUrl ?? "";
  if (!isPublicHttpsUrl(mockupUrl)) {
    throw new Error(`WF2 requires a valid public WF1 mockup URL. Found: ${mockupUrl || "(empty)"}`);
  }

  cleanDir(imagesDir);
  cleanDir(publicImagesDir);

  const assetResults = [];
  for (const asset of collectAssets(app)) {
    assetResults.push(await resolveAsset(app, asset, imagesDir, localAssetsDir));
  }

  const config = generateAppConfig(app, { packageDir: null });
  applyAssetResults(config, assetResults);
  writeJson(path.join(landingProjectPath, "app-data", "app-config.json"), config);

  const source = app.source ?? {};
  const assetsRepo = {
    repo: source.assetsGithubRepo ?? source.mockupGithubRepo ?? "",
    branch: source.assetsBranch ?? source.mockupBranch ?? "main",
  };
  const contentChecks = validateRequiredContent(app);
  for (const asset of assetResults) {
    contentChecks.push({
      key: asset.key,
      ok: asset.resolved,
      severity: asset.resolved ? "ok" : "missing",
      detail: asset.resolved ? `Resolved to ${asset.publicPath}.` : asset.error,
    });
  }
  contentChecks.push({
    key: "mockup embed",
    ok: true,
    severity: "ok",
    detail: `Resolved from deployment.mockup.url: ${mockupUrl}`,
  });

  const report = {
    generatedAt: new Date().toISOString(),
    appJsonPath,
    landingProjectPath,
    mockupUrl,
    assetsRepo,
    localAssetsDir,
    contentChecks,
    assetResults,
    generatedFiles: [
      "app-data/app-config.json",
      "app-data/images/",
      "../execution-log/wf2-verification-report.md",
      "../execution-log/asset-resolution-report.json",
      "../execution-log/github-repo-plan.json",
      "../execution-log/git-push-plan.json",
      "../execution-log/vercel-project-plan.json",
      "../execution-log/vercel-deploy-request.json",
      "../execution-log/expected-drive-writeback-fields.json",
    ],
  };

  writeJson(path.join(logDir, "asset-resolution-report.json"), report);
  writeJson(path.join(logDir, "github-repo-plan.json"), {
    owner: "scootero",
    repo: "Human-Lab-WF2-Sandbox",
    fullName: LANDING_REPO,
    repoUrl: LANDING_REPO_URL,
    visibility: "private",
    status: "created externally and empty",
    sourceDirectory: path.relative(sandboxRoot, landingProjectPath),
    branch: LANDING_BRANCH,
    externalWritePerformed: false,
  });
  writeJson(path.join(logDir, "git-push-plan.json"), {
    remote: LANDING_REPO_URL,
    sourceDirectory: path.relative(sandboxRoot, landingProjectPath),
    branch: LANDING_BRANCH,
    commands: [
      "cd rehearsals/wf2-human-lab-sandbox/landing-project",
      "git init",
      "git branch -M main",
      "git remote add origin https://github.com/scootero/Human-Lab-WF2-Sandbox.git",
      "git add .",
      "git commit -m \"Create WF2 sandbox landing project\"",
      "git push -u origin main",
    ],
    notes: [
      "Prepared only; do not run until external approval.",
      "Do not include node_modules, .next, .vercel, credentials, or tokens.",
      "Repository root is the landing-project directory itself.",
    ],
    externalWritePerformed: false,
  });
  writeJson(path.join(logDir, "vercel-project-plan.json"), {
    projectName: LANDING_PROJECT_NAME,
    projectId: LANDING_PROJECT_ID,
    teamId: VERCEL_TEAM_ID,
    framework: "nextjs",
    gitRepository: LANDING_REPO,
    productionBranch: LANDING_BRANCH,
    rootDirectory: "",
    rootDirectoryNote: "Use repository root/default. Vercel setting is empty/unset; do not use '..'.",
    buildCommand: "npm run build",
    installCommand: "npm install",
    status: "created externally and linked; no production deployment yet because repository is empty",
    externalWritePerformed: false,
  });
  writeJson(path.join(logDir, "vercel-deploy-request.json"), {
    method: "POST",
    url: `https://api.vercel.com/v13/deployments?teamId=${VERCEL_TEAM_ID}`,
    headersNote: "Authorization: Bearer {VERCEL_API_TOKEN} — from n8n Credentials / env only; never commit token",
    body: {
      name: LANDING_PROJECT_NAME,
      project: LANDING_PROJECT_ID,
      target: "production",
      gitSource: {
        type: "github",
        org: "scootero",
        repo: "Human-Lab-WF2-Sandbox",
        ref: LANDING_BRANCH,
      },
    },
    notes: [
      "Prepared only; do not POST until external approval.",
      "Root Directory is intentionally absent from this body; Vercel project uses repository root/default.",
      "The first production deployment can also be triggered automatically by pushing main to the linked repo.",
      "After READY: write public alias URL to deployment.landing.url and raw deployment URL to deployment.landing.deploymentUrl.",
    ],
    externalWritePerformed: false,
  });
  writeJson(path.join(logDir, "expected-drive-writeback-fields.json"), {
    "deployment.landing.vercelProjectId": LANDING_PROJECT_ID,
    "deployment.landing.url": LANDING_PUBLIC_URL,
    "deployment.landing.deploymentUrl": "{VERCEL_LANDING_DEPLOYMENT_URL}",
    "deployment.landing.lastDeployedAt": "{ISO_DEPLOYMENT_READY_TIMESTAMP}",
    "deployment.githubRepoUrl": LANDING_REPO_URL,
  });
  writeMarkdownReport(path.join(logDir, "wf2-verification-report.md"), report);

  console.log(`Wrote app-data/app-config.json`);
  console.log(`Resolved ${assetResults.filter((asset) => asset.resolved).length}/${assetResults.length} required asset(s)`);
  console.log(`Wrote ${path.join(logDir, "wf2-verification-report.md")}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
