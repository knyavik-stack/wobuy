import Link from "next/link";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="relative">
      <Link href="/" className="fixed left-6 top-5 z-50 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-80">
        wobuy<span className="text-[#00FF87]">.</span>
      </Link>
      {children}
    </section>
  );
}
