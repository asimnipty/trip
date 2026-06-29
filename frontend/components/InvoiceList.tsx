import React, { useState } from "react";
import { Invoice } from "../types";
import { calculateInvoiceSales, calculateInvoiceReceived, formatBDT, formatDate } from "../utils/erpUtils";
import { Edit, Trash2, Search, Filter, RefreshCw, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

interface InvoiceListProps {
  invoices: Invoice[];
  agents: string[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: number) => Promise<void>;
  onRefresh: () => void;
  loading: boolean;
}

const INVOICE_TYPES = [
  "All Types",
  "International",
  "Domestic",
  "Visa Application",
  "Hotel Booking",
  "Tour Package",
  "Void Charge",
  "Ticket Reissue",
];

export function InvoiceList({ invoices, agents, onEdit, onDelete, onRefresh, loading }: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("All Agents");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses"); // "All Statuses", "Paid", "Due", "Overpaid"

  // Filter list of invoices based on query matrix
  const filteredInvoices = invoices.filter((inv) => {
    const sTotal = calculateInvoiceSales(inv);
    const rTotal = calculateInvoiceReceived(inv);
    const due = sTotal - rTotal;

    // Search query matches: Invoice No, MR No, Sales Agent name
    const matchesSearch =
      inv.invNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.mrNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.salesRef.toLowerCase().includes(searchQuery.toLowerCase());

    // Agent match
    const matchesAgent = selectedAgent === "All Agents" || inv.salesRef === selectedAgent;

    // Type match
    const matchesType = selectedType === "All Types" || inv.type === selectedType;

    // Status match
    let matchesStatus = true;
    if (selectedStatus === "Paid") {
      matchesStatus = due <= 0;
    } else if (selectedStatus === "Due") {
      matchesStatus = due > 0;
    } else if (selectedStatus === "Overpaid") {
      matchesStatus = due < 0;
    }

    return matchesSearch && matchesAgent && matchesType && matchesStatus;
  });

  const handleDeleteClick = async (id: number, invNo: string) => {
    if (window.confirm(`Are you sure you want to delete invoice record #${id} (Inv No: ${invNo})? This action cannot be undone.`)) {
      await onDelete(id);
    }
  };

  return (
    <div id="invoice-list-root" className="space-y-4">
      
      {/* Search and Advanced Filter Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="search-filter-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice number, MR receipt number, or agent name..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Quick Refresh */}
          <button
            id="refresh-grid-btn"
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Sync ERP</span>
          </button>
        </div>

        {/* Dropdown Multi-filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter by Agent
            </label>
            <select
              id="filter-agent-select"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:border-indigo-500 outline-none transition"
            >
              <option value="All Agents">All Agents</option>
              {agents.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Service Category
            </label>
            <select
              id="filter-type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:border-indigo-500 outline-none transition"
            >
              {INVOICE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Ledger Balance State
            </label>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:border-indigo-500 outline-none transition"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Paid">Fully Paid / Receivable Settled</option>
              <option value="Due">Unpaid / Carrying Active Balance Due</option>
              <option value="Overpaid">Overpaid / Credit Balance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Database Grid Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Scrollable grid wrapper */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs text-slate-600">
            
            {/* Double-layered Table Header */}
            <thead>
              {/* Category Super-headers */}
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                <th colSpan={6} className="px-4 py-2 text-center border-r border-slate-100 bg-slate-50 text-[10px]">
                  General Particulars
                </th>
                <th colSpan={7} className="px-4 py-2 text-center border-r border-slate-100 bg-indigo-50/20 text-indigo-700 text-[10px]">
                  Debit Breakdown (Sales BDT ৳)
                </th>
                <th colSpan={5} className="px-4 py-2 text-center border-r border-slate-100 bg-emerald-50/20 text-emerald-700 text-[10px]">
                  Credit Breakdown (Received BDT ৳)
                </th>
                <th colSpan={3} className="px-4 py-2 text-center bg-amber-50/20 text-amber-700 text-[10px]">
                  Ledger Financial Balances
                </th>
              </tr>
              
              {/* Actual Fields Headers */}
              <tr className="bg-slate-100/75 text-slate-700 border-b border-slate-200 font-semibold align-middle text-[10px] uppercase">
                <th className="px-3 py-3 font-bold text-center">ID</th>
                <th className="px-3 py-3">Inv No</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3 text-center">Qty</th>
                <th className="px-3 py-3">MR No</th>
                <th className="px-3 py-3 border-r border-slate-200">Sales Agent (Ref)</th>

                {/* Sales (Debit) Column Sub-headers */}
                <th className="px-3 py-3 text-right bg-indigo-50/10">Fare</th>
                <th className="px-3 py-3 text-right bg-indigo-50/10">Reissue</th>
                <th className="px-3 py-3 text-right bg-indigo-50/10">Void</th>
                <th className="px-3 py-3 text-right bg-indigo-50/10">Visa</th>
                <th className="px-3 py-3 text-right bg-indigo-50/10">Tour</th>
                <th className="px-3 py-3 text-right bg-indigo-50/10">Hotel</th>
                <th className="px-3 py-3 text-right font-bold text-indigo-700 bg-indigo-100/20 border-r border-slate-200">Total Sales</th>

                {/* Received (Credit) Column Sub-headers */}
                <th className="px-3 py-3 text-right bg-emerald-50/10">Cash</th>
                <th className="px-3 py-3 text-right bg-emerald-50/10">BRAC</th>
                <th className="px-3 py-3 text-right bg-emerald-50/10">Pubali</th>
                <th className="px-3 py-3 text-right bg-emerald-50/10">DBBL</th>
                <th className="px-3 py-3 text-right font-bold text-emerald-700 bg-emerald-100/20 border-r border-slate-200">Total Recv</th>

                {/* Ledger calculations Sub-headers */}
                <th className="px-3 py-3 text-right font-bold text-amber-700 bg-amber-50/10">Due (৳)</th>
                <th className="px-3 py-3 text-center">Date Received</th>
                <th className="px-3 py-3 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body Content */}
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={21} className="px-6 py-12 text-center text-slate-400 bg-slate-50/20">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <HelpCircle className="h-8 w-8 text-slate-300" />
                      <p className="font-medium text-slate-500">No invoice records found</p>
                      <p className="text-[11px] text-slate-400">
                        Try refining your filter settings above or click "Sync ERP" to fetch fresh data.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const sTotal = calculateInvoiceSales(inv);
                  const rTotal = calculateInvoiceReceived(inv);
                  const due = sTotal - rTotal;

                  // Dynamic row highlight helper depending on payment structure
                  let statusBg = "hover:bg-slate-50/40";
                  let statusBadge = null;

                  if (due > 0) {
                    statusBg = "hover:bg-amber-50/10";
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium border border-amber-100">
                        <AlertTriangle className="h-2.5 w-2.5 shrink-0" /> Due
                      </span>
                    );
                  } else if (due === 0) {
                    statusBg = "hover:bg-emerald-50/10";
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium border border-emerald-100">
                        <CheckCircle className="h-2.5 w-2.5 shrink-0" /> Settled
                      </span>
                    );
                  } else if (due < 0) {
                    statusBg = "hover:bg-rose-50/5";
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full font-medium border border-rose-100">
                        Credit
                      </span>
                    );
                  }

                  return (
                    <tr key={inv.id} className={`transition ${statusBg}`}>
                      <td className="px-3 py-2.5 text-center font-semibold text-slate-400 font-mono text-[10px]">{inv.id}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-800 font-mono">{inv.invNo}</td>
                      <td className="px-3 py-2.5 font-medium">
                        <span className="text-slate-600 block">{inv.type}</span>
                        <div className="mt-0.5">{statusBadge}</div>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono">{inv.tickets}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-500">{inv.mrNo || "—"}</td>
                      <td className="px-3 py-2.5 font-medium border-r border-slate-100 max-w-[120px] truncate" title={inv.salesRef}>
                        {inv.salesRef}
                      </td>

                      {/* Sales Ledger Breakdown */}
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{inv.ticket ? formatBDT(inv.ticket) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{inv.ticketReissue ? formatBDT(inv.ticketReissue) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{inv.voidCharge ? formatBDT(inv.voidCharge) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{inv.visaFee ? formatBDT(inv.visaFee) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{inv.tourPackage ? formatBDT(inv.tourPackage) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{inv.hotelBooking ? formatBDT(inv.hotelBooking) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-indigo-700 bg-indigo-50/20 border-r border-slate-100 font-mono">
                        {formatBDT(sTotal)}
                      </td>

                      {/* Cash Breakdown */}
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{inv.cash ? formatBDT(inv.cash) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{inv.bracBank ? formatBDT(inv.bracBank) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{inv.pubaliBank ? formatBDT(inv.pubaliBank) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{inv.dbbl ? formatBDT(inv.dbbl) : "—"}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-emerald-700 bg-emerald-50/20 border-r border-slate-100 font-mono">
                        {formatBDT(rTotal)}
                      </td>

                      {/* Ledger Calculations */}
                      <td className={`px-3 py-2.5 text-right font-bold font-mono bg-slate-50/30 ${due > 0 ? "text-amber-600 font-extrabold" : due < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {formatBDT(due)}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-500 whitespace-nowrap">{formatDate(inv.receivedDate)}</td>
                      
                      {/* Action buttons */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`edit-invoice-btn-${inv.id}`}
                            onClick={() => onEdit(inv)}
                            title="Edit Invoice"
                            className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`delete-invoice-btn-${inv.id}`}
                            onClick={() => handleDeleteClick(inv.id!, inv.invNo)}
                            title="Delete Invoice"
                            className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Summation Footer of current filters */}
            {filteredInvoices.length > 0 && (
              <tfoot className="font-sans font-bold text-[10px] text-slate-700 bg-slate-100 border-t-2 border-slate-300">
                <tr className="align-middle uppercase">
                  <td colSpan={3} className="px-3 py-3 text-center border-r border-slate-200">Filtered Aggregates</td>
                  <td className="px-3 py-3 text-center font-mono border-r border-slate-200">
                    {filteredInvoices.reduce((sum, inv) => sum + Number(inv.tickets || 0), 0)}
                  </td>
                  <td colSpan={2} className="border-r border-slate-200"></td>

                  {/* Sales Footers */}
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(filteredInvoices.reduce((sum, inv) => sum + Number(inv.ticket || 0), 0))}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(filteredInvoices.reduce((sum, inv) => sum + Number(inv.ticketReissue || 0), 0))}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(filteredInvoices.reduce((sum, inv) => sum + Number(inv.voidCharge || 0), 0))}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(filteredInvoices.reduce((sum, inv) => sum + Number(inv.visaFee || 0), 0))}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(filteredInvoices.reduce((sum, inv) => sum + Number(inv.tourPackage || 0), 0))}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(filteredInvoices.reduce((sum, inv) => sum + Number(inv.hotelBooking || 0), 0))}</td>
                  <td className="px-3 py-3 text-right text-indigo-700 bg-indigo-50 border-r border-slate-200 font-mono">
                    {formatBDT(filteredInvoices.reduce((sum, inv) => sum + calculateInvoiceSales(inv), 0))}
                  </td>

                  {/* Payment Footers */}
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(filteredInvoices.reduce((sum, inv) => sum + Number(inv.cash || 0), 0))}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(filteredInvoices.reduce((sum, inv) => sum + Number(inv.bracBank || 0), 0))}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(filteredInvoices.reduce((sum, inv) => sum + Number(inv.pubaliBank || 0), 0))}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(filteredInvoices.reduce((sum, inv) => sum + Number(inv.dbbl || 0), 0))}</td>
                  <td className="px-3 py-3 text-right text-emerald-700 bg-emerald-50 border-r border-slate-200 font-mono">
                    {formatBDT(filteredInvoices.reduce((sum, inv) => sum + calculateInvoiceReceived(inv), 0))}
                  </td>

                  {/* Due balance footer */}
                  <td className="px-3 py-3 text-right text-amber-700 bg-amber-50 font-mono" colSpan={1}>
                    {formatBDT(
                      filteredInvoices.reduce((sum, inv) => sum + (calculateInvoiceSales(inv) - calculateInvoiceReceived(inv)), 0)
                    )}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Record count indicator footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Displaying <strong className="text-slate-700 font-semibold">{filteredInvoices.length}</strong> of{" "}
            <strong className="text-slate-700 font-semibold">{invoices.length}</strong> records
          </span>
          {filteredInvoices.length !== invoices.length && (
            <button
              id="clear-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedAgent("All Agents");
                setSelectedType("All Types");
                setSelectedStatus("All Statuses");
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
            >
              Clear filters
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
