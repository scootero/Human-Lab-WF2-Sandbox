import rawConfig from "@/app-data/app-config.json";

export interface ThemeConfig {
  style: string;
  accentColor: string;
  mode: string;
  /** CSS font stack from branding.theme.fontFamily; empty = template default */
  fontFamily?: string;
}

export interface LogoConfig {
  text: string;
  imageUrl: string;
}

export interface IconConfig {
  /** Favicon / apple-touch from media.icon */
  imageUrl: string;
}

export interface MockupConfig {
  embedUrl: string;
  baseWidth: number;
  baseHeight: number;
  useOuterDeviceFrame: boolean;
  /** Pixels clipped from the iframe bottom to hide mockup dev/debug chrome */
  clipBottomPx?: number;
}

export interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export interface Feature {
  title: string;
  description: string;
}

export interface Screenshot {
  title: string;
  description: string;
  image: string;
  /** App Package path, e.g. media/screenshots/01-home.png — shown when image is missing */
  sourcePath?: string;
  /** Set by generate-app-config when the PNG is not present in the App Package */
  missing?: boolean;
}

export interface HowItWorksStep {
  title: string;
  description: string;
}

export interface HowItWorksConfig {
  enabled: boolean;
  steps: HowItWorksStep[];
}

export interface PricingConfig {
  enabled: boolean;
  headlineLabel: string;
  price: string;
  billingLabel: string;
  ctaText: string;
  finePrint: string;
}

export interface EmailCaptureConfig {
  enabled: boolean;
  headline: string;
  subheadline: string;
  placeholder: string;
  buttonText: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQConfig {
  enabled: boolean;
  items: FAQItem[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
}

export interface TestimonialsConfig {
  enabled: boolean;
  headline?: string;
  items: TestimonialItem[];
}

export interface TrackingConfig {
  /** Unified n8n webhook for all events; overrides legacy URLs when set. */
  webhookUrl: string;
  buyNowWebhookUrl: string;
  emailWebhookUrl: string;
  experimentId: string;
  experimentRunId: string;
  projectId: string;
  landingVersion: string;
  landingVariantId: string;
  mockupVersionId: string;
  deploymentId: string;
  campaignName: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImageUrl: string;
}

export interface FooterConfig {
  text: string;
}

export interface AppConfig {
  appId: string;
  appName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroBody: string;
  badgeText: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  theme: ThemeConfig;
  logo: LogoConfig;
  icon?: IconConfig;
  mockup: MockupConfig;
  problem: string;
  solution: string;
  targetAudience: string;
  benefits: Benefit[];
  features: Feature[];
  screenshots: Screenshot[];
  howItWorks: HowItWorksConfig;
  pricing: PricingConfig;
  emailCapture: EmailCaptureConfig;
  faq: FAQConfig;
  testimonials: TestimonialsConfig;
  seo: SeoConfig;
  footer: FooterConfig;
  tracking: TrackingConfig;
}

const defaults: AppConfig = {
  appId: "app",
  appName: "App",
  tagline: "",
  heroHeadline: "",
  heroSubheadline: "",
  heroBody: "",
  badgeText: "",
  primaryCtaText: "Buy Now",
  secondaryCtaText: "Learn More",
  theme: { style: "liquid-glass", accentColor: "violet", mode: "light", fontFamily: "" },
  logo: { text: "A", imageUrl: "" },
  icon: { imageUrl: "" },
  mockup: {
    embedUrl: "",
    baseWidth: 375,
    baseHeight: 820,
    useOuterDeviceFrame: false,
    clipBottomPx: 0,
  },
  problem: "",
  solution: "",
  targetAudience: "",
  benefits: [],
  features: [],
  screenshots: [],
  howItWorks: { enabled: false, steps: [] },
  pricing: {
    enabled: false,
    headlineLabel: "Get for",
    price: "",
    billingLabel: "",
    ctaText: "Buy Now on the App Store",
    finePrint: "",
  },
  emailCapture: {
    enabled: false,
    headline: "",
    subheadline: "",
    placeholder: "Enter your email",
    buttonText: "Keep Me Updated",
  },
  faq: { enabled: false, items: [] },
  testimonials: { enabled: false, items: [] },
  seo: { title: "", description: "", keywords: [], ogImageUrl: "" },
  footer: { text: "" },
  tracking: {
    webhookUrl: "",
    buyNowWebhookUrl: "",
    emailWebhookUrl: "",
    experimentId: "",
    experimentRunId: "",
    projectId: "",
    landingVersion: "",
    landingVariantId: "",
    mockupVersionId: "",
    deploymentId: "",
    campaignName: "",
  },
};

function mergeConfig(partial: Partial<AppConfig>): AppConfig {
  return {
    ...defaults,
    ...partial,
    theme: { ...defaults.theme, ...partial.theme },
    logo: { ...defaults.logo, ...partial.logo },
    mockup: { ...defaults.mockup, ...partial.mockup },
    howItWorks: { ...defaults.howItWorks, ...partial.howItWorks },
    pricing: { ...defaults.pricing, ...partial.pricing },
    emailCapture: { ...defaults.emailCapture, ...partial.emailCapture },
    faq: { ...defaults.faq, ...partial.faq },
    testimonials: { ...defaults.testimonials, ...partial.testimonials },
    seo: { ...defaults.seo, ...partial.seo },
    footer: { ...defaults.footer, ...partial.footer },
    tracking: { ...defaults.tracking, ...partial.tracking },
    benefits: partial.benefits ?? defaults.benefits,
    features: partial.features ?? defaults.features,
    screenshots: partial.screenshots ?? defaults.screenshots,
  };
}

export function getAppConfig(): AppConfig {
  return mergeConfig(rawConfig as Partial<AppConfig>);
}

export function getSafeBenefits(config: AppConfig): Benefit[] {
  return (config.benefits ?? []).filter((b) => b?.title);
}

export function getSafeFeatures(config: AppConfig): Feature[] {
  return (config.features ?? []).filter((f) => f?.title);
}

export function getSafeScreenshots(config: AppConfig): Screenshot[] {
  return (config.screenshots ?? []).filter((s) => s?.title).slice(0, 4);
}

export function getSafeFAQItems(config: AppConfig): FAQItem[] {
  return (config.faq?.items ?? []).filter((item) => item?.question);
}

export function getSafeTestimonials(config: AppConfig): TestimonialItem[] {
  return (config.testimonials?.items ?? []).filter((t) => t?.quote);
}

export function getSafeHowItWorksSteps(config: AppConfig): HowItWorksStep[] {
  return (config.howItWorks?.steps ?? []).filter((s) => s?.title);
}

/** Build pricing CTA label from config — supports `{price}` template tokens */
export function getPricingCtaText(pricing: PricingConfig): string {
  const base = pricing.ctaText?.trim() || "Buy Now";
  if (!pricing.price) return base;
  if (base.includes("{price}")) {
    return base.replace(/\{price\}/g, pricing.price);
  }
  return base;
}
