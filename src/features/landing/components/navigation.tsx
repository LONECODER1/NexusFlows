import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

interface NavigationProps {
  isAuthenticated: boolean;
}

export function Navigation({ isAuthenticated }: NavigationProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <Image src="/logos/NexusFlows.png" alt="NexusFlows" width={30} height={30} className="object-contain" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            NexusFlows
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#workflow-demo" className="transition-colors hover:text-foreground">How it Works</a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          {isAuthenticated ? (
            <Link
              href="/workflows"
              className="group inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/10 transition-all duration-200 hover:bg-primary/95 hover:shadow-md active:scale-95"
            >
              Go to Console
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition-all duration-200 hover:bg-foreground/90 active:scale-95"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
