import type { Metadata } from "next";
import { Rajdhani, Playfair_Display, Roboto_Mono } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import "./globals.css";

const fontSans = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});


const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Nodebase",
  description: "Create Workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        <TRPCReactProvider>
          <NuqsAdapter>
            {children}
            <Toaster />
          </NuqsAdapter>

        </TRPCReactProvider>
      </body>
    </html>
  );
}
