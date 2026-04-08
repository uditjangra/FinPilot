import React from "react";

export default function Skeleton({ className = "", style }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} style={style} />;
}

export function CardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-40" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, index) => index + 1).map((row) => (
        <div key={row} className="card flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  const bars = [35, 50, 72, 55, 81, 60, 76, 48];

  return (
    <div className="card flex h-[320px] items-end gap-3 p-5">
      {bars.map((height, index) => (
        <Skeleton key={index} className="w-full rounded-lg" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      <ListSkeleton rows={6} />
    </div>
  );
}
