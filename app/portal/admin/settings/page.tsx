"use client";

import { useState, useEffect } from "react";
import { FiSettings, FiSave, FiLoader, FiCheckCircle } from "react-icons/fi";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h3 className="text-xl font-black text-white tracking-tight">System Settings</h3>
        <p className="text-xs text-slate-400 mt-1">Configure global application variables and configurations</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-2">
          <FiCheckCircle /> Settings saved successfully!
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div className="divide-y divide-slate-850">
          {settings.map((setting) => (
            <div key={setting.id} className="py-6 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {setting.key.replace(/_/g, " ")}
                </span>
              </div>
              <div className="md:col-span-8">
                <input
                  type="text"
                  value={setting.value}
                  onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-850 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <FiLoader className="animate-spin" size={18} />
            ) : (
              <>
                <FiSave size={18} /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
