import type { Metadata } from "next";
import { Providers } from "../components/providers";
import { EB_Garamond } from "next/font/google";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/client";

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
    <NuqsAdapter>
      <html lang="en" className={cn(inter.className, eb_garamond.variable)}>
        <body className="min-h-[calc(100vh-1px)] flex flex-col font-sans bg-background text-foreground antialiased">
          <main className="relative flex-1 flex flex-col">
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </main>
        </body>
      </html>
    </NuqsAdapter>
  );
}
