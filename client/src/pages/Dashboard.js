// client/src/pages/Dashboard.js
import { useCallback, useEffect, useState } from "react";
import { listLeads } from "../services/api";
import StatsCards from "../components/StatsCards";
import LeadsTable from "../components/LeadsTable";
import LeadDetail from "../components/LeadDetail";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export default function Dashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [filter, setFilter] = useState("mine");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchLeads = useCallback(async () => {
    try {
      setError(null);
      const assignedTo =
        filter === "mine" ? undefined :
        filter === "unassigned" ? "unassigned" : "all";
      const data = await listLeads({ search, status, assignedTo });
      setLeads(data.leads);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, filter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, refreshKey]);

  useEffect(() => {
    const id = setInterval(() => setRefreshKey((k) => k + 1), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-medium text-sm">M</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Mctaba CRM</div>
              <div className="text-xs text-gray-400">WhatsApp + M-Pesa · Nairobi</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                {currentUser?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-xs text-gray-500">{currentUser?.name}</span>
            </div>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="text-xs text-gray-400 hover:text-gray-700 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        <StatsCards refreshKey={refreshKey} />

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or email"
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"
          >
            <option value="mine">Assigned to me</option>
            <option value="unassigned">Unassigned</option>
            {currentUser?.role === "admin" && (
              <option value="all">All leads</option>
            )}
          </select>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-400 text-sm py-8 text-center">Loading leads...</div>
        ) : (
          <LeadsTable
            leads={leads}
            onSelect={(lead) => setSelectedId(lead.id)}
          />
        )}
      </main>

      <LeadDetail
        leadId={selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}