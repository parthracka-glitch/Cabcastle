/* Cab Castle Goa Design System Skeleton */
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerSkeleton() {
  return (
    <div className="min-h-screen bg-[#E7EDEB] text-[#1B2922] flex flex-col justify-between font-body">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#CBD8D4] py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-36 bg-[#CBD8D4]/60 rounded-xl" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-4 w-16 bg-[#CBD8D4]/60 rounded-full" />
            <Skeleton className="h-4 w-16 bg-[#CBD8D4]/60 rounded-full" />
            <Skeleton className="h-4 w-20 bg-[#CBD8D4]/60 rounded-full" />
            <Skeleton className="h-4 w-16 bg-[#CBD8D4]/60 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24 bg-[#CBD8D4]/60 rounded-xl" />
            <Skeleton className="h-10 w-28 bg-[#7C1F31]/20 rounded-xl" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 space-y-8">
        {/* Banner Section */}
        <div className="bg-white rounded-[28px] border border-[#CBD8D4] p-6 sm:p-8 space-y-4 shadow-xs">
          <Skeleton className="h-5 w-44 bg-[#DEEDE4] rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-full max-w-xl bg-[#CBD8D4]/70 rounded-2xl" />
          <Skeleton className="h-4 w-full max-w-md bg-[#CBD8D4]/50 rounded-full" />
          
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Skeleton className="h-11 w-32 bg-[#CBD8D4]/60 rounded-xl" />
            <Skeleton className="h-11 w-36 bg-[#CBD8D4]/60 rounded-xl" />
            <Skeleton className="h-11 w-32 bg-[#CBD8D4]/60 rounded-xl" />
          </div>
        </div>

        {/* Fleet Grid Skeleton: 6 Vehicle Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48 bg-[#CBD8D4]/70 rounded-xl" />
            <Skeleton className="h-6 w-24 bg-[#CBD8D4]/60 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#CBD8D4] rounded-[24px] overflow-hidden p-5 space-y-3.5 shadow-xs"
              >
                <Skeleton className="aspect-[16/10] w-full bg-[#E7EDEB] rounded-2xl border border-[#CBD8D4]/50" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-28 bg-[#CBD8D4]/70 rounded-lg" />
                    <Skeleton className="h-5 w-20 bg-[#DEEDE4] rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full bg-[#CBD8D4]/50 rounded-full" />
                  <Skeleton className="h-3 w-3/4 bg-[#CBD8D4]/50 rounded-full" />
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#CBD8D4]">
                  <Skeleton className="h-8 w-full bg-[#E7EDEB] rounded-lg" />
                  <Skeleton className="h-8 w-full bg-[#E7EDEB] rounded-lg" />
                  <Skeleton className="h-8 w-full bg-[#E7EDEB] rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Skeleton className="h-10 w-full bg-[#E7EDEB] rounded-xl" />
                  <Skeleton className="h-10 w-full bg-[#7C1F31]/20 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="bg-[#24060C] py-10 px-6 border-t border-[#7C1F31]/30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Skeleton className="h-8 w-40 bg-white/10 rounded-xl" />
          <Skeleton className="h-4 w-56 bg-white/10 rounded-full" />
        </div>
      </footer>
    </div>
  );
}
