import type { Metadata } from "next";
import { Space_Mono, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Deckbox — flashcards, shared",
  description: "Publish, discover, and study flashcard decks made by other students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} ${inter.variable} font-body`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 pb-24">{children}</main>
      </body>
    </html>
  );
}
