import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Tự Học Typing Web - Luyện Gõ 10 Ngón & Game 3D",
  description:
    "Nền tảng luyện gõ 10 ngón tiếng Việt với 81 bài học, 414 bài tập, game 3D Arcade và bảng xếp hạng Google Sheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#070a13] text-gray-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-300`}>
        {children}
      </body>
    </html>
  );
}
