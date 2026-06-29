import React from "react";
import { Invoice } from "../types";
import { computeERPStats, formatBDT, calculateInvoiceSales, calculateInvoiceReceived } from "../utils/erpUtils";
import { TrendingUp, CreditCard, AlertCircle, BookmarkCheck, BarChart2, ShieldAlert } from "lucide-react";

interface DashboardProps {
  invoices: Invoice[];
  agents: string[];
}

export function Dashboard({ invoices, agents }: DashboardProps) {
  const stats = computeERPStats(invoices);

  // 1. Group Sales & Receipts by Agent
  const agentMetrics = agents.map((agent) => {
    const agentInvs = invoices.filter((inv) => inv.salesRef === agent);
    let sales = 0;
    let received = 0;
    let tickets = 0;

    agentInvs.forEach((inv) => {
      sales += calculateInvoiceSales(inv);
      received += calculateInvoiceReceived(inv);
      tickets += Number(inv.tickets || 0);
    });

    return {
      name: agent,
      sales,
      received,
      due: sales - received,
      tickets,
    };
  }).sort((a, b) => b.sales - a.sales);

  // 2. Group Sales by Service Category (Type)
  const categoryMap: { [key: string]: number } = {};
  invoices.forEach((inv) => {
    const s = calculateInvoiceSales(inv);
    categoryMap[inv.type] = (categoryMap[inv.type] || 0) + s;
  });

  const categoryMetrics = Object.entries(categoryMap)
    .map(([type, sales]) => ({ type, sales }))
    .sort((a, b) => b.sales - a.sales);

  // 3. Financial Channels / Gateways Distribution
  let totalCash = 0;
  let totalBrac = 0;
  let totalPubali = 0;
  let totalDbbl = 0;

  invoices.forEach((inv) => {
    totalCash += Number(inv.cash || 0);
    totalBrac += Number(inv.bracBank || 0);
    totalPubali += Number(inv.pubaliBank || 0);
    totalDbbl += Number(inv.dbbl || 0);
  });

  const channels = [
    { name: "Cash Drawer", amount: totalCash, color: "bg-amber-500", text: "text-amber-600" },
    { name: "BRAC Bank Account", amount: totalBrac, color: "bg-blue-600", text: "text-blue-600" },
    { name: "Pubali Bank Account", amount: totalPubali, color: "bg-teal-600", text: "text-teal-600" },
    { name: "DBBL Account", amount: totalDbbl, color: "bg-purple-600", text: "text-purple-600" },
  ].sort((a, b) => b.amount - a.amount);

  return (
    <div id="dashboard-root" className="space-y-6">
      
      {/* 4-Column Executive KPI Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Gross Sales Ledger</span>
            <span className="text-xl font-bold text-slate-800 font-mono block">{formatBDT(stats.totalSales)}</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3 shrink-0" /> Total Debited Billings
            </span>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2: Total Received */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Cash Collected</span>
            <span className="text-xl font-bold text-slate-800 font-mono block">{formatBDT(stats.totalReceived)}</span>
            <span className="text-[10px] text-slate-500 block">
              Collection efficiency: <strong className="text-emerald-600 font-bold">{stats.collectionRate.toFixed(1)}%</strong>
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3: Total Due */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Accounts Receivable</span>
            <span className={`text-xl font-bold font-mono block ${stats.totalDue > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {formatBDT(stats.totalDue)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Outstanding client balance
            </span>
          </div>
          <div className={`p-3 rounded-lg ${stats.totalDue > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 4: Tickets Issued */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pax/Tickets Issued</span>
            <span className="text-xl font-bold text-slate-800 font-mono block">{stats.totalTickets} Pax</span>
            <span className="text-[10px] text-slate-500 block">
              Across {invoices.length} transactions
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
            <BookmarkCheck className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Grid of details: Agents and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Agent Performance & Due Track */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-indigo-600" />
              <span>Sales Reference Agent Performance Matrix</span>
            </h4>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">Ranked by Sales</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2">Agent Name</th>
                  <th className="py-2 text-center">Tickets</th>
                  <th className="py-2 text-right">Debit (Sales)</th>
                  <th className="py-2 text-right">Credit (Collected)</th>
                  <th className="py-2 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {agentMetrics.map((am) => (
                  <tr key={am.name} className="hover:bg-slate-50/40">
                    <td className="py-3 font-semibold text-slate-700">{am.name}</td>
                    <td className="py-3 text-center font-mono text-slate-500">{am.tickets} Pax</td>
                    <td className="py-3 text-right font-mono font-medium text-indigo-600">{formatBDT(am.sales)}</td>
                    <td className="py-3 text-right font-mono text-emerald-600">{formatBDT(am.received)}</td>
                    <td className={`py-3 text-right font-mono font-bold ${am.due > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {formatBDT(am.due)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Financial channels and Categories stack */}
        <div className="space-y-6">
          
          {/* Channel allocation card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4">
            <h4 className="font-semibold text-slate-800 text-sm border-b border-slate-50 pb-3">
              Account Fund Distribution
            </h4>
            <div className="space-y-3.5">
              {channels.map((chan) => {
                const percent = stats.totalReceived > 0 ? (chan.amount / stats.totalReceived) * 100 : 0;
                return (
                  <div key={chan.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{chan.name}</span>
                      <span className="font-mono text-slate-500">{formatBDT(chan.amount)} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${chan.color} rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service breakdown card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4">
            <h4 className="font-semibold text-slate-800 text-sm border-b border-slate-50 pb-3">
              Sales by Service Category
            </h4>
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {categoryMetrics.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No categories registered yet.</p>
              ) : (
                categoryMetrics.map((cm) => {
                  const percent = stats.totalSales > 0 ? (cm.sales / stats.totalSales) * 100 : 0;
                  return (
                    <div key={cm.type} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{cm.type}</span>
                        <span className="font-mono text-slate-500">{formatBDT(cm.sales)} ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
