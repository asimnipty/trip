import React from "react";
import { Invoice } from "../types";
import { calculateInvoiceSales, calculateInvoiceReceived, formatBDT } from "../utils/erpUtils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { PieChart as PieIcon, BarChart2, LineChart as LineIcon } from "lucide-react";

interface AnalyticsProps {
  invoices: Invoice[];
  agents: string[];
}

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6", "#14b8a6"];

export function Analytics({ invoices, agents }: AnalyticsProps) {
  
  // 1. Prepare data for Agent comparison: Sales vs Collections
  const agentChartData = agents.map((agent) => {
    const agentInvs = invoices.filter((inv) => inv.salesRef === agent);
    let totalSales = 0;
    let totalReceived = 0;

    agentInvs.forEach((inv) => {
      totalSales += calculateInvoiceSales(inv);
      totalReceived += calculateInvoiceReceived(inv);
    });

    return {
      name: agent.split(" ")[0] || agent, // Use first name to avoid overcrowding labels
      Sales: totalSales,
      Collected: totalReceived,
      Due: totalSales - totalReceived,
    };
  });

  // 2. Prepare data for Service Categories
  const categoryChartData: { [key: string]: number } = {};
  invoices.forEach((inv) => {
    categoryChartData[inv.type] = (categoryChartData[inv.type] || 0) + calculateInvoiceSales(inv);
  });

  const serviceChartData = Object.entries(categoryChartData).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  // 3. Daily / Date billing trends
  const dateMap: { [key: string]: { sales: number; received: number } } = {};
  invoices.forEach((inv) => {
    const rawDate = inv.receivedDate || "Pending Date";
    // Shorten date label
    let label = "Pending";
    if (rawDate && rawDate !== "Pending Date") {
      try {
        const parts = rawDate.split("-");
        if (parts.length === 3) {
          const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          if (!isNaN(date.getTime())) {
            label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }
        }
      } catch {
        label = rawDate;
      }
    }

    if (!dateMap[label]) {
      dateMap[label] = { sales: 0, received: 0 };
    }
    dateMap[label].sales += calculateInvoiceSales(inv);
    dateMap[label].received += calculateInvoiceReceived(inv);
  });

  const timelineChartData = Object.entries(dateMap).map(([date, data]) => ({
    date,
    Sales: data.sales,
    Received: data.received,
  })).slice(-10); // Display last 10 dates for clean sizing

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-md border border-slate-800 text-[11px] font-sans font-medium">
          <p className="font-bold mb-1 text-slate-300">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.fill }}>
              {entry.name}: {formatBDT(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="analytics-root" className="space-y-6">
      
      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Agent Performance (Bar Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <BarChart2 className="h-4 w-4 text-indigo-600" />
            <h4 className="font-semibold text-slate-800 text-sm">Agent Billings vs. Cash Collections</h4>
          </div>

          <div className="h-64 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" tickLine={false} tickFormatter={(v) => `৳${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category distribution (Pie Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <PieIcon className="h-4 w-4 text-indigo-600" />
            <h4 className="font-semibold text-slate-800 text-sm">Revenue Share by Service Category</h4>
          </div>

          <div className="h-64 w-full text-xs flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 h-full min-w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {serviceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Manual Legend to handle space neatly */}
            <div className="space-y-2 shrink-0 w-full sm:w-44 overflow-y-auto max-h-full pr-1">
              {serviceChartData.slice(0, 5).map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="truncate" title={entry.name}>{entry.name}</span>
                  </div>
                  <span className="font-mono text-slate-500">{formatBDT(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Timeline Trend line */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <LineIcon className="h-4 w-4 text-indigo-600" />
            <h4 className="font-semibold text-slate-800 text-sm">ERP Transaction Timeline Trend</h4>
          </div>

          <div className="h-64 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" tickLine={false} tickFormatter={(v) => `৳${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="Sales" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Received" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
