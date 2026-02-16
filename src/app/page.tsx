"use client";

import { MenuStats } from "./_components/dashboard/MenuStats";
import { MenuQR, QuickActions } from "./_components/dashboard/DashboardModules";
import { RecentProducts } from "./_components/dashboard/RecentProducts";
import { SectionHeader } from "@/components/shared/SectionHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-10 md:py-16">
        {/* Header Section */}
        <SectionHeader
          title="Overview"
          description="Welcome back to Menura. Here&apos;s what&apos;s happening."
        />
        {/* Top Metrics Row */}
        <MenuStats />
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RecentProducts />
          <div className="flex flex-col gap-8">
            <MenuQR />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}

