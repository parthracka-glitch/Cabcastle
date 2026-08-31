/* Brex Design System */
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerSkeleton() {
  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] flex flex-col justify-between font-body">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#DFDCE8] py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Skeleton className="h-9 w-32 bg-[#F6F5FA] rounded-full" />
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-4 w-16 bg-[#F6F5FA] rounded-full" />
            <Skeleton className="h-4 w-16 bg-[#F6F5FA] rounded-full" />
            <Skeleton className="h-4 w-20 bg-[#F6F5FA] rounded-full" />
            <Skeleton className="h-4 w-16 bg-[#F6F5FA] rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-20 bg-[#F6F5FA] rounded-full" />
            <Skeleton className="h-10 w-24 bg-[#212121]/20 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1 space-y-8">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <Skeleton className="h-5 w-40 bg-[#F6F5FA] rounded-full" />
            <Skeleton className="h-12 w-full max-w-lg bg-[#F6F5FA] rounded-[16px]" />
            <Skeleton className="h-12 w-3/4 bg-[#F6F5FA] rounded-[16px]" />
            <Skeleton className="h-4 w-full max-w-md bg-[#F6F5FA] rounded-full" />

            <div className="flex items-center gap-6 pt-2">
              <Skeleton className="h-11 w-24 bg-[#F6F5FA] rounded-full" />
              <Skeleton className="h-11 w-24 bg-[#F6F5FA] rounded-full" />
              <Skeleton className="h-11 w-24 bg-[#F6F5FA] rounded-full" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <Skeleton className="h-80 w-full bg-white border border-[#DFDCE8] rounded-[24px]" />
          </div>
        </div>

        {/* Fleet Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 pt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-[#DFDCE8] rounded-[24px] overflow-hidden p-5 space-y-3 shadow-sm">
              <Skeleton className="aspect-[16/10] w-full bg-[#F6F5FA] rounded-[16px]" />
              <Skeleton className="h-5 w-2/3 bg-[#F6F5FA] rounded-full" />
              <Skeleton className="h-4 w-1/2 bg-[#F6F5FA] rounded-full" />
              <Skeleton className="h-11 w-full bg-[#F6F5FA] rounded-full" />
            </div>
          ))}
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="bg-[#212121] py-10 px-6 border-t border-[#212121]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Skeleton className="h-8 w-32 bg-white/10 rounded-full" />
          <Skeleton className="h-4 w-48 bg-white/10 rounded-full" />
        </div>
      </footer>
    </div>
  );
}
