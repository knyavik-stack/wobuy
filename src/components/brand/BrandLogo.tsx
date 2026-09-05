import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function BrandLogo({ href = "/", size = "md", className = "" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const dotSizeClasses = {
    sm: "h-1.5 w-1.5 mb-0.5",
    md: "h-2 w-2 mb-1",
    lg: "h-2.5 w-2.5 mb-1.5",
    xl: "h-3 w-3 mb-1.5",
  };

  const content = (
    <span
      className={`inline-flex items-baseline font-black tracking-tight text-white transition hover:opacity-90 ${sizeClasses[size]} ${className}`}
    >
      <span>wobuy</span>
      <span
        aria-hidden="true"
        className={`ml-0.5 inline-block shrink-0 rounded-full bg-[#00FF87] shadow-[0_0_10px_#00FF87] ${dotSizeClasses[size]}`}
      />
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
