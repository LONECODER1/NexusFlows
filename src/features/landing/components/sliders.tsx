import Image from "next/image";

const row1Logos = [
  { src: "/logos/anthropic.svg", name: "Anthropic" },
  { src: "/logos/discord.svg", name: "Discord" },
  { src: "/logos/gemini.svg", name: "Gemini" },
  { src: "/logos/github.svg", name: "GitHub" },
  { src: "/logos/google.svg", name: "Google" },
  { src: "/logos/googleform.svg", name: "Google Forms" },
  { src: "/logos/groq.svg", name: "Groq" },
  { src: "/logos/openai.svg", name: "OpenAI" },
  { src: "/logos/resend.svg", name: "Resend" },
  { src: "/logos/slack.svg", name: "Slack" },
  { src: "/logos/stripe.svg", name: "Stripe" },
  { src: "/logos/telegram.svg", name: "Telegram" },
];

const row2Logos = [
  { src: "/logos/telegram.svg", name: "Telegram" },
  { src: "/logos/stripe.svg", name: "Stripe" },
  { src: "/logos/slack.svg", name: "Slack" },
  { src: "/logos/resend.svg", name: "Resend" },
  { src: "/logos/openai.svg", name: "OpenAI" },
  { src: "/logos/groq.svg", name: "Groq" },
  { src: "/logos/googleform.svg", name: "Google Forms" },
  { src: "/logos/google.svg", name: "Google" },
  { src: "/logos/github.svg", name: "GitHub" },
  { src: "/logos/gemini.svg", name: "Gemini" },
  { src: "/logos/discord.svg", name: "Discord" },
  { src: "/logos/anthropic.svg", name: "Anthropic" },
];

export function Sliders() {
  // Triple the items to ensure the marquee track is long enough and overflows seamlessly
  const row1Items = [...row1Logos, ...row1Logos, ...row1Logos];
  const row2Items = [...row2Logos, ...row2Logos, ...row2Logos];

  return (
    <section className="relative w-full overflow-hidden bg-background py-20 border-t border-border/40">
      {/* Background radial gradient to frame the sliders */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 text-center mb-16">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
          Plug AI into your own data &<br className="hidden sm:inline" /> over 500 integrations
        </h2>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Use pre-built nodes for common apps. Custom API connections for everything else.
        </p>
      </div>

      {/* Sliders Container with side fades */}
      <div className="relative w-full overflow-hidden flex flex-col gap-2 py-2 select-none">
        {/* Left & Right gradient overlays for smooth fading effect at edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Row 1: Sliding Left */}
        <div className="flex w-max gap-6 py-4 overflow-visible animate-slide-left hover:[animation-play-state:paused] transition-all duration-300">
          {row1Items.map((logo, idx) => (
            <div
              key={`row1-${idx}`}
              className="flex h-20 w-20 md:h-24 md:w-24 shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 hover:bg-muted/50 hover:scale-110 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group cursor-pointer overflow-visible"
            >
              <div className="relative h-10 w-10 md:h-12 md:w-12 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  fill
                  className="object-contain filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Sliding Right */}
        <div className="flex w-max gap-6 py-4 overflow-visible animate-slide-right hover:[animation-play-state:paused] transition-all duration-300">
          {row2Items.map((logo, idx) => (
            <div
              key={`row2-${idx}`}
              className="flex h-20 w-20 md:h-24 md:w-24 shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 hover:bg-muted/50 hover:scale-110 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group cursor-pointer overflow-visible"
            >
              <div className="relative h-10 w-10 md:h-12 md:w-12 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  fill
                  className="object-contain filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
