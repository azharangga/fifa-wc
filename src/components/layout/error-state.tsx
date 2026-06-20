"use client";

interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
  title?: string;
  message?: string;
}

export function ErrorState({
  error,
  onRetry = () => window.location.reload(),
  title = "Sync Error",
  message = "Failed to load data",
}: ErrorStateProps) {
  return (
    <div
      className="text-center py-24 max-w-lg mx-auto"
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "20px",
        border: "1px solid var(--border)",
      }}
    >
      <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: 700, letterSpacing: "-0.8px", marginBottom: "8px" }}>
        {title}
      </p>
      <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: "16px" }}>
        {error || message}
      </p>
      <button onClick={onRetry} className="btn-primary">
        Try Again
      </button>
    </div>
  );
}
