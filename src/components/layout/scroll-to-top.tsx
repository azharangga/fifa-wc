"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed right-6 z-40 p-3 rounded-full border transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center hover:-translate-y-0.5 ${
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)", // Prevents overlap with mobile nav bar
        backgroundColor: "var(--foreground)",
        borderColor: "var(--foreground)",
        color: "var(--background)",
        boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.15)",
      }}
    >
      <style jsx>{`
        @media (min-width: 768px) {
          button {
            bottom: 24px !important;
          }
        }
      `}</style>
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
