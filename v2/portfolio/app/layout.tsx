import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/sidebar";
import { sidebarItems } from "./data/sidebarItems";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mukesh Mahara",
  description: "Developed using NEXT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="snowflakes" aria-hidden="true">
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❄</div>
        </div>

        {children}
        
      </body>
    </html>
  );
}
