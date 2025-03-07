import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
              <h1 className="text-2xl font-bold">EHR Explorer</h1>
              <p className="text-white text-sm">Patient Medication Analysis Tool</p>
            </div>
          </header>
          <main className="container mx-auto py-6 px-4">{children}</main>
          <footer className="bg-gray-800 text-white p-4 mt-8">
            <div className="container mx-auto text-center text-sm">
              <p className="text-white">EHR Explorer - Developed By DanielHafezi</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
