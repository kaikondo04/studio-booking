import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "スタジオ予約",
  description: "軽音学部のスタジオ予約アプリ",
  // PWA用の設定を追加
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 言語を日本語(ja)に変更
    <html lang="ja">
      <head>
        {/* アイコンの設定 */}
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-100 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}