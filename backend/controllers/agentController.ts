import { Request, Response } from "express";
import { getDatabase, inMemoryStore } from "../config/db";

export const addAgent = async (req: Request, res: Response) => {
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
