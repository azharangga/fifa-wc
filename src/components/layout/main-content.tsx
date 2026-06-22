"use client";

import { usePathname } from "next/navigation";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main
      className={`flex-1 w-full pb-20 md:pb-0 transition-all duration-300 ${
        isHome ? "pt-[56px]" : "pt-[80px] sm:pt-[96px]"
      }`}
    >
      {children}
    </main>
  );
}
