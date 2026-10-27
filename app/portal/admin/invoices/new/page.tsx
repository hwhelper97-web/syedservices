"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiDollarSign,
  FiFileText,
  FiCheck,
  FiRefreshCw,
  FiEye,
  FiMail,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";
import { SUPPORTED_CURRENCIES, formatCurrencyAmount } from "@/lib/currencies";
import { calculateInvoiceTotals, LineItemInput } from "@/lib/invoiceMath";

interface FormItem {
  id: string;
  serviceName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  taxRate: number;
}

const SERVICE_PRESETS = [
  { name: "Dubai 30-Day Tourist Visa Express", price: 150, unit: "visa" },
  { name: "Dubai 60-Day Visit Visa", price: 280, unit: "visa" },
  { name: "Saudi Umrah Visa Package", price: 200, unit: "person" },
  { name: "Document Attestation (MOFA & Embassy)", price: 80, unit: "document" },
  { name: "Confirmed Flight Ticket Reservation (PNR)", price: 40, unit: "ticket" },
  { name: "Hotel Booking Voucher for Embassy", price: 35, unit: "booking" },
  { name: "Embassy File Preparation & Appointment", price: 100, unit: "service" },
  { name: "Comprehensive Travel & Visa Consultation", price: 50, unit: "session" },
];

export default function CreateInvoicePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [sendEmailImmediately, setSendEmailImmediately] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recent applications for optional linking
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("Peshawar");
  const [customerCountry, setCustomerCountry] = useState("Pakistan");
  const [customerTaxId, setCustomerTaxId] = useState("");

  // Invoice Meta
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [currency, setCurrency] = useState("PKR");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlCur = sp.get("currency");
      if (urlCur && urlCur !== "ALL") {
        setCurrency(urlCur.toUpperCase());
      }
    }
  }, []);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState("ISSUED");

  // Items
  const [items, setItems] = useState<FormItem[]>([
    {
      id: "item-1",
      serviceName: "Dubai 30-Day Tourist Visa Express",
      description: "Standard visa processing including immigration fee and insurance.",
      quantity: 1,
      unit: "visa",
      unitPrice: 35000,
      discountType: "PERCENTAGE",
      discountValue: 0,
      taxRate: 0,
    },
  ]);

  // Invoice level adjustments
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("FIXED");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);

  // Terms and Notes
  const [notes, setNotes] = useState(
    "Thank you for choosing Syed Services & Consultant. Please retain this invoice for your records."
  );
  const [terms, setTerms] = useState(
    "Payment due within 14 days of issue date.\nBank: Habib Bank Limited (HBL) / Meezan Bank\nAccount Title: Syed Services & Consultant"
  );

  // Fetch applications for optional link
  useEffect(() => {
    fetch("/api/applications?limit=25")
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) setApplications(data.applications);
      })
      .catch(() => {});
  }, []);

  // Handle application link selection
  const handleSelectApplication = (appId: string) => {
    setSelectedAppId(appId);
    if (!appId) return;
    const app = applications.find((a) => String(a.id) === appId);
    if (app && app.client) {
      if (app.client.user?.name) setCustomerName(app.client.user.name);
      if (app.client.user?.email) setCustomerEmail(app.client.user.email);
      if (app.client.phone) setCustomerPhone(app.client.phone);
      if (app.client.currentAddress) setCustomerAddress(app.client.currentAddress);
    }
  };

  // Real-time calculated totals
  const calculatedTotals = useMemo(() => {
    const mathItems: LineItemInput[] = items.map((it, idx) => ({
      serviceName: it.serviceName || `Item #${idx + 1}`,
      description: it.description,
      quantity: Number(it.quantity) || 1,
      unit: it.unit,
      unitPrice: Number(it.unitPrice) || 0,
      discountType: it.discountType,
      discountValue: Number(it.discountValue) || 0,
      taxRate: Number(it.taxRate) || 0,
      sortOrder: idx,
    }));

    return calculateInvoiceTotals({
      currency,
      items: mathItems,
      discountType,
      discountValue: Number(discountValue) || 0,
      taxRate: Number(taxRate) || 0,
      shippingFee: Number(shippingFee) || 0,
      dueDate,
      currentStatus: status,
    });
  }, [items, currency, discountType, discountValue, taxRate, shippingFee, dueDate, status]);

  // Item helpers
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        serviceName: "",
        description: "",
        quantity: 1,
        unit: "service",
        unitPrice: 0,
        discountType: "PERCENTAGE",
        discountValue: 0,
        taxRate: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, field: keyof FormItem, val: any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const applyPreset = (id: string, preset: typeof SERVICE_PRESETS[0]) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              serviceName: preset.name,
              unit: preset.unit,
              unitPrice: currency === "PKR" ? preset.price * 280 : preset.price,
            }
          : it
      )
    );
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setError(null);
    if (!customerName.trim() && !selectedAppId) {
      setError("Please provide a customer name or select an existing application.");
      return;
    }

    if (items.some((it) => !it.serviceName.trim())) {
      setError("Every line item must have a service name.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        invoiceNumber: invoiceNumber.trim() || undefined,
        customerName,
        customerCompany,
        customerEmail,
        customerPhone,
        customerAddress,
        customerCity,
        customerCountry,
        customerTaxId,
        currency,
        items: items.map((it, idx) => ({
          serviceName: it.serviceName,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          discountType: it.discountType,
          discountValue: it.discountValue,
          taxRate: it.taxRate,
          sortOrder: idx,
        })),
        discountType,
        discountValue,
        taxRate,
        shippingFee,
        issueDate,
        dueDate,
        notes,
        terms,
        applicationId: selectedAppId ? parseInt(selectedAppId, 10) : undefined,
        status: isDraft ? "DRAFT" : "ISSUED",
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create invoice");
      }

      const createdInvoice = data.invoice;

      // If requested to send email immediately
      if (sendEmailImmediately && createdInvoice.customerEmail) {
        await fetch(`/api/invoices/${createdInvoice.id}/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientEmail: createdInvoice.customerEmail }),
        });
      }

      router.push(`/portal/admin/invoices/${createdInvoice.id}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/portal/admin/invoices?currency=${currency}`}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Create Independent Invoice</h1>
            <p className="text-xs text-slate-400">
              Bill any customer or service with multi-currency support and instant live preview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <FiRefreshCw className="animate-spin" size={16} />
            ) : (
              <FiCheck size={16} />
            )}
            <span>Create &amp; Issue Invoice</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <FiInfo size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form (Left 60%) + Live Preview (Right 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Customer & Optional Application Linking */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                1. Customer &amp; Billing Information
              </h2>
            </div>

            {/* Optional Application Link Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Link to Visa Application (Optional)
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => handleSelectApplication(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="">-- Independent Invoice (No application linked) --</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    #{app.trackingId || app.id} - {app.client?.user?.name || "Client"} ({app.country} - {app.visaCategory})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Customer / Client Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Company / Business Name (Optional)</label>
                <input
                  type="text"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  placeholder="e.g. Al-Hayat Travel Agency"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Street Address</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Office #2, Saddar Road"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">City</label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Country</label>
                <input
                  type="text"
                  value={customerCountry}
                  onChange={(e) => setCustomerCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 2. Currency, Dates & Invoice ID */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              2. Invoice Metadata &amp; Currency
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Currency *</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Invoice Number (Auto-assigned if empty)</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2026-0042"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tax ID / CNIC / NTN</label>
                <input
                  type="text"
                  value={customerTaxId}
                  onChange={(e) => setCustomerTaxId(e.target.value)}
                  placeholder="e.g. 17301-1234567-1"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ISSUED">Issued (Unpaid)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Line Items */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                3. Itemized Services &amp; Products
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold border border-amber-500/20 transition-colors"
              >
                <FiPlus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">Line #{idx + 1}</span>

                    {/* Quick Preset Selector */}
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => {
                          const p = SERVICE_PRESETS.find((x) => x.name === e.target.value);
                          if (p) applyPreset(item.id, p);
                        }}
                        className="text-[11px] bg-slate-900 text-slate-400 border border-slate-800 rounded-lg px-2 py-1"
                        defaultValue=""
                      >
                        <option value="" disabled>Load preset service...</option>
                        {SERVICE_PRESETS.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove item"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Service / Item Name *</label>
                      <input
                        type="text"
                        value={item.serviceName}
                        onChange={(e) => updateItem(item.id, "serviceName", e.target.value)}
                        placeholder="e.g. Visa Processing Fee"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-center focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                        placeholder="visa, person"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-center focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-12">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Description / Notes</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="e.g. Express embassy submission fee"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Unit Price ({currency})</label>
                      <input
                        type="number"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Line Discount</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          step="any"
                          value={item.discountValue}
                          onChange={(e) => updateItem(item.id, "discountValue", parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, "discountType", item.discountType === "PERCENTAGE" ? "FIXED" : "PERCENTAGE")}
                          className="px-2 py-1 bg-slate-800 rounded text-[10px] font-mono font-bold text-slate-300"
                        >
                          {item.discountType === "PERCENTAGE" ? "%" : currency}
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Tax Rate (%)</label>
                      <input
                        type="number"
                        step="any"
                        value={item.taxRate}
                        onChange={(e) => updateItem(item.id, "taxRate", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Adjustments & Payment Instructions */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              4. Global Adjustments, Terms &amp; Notes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Invoice Discount</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="any"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setDiscountType(discountType === "PERCENTAGE" ? "FIXED" : "PERCENTAGE")}
                    className="px-3 py-2 bg-slate-800 rounded-xl text-xs font-mono font-bold text-slate-300"
                  >
                    {discountType === "PERCENTAGE" ? "%" : currency}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Invoice Tax Rate (%)</label>
                <input
                  type="number"
                  step="any"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Additional Charges / Courier ({currency})</label>
                <input
                  type="number"
                  step="any"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Client Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Payment Terms &amp; Bank Details</label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={sendEmailImmediately}
                    onChange={(e) => setSendEmailImmediately(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 focus:ring-0 bg-slate-950 border-slate-800"
                  />
                  <span>Automatically email invoice with branded PDF to customer upon creation</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column (Right 40%) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiEye className="text-amber-400" /> Real-Time Live Preview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                {currency}
              </span>
            </div>

            {/* Branded Invoice Preview Canvas */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-300 font-sans text-xs">
              {/* Header Bar */}
              <div className="bg-[#020617] p-5 border-b-2 border-amber-400 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white p-0.5 border border-amber-400/40 flex items-center justify-center overflow-hidden shrink-0">
                    <Image src="/images/logo.png" alt="Syed Services Logo" width={38} height={38} className="w-full h-full object-contain" priority />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white tracking-wider">SYED SERVICES</div>
                    <div className="text-[9px] text-amber-400 font-semibold tracking-wide">&amp; CONSULTANT</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-amber-400">INVOICE</div>
                  <div className="text-[10px] text-slate-400 font-mono">{invoiceNumber || "INV-XXXX-PREVIEW"}</div>
                </div>
              </div>

              {/* Bill To & Dates */}
              <div className="p-5 border-b border-slate-900 grid grid-cols-2 gap-4 bg-slate-900/30">
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase mb-1">Billed To</div>
                  <div className="font-bold text-white text-sm">{customerName || "Customer Name"}</div>
                  {customerCompany && <div className="text-[11px] text-slate-400">{customerCompany}</div>}
                  {customerEmail && <div className="text-[10px] text-slate-500">{customerEmail}</div>}
                  {customerPhone && <div className="text-[10px] text-slate-500">{customerPhone}</div>}
                  {customerAddress && <div className="text-[10px] text-slate-500">{customerAddress}, {customerCity}</div>}
                </div>

                <div className="text-right space-y-1">
                  <div className="text-[10px] text-slate-500">
                    <span className="text-slate-400 font-semibold">Issue:</span> {issueDate}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    <span className="text-slate-400 font-semibold">Due:</span> {dueDate}
                  </div>
                  <div className="pt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="p-5 space-y-3">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="pb-2">Item</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {calculatedTotals.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 pr-2">
                          <div className="font-semibold text-white">{it.serviceName}</div>
                          {it.description && <div className="text-[9px] text-slate-500">{it.description}</div>}
                        </td>
                        <td className="py-2 text-center text-slate-400">{it.quantity} {it.unit}</td>
                        <td className="py-2 text-right text-slate-400 font-mono">
                          {formatCurrencyAmount(it.unitPrice, currency, { showSymbol: false })}
                        </td>
                        <td className="py-2 text-right font-bold text-white font-mono">
                          {formatCurrencyAmount(it.lineTotal, currency, { showSymbol: false })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Breakdown */}
                <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">{formatCurrencyAmount(calculatedTotals.subtotal, currency, { showCode: true })}</span>
                  </div>

                  {calculatedTotals.discountTotal > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Total Discount</span>
                      <span className="font-mono text-emerald-400">-{formatCurrencyAmount(calculatedTotals.discountTotal, currency, { showCode: true })}</span>
                    </div>
                  )}

                  {calculatedTotals.taxTotal > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Tax</span>
                      <span className="font-mono text-slate-300">+{formatCurrencyAmount(calculatedTotals.taxTotal, currency, { showCode: true })}</span>
                    </div>
                  )}

                  {calculatedTotals.shippingFee > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Additional Fee</span>
                      <span className="font-mono text-slate-300">+{formatCurrencyAmount(calculatedTotals.shippingFee, currency, { showCode: true })}</span>
                    </div>
                  )}

                  <div className="flex justify-between p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-white font-bold text-sm">
                    <span className="text-amber-400">Total Amount</span>
                    <span className="font-mono text-amber-400">{formatCurrencyAmount(calculatedTotals.totalAmount, currency, { showCode: true })}</span>
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1 text-[11px]">
                    <span>Balance Due</span>
                    <span className="font-bold text-white font-mono">{formatCurrencyAmount(calculatedTotals.balanceDue, currency, { showCode: true })}</span>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 space-y-1">
                  <div><strong>Terms:</strong> {terms.slice(0, 80)}...</div>
                  <div className="text-center pt-2 text-slate-600">
                    Peshawar, Pakistan &amp; Jalalabad, Afghanistan • info@syedservices.com.pk
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
