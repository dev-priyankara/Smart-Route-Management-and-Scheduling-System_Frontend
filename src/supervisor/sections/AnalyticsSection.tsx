"use client";

import { Download } from "lucide-react";
import { PageHeader, PrimaryButton, SectionCard } from "@/components/shell";

interface RoutePerf { name: string; value: number; }
interface StatusItem { name: string; value: number; color: string; }

interface Props {
  routePerformanceData: RoutePerf[];
  fleetStatusData: StatusItem[];
  tripStatusData: StatusItem[];
  driverStatusData: StatusItem[];
  showToast: (msg: string) => void;
}

export function AnalyticsSection({ routePerformanceData, fleetStatusData, tripStatusData, driverStatusData, showToast }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        subtitle="Operational performance metrics and visual analytics"
        action={
          <PrimaryButton onClick={() => showToast("Report generation initiated")}>
            <Download className="mr-1.5 h-4 w-4" /> Export Report
          </PrimaryButton>
        }
      />

      <SectionCard title="Route Performance" subtitle="On-time performance by corridor">
        <div className="space-y-3">
          {routePerformanceData.map((route) => (
            <div key={route.name} className="flex items-center gap-4">
              <div className="w-44 text-sm font-medium text-[var(--text-primary)]">{route.name}</div>
              <div className="flex-1">
                <div className="h-5 w-full overflow-hidden rounded-full bg-[var(--soft)] border border-[var(--border)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all" style={{ width: `${route.value}%` }} />
                </div>
              </div>
              <div className="w-12 text-right font-bold text-[var(--text-primary)]">{route.value}%</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Fleet Status", data: fleetStatusData },
          { title: "Trip Status", data: tripStatusData },
          { title: "Driver Status", data: driverStatusData },
        ].map(({ title, data }) => (
          <SectionCard key={title} title={title}>
            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm text-[var(--text-secondary)]">{item.name}</span>
                  <span className="font-bold text-[var(--text-primary)]">{item.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
