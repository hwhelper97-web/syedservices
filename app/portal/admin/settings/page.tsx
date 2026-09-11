"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSettings, FiSave, FiLoader, FiCheckCircle, 
  FiBriefcase, FiGlobe, FiMail, FiShield, 
  FiRefreshCw, FiAlertTriangle, FiCheck, FiSliders, FiInfo
} from "react-icons/fi";

const TABS = [
  { id: "agency", label: "Agency & Profile", icon: FiBriefcase, desc: "Legal identity, branch offices, and official contact channels" },
  { id: "visa", label: "Visa Policies & Fees", icon: FiGlobe, desc: "Default pricing, document upload quotas, and application rules" },
  { id: "email", label: "Email & Notifications", icon: FiMail, desc: "Automated alerts, SMTP outgoing server, and greetings" },
  { id: "security", label: "Security & Controls", icon: FiShield, desc: "Maintenance mode, public registration gate, and announcements" },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("agency");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [initialSettings, setInitialSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.settingsMap) {
        setSettings(data.settingsMap);
        setInitialSettings(data.settingsMap);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to connect to settings server");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }));
  };

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setInitialSettings({ ...settings });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...initialSettings });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4 text-yellow-400">
        <FiLoader className="animate-spin" size={40} />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Loading Administrative Suite Configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#111c38] to-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider">
              <FiSliders size={13} /> Super Administrator Center
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Global System Settings
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Configure corporate agency credentials, processing fee guidelines, automated email notifications, and security protocols.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
                Unsaved Changes
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasUnsavedChanges || saving}
              className="px-4 py-3 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-7 py-3 bg-yellow-400 text-black font-black rounded-2xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-lg shadow-yellow-400/20 disabled:opacity-50"
            >
              {saving ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
              {saving ? "Saving..." : "Save All Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2.5 shadow-xl"
          >
            <FiCheckCircle size={18} />
            <span>All system configurations and variables were updated and persisted successfully!</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2.5 shadow-xl"
          >
            <FiAlertTriangle size={18} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0f172a] border border-slate-800 p-2 rounded-[2rem] shadow-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                  : "bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                isActive ? "bg-black/10 text-black" : "bg-slate-800 text-yellow-400"
              }`}>
                <Icon size={18} />
              </div>
              <div className="truncate">
                <p className="text-xs font-black tracking-tight">{tab.label}</p>
                <p className={`text-[10px] truncate ${isActive ? "text-black/70" : "text-slate-500"}`}>
                  {tab.id.toUpperCase()}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form Panels */}
      <form onSubmit={handleSave}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="bg-[#0f172a] border border-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-8"
        >
          {/* TAB 1: AGENCY DETAILS */}
          {activeTab === "agency" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FiBriefcase className="text-yellow-400" /> Agency Identity & Official Channels
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  These details appear on client visa agreements, email footers, and official printed receipts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    value={settings.company_name || ""}
                    onChange={(e) => handleChange("company_name", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    placeholder="e.g. Syed Services Pvt Ltd"
                  />
                  <p className="text-[10px] text-slate-500">Official registered corporate title</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Corporate Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={settings.company_tagline || ""}
                    onChange={(e) => handleChange("company_tagline", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    placeholder="e.g. Premier Global Immigration & Visa Consultancy"
                  />
                  <p className="text-[10px] text-slate-500">Subtitle displayed across portals and banners</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    License / Registration No.
                  </label>
                  <input
                    type="text"
                    value={settings.registration_number || ""}
                    onChange={(e) => handleChange("registration_number", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none font-mono"
                    placeholder="e.g. SEC-KP-2024-9981"
                  />
                  <p className="text-[10px] text-slate-500">Government SEC / chamber accreditation ID</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Official Inquiries Email
                  </label>
                  <input
                    type="email"
                    value={settings.company_email || ""}
                    onChange={(e) => handleChange("company_email", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    placeholder="e.g. info@syedservices.com"
                  />
                  <p className="text-[10px] text-slate-500">Public email visible to prospective applicants</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Official Telephone Line
                  </label>
                  <input
                    type="text"
                    value={settings.company_phone || ""}
                    onChange={(e) => handleChange("company_phone", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    placeholder="e.g. +92 300 1234567"
                  />
                  <p className="text-[10px] text-slate-500">Primary phone for corporate inquiries</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    WhatsApp Support Helpline
                  </label>
                  <input
                    type="text"
                    value={settings.whatsapp_helpline || ""}
                    onChange={(e) => handleChange("whatsapp_helpline", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    placeholder="e.g. +92 300 7654321"
                  />
                  <p className="text-[10px] text-slate-500">Direct WhatsApp link for urgent client queries</p>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Peshawar Head Office Address
                  </label>
                  <input
                    type="text"
                    value={settings.company_address || ""}
                    onChange={(e) => handleChange("company_address", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    placeholder="e.g. Gt Road, Peshawar, Khyber Pakhtunkhwa, Pakistan"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Jalalabad Branch / Cross-Border Office Address
                  </label>
                  <input
                    type="text"
                    value={settings.secondary_address || ""}
                    onChange={(e) => handleChange("secondary_address", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    placeholder="e.g. Jalalabad Main Commercial Center, Nangarhar, Afghanistan"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISA POLICIES & FEES */}
          {activeTab === "visa" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FiGlobe className="text-yellow-400" /> Visa Processing Policies & Quotas
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage defaults for new client applications, document upload sizes, and deposit requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Default Visa Fee ($ USD)
                  </label>
                  <input
                    type="number"
                    value={settings.default_visa_fee || "1000"}
                    onChange={(e) => handleChange("default_visa_fee", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Base fee applied when generating new agreements</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Base Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={settings.default_currency || "USD"}
                    onChange={(e) => handleChange("default_currency", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500">e.g. USD, PKR, AFN</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Advance Initial Deposit Requirement (%)
                  </label>
                  <input
                    type="number"
                    value={settings.deposit_percentage || "25"}
                    onChange={(e) => handleChange("deposit_percentage", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Percentage required upfront before processing</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Max File Upload Size (Megabytes)
                  </label>
                  <input
                    type="number"
                    value={settings.max_upload_size_mb || "10"}
                    onChange={(e) => handleChange("max_upload_size_mb", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Upload ceiling for passports and bank statements</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Allowed File Formats
                  </label>
                  <input
                    type="text"
                    value={settings.allowed_extensions || "pdf, jpg, jpeg, png"}
                    onChange={(e) => handleChange("allowed_extensions", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Comma-separated file extensions permitted</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Application Auto-Archive Days
                  </label>
                  <input
                    type="number"
                    value={settings.application_expiry_days || "60"}
                    onChange={(e) => handleChange("application_expiry_days", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Days of inactivity before draft is flagged</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL & NOTIFICATIONS */}
          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FiMail className="text-yellow-400" /> Automated Communication & SMTP Alerts
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure internal administrative alerts, outbound email delivery server, and client greetings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Admin Notifications Recipient Email
                  </label>
                  <input
                    type="email"
                    value={settings.admin_alert_email || ""}
                    onChange={(e) => handleChange("admin_alert_email", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    placeholder="e.g. notifications@syedservices.com"
                  />
                  <p className="text-[10px] text-slate-500">Receives alerts on new registrations and status changes</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Email Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.email_sender_name || "Syed Services Operations"}
                    onChange={(e) => handleChange("email_sender_name", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Display name seen by client in inbox</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Outbound SMTP Server Host
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_host || "smtp.gmail.com"}
                    onChange={(e) => handleChange("smtp_host", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500">SMTP mail server host</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_port || "465"}
                    onChange={(e) => handleChange("smtp_port", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500">Usually 465 (SSL) or 587 (TLS)</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Welcome Greeting Emails
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Send welcome orientation email when a new client or travel agency registers
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle("email_welcome_enabled")}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      settings.email_welcome_enabled === "true" ? "bg-yellow-400" : "bg-slate-800"
                    }`}
                  >
                    <motion.div
                      layout
                      className={`bg-black w-4 h-4 rounded-full shadow-md ${
                        settings.email_welcome_enabled === "true" ? "ml-auto" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Dossier Status Update Email Notifications
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Notify applicant whenever administrators advance or modify the visa pipeline stage
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle("email_status_updates_enabled")}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      settings.email_status_updates_enabled === "true" ? "bg-yellow-400" : "bg-slate-800"
                    }`}
                  >
                    <motion.div
                      layout
                      className={`bg-black w-4 h-4 rounded-full shadow-md ${
                        settings.email_status_updates_enabled === "true" ? "ml-auto" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & SYSTEM CONTROLS */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FiShield className="text-yellow-400" /> Security Safeguards & Global Controls
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enforce portal maintenance, restrict public registrations, and broadcast announcements.
                </p>
              </div>

              {/* Maintenance & Public Registration switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      System Maintenance Mode
                      {settings.maintenance_mode === "true" && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-black">
                          ACTIVE
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      When enabled, non-admin visitors will see a maintenance notice
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle("maintenance_mode")}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      settings.maintenance_mode === "true" ? "bg-rose-500" : "bg-slate-800"
                    }`}
                  >
                    <motion.div
                      layout
                      className={`bg-white w-4 h-4 rounded-full shadow-md ${
                        settings.maintenance_mode === "true" ? "ml-auto" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Allow Public Registrations
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Permit new clients and travel agencies to register accounts from the public portal
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle("allow_registration")}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      settings.allow_registration === "true" ? "bg-yellow-400" : "bg-slate-800"
                    }`}
                  >
                    <motion.div
                      layout
                      className={`bg-black w-4 h-4 rounded-full shadow-md ${
                        settings.allow_registration === "true" ? "ml-auto" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Broadcast Global Announcement Banner
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Display high-visibility announcement banner across client dashboards
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle("announcement_active")}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      settings.announcement_active === "true" ? "bg-yellow-400" : "bg-slate-800"
                    }`}
                  >
                    <motion.div
                      layout
                      className={`bg-black w-4 h-4 rounded-full shadow-md ${
                        settings.announcement_active === "true" ? "ml-auto" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Announcement text & timeout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Global Announcement Banner Message
                  </label>
                  <input
                    type="text"
                    value={settings.announcement_text || ""}
                    onChange={(e) => handleChange("announcement_text", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    placeholder="e.g. System maintenance scheduled for Sunday at midnight UTC..."
                  />
                  <p className="text-[10px] text-slate-500">Text rendered if announcement banner is enabled above</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Session Inactivity Timeout (Minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.session_timeout_minutes || "120"}
                    onChange={(e) => handleChange("session_timeout_minutes", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Auto-disconnects idle administrative sessions</p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FiInfo size={14} className="text-yellow-400" />
              <span>Modifications take effect immediately upon saving.</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3.5 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50 shadow-lg shadow-yellow-400/20 text-xs"
            >
              {saving ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
              {saving ? "Saving All Configuration..." : "Save All System Settings"}
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
