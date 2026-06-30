import React, { useState, useEffect } from "react";
import { Invoice, ConfigInfo, ActiveTab } from "./types";
import { Dashboard } from "./components/Dashboard";
import { InvoiceList } from "./components/InvoiceList";
import { InvoiceModal } from "./components/InvoiceModal";
import { AgentModal } from "./components/AgentModal";
import { Analytics } from "./components/Analytics";
import {
  Globe,
  PlusCircle,
  UserPlus,
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  ServerCrash,
  Database,
  Loader2,
} from "lucide-react";

// Use the environment variable, fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ConfigInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const loadERPData = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const dataRes = await fetch(`${API_BASE}/api/data`);
      if (!dataRes.ok) throw new Error("Could not download ledger data");
      const data = await dataRes.json();
      setInvoices(data.invoices || []);
      setAgents(data.agents || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Failed to establish synchronization with Server",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadConfigStatus = async () => {
    try {
      const configRes = await fetch(`${API_BASE}/api/config`);
      if (configRes.ok) {
        const conf = await configRes.json();
        setConfig(conf);
      }
    } catch (err) {
      console.warn("Could not query config database status:", err);
    }
  };

  useEffect(() => {
    loadERPData();
    loadConfigStatus();
  }, []);

  const handleSaveInvoice = async (invoice: Invoice) => {
    const response = await fetch(`${API_BASE}/api/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoice),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to persist invoice");
    }
    await loadERPData();
  };

  const handleDeleteInvoice = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/invoices/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to remove invoice");
      }
      await loadERPData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleAddAgent = async (agentName: string) => {
    const response = await fetch(`${API_BASE}/api/agents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: agentName }),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to register agent");
    }
    await loadERPData();
  };

  const startEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsInvoiceOpen(true);
  };

  const startNewInvoice = () => {
    setEditingInvoice(null);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800 flex flex-col">
      {config && (
        <div
          className={`px-4 py-2 border-b text-xs flex items-center justify-between gap-2 ${config.status === "fallback" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}
        >
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5" />
            <span>
              {config.status === "connected"
                ? "Atlas Online"
                : "Local Cache Active"}
            </span>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-100 h-16 flex items-center px-8 justify-between">
        <h1 className="font-bold text-lg">Welcare Trip ERP</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAgentOpen(true)}
            className="px-3 py-1.5 border rounded-lg text-xs"
          >
            Add Agent
          </button>
          <button
            onClick={startNewInvoice}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs"
          >
            Create Invoice
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {error && (
          <div className="bg-rose-50 p-4 border border-rose-200 text-rose-700 rounded-lg mb-6 flex items-center gap-3">
            <ServerCrash />
            <div>
              <p className="font-bold">Backend Communication Disrupted</p>
              <button onClick={loadERPData} className="text-xs underline">
                Retry
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "dashboard" && (
              <Dashboard invoices={invoices} agents={agents} />
            )}
            {activeTab === "invoices" && (
              <InvoiceList
                invoices={invoices}
                agents={agents}
                onEdit={startEditInvoice}
                onDelete={handleDeleteInvoice}
                onRefresh={loadERPData}
                loading={loading}
              />
            )}
            {activeTab === "analytics" && (
              <Analytics invoices={invoices} agents={agents} />
            )}
          </div>
        )}
      </main>

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        onSave={handleSaveInvoice}
        agents={agents}
        editingInvoice={editingInvoice}
      />
      <AgentModal
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        onSave={handleAddAgent}
      />
    </div>
  );
}
