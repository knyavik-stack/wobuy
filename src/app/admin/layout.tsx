import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Кабинет Администратора | wobuy.",
  description: "Панель управления настройками, аналитикой и безопасностью платформы wobuy.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-violet-500 selection:text-white">
      {children}
    </div>
  );
}
