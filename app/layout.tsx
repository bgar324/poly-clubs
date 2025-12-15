import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader"; // We will simplify this next
import { Toaster } from "sonner";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Poly Clubs",
  description: "The unofficial pulse of campus life.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${sans.variable} ${serif.variable} font-sans antialiased bg-[#FAFAF9] text-gray-900 min-h-screen flex flex-col`}
      >
        {/* 1. Dynamic Header (Simplified) */}
        <SiteHeader />

        {/* 2. Main Content */}
        <div className="flex-grow pt-16">{children}</div>

        {/* 3. The Minimalist Footer */}
        <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-auto">
          <div className="max-w-[1600px] mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 font-medium">
              Not affiliated with Cal Poly.
            </p>

            <a
              href="https://www.bentgarcia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-gray-400 hover:text-poly-green transition-colors flex items-center gap-1.5"
            >
              Made by{" "}
              <span className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-poly-green">
                Benjamin Garcia
              </span>
            </a>
          </div>
        </footer>

        {/* Toast Notifications */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
