"use client";

import { Skeleton } from "@/components/ui/skeleton";

// Global style injection for the high-end diagonal shimmer effect
export function ShimmerStyle() {
  return (
    <style jsx global>{`
      @keyframes shimmerEffect {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      .shimmer-bg {
        background: linear-gradient(
          90deg,
          var(--muted) 25%,
          var(--accent) 50%,
          var(--muted) 75%
        );
        background-size: 200% 100%;
        animation: shimmerEffect 1.8s infinite linear;
      }
      .dark .shimmer-bg {
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.06) 25%,
          rgba(255, 255, 255, 0.18) 50%,
          rgba(255, 255, 255, 0.06) 75%
        );
        background-size: 200% 100%;
        animation: shimmerEffect 1.8s infinite linear;
      }
    `}</style>
  );
}

// 1. Skeleton for MatchCard
export function MatchCardSkeleton() {
  return (
    <div
      className="overflow-hidden flex flex-col h-full rounded-[20px] border border-[var(--border)]"
      style={{ backgroundColor: "var(--card)" }}
    >
      <ShimmerStyle />
      {/* Banner / Stadium Area Mock - Responsive background */}
      <div 
        className="relative aspect-[2/1] w-full flex items-center justify-center"
        style={{ backgroundColor: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}
      >
        
        {/* Top details bar mock */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex justify-between w-full px-2">
          <div className="w-24 h-3 rounded shimmer-bg opacity-50" />
          <div className="w-14 h-4 rounded-md shimmer-bg opacity-40" />
        </div>

        {/* Teams and score placeholder */}
        <div className="relative z-20 flex items-center justify-center gap-4 w-full px-3">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="h-9 w-13 sm:h-10 sm:w-15 rounded-[10px] shimmer-bg opacity-30" />
            <div className="w-14 h-3 rounded shimmer-bg opacity-50" />
          </div>
          <div className="w-10 h-7 rounded shimmer-bg opacity-40" />
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="h-9 w-13 sm:h-10 sm:w-15 rounded-[10px] shimmer-bg opacity-30" />
            <div className="w-14 h-3 rounded shimmer-bg opacity-50" />
          </div>
        </div>
      </div>

      {/* Footer mock */}
      <div className="p-3 flex items-center justify-between mt-auto">
        <div className="w-32 h-4 rounded shimmer-bg opacity-50" />
        <div className="w-16 h-7 rounded-[100px] shimmer-bg" />
      </div>
    </div>
  );
}

// 2. Skeleton for GroupTable
export function GroupTableSkeleton() {
  return (
    <div
      className="flex flex-col justify-between h-full rounded-[20px] border border-[var(--border)] overflow-hidden"
      style={{ backgroundColor: "var(--card)" }}
    >
      <ShimmerStyle />
      {/* Header */}
      <div className="p-3 border-b border-[var(--hairline-soft)] bg-[var(--card-muted)]">
        <div className="w-28 h-5 rounded shimmer-bg" />
      </div>

      {/* Table grid rows */}
      <div className="p-3.5 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--hairline-soft)] last:border-0">
            <div className="flex items-center gap-3 w-1/2">
              <div className="w-5 h-5 rounded-[6px] shimmer-bg opacity-40 flex-shrink-0" />
              <div className="w-5 h-3.5 rounded-[3px] shimmer-bg opacity-30 flex-shrink-0" />
              <div className="w-2/3 h-4 rounded shimmer-bg" />
            </div>
            <div className="flex gap-3 w-1/3 justify-end items-center">
              <div className="w-6 h-4 rounded shimmer-bg opacity-40" />
              <div className="w-6 h-4 rounded shimmer-bg opacity-40" />
              <div className="w-8 h-4 rounded shimmer-bg" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--hairline-soft)] bg-[var(--card-muted)] space-y-2">
        <div className="w-1/2 h-3 rounded shimmer-bg opacity-40" />
        <div className="w-full h-9 rounded-[100px] shimmer-bg pt-2" />
      </div>
    </div>
  );
}

// 3. Skeleton for StatsBanner
export function StatsBannerSkeleton() {
  return (
    <div 
      className="grid gap-4 grid-cols-2 md:grid-cols-4 p-6 rounded-[20px] border border-[var(--border)]"
      style={{ backgroundColor: "var(--card)" }}
    >
      <ShimmerStyle />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2 text-center py-2 border-r border-[var(--border)] last:border-0">
          <div className="w-16 h-4 rounded shimmer-bg mx-auto opacity-50" />
          <div className="w-10 h-7 rounded-md shimmer-bg mx-auto" />
        </div>
      ))}
    </div>
  );
}

// 4. Skeleton for ThirdPlaceRanking
export function ThirdPlaceRankingSkeleton() {
  return (
    <div 
      className="p-5 rounded-[20px] border border-[var(--border)] space-y-4"
      style={{ backgroundColor: "var(--card)" }}
    >
      <ShimmerStyle />
      <div className="w-48 h-5 rounded shimmer-bg mb-2" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--hairline-soft)] last:border-0">
          <div className="flex items-center gap-3 w-1/3">
            <div className="w-5 h-5 rounded shimmer-bg opacity-45" />
            <div className="w-full h-4 rounded shimmer-bg" />
          </div>
          <div className="w-16 h-4 rounded shimmer-bg opacity-30" />
          <div className="w-10 h-4 rounded shimmer-bg" />
        </div>
      ))}
    </div>
  );
}

// 5. Skeleton for StadiumsTable
export function StadiumsTableSkeleton() {
  return (
    <div 
      className="p-5 rounded-[20px] border border-[var(--border)] space-y-4"
      style={{ backgroundColor: "var(--card)" }}
    >
      <ShimmerStyle />
      <div className="flex items-center justify-between border-b pb-3 border-[var(--border)]">
        <div className="w-32 h-4 rounded shimmer-bg" />
        <div className="w-12 h-4 rounded shimmer-bg opacity-50" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--hairline-soft)] last:border-0">
          <div className="w-1/4 h-4 rounded shimmer-bg" />
          <div className="w-1/4 h-4 rounded shimmer-bg opacity-60" />
          <div className="w-16 h-4 rounded shimmer-bg text-right" />
        </div>
      ))}
    </div>
  );
}

// Main fallback loader component (does not display text)
export function LoadingState({ py = "py-12" }: { py?: string }) {
  return (
    <div className={`w-full max-w-6xl mx-auto px-4 ${py} space-y-8 select-none`}>
      <ShimmerStyle />
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// 6. Skeleton for Hero Carousel
export function HeroCarouselSkeleton() {
  return (
    <div
      className="dark relative w-full h-[65vh] sm:h-[75vh] md:h-[calc(100vh-64px)] min-h-[400px] overflow-hidden flex items-center justify-start"
      style={{ backgroundColor: "#090909", borderBottom: "1px solid #262626" }}
    >
      <ShimmerStyle />
      {/* Background underlay gradient mock */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/60 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-transparent z-10 hidden sm:block" />

      {/* Slide Mock content */}
      <div className="max-w-6xl mx-auto w-full px-4 relative z-20 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-24 h-5 rounded-[6px] shimmer-bg opacity-60" />
          <div className="w-20 h-5 rounded-[6px] shimmer-bg opacity-50" />
        </div>
        
        {/* Title Mock */}
        <div className="space-y-3 max-w-3xl">
          <div className="w-3/4 h-12 sm:h-16 rounded-md shimmer-bg opacity-80" />
          <div className="w-1/2 h-12 sm:h-16 rounded-md shimmer-bg opacity-60" />
        </div>

        {/* Description line mock */}
        <div className="space-y-2 max-w-xl">
          <div className="w-full h-4 rounded shimmer-bg opacity-55" />
          <div className="w-5/6 h-4 rounded shimmer-bg opacity-55" />
        </div>

        {/* Button Mock */}
        <div className="pt-3">
          <div className="w-48 h-11 rounded-[100px] shimmer-bg opacity-70" />
        </div>
      </div>
    </div>
  );
}



