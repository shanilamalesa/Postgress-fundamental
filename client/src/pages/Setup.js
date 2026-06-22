// client/src/pages/Setup.js
import { useState } from "react";

export default function Setup({ onComplete }) {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSetup() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Setup failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-10 w-full max-w-sm shadow-sm">

        {/* Logo + Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-medium text-base">M</span>
          </div>
          <span className="text-base font-medium text-gray-900">Mctaba CRM</span>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-gray-900" : "bg-gray-200"}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-gray-900" : "bg-gray-200"}`} />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-medium text-gray-900 mb-1">
          {step === 1 ? "Set up your workspace" : "Create admin account"}
        </h1>
        <p className="text-sm text-gray-500 mb-7">
          {step === 1 ? "Step 1 of 2 — Your business" : "Step 2 of 2 — Your account"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Business name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Lavington Properties Ltd"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              />
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
              {[
                "Never lose a WhatsApp lead again",
                "Collect M-Pesa payments in one click",
                "Assign leads to your team instantly",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px]">✓</span>
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (!businessName.trim()) { setError("Please enter your business name"); return; }
                setError(null);
                setStep(2);
              }}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Wanjiru"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@lavingtonproperties.co.ke"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleSetup}
                disabled={loading}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
              >
                {loading ? "Setting up..." : "Launch CRM "}
              </button>
            </div>
          </div>
        )}

        <hr className="my-6 border-gray-100" />
        <p className="text-center text-xs text-gray-400">
          Powered by Mctaba Labs · East Africa's WhatsApp + M-Pesa CRM
        </p>
      </div>
    </div>
  );
}