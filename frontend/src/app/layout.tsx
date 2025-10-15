import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import Navigation from "../components/Navigation.js";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Observability Platform",
  description: "Real-time monitoring and security analysis for agentic AI systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <ThemeProvider>
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
