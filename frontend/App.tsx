import React, { useState, useEffect } from "react";
import { Invoice, ConfigInfo, ActiveTab } from "./types";
import { Dashboard } from "./components/Dashboard";
import { InvoiceList } from "./components/InvoiceList";
import { InvoiceModal } from "./components/InvoiceModal";
import { AgentModal } from "./components/AgentModal";
import { Analytics } from "./components/Analytics";
import { INITIAL_SEED_DATA, INITIAL_DEFAULT_AGENTS } from "./utils/seedData";
import { downloadInvoicesCSV, downloadAgentsCSV } from "./utils/erpUtils";
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
  AlertTriangle,
  Download,
  ChevronDown,
  Printer,
  FileText,
} from "lucide-react";

const getApiUrl = (endpoint: string): string => {
  const hostname = window.location.hostname;
  // If we are hosted on GitHub Pages or custom frontend domains, direct requests to the Render backend.
  if (
    hostname.includes("github.io") || 
    (!hostname.includes("localhost") && !hostname.includes(".run.app") && !hostname.includes("onrender.com"))
  ) {
    return `https://trip-4a60.onrender.com${endpoint}`;
  }
  return endpoint;
};

export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ConfigInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals controller
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  // Synchronize entire ERP ledger from server
  const loadERPData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataRes = await fetch(getApiUrl("/api/data"));
      if (!dataRes.ok) throw new Error("Could not download ledger data");
      const data = await dataRes.json();
      setInvoices(data.invoices || []);
      setAgents(data.agents || []);
      
      // Cache in localStorage for local fallback
      localStorage.setItem("erp_invoices", JSON.stringify(data.invoices || []));
      localStorage.setItem("erp_agents", JSON.stringify(data.agents || []));
    } catch (err: any) {
      console.warn("Backend unavailable, loading cached local storage data:", err);
      
      const cachedInvoices = localStorage.getItem("erp_invoices");
      const cachedAgents = localStorage.getItem("erp_agents");
      
      if (cachedInvoices && cachedAgents) {
        setInvoices(JSON.parse(cachedInvoices));
        setAgents(JSON.parse(cachedAgents));
      } else {
        localStorage.setItem("erp_invoices", JSON.stringify(INITIAL_SEED_DATA));
        localStorage.setItem("erp_agents", JSON.stringify(INITIAL_DEFAULT_AGENTS));
        setInvoices(INITIAL_SEED_DATA);
        setAgents(INITIAL_DEFAULT_AGENTS);
      }
    } finally {
      setLoading(false);
    }
  };

  // Check connection status to MongoDB cluster
  const loadConfigStatus = async () => {
    try {
      const configRes = await fetch(getApiUrl("/api/config"));
      if (configRes.ok) {
        const conf = await configRes.json();
        setConfig(conf);
      } else {
        throw new Error("Failed to reach API config endpoint");
      }
    } catch (err) {
      console.warn("Could not query config database status:", err);
      setConfig({
        database: "GitHub Pages (Local Offline Mode)",
        status: "fallback",
        fallbackNotice: "This application is running in local offline demo mode on GitHub Pages. Your entries are safely stored in your browser's local storage and will persist across browser reloads!"
      });
    }
  };

  useEffect(() => {
    loadERPData();
    loadConfigStatus();
  }, []);

  // Save/Update invoice row handler
  const handleSaveInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(getApiUrl("/api/invoices"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to persist invoice");
      }

      // Refresh entire memory tree
      await loadERPData();
    } catch (err) {
      console.warn("Backend save failed, writing to local storage instead:", err);
      
      // Local fallback
      const cachedInvoices = localStorage.getItem("erp_invoices");
      let list: Invoice[] = cachedInvoices ? JSON.parse(cachedInvoices) : [...INITIAL_SEED_DATA];
      
      if (invoice.id) {
        // Edit existing
        list = list.map((inv) => (inv.id === invoice.id ? invoice : inv));
      } else {
        // Create new
        const maxId = list.reduce((max, inv) => (inv.id > max ? inv.id : max), 0);
        const newInvoice = { ...invoice, id: maxId + 1 };
        list.push(newInvoice);
      }
      
      localStorage.setItem("erp_invoices", JSON.stringify(list));
      setInvoices(list);
    }
  };

  // Delete invoice row handler
  const handleDeleteInvoice = async (id: number) => {
    try {
      const response = await fetch(getApiUrl(`/api/invoices/${id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to remove invoice");
      }

      await loadERPData();
    } catch (err: any) {
      console.warn("Backend delete failed, removing from local storage instead:", err);
      
      // Local fallback
      const cachedInvoices = localStorage.getItem("erp_invoices");
      let list: Invoice[] = cachedInvoices ? JSON.parse(cachedInvoices) : [...INITIAL_SEED_DATA];
      
      list = list.filter((inv) => inv.id !== id);
      localStorage.setItem("erp_invoices", JSON.stringify(list));
      setInvoices(list);
    }
  };

  // Add agent/sales reference dropdown item
  const handleAddAgent = async (agentName: string) => {
    try {
      const response = await fetch(getApiUrl("/api/agents"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: agentName }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to register agent");
      }

      await loadERPData();
    } catch (err) {
      console.warn("Backend add agent failed, adding to local storage instead:", err);
      
      // Local fallback
      const cachedAgents = localStorage.getItem("erp_agents");
      let list: string[] = cachedAgents ? JSON.parse(cachedAgents) : [...INITIAL_DEFAULT_AGENTS];
      
      if (!list.includes(agentName)) {
        list.push(agentName);
      }
      
      localStorage.setItem("erp_agents", JSON.stringify(list));
      setAgents(list);
    }
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
    <div id="erp-app-shell" className="min-h-screen bg-slate-50/70 font-sans text-slate-800 flex flex-col selection:bg-indigo-500/10">
      
      {/* 1. Dynamic Database status indicators bar */}
      {config && (
        <div id="erp-status-bar" className={`px-4 py-2 border-b text-xs flex flex-wrap items-center justify-between gap-2 transition ${config.status === "fallback" ? "bg-amber-50 text-amber-800 border-amber-100" : "bg-emerald-50 text-emerald-800 border-emerald-100"}`}>
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span className="font-semibold">Database Engine:</span>
            <span>{config.database}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full inline-block ${config.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              {config.status === "connected" ? "Atlas Online & Connected" : "Local In-Memory Cache Active"}
            </span>
          </div>
          {config.status === "fallback" && (
            <p className="text-[11px] font-medium leading-normal">
              ⚠️ {config.fallbackNotice}
            </p>
          )}
        </div>
      )}

      {/* 2. Primary Navigation Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xs">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">Welcare Trip ERP</h1>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 inline-block">Management Ledger</span>
            </div>
          </div>

          {/* Navigation links & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                id="tab-dashboard-btn"
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "dashboard" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                <div className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </div>
              </button>
              <button
                id="tab-invoices-btn"
                onClick={() => setActiveTab("invoices")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "invoices" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                <div className="flex items-center gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Invoices Ledger
                </div>
              </button>
              <button
                id="tab-analytics-btn"
                onClick={() => setActiveTab("analytics")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "analytics" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics
                </div>
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <button
                id="add-agent-btn"
                onClick={() => setIsAgentOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Agent</span>
              </button>
              
              <button
                id="create-invoice-btn"
                onClick={startNewInvoice}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Invoice</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Sticky Tab bar helper */}
      <div id="mobile-tabs-rail" className="md:hidden bg-white border-b border-slate-100 px-4 py-2 flex gap-1 sticky top-16 z-30">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === "dashboard" ? "bg-indigo-50 text-indigo-600" : "text-slate-500"}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === "invoices" ? "bg-indigo-50 text-indigo-600" : "text-slate-500"}`}
        >
          Ledger
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === "analytics" ? "bg-indigo-50 text-indigo-600" : "text-slate-500"}`}
        >
          Analytics
        </button>
      </div>

      {/* 3. Main content canvas area */}
      <main id="erp-canvas" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Connection health warning panel */}
        {!loading && config && config.status === "fallback" && (
          <div id="fallback-warning-panel" className="mb-6 p-4 bg-amber-50 border border-amber-200/60 rounded-2xl flex items-start gap-3 text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold">Local Storage Failover Enabled</h4>
              <p className="text-[11px] font-medium opacity-90 leading-relaxed">
                The application could not reach the database. Your ledger is safely working on offline mode (LocalStorage). Your changes are saved locally!
              </p>
            </div>
          </div>
        )}

        {/* Dynamic tabs render mapping */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Synchronizing enterprise records. Please wait...</p>
          </div>
        ) : (
          <div id="erp-tab-content" className="space-y-6">
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

      {/* 5. Modals portal stack */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setEditingInvoice(null);
        }}
        onSave={handleSaveInvoice}
        agents={agents}
        editingInvoice={editingInvoice}
      />

      <AgentModal
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        onSave={handleAddAgent}
      />

      {/* Humble Footer */}
      <footer className="bg-white border-t border-slate-100 py-4 text-center text-[10px] text-slate-400 font-medium">
        <span>© 2026 Welcare Trip ERP Systems. All Rights Reserved.</span>
      </footer>

    </div>
  );
}