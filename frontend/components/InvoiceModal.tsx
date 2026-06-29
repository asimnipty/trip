import React, { useState, useEffect } from "react";
import { Invoice } from "../types";
import { calculateInvoiceSales, calculateInvoiceReceived, formatBDT } from "../utils/erpUtils";
import { X, Calculator, CircleCheck, Info } from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => Promise<void>;
  agents: string[];
  editingInvoice: Invoice | null;
}

const INVOICE_TYPES = [
  "International",
  "Domestic",
  "Visa Application",
  "Hotel Booking",
  "Tour Package",
  "Void Charge",
  "Ticket Reissue",
];

export function InvoiceModal({ isOpen, onClose, onSave, agents, editingInvoice }: InvoiceModalProps) {
  const [formData, setFormData] = useState<Invoice>({
    invNo: "",
    type: "International",
    tickets: 1,
    mrNo: "",
    salesRef: agents[0] || "",
    ticket: 0,
    ticketReissue: 0,
    voidCharge: 0,
    visaFee: 0,
    tourPackage: 0,
    hotelBooking: 0,
    cash: 0,
    bracBank: 0,
    pubaliBank: 0,
    dbbl: 0,
    receivedDate: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        ...editingInvoice,
        // Ensure values are properly mapped as numbers/strings
        ticket: Number(editingInvoice.ticket || 0),
        ticketReissue: Number(editingInvoice.ticketReissue || 0),
        voidCharge: Number(editingInvoice.voidCharge || 0),
        visaFee: Number(editingInvoice.visaFee || 0),
        tourPackage: Number(editingInvoice.tourPackage || 0),
        hotelBooking: Number(editingInvoice.hotelBooking || 0),
        cash: Number(editingInvoice.cash || 0),
        bracBank: Number(editingInvoice.bracBank || 0),
        pubaliBank: Number(editingInvoice.pubaliBank || 0),
        dbbl: Number(editingInvoice.dbbl || 0),
      });
    } else {
      setFormData({
        invNo: "",
        type: "International",
        tickets: 1,
        mrNo: "",
        salesRef: agents[0] || "",
        ticket: 0,
        ticketReissue: 0,
        voidCharge: 0,
        visaFee: 0,
        tourPackage: 0,
        hotelBooking: 0,
        cash: 0,
        bracBank: 0,
        pubaliBank: 0,
        dbbl: 0,
        receivedDate: "",
      });
    }
    setError(null);
  }, [editingInvoice, isOpen, agents]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Math.max(0, Number(value)) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const currentSalesTotal = calculateInvoiceSales(formData);
  const currentReceivedTotal = calculateInvoiceReceived(formData);
  const currentDue = currentSalesTotal - currentReceivedTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invNo.trim()) {
      setError("Invoice Number is required");
      return;
    }
    if (!formData.salesRef) {
      setError("Please select a sales agent");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to persist record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="invoice-modal-backdrop" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div id="invoice-modal-container" className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-lg">
              {editingInvoice ? `Edit Invoice #${editingInvoice.id} / Inv: ${editingInvoice.invNo}` : "Create New ERP Invoice Record"}
            </h3>
          </div>
          <button id="close-modal-btn" onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm flex gap-2 rounded-r-md">
              <Info className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Core Identifiers */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Core Identifiers</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Invoice Number *</label>
                <input
                  id="field-invNo"
                  type="text"
                  name="invNo"
                  required
                  value={formData.invNo}
                  onChange={handleChange}
                  placeholder="e.g., 345"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Invoice Type</label>
                <select
                  id="field-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                >
                  {INVOICE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Sales Agent (Ref) *</label>
                <select
                  id="field-salesRef"
                  name="salesRef"
                  value={formData.salesRef}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                >
                  <option value="" disabled>Select Agent</option>
                  {agents.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ticket Quantity</label>
                <input
                  id="field-tickets"
                  type="number"
                  name="tickets"
                  min="0"
                  value={formData.tickets}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Money Receipt (MR) No.</label>
                <input
                  id="field-mrNo"
                  type="text"
                  name="mrNo"
                  value={formData.mrNo}
                  onChange={handleChange}
                  placeholder="e.g., 112"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Received Date</label>
                <input
                  id="field-receivedDate"
                  type="date"
                  name="receivedDate"
                  value={formData.receivedDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Sales breakdown and Payments Breakdown Side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sales Columns */}
            <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50 space-y-3">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>Sales Ledger (Debit)</span>
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ticket Fare (৳)</label>
                <input
                  id="field-ticket"
                  type="number"
                  name="ticket"
                  value={formData.ticket}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ticket Reissue (৳)</label>
                <input
                  id="field-ticketReissue"
                  type="number"
                  name="ticketReissue"
                  value={formData.ticketReissue}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Void Charge (৳)</label>
                <input
                  id="field-voidCharge"
                  type="number"
                  name="voidCharge"
                  value={formData.voidCharge}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Visa Fee (৳)</label>
                <input
                  id="field-visaFee"
                  type="number"
                  name="visaFee"
                  value={formData.visaFee}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tour Package (৳)</label>
                <input
                  id="field-tourPackage"
                  type="number"
                  name="tourPackage"
                  value={formData.tourPackage}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hotel Booking (৳)</label>
                <input
                  id="field-hotelBooking"
                  type="number"
                  name="hotelBooking"
                  value={formData.hotelBooking}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition"
                />
              </div>
            </div>

            {/* Payment / Cash Received Columns */}
            <div className="bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/30 space-y-3">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>Receipt Ledger (Credit)</span>
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Cash Payment (৳)</label>
                <input
                  id="field-cash"
                  type="number"
                  name="cash"
                  value={formData.cash}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">BRAC Bank Transfer (৳)</label>
                <input
                  id="field-bracBank"
                  type="number"
                  name="bracBank"
                  value={formData.bracBank}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pubali Bank Transfer (৳)</label>
                <input
                  id="field-pubaliBank"
                  type="number"
                  name="pubaliBank"
                  value={formData.pubaliBank}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">DBBL Transfer (৳)</label>
                <input
                  id="field-dbbl"
                  type="number"
                  name="dbbl"
                  value={formData.dbbl}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition"
                />
              </div>
            </div>

          </div>

          {/* Section 3: Dynamic Real-time Calculations Panel */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Real-time Calculation Summary</span>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                <p className="text-slate-600 font-medium">Total Debited Sales: <span className="text-indigo-600 font-bold">{formatBDT(currentSalesTotal)}</span></p>
                <p className="text-slate-600 font-medium">Total Credited Payments: <span className="text-emerald-600 font-bold">{formatBDT(currentReceivedTotal)}</span></p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Balance Due / Receivable</span>
              <span className={`text-lg font-bold ${currentDue > 0 ? "text-amber-600" : currentDue < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {formatBDT(currentDue)}
              </span>
            </div>
          </div>
        </form>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            id="cancel-modal-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg transition"
          >
            Cancel
          </button>
          <button
            id="save-invoice-btn"
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-xs transition"
          >
            {saving ? "Saving..." : (
              <>
                <CircleCheck className="h-4 w-4" />
                <span>Save Invoice Record</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
