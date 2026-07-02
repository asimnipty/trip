var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// backend/server.ts
var import_express2 = __toESM(require("express"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);
var import_cors = __toESM(require("cors"), 1);

// backend/routes/api.ts
var import_express = require("express");

// backend/config/db.ts
var import_mongodb = require("mongodb");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config({ quiet: true });
var dbClient = null;
var db = null;
var useFallback = false;
var SEED_DATA = [
  { id: 1, invNo: "328", type: "Domestic", tickets: 1, mrNo: "87", salesRef: "Ekramul Hossain", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 1e4, receivedDate: "2026-03-11", cash: 0, bracBank: 0, pubaliBank: 0, dbbl: 1e4 },
  { id: 2, invNo: "329", type: "International", tickets: 2, mrNo: "", salesRef: "Farhadul Amin", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 317778, receivedDate: "2026-03-30", cash: 0, bracBank: 3e5, pubaliBank: 17778, dbbl: 0 },
  { id: 3, invNo: "330", type: "International", tickets: 2, mrNo: "110", salesRef: "Farhadul Amin", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 244838, receivedDate: "2026-03-30", cash: 0, bracBank: 0, pubaliBank: 244838, dbbl: 0 },
  { id: 4, invNo: "331", type: "International", tickets: 2, mrNo: "96", salesRef: "Ekramul Hossain", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 194e3, receivedDate: "2026-03-16", cash: 0, bracBank: 0, pubaliBank: 194e3, dbbl: 0 },
  { id: 5, invNo: "332", type: "Hotel Booking", tickets: 2, mrNo: "101", salesRef: "Ekramul Hossain", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 34500, ticket: 0, receivedDate: "2026-03-11", cash: 34500, bracBank: 0, pubaliBank: 0, dbbl: 0 },
  { id: 6, invNo: "333", type: "Domestic", tickets: 1, mrNo: "87", salesRef: "Ekramul Hossain", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 3e3, receivedDate: "2026-03-11", cash: 0, bracBank: 0, pubaliBank: 0, dbbl: 3e3 },
  { id: 7, invNo: "334", type: "Void Charge", tickets: 4, mrNo: "111", salesRef: "Farhadul Amin", ticketReissue: 0, voidCharge: 1200, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 0, receivedDate: "2026-03-30", cash: 0, bracBank: 0, pubaliBank: 1200, dbbl: 0 },
  { id: 8, invNo: "335", type: "Domestic", tickets: 1, mrNo: "90", salesRef: "Ekramul Hossain", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 11500, receivedDate: "2026-03-15", cash: 11500, bracBank: 0, pubaliBank: 0, dbbl: 0 },
  { id: 9, invNo: "336", type: "International", tickets: 2, mrNo: "", salesRef: "Ekramul Hossain", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 148534, receivedDate: "", cash: 0, bracBank: 0, pubaliBank: 0, dbbl: 0 },
  { id: 10, invNo: "337", type: "International", tickets: 1, mrNo: "116", salesRef: "Ekramul Hossain", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 28500, receivedDate: "2026-03-30", cash: 19800, bracBank: 0, pubaliBank: 0, dbbl: 0 },
  { id: 11, invNo: "338", type: "International", tickets: 1, mrNo: "", salesRef: "Ekramul Hossain", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 46300, receivedDate: "", cash: 0, bracBank: 0, pubaliBank: 0, dbbl: 0 },
  { id: 12, invNo: "339", type: "International", tickets: 2, mrNo: "107", salesRef: "Ekramul Hossain", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 85130, receivedDate: "2026-03-29", cash: 85130, bracBank: 0, pubaliBank: 0, dbbl: 0 },
  { id: 13, invNo: "25", type: "Visa Application", tickets: 1, mrNo: "100", salesRef: "Asif Mahbub", ticketReissue: 0, voidCharge: 0, visaFee: 500, tourPackage: 0, hotelBooking: 0, ticket: 0, receivedDate: "2026-03-17", cash: 0, bracBank: 0, pubaliBank: 0, dbbl: 500 },
  { id: 14, invNo: "340", type: "International", tickets: 3, mrNo: "91", salesRef: "Ekramul Hossain", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 146400, receivedDate: "2026-03-15", cash: 0, bracBank: 0, pubaliBank: 146400, dbbl: 0 },
  { id: 15, invNo: "341", type: "International", tickets: 1, mrNo: "112", salesRef: "Farhadul Amin", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 154787, receivedDate: "2026-03-30", cash: 0, bracBank: 0, pubaliBank: 154787, dbbl: 0 },
  { id: 16, invNo: "342", type: "International", tickets: 2, mrNo: "113", salesRef: "Farhadul Amin", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 106618, receivedDate: "", cash: 0, bracBank: 0, pubaliBank: 106618, dbbl: 0 },
  { id: 17, invNo: "343", type: "International", tickets: 1, mrNo: "86", salesRef: "Asif Mahbub", ticketReissue: 0, voidCharge: 0, visaFee: 0, tourPackage: 0, hotelBooking: 0, ticket: 37032, receivedDate: "2026-03-09", cash: 0, bracBank: 0, pubaliBank: 36800, dbbl: 0 }
];
var DEFAULT_AGENTS = ["Ekramul Hossain", "Farhadul Amin", "Asif Mahbub"];
var inMemoryStore = {
  invoices: [...SEED_DATA],
  agents: [...DEFAULT_AGENTS],
  nextId: 18
};
function isUsingFallback() {
  return useFallback;
}
async function getDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("USER:PASSWORD") || uri.includes("YOUR_")) {
    if (!useFallback) {
      console.warn("\u26A0\uFE0F MONGODB_URI is empty or unconfigured. Defaulting to safe in-memory data store.");
      useFallback = true;
    }
    return { isFallback: true, dbInvoices: null, dbAgents: null };
  }
  if (db) {
    return { isFallback: false, dbInvoices: db.collection("invoices"), dbAgents: db.collection("agents") };
  }
  try {
    console.log("\u{1F50C} Connecting to MongoDB cluster...");
    dbClient = new import_mongodb.MongoClient(uri, { serverSelectionTimeoutMS: 5e3 });
    await dbClient.connect();
    db = dbClient.db("travel_erp");
    console.log("\u2705 Successfully connected to MongoDB Database: travel_erp");
    const dbInvoices = db.collection("invoices");
    const dbAgents = db.collection("agents");
    const invoiceCount = await dbInvoices.countDocuments();
    if (invoiceCount === 0) {
      console.log("\u{1F331} Seeding initial invoices into MongoDB collection...");
      await dbInvoices.insertMany(SEED_DATA);
    }
    const agentCount = await dbAgents.countDocuments();
    if (agentCount === 0) {
      console.log("\u{1F331} Seeding default agents list into MongoDB collection...");
      await dbAgents.insertMany(DEFAULT_AGENTS.map((name) => ({ name })));
    }
    useFallback = false;
    return { isFallback: false, dbInvoices, dbAgents };
  } catch (error) {
    console.warn("\u26A0\uFE0F Could not establish connection to MongoDB (using live in-memory fallback):", error instanceof Error ? error.message : error);
    console.info("\u{1F4A1} Switching backup mode: Running on in-memory ERP cache.");
    useFallback = true;
    return { isFallback: true, dbInvoices: null, dbAgents: null };
  }
}

// backend/controllers/invoiceController.ts
var getERPData = async (req, res) => {
  try {
    const { isFallback, dbInvoices, dbAgents } = await getDatabase();
    if (isFallback) {
      return res.json({
        invoices: inMemoryStore.invoices,
        agents: inMemoryStore.agents,
        nextId: inMemoryStore.nextId,
        isFallback: true
      });
    }
    const invoices = await dbInvoices.find({}).toArray();
    const agentsRaw = await dbAgents.find({}).toArray();
    const agents = agentsRaw.map((a) => a.name);
    const maxId = invoices.reduce((max, inv) => Math.max(max, inv.id || 0), 0);
    const nextId = maxId >= 18 ? maxId + 1 : 18;
    res.json({
      invoices,
      agents,
      nextId,
      isFallback: false
    });
  } catch (error) {
    console.error("Controller Error - getERPData:", error);
    res.status(500).json({ error: "Failed to read database records" });
  }
};
var saveInvoice = async (req, res) => {
  try {
    const invoice = req.body;
    const { isFallback, dbInvoices } = await getDatabase();
    if (isFallback) {
      if (invoice.id) {
        inMemoryStore.invoices = inMemoryStore.invoices.map((inv) => inv.id === invoice.id ? invoice : inv);
      } else {
        invoice.id = inMemoryStore.nextId++;
        inMemoryStore.invoices.push(invoice);
      }
      return res.json({ success: true, record: invoice });
    }
    if (invoice.id) {
      const originalId = parseInt(invoice.id);
      delete invoice._id;
      invoice.id = originalId;
      await dbInvoices.updateOne({ id: originalId }, { $set: invoice }, { upsert: true });
    } else {
      const invoices = await dbInvoices.find({}).toArray();
      const maxId = invoices.reduce((max, inv) => Math.max(max, inv.id || 0), 0);
      invoice.id = maxId >= 18 ? maxId + 1 : 18;
      await dbInvoices.insertOne(invoice);
    }
    res.json({ success: true, record: invoice });
  } catch (error) {
    console.error("Controller Error - saveInvoice:", error);
    res.status(500).json({ error: "Failed to persist invoice data" });
  }
};
var deleteInvoice = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const { isFallback, dbInvoices } = await getDatabase();
    if (isFallback) {
      inMemoryStore.invoices = inMemoryStore.invoices.filter((inv) => inv.id !== invoiceId);
      return res.json({ success: true });
    }
    await dbInvoices.deleteOne({ id: invoiceId });
    res.json({ success: true });
  } catch (error) {
    console.error("Controller Error - deleteInvoice:", error);
    res.status(500).json({ error: "Failed to delete record" });
  }
};

// backend/controllers/agentController.ts
var addAgent = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Agent name is required" });
    }
    const trimmed = name.trim();
    const { isFallback, dbAgents } = await getDatabase();
    if (isFallback) {
      if (!inMemoryStore.agents.includes(trimmed)) {
        inMemoryStore.agents.push(trimmed);
      }
      return res.json({ success: true, agent: trimmed });
    }
    const existing = await dbAgents.findOne({ name: trimmed });
    if (!existing) {
      await dbAgents.insertOne({ name: trimmed });
    }
    res.json({ success: true, agent: trimmed });
  } catch (error) {
    console.error("Controller Error - addAgent:", error);
    res.status(500).json({ error: "Failed to persist sales agent" });
  }
};

// backend/routes/api.ts
var router = (0, import_express.Router)();
router.get("/config", async (req, res) => {
  const uri = process.env.MONGODB_URI;
  const configured = !!(uri && !uri.includes("USER:PASSWORD") && !uri.includes("YOUR_"));
  await getDatabase();
  const fallback = isUsingFallback();
  res.json({
    status: fallback ? "fallback" : "connected",
    configured,
    database: "MongoDB Atlas/Compass",
    fallbackNotice: fallback ? "Running on live mock in-memory state. Connect real MongoDB Atlas cluster by editing .env secrets." : void 0
  });
});
router.get("/data", getERPData);
router.post("/invoices", saveInvoice);
router.delete("/invoices/:id", deleteInvoice);
router.post("/agents", addAgent);
var api_default = router;

// backend/server.ts
import_dotenv2.default.config({ quiet: true });
var app = (0, import_express2.default)();
var PORT = process.env.PORT || 3e3;
app.use((0, import_cors.default)({
  origin: "https://asimnipty.github.io",
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true
}));
app.use(import_express2.default.json());
app.use("/api", api_default);
app.get("/", (req, res) => {
  res.send("Backend API is online.");
});
app.listen(PORT, () => {
  console.log(`\u{1F680} Server running on port ${PORT}`);
});
//# sourceMappingURL=server.cjs.map
