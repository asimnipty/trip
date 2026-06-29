export interface Invoice {
  id?: number;
  invNo: string;
  type: string;
  tickets: number;
  mrNo: string;
  salesRef: string;
  ticketReissue: number;
  voidCharge: number;
  visaFee: number;
  tourPackage: number;
  hotelBooking: number;
  ticket: number;
  receivedDate: string;
  cash: number;
  bracBank: number;
  pubaliBank: number;
  dbbl: number;
  
  // Calculated properties computed dynamically
  totalSales?: number;
  totalReceived?: number;
  dueAmount?: number;
}

export interface ConfigInfo {
  status: "connected" | "fallback";
  configured: boolean;
  database: string;
  fallbackNotice?: string;
}

export interface ERPResponse {
  invoices: Invoice[];
  agents: string[];
  nextId: number;
  isFallback: boolean;
}

export type ActiveTab = "dashboard" | "invoices" | "analytics";
