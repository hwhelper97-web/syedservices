"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiEdit2, FiTrash2, FiShare2, FiCopy, FiCheck, 
  FiExternalLink, FiSearch, FiFilter, FiGlobe, FiPhone, 
  FiDollarSign, FiClock, FiFileText, FiStar, FiX, FiRefreshCw,
  FiCheckCircle, FiAlertCircle, FiTag, FiUploadCloud, FiImage, FiLoader
} from "react-icons/fi";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

interface PackageItem {
  id: number;
  title: string;
  slug: string | null;
  country: string;
  visaType: string | null;
  agencyNumber: string;
  priceUSD: number | null;
  pricePKR: number | null;
  priceAFN: number | null;
  duration: string | null;
  processingTime: string | null;
  description: string;
  documents: string;
  image: string | null;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_AGENCY_NUMBER = "+92 334 5668667";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    title: "",
    country: "",
    visaType: "Tourist Visa",
    agencyNumber: DEFAULT_AGENCY_NUMBER,
    priceUSD: "",
    pricePKR: "",
    priceAFN: "",
    duration: "30 Days Stay",
    processingTime: "3-5 Working Days",
    description: "",
    documents: "",
    image: "",
    featured: false,
    status: "ACTIVE",
  });

  // Local Computer Image Upload State
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFormError("Selected image file is too large. Maximum size is 10MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file (PNG, JPG, WEBP, etc.).");
      return;
    }

    setUploadingImage(true);
    setFormError("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (res.ok && data.fileUrl) {
        setFormData((prev) => ({ ...prev, image: data.fileUrl }));
        showNotification("success", `Image "${file.name}" uploaded successfully!`);
      } else {
        setFormError(data.error || "Failed to upload image. You can also paste a direct image URL.");
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      setFormError("Network error while uploading image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/packages?all=true");
      const data = await res.json();
      if (res.ok && data.packages) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error("Failed to load packages:", err);
      showNotification("error", "Failed to fetch packages from server");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const getPackageUrl = (pkg: PackageItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.syedservices.com.pk";
    return `${origin}/packages/${pkg.slug || pkg.id}`;
  };

  const handleCopyLink = (pkg: PackageItem) => {
    const url = getPackageUrl(pkg);
    navigator.clipboard.writeText(url);
    setCopiedId(pkg.id);
    setTimeout(() => setCopiedId(null), 2500);
    showNotification("success", `Public link copied for: ${pkg.title}`);
  };

  const openCreateModal = () => {
    setModalMode("CREATE");
    setEditingId(null);
    setFormData({
      title: "",
      country: "",
      visaType: "Tourist Visa",
      agencyNumber: DEFAULT_AGENCY_NUMBER,
      priceUSD: "",
      pricePKR: "",
      priceAFN: "",
      duration: "30 Days Stay",
      processingTime: "3-5 Working Days",
      description: "",
      documents: "Valid Passport (min 6 months)\nPassport size photograph (white background)\nNational ID / Tazkira copy\nConfirmed return ticket booking",
      image: "",
      featured: false,
      status: "ACTIVE",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: PackageItem) => {
    setModalMode("EDIT");
    setEditingId(pkg.id);
    setFormData({
      title: pkg.title,
      country: pkg.country,
      visaType: pkg.visaType || "Tourist Visa",
      agencyNumber: pkg.agencyNumber || DEFAULT_AGENCY_NUMBER,
      priceUSD: pkg.priceUSD ? String(pkg.priceUSD) : "",
      pricePKR: pkg.pricePKR ? String(pkg.pricePKR) : "",
      priceAFN: pkg.priceAFN ? String(pkg.priceAFN) : "",
      duration: pkg.duration || "",
      processingTime: pkg.processingTime || "",
      description: pkg.description,
      documents: pkg.documents,
      image: pkg.image || "",
      featured: pkg.featured,
      status: pkg.status,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    if (!formData.title || !formData.country || !formData.agencyNumber || !formData.description || !formData.documents) {
      setFormError("Please fill in Title, Country, Agency Number, Description, and Documents.");
      setSubmitting(false);
      return;
    }

    try {
      if (modalMode === "CREATE") {
        const res = await fetch("/api/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok && data.package) {
          showNotification("success", "Package created and published successfully!");
          setIsModalOpen(false);
          fetchPackages();
        } else {
          setFormError(data.error || "Failed to create package");
        }
      } else if (modalMode === "EDIT" && editingId) {
        const res = await fetch(`/api/packages/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok && data.package) {
          showNotification("success", "Package updated successfully!");
          setIsModalOpen(false);
          fetchPackages();
        } else {
          setFormError(data.error || "Failed to update package");
        }
      }
    } catch (err: any) {
      console.error(err);
      setFormError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (pkg: PackageItem) => {
    if (!confirm(`Are you sure you want to delete "${pkg.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("success", `Package "${pkg.title}" deleted.`);
        fetchPackages();
      } else {
        showNotification("error", data.error || "Failed to delete package");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Error connecting to delete API");
    }
  };

  const handleToggleStatus = async (pkg: PackageItem) => {
    const newStatus = pkg.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPackages((prev) =>
          prev.map((p) => (p.id === pkg.id ? { ...p, status: newStatus } : p))
        );
        showNotification("success", `Status changed to ${newStatus}`);
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const countries = ["ALL", ...Array.from(new Set(packages.map((p) => p.country)))];

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.visaType && pkg.visaType.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCountry = countryFilter === "ALL" || pkg.country === countryFilter;
    const matchesStatus = statusFilter === "ALL" || pkg.status === statusFilter;

    return matchesSearch && matchesCountry && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold backdrop-blur-lg ${
              notification.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/90 border-red-500/30 text-red-300"
            }`}
          >
            {notification.type === "success" ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-black uppercase tracking-widest mb-1">
            <FiGlobe /> Landing Page Setup
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Visa Packages Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Post and configure country visa packages with multi-currency pricing (USD, PKR, AFN), documents checklist, and shareable public links.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchPackages}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 cursor-pointer"
            title="Refresh packages"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-5 py-3 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-yellow-400/20 cursor-pointer"
          >
            <FiPlus size={18} /> Post New Package
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Packages</div>
          <div className="text-3xl font-black text-white mt-1">{packages.length}</div>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Published</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">
            {packages.filter((p) => p.status === "ACTIVE").length}
          </div>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Featured Highlights</div>
          <div className="text-3xl font-black text-yellow-400 mt-1">
            {packages.filter((p) => p.featured).length}
          </div>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Countries Covered</div>
          <div className="text-3xl font-black text-sky-400 mt-1">
            {new Set(packages.map((p) => p.country)).size}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search packages by title or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Country:</span>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-400 cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Countries" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-400 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Packages Table & List */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="py-24 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center mx-auto mb-4 text-xl">
              <FiGlobe />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Packages Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              {searchQuery || countryFilter !== "ALL" || statusFilter !== "ALL"
                ? "Try adjusting your filters or search terms."
                : "Get started by posting your first country visa package."}
            </p>
            <button
              onClick={openCreateModal}
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              + Post First Package
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Package & Country</th>
                  <th className="py-4 px-4">Agency Number</th>
                  <th className="py-4 px-4">Pricing (USD / PKR / AFN)</th>
                  <th className="py-4 px-4">Processing & Stay</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Package & Country */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-yellow-400/10 text-yellow-400 font-extrabold text-[10px] uppercase border border-yellow-400/20">
                              {pkg.country}
                            </span>
                            {pkg.featured && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-bold text-[10px] border border-purple-500/20 flex items-center gap-1">
                                <FiStar size={10} /> Featured
                              </span>
                            )}
                          </div>
                          <div className="text-white font-extrabold text-sm max-w-sm line-clamp-1">
                            {pkg.title}
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-2">
                            <span>{pkg.visaType || "Visa Service"}</span>
                            <span>•</span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              slug: {pkg.slug || pkg.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Agency Contact */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-300 font-mono">
                        <FiPhone className="text-yellow-400" />
                        <span>{pkg.agencyNumber}</span>
                      </div>
                    </td>

                    {/* Multi Currency Rates */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="text-emerald-400 font-bold">
                          USD: {pkg.priceUSD ? `$${pkg.priceUSD.toLocaleString()}` : "—"}
                        </div>
                        <div className="text-yellow-400">
                          PKR: {pkg.pricePKR ? `₨ ${pkg.pricePKR.toLocaleString()}` : "—"}
                        </div>
                        <div className="text-sky-400">
                          AFN: {pkg.priceAFN ? `؋ ${pkg.priceAFN.toLocaleString()}` : "—"}
                        </div>
                      </div>
                    </td>

                    {/* Processing & Stay */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-300">
                      <div>{pkg.processingTime || "Standard"}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{pkg.duration || "N/A"}</div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(pkg)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                          pkg.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pkg.status === "ACTIVE" ? "bg-emerald-400" : "bg-slate-500"}`} />
                        {pkg.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        
                        {/* Copy Link Button */}
                        <button
                          onClick={() => handleCopyLink(pkg)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
                          title="Copy public link to share"
                        >
                          {copiedId === pkg.id ? <FiCheck className="text-emerald-400" size={14} /> : <FiCopy size={14} />}
                        </button>

                        {/* View Public Page */}
                        <Link
                          href={`/packages/${pkg.slug || pkg.id}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-yellow-400 transition-colors border border-slate-700 cursor-pointer"
                          title="Open public package view"
                        >
                          <FiExternalLink size={14} />
                        </Link>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
                          title="Edit package details"
                        >
                          <FiEdit2 size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(pkg)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20 cursor-pointer"
                          title="Delete package"
                        >
                          <FiTrash2 size={14} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={22} />
              </button>

              <div className="mb-6">
                <span className="text-xs font-black text-yellow-400 uppercase tracking-widest block mb-1">
                  {modalMode === "CREATE" ? "New Visa Package" : "Modify Visa Package"}
                </span>
                <h2 className="text-2xl font-black text-white">
                  {modalMode === "CREATE" ? "Post New Travel Package" : `Edit "${formData.title}"`}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Fill in all package details. Rates in USD, PKR, and AFN will be available instantly to customers.
                </p>
              </div>

              {formError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold mb-6 flex items-center gap-2">
                  <FiAlertCircle className="shrink-0" size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dubai 30 Days Tourist Visa & Express Clearance"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                {/* Country & Visa Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Country *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. United Arab Emirates"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Visa Category / Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tourist Visa, Umrah Visa, Business"
                      value={formData.visaType}
                      onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                {/* Agency Contact Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Travel Agency Helpline / WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+92 334 5668667"
                    value={formData.agencyNumber}
                    onChange={(e) => setFormData({ ...formData, agencyNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Clients will call or WhatsApp this exact number when inquiring about this package.</p>
                </div>

                {/* Multi Currency Pricing Grid */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="text-xs font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FiDollarSign /> Package Price Details in 3 Currencies
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-400 uppercase mb-1">
                        🇺🇸 Price (USD $)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 199"
                        value={formData.priceUSD}
                        onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-yellow-400 uppercase mb-1">
                        🇵🇰 Price (PKR ₨)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 55000"
                        value={formData.pricePKR}
                        onChange={(e) => setFormData({ ...formData, pricePKR: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-sky-400 uppercase mb-1">
                        🇦🇫 Price (AFN ؋)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 14000"
                        value={formData.priceAFN}
                        onChange={(e) => setFormData({ ...formData, priceAFN: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration & Processing Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Stay Duration / Validity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 30 Days Stay, 60 Days Multiple"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Processing Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3-5 Working Days, 24 Hours Express"
                      value={formData.processingTime}
                      onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                {/* Description Detail */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Description Detail *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full details of the package, inclusions (e.g. e-visa fee, health insurance, hotel voucher, concierge assistance)..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                {/* Documents Requirement Detail */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Documents Requirement Detail * (Enter one per line)
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Original Passport (valid for at least 6 months)&#10;White background photograph (35x45mm)&#10;National ID Card / Tazkira copy&#10;Return flight itinerary"
                    value={formData.documents}
                    onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 resize-none font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Each line will automatically be formatted as a verified checklist item on the public page.</p>
                </div>

                {/* Cover Image (Local Computer Upload or URL) */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Package Cover Image (Optional)
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Upload an image from your computer or paste a direct image URL
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setImageInputMode("upload")}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          imageInputMode === "upload"
                            ? "bg-yellow-400 text-black shadow-sm font-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <FiUploadCloud className="inline mr-1" /> From Computer
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode("url")}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          imageInputMode === "url"
                            ? "bg-yellow-400 text-black shadow-sm font-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <FiImage className="inline mr-1" /> Paste URL
                      </button>
                    </div>
                  </div>

                  {/* Local Computer Upload Tab */}
                  {imageInputMode === "upload" ? (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                        id="package-image-upload"
                      />
                      <label
                        htmlFor="package-image-upload"
                        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                          uploadingImage
                            ? "border-yellow-400/60 bg-yellow-400/5 cursor-wait"
                            : "border-slate-700 hover:border-yellow-400/60 bg-slate-800/40 hover:bg-slate-800/80"
                        }`}
                      >
                        {uploadingImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <FiLoader className="animate-spin text-yellow-400 text-2xl" />
                            <span className="text-xs text-yellow-400 font-bold">
                              Uploading image from computer...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center text-xl">
                              <FiUploadCloud />
                            </div>
                            <div>
                              <span className="text-xs font-extrabold text-white">
                                Choose image file from your computer
                              </span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">
                                Supports PNG, JPG, JPEG, WEBP (Max 10MB)
                              </span>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                      />
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Paste any public image link (e.g. Unsplash, Cloudinary, or web URL)
                      </span>
                    </div>
                  )}

                  {/* Active Image Preview Card */}
                  {formData.image && (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={formData.image}
                          alt="Cover Preview"
                          className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-900"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                            ✓ Active Cover Image
                          </span>
                          <span className="text-xs text-white truncate block max-w-xs font-mono">
                            {formData.image}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors shrink-0 cursor-pointer border border-red-500/20"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Checkboxes & Status */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-yellow-400 focus:ring-yellow-400 bg-slate-900 border-slate-700"
                    />
                    <span>Highlight as Featured on Main Landing Page</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Status:</span>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-yellow-400 cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE (Published)</option>
                      <option value="INACTIVE">INACTIVE (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black transition-all shadow-lg shadow-yellow-400/20 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Saving Package..." : (modalMode === "CREATE" ? "Publish Package" : "Save Changes")}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
