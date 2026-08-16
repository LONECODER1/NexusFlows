import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentMonthYear = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <footer className="relative w-full bg-background pt-24 pb-12 overflow-hidden border-t border-border/20">
      {/* Dynamic Background Glow representing the top orange/red header backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-32 w-full max-w-7xl bg-gradient-to-r from-orange-500/10 via-primary/5 to-transparent blur-[80px] opacity-70 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Main Glassmorphic Card Container */}
        <div className="bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/80 p-8 md:p-12 shadow-xl shadow-black/5 hover:border-primary/20 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            
            {/* Left Brand Column (4 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                <Link href="/" className="inline-flex items-center gap-2.5 mb-4 hover:opacity-90 transition-opacity">
                  <Image src="/logos/NexusFlows.png" alt="NexusFlows" width={30} height={30} className="object-contain" />
                  <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                    NexusFlows
                  </span>
                </Link>
                <p className="text-muted-foreground font-medium text-sm mb-6">
                  Automate without limits
                </p>
              </div>

              {/* Social Icons Row */}
              <div className="flex items-center gap-5 text-muted-foreground">
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors duration-200" aria-label="X (formerly Twitter)">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors duration-200" aria-label="GitHub">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors duration-200" aria-label="Discord">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.873-.894.077.077 0 01-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 01.077-.011 13.985 13.985 0 0010.149 0 .075.075 0 01.078.012c.12.097.246.194.372.287a.075.075 0 01-.006.128 11.96 11.96 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03a.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors duration-200" aria-label="LinkedIn">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors duration-200" aria-label="YouTube">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links Columns (8 cols on medium/large) */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              
              {/* Column 1: Company */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Careers</span>
                  <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/65 px-2 py-0.5 text-[9px] font-bold text-foreground">
                    Hiring
                  </span>
                </div>
                <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
                <a href="#merch" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Merch</a>
                <a href="#press" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Press</a>
                <a href="#legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Legal</a>
                <a href="#tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tools</a>
              </div>

              {/* Column 2: Resources */}
              <div className="flex flex-col gap-3 text-sm">
                <a href="#case-studies" className="text-muted-foreground hover:text-foreground transition-colors">Case Studies</a>
                <a href="#ai-report" className="text-muted-foreground hover:text-foreground transition-colors">AI agent report</a>
                <a href="#ai-benchmark" className="text-muted-foreground hover:text-foreground transition-colors">AI benchmark</a>
                <a href="#alternatives" className="text-muted-foreground hover:text-foreground transition-colors">NexusFlows alternatives</a>
                <a href="#events" className="text-muted-foreground hover:text-foreground transition-colors">Events</a>
                <div className="flex items-center gap-2">
                  <a href="#newsletter" className="text-muted-foreground hover:text-foreground transition-colors">In The Loop</a>
                  <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/65 px-2 py-0.5 text-[9px] font-bold text-foreground whitespace-nowrap">
                    {currentMonthYear}
                  </span>
                </div>
              </div>

              {/* Column 3: Ecosystem */}
              <div className="flex flex-col gap-3 text-sm col-span-2 sm:col-span-1">
                <a href="#partners" className="text-muted-foreground hover:text-foreground transition-colors font-semibold text-foreground mb-0.5 block">Partners</a>
                <a href="#affiliate" className="text-muted-foreground hover:text-foreground transition-colors">Affiliate program</a>
                <a href="#expert" className="text-muted-foreground hover:text-foreground transition-colors">Hire an expert</a>
                <a href="#usertests" className="text-muted-foreground hover:text-foreground transition-colors">Join user tests, get a gift</a>
                <a href="#brand" className="text-muted-foreground hover:text-foreground transition-colors">Brand guidelines</a>
                <a href="#sap" className="text-muted-foreground hover:text-foreground transition-colors">NexusFlows on SAP</a>
              </div>

            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/40 mt-12 mb-8" />

          {/* Sub-Footer Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-2">
              <a href="#imprint" className="hover:text-foreground transition-colors">Imprint</a>
              <span>|</span>
              <a href="#security" className="hover:text-foreground transition-colors">Security</a>
              <span>|</span>
              <a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <span>|</span>
              <a href="#vulnerability" className="hover:text-foreground transition-colors">Report a vulnerability</a>
            </div>
            <p className="text-center sm:text-right">
              © {new Date().getFullYear()} NexusFlows | All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
