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
