"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface HeroProps {
  isAuthenticated: boolean;
}

const slideData = [
  {
    role: "IT Ops",
    action: "On-board new employees",
    src: "/features/ITOps.png",
    alt: "IT Ops on-boarding workflow",
  },
  {
    role: "Sec Ops",
    action: "Run live market analysis",
    src: "/features/LiveMarketAnalysis.png",
    alt: "Live market security analysis workflow",
  },
  {
    role: "Dev Ops",
    action: "Convert natural language into API calls",
    src: "/features/devOps.png",
    alt: "Dev Ops API automation workflow",
  },
  {
    role: "Sales",
    action: "Generate customer insights from reviews",
    src: "/features/Sales.png",
    alt: "Sales review parsing workflow",
  },
];

export function Hero({ isAuthenticated }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slideData.length);
    }, 5000);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
    resetTimer();
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-sm">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span>Introducing NexusFlows 1.0</span>
        </div>

        {/* Heading */}
        <h1 className="mt-8 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-none">
          Build, Schedule, and{" "}
          <span className="bg-gradient-to-r from-primary via-indigo-500 to-accent bg-clip-text text-transparent">
            Automate Workflows
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          A developer-friendly workflow automation platform. Drag, drop, and configure robust event-driven orchestrations with zero infrastructure hassle.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              href="/workflows"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/95 hover:shadow-lg active:scale-95"
            >
              Go to Workspace
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/95 hover:shadow-lg active:scale-95"
              >
                Start Automating Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-8 py-3.5 text-base font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground active:scale-95"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Visual Canvas Demo Container (Interactive Slideshow) */}
      <div id="workflow-demo" className="mt-16 md:mt-24 rounded-3xl border border-border/60 bg-card p-4 md:p-6 shadow-2xl shadow-primary/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column Tabs (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-4">
            {slideData.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={index}
                  onClick={() => handleTabClick(index)}
                  className={`group relative w-full flex flex-col items-start text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-muted/50 border-border/80 shadow-inner"
                      : "bg-transparent border-transparent hover:bg-muted/20"
                  }`}
                >
                  {/* Active Indicator Bar on Left */}
                  {isActive && (
                    <span className="absolute left-0 top-[20%] bottom-[20%] w-1.5 rounded-r-md bg-orange-500" />
                  )}
                  
                  <span className={`text-sm font-semibold tracking-wide transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}>
                    {slide.role} <span className="text-muted-foreground/60 font-medium">can</span>
                  </span>
                  
                  <span className={`mt-1.5 text-base leading-snug transition-colors ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground/80 group-hover:text-foreground"
                  }`}>
                    {slide.action}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column Slideshow Screen (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex-1 rounded-2xl border border-border/50 bg-background/40 p-4 md:p-5 flex flex-col shadow-inner">
              {/* Window Header controls */}
              <div className="flex items-center justify-between pb-4 border-b border-border/20 mb-4">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <span className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-xs font-mono text-muted-foreground/80 flex items-center gap-1.5 bg-muted/40 px-3 py-1 rounded-full border border-border/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                  {slideData[activeIndex].role.toLowerCase()}_automation.png
                </div>
              </div>

              {/* Main Image container with smooth transitions */}
              <div className="relative flex-1 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/40 bg-muted/10">
                {slideData.map((slide, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 1024px) 100vw, 800px"
                        className="object-cover object-left-top"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
