"use client";

import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  py?: string;
}

export function LoadingState({ message = "Loading data...", py = "py-24" }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${py} gap-4`}>
      <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--foreground)" }} />
      <p style={{ color: "var(--muted-foreground)", fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px" }}>
        {message}
      </p>
    </div>
  );
}
