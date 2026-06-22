// client/src/components/LeadsTable.js

const STATUS_STYLES = {
  new:       "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  qualified: "bg-purple-50 text-purple-700",
  converted: "bg-green-50 text-green-700",
  lost:      "bg-gray-100 text-gray-500",
};

export default function LeadsTable({ leads, onSelect }) {
  if (leads.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
        <div className="text-gray-400 text-sm">No leads yet.</div>
        <div className="text-gray-300 text-xs mt-1">Message your WhatsApp number to create one.</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Inquiry</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Received</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onSelect(lead)}
              className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition last:border-0"
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                {lead.name || "(no name yet)"}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                +{lead.wa_phone}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {lead.inquiry_type || "—"}
              </td>
              <td className="px-4 py-3">
                <span className={
                  "px-2.5 py-1 rounded-full text-xs font-medium " +
                  (STATUS_STYLES[lead.status] || "bg-gray-100 text-gray-500")
                }>
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">
                {lead.created_at ? new Date(lead.created_at).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}