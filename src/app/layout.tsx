import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "wobuy. — умный поиск товаров", template: "%s | wobuy." },
  description: "wobuy. — ИИ-помощник для поиска, сравнения цен и выбора лучших предложений.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="bg-[#0D0F14]">
      <body className="min-h-screen overflow-x-hidden bg-[#0D0F14] text-slate-100">{children}</body>
    </html>
  );
}
