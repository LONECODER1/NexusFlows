import { getServerSession } from "@/lib/auth-session";
import { Navigation } from "@/features/landing/components/navigation";
import { Hero } from "@/features/landing/components/hero";
import { Sliders } from "@/features/landing/components/sliders";
import { FeaturesGrid } from "@/features/landing/components/features-grid";
import { Footer } from "@/features/landing/components/footer";

export default async function Page() {
  const session = await getServerSession();
  const isAuthenticated = !!session;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans text-foreground selection:bg-primary/20">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 -left-40 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute top-80 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[150px]" />
      <div className="absolute bottom-0 left-1/3 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />

      <Navigation isAuthenticated={isAuthenticated} />
      <Hero isAuthenticated={isAuthenticated} />
      <Sliders />
      <FeaturesGrid />
      <Footer />

      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "NexusFlows",
            "operatingSystem": "All",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "USD"
            },
            "description": "Open-source workflow automation platform to build, schedule, and automate integrations."
          })
        }}
      />
    </div>
  );
}
