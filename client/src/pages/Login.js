// client/src/pages/Login.js
import { useState } from "react";
import { login } from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      onLogin();
    } catch (err) {
      setError(
        typeof err.response?.data?.error === "string"
          ? err.response?.data?.error
          : err.message || "Login failed"
      );
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

        {/* Heading */}
        <h1 className="text-2xl font-medium text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Access your business workspace</p>

        {/* Badges */}
        <div className="flex gap-2 mb-7">
          {["WhatsApp", "M-Pesa", "Team CRM"].map((b) => (
            <span key={b} className="text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
              {b}
            </span>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.co.ke"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition mt-2"
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <hr className="my-6 border-gray-100" />
        <p className="text-center text-xs text-gray-400">
          Powered by Mctaba Labs · East Africa's WhatsApp + M-Pesa CRM
        </p>
      </div>
    </div>
  );
}