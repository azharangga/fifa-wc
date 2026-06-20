"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "9999px",
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
        }}
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "9999px",
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        color: "var(--foreground)",
        cursor: "pointer",
      }}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" style={{ color: "var(--foreground)" }} />
      ) : (
        <Moon className="h-4 w-4" style={{ color: "var(--foreground)" }} />
      )}
    </button>
  );
}
