import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "wobuy.",
  description: "wobuy. — умный ИИ-помощник для покупок",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="bg-[#0D0F14] text-slate-100">{children}</body>
    </html>
  );
}
