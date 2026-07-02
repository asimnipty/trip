import { Router } from "express";
import { getERPData, saveInvoice, deleteInvoice } from "../controllers/invoiceController";
import { addAgent } from "../controllers/agentController";
import { getDatabase, isUsingFallback } from "../config/db";

const router = Router();

// 1. Live status info route
router.get("/config", (req, res) => {
  const uri = process.env.MONGODB_URI;
  const configured = !!(uri && !uri.includes("USER:PASSWORD") && !uri.includes("YOUR_"));
  const fallback = isUsingFallback();
  
  res.json({
    status: fallback ? "fallback" : "connected",
    configured,
    database: "MongoDB Atlas/Compass",
    fallbackNotice: fallback 
      ? "Running on live mock in-memory state. Connect real MongoDB Atlas cluster by editing .env secrets." 
      : undefined
  });
});

// 2. Main data endpoint
router.get("/data", getERPData);

// 3. Invoice routes
router.post("/invoices", saveInvoice);
router.delete("/invoices/:id", deleteInvoice);

// 4. Agent routes
router.post("/agents", addAgent);

export default router;
