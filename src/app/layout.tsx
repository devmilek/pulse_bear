import type { Metadata } from "next";
import { EB_Garamond, Geist } from "next/font/google";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals-default.css";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/client";
import { TurborepoAccessTraceResult } from "next/dist/build/turborepo-access-trace";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const eb_garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "PulseBear - Real-time SaaS Monitoring",
  description:
    "Monitor your SaaS applications in real-time with PulseBear. Get instant alerts, track critical metrics, and never miss an event.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <html
        lang="en"
        className={cn(geist.className, eb_garamond.variable)}
        suppressHydrationWarning
      >
        <body className="min-h-[calc(100vh-1px)] flex flex-col antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="relative flex-1 flex flex-col">
              <TRPCReactProvider>{children}</TRPCReactProvider>
              <Toaster />
            </main>
          </ThemeProvider>
        </body>
      </html>
    </NuqsAdapter>
  );
}
