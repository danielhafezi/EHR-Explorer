import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Activity, HeartPulse, Github } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EHR Explorer",
  description: "Patient Medication Analysis Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="ehr-explorer-theme">
          <div className="min-h-screen flex flex-col">
            <header className="bg-white text-gray-800 border-b border-border sticky top-0 z-10">
              <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary-foreground p-1.5 rounded-full">
                        <HeartPulse className="h-5 w-5 text-primary" />
                      </div>
                      <h1 className="text-2xl font-bold tracking-tight">EHR Explorer</h1>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">Patient Medication Analysis Tool</p>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-grow">{children}</main>
            <footer className="bg-secondary text-secondary-foreground border-t border-border mt-auto">
              <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary rounded-full p-1">
                      <HeartPulse className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <p className="text-sm font-medium">EHR Explorer</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    <p className="text-sm">
                      Developed By{" "}
                      <a 
                        href="https://danielhafezi.github.io/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-primary transition-colors font-medium"
                      >
                        Daniel Hafezi
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
