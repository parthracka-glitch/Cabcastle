import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSkeleton() {
  return (
    <div className="h-screen w-screen bg-[#F6F5FA] p-2 sm:p-3 md:p-4 font-body text-[#212121] relative overflow-hidden flex flex-col justify-center">
      <div className="max-w-[1600px] w-full mx-auto bg-[#F6F5FA] rounded-[1.5rem] sm:rounded-[2rem] shadow-xl border border-[#DFDCE8] h-full max-h-[97vh] flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar Skeleton */}
        <aside className="w-full lg:w-64 bg-[#FFFFFF] border-r border-[#DFDCE8] p-5 sm:p-6 flex flex-col justify-start shrink-0">
          <div className="flex items-center justify-center mb-8 px-2">
            <Skeleton className="h-10 w-36 bg-[#DFDCE8] rounded-xl" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 bg-[#DFDCE8] rounded" />
              <Skeleton className="h-9 w-full bg-[#DFDCE8] rounded-full" />
              <Skeleton className="h-9 w-full bg-[#DFDCE8] rounded-full" />
              <Skeleton className="h-9 w-full bg-[#DFDCE8] rounded-full" />
              <Skeleton className="h-9 w-full bg-[#DFDCE8] rounded-full" />
            </div>

            <div className="space-y-2 pt-4">
              <Skeleton className="h-3 w-24 bg-[#DFDCE8] rounded" />
              <Skeleton className="h-9 w-full bg-[#DFDCE8] rounded-full" />
              <Skeleton className="h-9 w-full bg-[#DFDCE8] rounded-full" />
            </div>
          </div>

          <div className="pt-6 mt-auto border-t border-[#DFDCE8]">
            <div className="flex items-center gap-3 p-3 bg-[#F6F5FA] rounded-2xl border border-[#DFDCE8]">
              <Skeleton className="w-9 h-9 rounded-full bg-[#DFDCE8] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-24 bg-[#DFDCE8] rounded" />
                <Skeleton className="h-2.5 w-32 bg-[#DFDCE8] rounded" />
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Workspace Skeleton */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F6F5FA]">
          {/* Header Bar */}
          <header className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between gap-4 border-b border-[#DFDCE8] bg-[#F6F5FA]">
            <Skeleton className="h-4 w-44 bg-[#DFDCE8] rounded" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full bg-[#DFDCE8]" />
              <Skeleton className="w-9 h-9 rounded-full bg-[#DFDCE8]" />
            </div>
          </header>

          {/* Main Dashboard Skeleton Grid */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Welcome Banner Skeleton */}
            <div className="bg-[#F6F5FA] border border-[#DFDCE8] rounded-[1.8rem] sm:rounded-[2.2rem] p-6 flex items-center justify-between gap-4">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-64 bg-[#DFDCE8] rounded-xl" />
                <Skeleton className="h-4 w-full max-w-lg bg-[#DFDCE8] rounded" />
                <div className="flex items-center gap-3 pt-2">
                  <Skeleton className="h-9 w-28 bg-[#DFDCE8] rounded-full" />
                  <Skeleton className="h-9 w-32 bg-[#DFDCE8] rounded-full" />
                </div>
              </div>
              <Skeleton className="h-36 w-36 rounded-2xl bg-[#DFDCE8] shrink-0 hidden sm:block" />
            </div>

            {/* KPI Cards Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-[#DFDCE8] rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-24 bg-[#DFDCE8] rounded" />
                    <Skeleton className="w-7 h-7 rounded-full bg-[#DFDCE8]" />
                  </div>
                  <Skeleton className="h-8 w-28 bg-[#DFDCE8] rounded-lg" />
                </div>
              ))}
            </div>

            {/* Chart Skeleton Block */}
            <div className="bg-white border border-[#DFDCE8] rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-52 bg-[#DFDCE8] rounded" />
                <Skeleton className="h-8 w-28 bg-[#DFDCE8] rounded-full" />
              </div>
              <Skeleton className="h-56 w-full bg-[#F6F5FA] rounded-2xl" />
            </div>

            {/* Lead Tracker Table Skeleton */}
            <div className="bg-white border border-[#DFDCE8] rounded-[2rem] p-6 space-y-4">
              <Skeleton className="h-5 w-60 bg-[#DFDCE8] rounded" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b border-[#DFDCE8]">
                    <Skeleton className="h-4 w-32 bg-[#DFDCE8] rounded" />
                    <Skeleton className="h-4 w-24 bg-[#DFDCE8] rounded" />
                    <Skeleton className="h-4 w-28 bg-[#DFDCE8] rounded" />
                    <Skeleton className="h-6 w-20 bg-[#DFDCE8] rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
