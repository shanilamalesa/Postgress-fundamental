// client/src/components/StatsCards.js
import { useEffect, useState } from "react";
import { getStats } from "../services/api";

const CARD_META = {
  "Total leads":  { sub: "All time" },
  "New today":    { sub: "Since midnight" },
  "Qualified":    { sub: "Ready to convert" },
  "Converted":    { sub: "Paid via M-Pesa" },
};

export default function StatsCards({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((data) => !cancelled && setStats(data))
      .catch((err) => !cancelled && setError(typeof err.message === "string" ? err.message : "Stats unavailable"));
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (error) return <div className="text-red-500 text-sm">Stats error: {error}</div>;
  if (!stats) return <div className="text-gray-400 text-sm">Loading stats...</div>;

  const byStatus = Object.fromEntries(
    (stats.byStatus || []).map((r) => [r.status, r.total])
  );

  const cards = [
    { label: "Total leads", value: stats.total },
    { label: "New today", value: stats.today ?? "—" },
    { label: "Qualified", value: byStatus.qualified ?? 0 },
    { label: "Converted", value: byStatus.converted ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white border border-gray-200 rounded-xl p-4"
        >
          <div className="text-xs text-gray-400 mb-1">{c.label}</div>
          <div className="text-2xl font-medium text-gray-900">{c.value}</div>
          <div className="text-xs text-gray-400 mt-1">{CARD_META[c.label]?.sub}</div>
        </div>
      ))}
    </div>
  );
}