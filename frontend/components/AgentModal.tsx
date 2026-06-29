import React, { useState } from "react";
import { X, UserPlus, Info } from "lucide-react";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentName: string) => Promise<void>;
}

export function AgentModal({ isOpen, onClose, onSave }: AgentModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Sales reference name is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim());
      setName("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="agent-modal-backdrop" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div id="agent-modal-container" className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-base">Add New Sales Agent</h3>
          </div>
          <button id="close-agent-btn" onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs flex gap-2 rounded-r-md">
              <Info className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Sales Reference / Agent Name *
            </label>
            <input
              id="agent-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kazi Saifuddin"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
              autoFocus
            />
            <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
              Adding this agent will update the sales dropdown reference. If connected to MongoDB, it will be securely written.
            </p>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 mt-4">
            <button
              id="cancel-agent-btn"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg transition"
            >
              Cancel
            </button>
            <button
              id="save-agent-btn"
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-medium rounded-lg transition shadow-xs"
            >
              {saving ? "Registering..." : "Add Agent"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
