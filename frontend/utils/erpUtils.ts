import { Invoice } from "../types";

// Calculate the total sales for a single invoice row
export function calculateInvoiceSales(inv: Invoice): number {
  return (
    Number(inv.ticket || 0) +
    Number(inv.ticketReissue || 0) +
    Number(inv.voidCharge || 0) +
    Number(inv.visaFee || 0) +
    Number(inv.tourPackage || 0) +
    Number(inv.hotelBooking || 0)
  );
}

// Calculate total payments received for a single invoice row
export function calculateInvoiceReceived(inv: Invoice): number {
  return (
    Number(inv.cash || 0) +
    Number(inv.bracBank || 0) +
    Number(inv.pubaliBank || 0) +
    Number(inv.dbbl || 0)
  );
}

// Format number into BDT (Bangladesh Taka ৳) with commas
export function formatBDT(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("BDT", "৳");
}

// Format raw string date (YYYY-MM-DD) into readable display date (e.g., 15 Mar 2026)
export function formatDate(dateStr: string): string {
  if (!dateStr) return "Pending";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

// Calculate aggregate stats for dashboard summaries
export interface ERPStats {
  totalSales: number;
  totalReceived: number;
  totalDue: number;
  totalTickets: number;
  collectionRate: number;
}

export function computeERPStats(invoices: Invoice[]): ERPStats {
  let totalSales = 0;
  let totalReceived = 0;
  let totalTickets = 0;

  invoices.forEach((inv) => {
    totalSales += calculateInvoiceSales(inv);
    totalReceived += calculateInvoiceReceived(inv);
    totalTickets += Number(inv.tickets || 0);
  });

  const totalDue = totalSales - totalReceived;
  const collectionRate = totalSales > 0 ? (totalReceived / totalSales) * 100 : 0;

  return {
    totalSales,
    totalReceived,
    totalDue,
    totalTickets,
    collectionRate,
  };
}

// Escape cell value for CSV formatting
function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Download detailed Invoice Ledger CSV
export function downloadInvoicesCSV(invoices: Invoice[]) {
  const headers = [
    "Invoice No",
    "Category / Type",
    "Pax / Tickets",
    "MR No",
    "Sales Ref (Agent)",
    "Received Date",
    "Ticket (Debit)",
    "Ticket Reissue (Debit)",
    "Void Charge (Debit)",
    "Visa Fee (Debit)",
    "Tour Package (Debit)",
    "Hotel Booking (Debit)",
    "Total Debit (Sales)",
    "Cash (Credit)",
    "BRAC Bank (Credit)",
    "Pubali Bank (Credit)",
    "DBBL (Credit)",
    "Total Credit (Collected)",
    "Balance Due"
  ];

  const rows = invoices.map((inv) => {
    const totalDebit = calculateInvoiceSales(inv);
    const totalCredit = calculateInvoiceReceived(inv);
    const balanceDue = totalDebit - totalCredit;

    return [
      inv.invNo || "",
      inv.type || "",
      inv.tickets || 0,
      inv.mrNo || "",
      inv.salesRef || "Unassigned",
      inv.receivedDate || "Pending",
      inv.ticket || 0,
      inv.ticketReissue || 0,
      inv.voidCharge || 0,
      inv.visaFee || 0,
      inv.tourPackage || 0,
      inv.hotelBooking || 0,
      totalDebit,
      inv.cash || 0,
      inv.bracBank || 0,
      inv.pubaliBank || 0,
      inv.dbbl || 0,
      totalCredit,
      balanceDue
    ];
  });

  const csvContent = [
    headers.map(escapeCSVValue).join(","),
    ...rows.map(row => row.map(escapeCSVValue).join(","))
  ].join("\n");

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Welcare_Trip_Invoice_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download Sales Agent Summary CSV
export function downloadAgentsCSV(invoices: Invoice[], agents: string[]) {
  const headers = [
    "Agent Name",
    "Tickets Issued (Pax)",
    "Total Debit (Sales)",
    "Total Credit (Collected)",
    "Balance Due"
  ];

  const rows = agents.map((agent) => {
    const agentInvoices = invoices.filter(
      (inv) => (inv.salesRef || "").toLowerCase() === agent.toLowerCase()
    );

    let totalTickets = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    agentInvoices.forEach((inv) => {
      totalTickets += Number(inv.tickets || 0);
      totalDebit += calculateInvoiceSales(inv);
      totalCredit += calculateInvoiceReceived(inv);
    });

    const balanceDue = totalDebit - totalCredit;

    return [
      agent,
      totalTickets,
      totalDebit,
      totalCredit,
      balanceDue
    ];
  });

  const csvContent = [
    headers.map(escapeCSVValue).join(","),
    ...rows.map(row => row.map(escapeCSVValue).join(","))
  ].join("\n");

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Welcare_Trip_Agent_Summary_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

