import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BenefitGrid from "@/components/BenefitGrid";
import ProblemSolution from "@/components/ProblemSolution";
import FeatureSection from "@/components/FeatureSection";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import EmailCapture from "@/components/EmailCapture";
import FAQSection from "@/components/FAQSection";
import TestimonialSection from "@/components/TestimonialSection";
import Footer from "@/components/Footer";
import {
  getAppConfig,
  getSafeBenefits,
  getSafeFeatures,
  getSafeScreenshots,
  getSafeFAQItems,
  getSafeTestimonials,
  getSafeHowItWorksSteps,
} from "@/lib/appData";

export default function HomePage() {
  const config = getAppConfig();
  const benefits = getSafeBenefits(config);
  const features = getSafeFeatures(config);
  const screenshots = getSafeScreenshots(config);
  const faqItems = getSafeFAQItems(config);
  const testimonials = getSafeTestimonials(config);
  const howItWorksSteps = getSafeHowItWorksSteps(config);

  return (
    <>
      <Header config={config} />
      <main>
        <Hero config={config} />
        <BenefitGrid benefits={benefits} />
        <ProblemSolution
          problem={config.problem}
          solution={config.solution}
          targetAudience={config.targetAudience}
        />
        <FeatureSection features={features} />
        <ScreenshotGallery screenshots={screenshots} />
        {config.howItWorks?.enabled && (
          <HowItWorks steps={howItWorksSteps} />
        )}
        <PricingSection
          pricing={config.pricing}
          benefits={benefits}
          features={features}
        />
        <EmailCapture config={config.emailCapture} />
        {config.faq?.enabled && <FAQSection items={faqItems} />}
        {config.testimonials?.enabled && (
          <TestimonialSection
            items={testimonials}
            headline={config.testimonials.headline}
          />
        )}
      </main>
      <Footer config={config} />
    </>
  );
}
