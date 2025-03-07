import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Activity, HeartPulse, Github } from "lucide-react";

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
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-blue-500 text-white p-4 shadow-md">
            <div className="container mx-auto">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-6 w-6" />
                <h1 className="text-2xl font-bold">EHR Explorer</h1>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Activity className="h-4 w-4" />
                <p className="text-white text-sm">Patient Medication Analysis Tool</p>
              </div>
            </div>
          </header>
          <main className="container mx-auto py-6 px-4">{children}</main>
          <footer className="bg-gray-800 text-white p-4 mt-8">
            <div className="container mx-auto text-center text-sm">
              <div className="flex items-center justify-center gap-2">
                <Github className="h-4 w-4" />
                <p className="text-white">EHR Explorer - Developed By DanielHafezi</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
