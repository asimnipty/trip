import { Request, Response } from "express";
import { getDatabase, inMemoryStore, isUsingFallback } from "../config/db";

export const getERPData = async (req: Request, res: Response) => {
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
    const agents = agentsRaw.map((a: any) => a.name);

    // Calculate maximum identifier for secure ID assignment
    const maxId = invoices.reduce((max: number, inv: any) => Math.max(max, inv.id || 0), 0);
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

export const saveInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = req.body;
    const { isFallback, dbInvoices } = await getDatabase();

    if (isFallback) {
      if (invoice.id) {
        // Edit mode
        inMemoryStore.invoices = inMemoryStore.invoices.map(inv => inv.id === invoice.id ? invoice : inv);
      } else {
        // Add mode
        invoice.id = inMemoryStore.nextId++;
        inMemoryStore.invoices.push(invoice);
      }
      return res.json({ success: true, record: invoice });
    }

    if (invoice.id) {
      const originalId = parseInt(invoice.id);
      delete invoice._id; // Remove MongoDB internal identifier if present
      invoice.id = originalId;

      await dbInvoices.updateOne({ id: originalId }, { $set: invoice }, { upsert: true });
    } else {
      const invoices = await dbInvoices.find({}).toArray();
      const maxId = invoices.reduce((max: number, inv: any) => Math.max(max, inv.id || 0), 0);
      invoice.id = maxId >= 18 ? maxId + 1 : 18;

      await dbInvoices.insertOne(invoice);
    }

    res.json({ success: true, record: invoice });
  } catch (error) {
    console.error("Controller Error - saveInvoice:", error);
    res.status(500).json({ error: "Failed to persist invoice data" });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const { isFallback, dbInvoices } = await getDatabase();

    if (isFallback) {
      inMemoryStore.invoices = inMemoryStore.invoices.filter(inv => inv.id !== invoiceId);
      return res.json({ success: true });
    }

    await dbInvoices.deleteOne({ id: invoiceId });
    res.json({ success: true });
  } catch (error) {
    console.error("Controller Error - deleteInvoice:", error);
    res.status(500).json({ error: "Failed to delete record" });
  }
};
