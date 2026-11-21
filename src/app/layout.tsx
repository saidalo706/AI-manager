import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BackgroundPaths } from "@/components/DrawPath";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "AI Task Manager",
  description: "Матрица Эйзенхауэра с ИИ-разбором задач",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans`}>
        <div className="bg-fx" aria-hidden>
          <i /><i /><i /><i />
          <BackgroundPaths />
        </div>
        {children}
      </body>
    </html>
  );
}
