"use client";

import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, ChartCard, MetricCard, PageHeader, PrimaryButton, SecondaryButton } from "@/components/shell";
import { reportsKpis, routePerformance, fuelTrend, tripCompletion } from "@/lib/mock-data";

const pieColors = ["#146CFA", "#00AEEF", "#cbd5e1"];

export default function ReportsPage() {
  const exportPdf = () => {
    window.print();
  };

  return (
    <AppShell title="Reports & Analytics" subtitle="Performance, fuel, and route efficiency insights.">
      <PageHeader title="Reporting & Analytics" subtitle="Operational performance dashboard" action={<div className="flex gap-3"><SecondaryButton>Monthly Report</SecondaryButton><PrimaryButton onClick={exportPdf}><Download className="mr-2 h-4 w-4" /> Export PDF</PrimaryButton></div>} />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportsKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
            <div className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">{kpi.label}</div>
            <div className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">{kpi.value}</div>
            <div className="mt-1 text-sm text-[var(--text-muted)]">{kpi.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Route Performance" subtitle="Service quality by corridor">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routePerformance}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#146CFA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Fuel Consumption Trend" subtitle="Monthly fuel usage trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelTrend}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#00AEEF" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Vehicle Utilization" subtitle="Current fleet use ratio">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={routePerformance.slice(0, 3)} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={4} startAngle={90} endAngle={-270}>
                  {routePerformance.slice(0, 3).map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Trip Completion" subtitle="Completed versus delayed or cancelled trips">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripCompletion} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#146CFA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6 report-sheet rounded-2xl border border-[var(--border)] bg-white p-6 text-slate-900 shadow-[var(--shadow-soft)] no-print">
        <div className="mb-5 flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Depot report</div>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Colombo Depot Operations Summary</h3>
            <div className="mt-2 text-sm text-slate-500">Date range: 01 Aug 2026 - 31 Oct 2026</div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>Generated</div>
            <div className="font-medium text-slate-800">02 Oct 2026</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {reportsKpis.map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{kpi.label}</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{kpi.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border border-slate-200 text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 font-medium">Route</th>
                <th className="px-3 py-2 font-medium">Trips</th>
                <th className="px-3 py-2 font-medium">On Time</th>
                <th className="px-3 py-2 font-medium">Fuel (L)</th>
              </tr>
            </thead>
            <tbody>
              {routePerformance.map((route) => (
                <tr key={route.name} className="border-t border-slate-200 text-slate-800">
                  <td className="px-3 py-2">{route.name}</td>
                  <td className="px-3 py-2">{route.value}</td>
                  <td className="px-3 py-2">{Math.max(75, route.value - 4)}%</td>
                  <td className="px-3 py-2">{route.value * 22} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-500">
          <span>Prepared by SRMSS Depot Analytics</span>
          <span>Confidential operational snapshot</span>
        </div>
      </div>
    </AppShell>
  );
}
