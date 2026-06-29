import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let dbClient: MongoClient | null = null;
let db: Db | null = null;
let useFallback = false;

// ─────────────────────────────────────────────────────────────────
// SEED DATA FOR BACKUP AND DB INITIALIZATION
// ─────────────────────────────────────────────────────────────────
export interface Invoice {
  id: number;
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
  totalSales?: number;
  totalReceived?: number;
  dueAmount?: number;
}

export const SEED_DATA: Invoice[] = [
  { id:1,  invNo:"328", type:"Domestic",         tickets:1, mrNo:"87",  salesRef:"Ekramul Hossain", ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:10000,  receivedDate:"2026-03-11", cash:0,     bracBank:0,      pubaliBank:0,      dbbl:10000  },
  { id:2,  invNo:"329", type:"International",     tickets:2, mrNo:"",    salesRef:"Farhadul Amin",   ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:317778, receivedDate:"2026-03-30", cash:0,     bracBank:300000, pubaliBank:17778,  dbbl:0      },
  { id:3,  invNo:"330", type:"International",     tickets:2, mrNo:"110", salesRef:"Farhadul Amin",   ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:244838, receivedDate:"2026-03-30", cash:0,     bracBank:0,      pubaliBank:244838, dbbl:0      },
  { id:4,  invNo:"331", type:"International",     tickets:2, mrNo:"96",  salesRef:"Ekramul Hossain", ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:194000, receivedDate:"2026-03-16", cash:0,     bracBank:0,      pubaliBank:194000, dbbl:0      },
  { id:5,  invNo:"332", type:"Hotel Booking",     tickets:2, mrNo:"101", salesRef:"Ekramul Hossain", ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:34500, ticket:0,      receivedDate:"2026-03-11", cash:34500, bracBank:0,      pubaliBank:0,      dbbl:0      },
  { id:6,  invNo:"333", type:"Domestic",          tickets:1, mrNo:"87",  salesRef:"Ekramul Hossain", ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:3000,   receivedDate:"2026-03-11", cash:0,     bracBank:0,      pubaliBank:0,      dbbl:3000   },
  { id:7,  invNo:"334", type:"Void Charge",       tickets:4, mrNo:"111", salesRef:"Farhadul Amin",   ticketReissue:0,   voidCharge:1200, visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:0,      receivedDate:"2026-03-30", cash:0,     bracBank:0,      pubaliBank:1200,   dbbl:0      },
  { id:8,  invNo:"335", type:"Domestic",          tickets:1, mrNo:"90",  salesRef:"Ekramul Hossain", ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:11500,  receivedDate:"2026-03-15", cash:11500, bracBank:0,      pubaliBank:0,      dbbl:0      },
  { id:9,  invNo:"336", type:"International",     tickets:2, mrNo:"",    salesRef:"Ekramul Hossain", ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:148534, receivedDate:"",           cash:0,     bracBank:0,      pubaliBank:0,      dbbl:0      },
  { id:10, invNo:"337", type:"International",     tickets:1, mrNo:"116", salesRef:"Ekramul Hossain", ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:28500,  receivedDate:"2026-03-30", cash:19800, bracBank:0,      pubaliBank:0,      dbbl:0      },
  { id:11, invNo:"338", type:"International",     tickets:1, mrNo:"",    salesRef:"Ekramul Hossain", ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:46300,  receivedDate:"",           cash:0,     bracBank:0,      pubaliBank:0,      dbbl:0      },
  { id:12, invNo:"339", type:"International",     tickets:2, mrNo:"107", salesRef:"Ekramul Hossain", ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:85130,  receivedDate:"2026-03-29", cash:85130, bracBank:0,      pubaliBank:0,      dbbl:0      },
  { id:13, invNo:"25",  type:"Visa Application",  tickets:1, mrNo:"100", salesRef:"Asif Mahbub",     ticketReissue:0,   voidCharge:0,    visaFee:500, tourPackage:0, hotelBooking:0,     ticket:0,      receivedDate:"2026-03-17", cash:0,     bracBank:0,      pubaliBank:0,      dbbl:500    },
  { id:14, invNo:"340", type:"International",     tickets:3, mrNo:"91",  salesRef:"Ekramul Hossain", ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:146400, receivedDate:"2026-03-15", cash:0,     bracBank:0,      pubaliBank:146400, dbbl:0      },
  { id:15, invNo:"341", type:"International",     tickets:1, mrNo:"112", salesRef:"Farhadul Amin",   ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:154787, receivedDate:"2026-03-30", cash:0,     bracBank:0,      pubaliBank:154787, dbbl:0      },
  { id:16, invNo:"342", type:"International",     tickets:2, mrNo:"113", salesRef:"Farhadul Amin",   ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:106618, receivedDate:"",           cash:0,     bracBank:0,      pubaliBank:106618, dbbl:0      },
  { id:17, invNo:"343", type:"International",     tickets:1, mrNo:"86",  salesRef:"Asif Mahbub",     ticketReissue:0,   voidCharge:0,    visaFee:0,   tourPackage:0, hotelBooking:0,     ticket:37032,  receivedDate:"2026-03-09", cash:0,     bracBank:0,      pubaliBank:36800,  dbbl:0      },
];

export const DEFAULT_AGENTS = ["Ekramul Hossain", "Farhadul Amin", "Asif Mahbub"];

// Safe Live Memory backup state
export const inMemoryStore = {
  invoices: [...SEED_DATA],
  agents: [...DEFAULT_AGENTS],
  nextId: 18,
};

export function isUsingFallback(): boolean {
  return useFallback;
}

export async function getDatabase(): Promise<{ isFallback: boolean; dbInvoices: any; dbAgents: any }> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes("USER:PASSWORD") || uri.includes("YOUR_")) {
    if (!useFallback) {
      console.warn("⚠️ MONGODB_URI is empty or unconfigured. Defaulting to safe in-memory data store.");
      useFallback = true;
    }
    return { isFallback: true, dbInvoices: null, dbAgents: null };
  }

  if (db) {
    return { isFallback: false, dbInvoices: db.collection("invoices"), dbAgents: db.collection("agents") };
  }

  try {
    console.log("🔌 Connecting to MongoDB cluster...");
    dbClient = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await dbClient.connect();
    db = dbClient.db("travel_erp");
    console.log("✅ Successfully connected to MongoDB Database: travel_erp");

    const dbInvoices = db.collection("invoices");
    const dbAgents = db.collection("agents");

    // Seed database collections if they are clean and empty
    const invoiceCount = await dbInvoices.countDocuments();
    if (invoiceCount === 0) {
      console.log("🌱 Seeding initial invoices into MongoDB collection...");
      await dbInvoices.insertMany(SEED_DATA);
    }

    const agentCount = await dbAgents.countDocuments();
    if (agentCount === 0) {
      console.log("🌱 Seeding default agents list into MongoDB collection...");
      await dbAgents.insertMany(DEFAULT_AGENTS.map(name => ({ name })));
    }

    useFallback = false;
    return { isFallback: false, dbInvoices, dbAgents };
  } catch (error) {
    console.warn("⚠️ Could not establish connection to MongoDB (using live in-memory fallback):", error instanceof Error ? error.message : error);
    console.info("💡 Switching backup mode: Running on in-memory ERP cache.");
    useFallback = true;
    return { isFallback: true, dbInvoices: null, dbAgents: null };
  }
}
