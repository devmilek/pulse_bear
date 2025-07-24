import type { Metadata } from "next";
import { Providers } from "../components/providers";
import { EB_Garamond } from "next/font/google";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const eb_garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "PulseBear - Real-time SaaS Monitoring",
  description:
    "Monitor your SaaS applications in real-time with PulseBear. Get instant alerts, track critical metrics, and never miss an event.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <NuqsAdapter>
        <html lang="en" className={cn(inter.className, eb_garamond.variable)}>
          <body className="min-h-[calc(100vh-1px)] flex flex-col font-sans bg-brand-25 text-brand-950 antialiased">
            <main className="relative flex-1 flex flex-col">
              <Providers>{children}</Providers>
            </main>
          </body>
        </html>
      </NuqsAdapter>
    </ClerkProvider>
  );
}
