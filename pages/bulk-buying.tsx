import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import {
  getAllAuctions,
  createAuction,
  submitBid,
  getComparativeStatement,
  generatePurchaseOrderPdf,
  getNearbyRegionalSuppliers,
  VerifiedSupplier,
  BulkAuction,
  MasterCatalogItem,
  fetchAdminMasterCatalog
} from '../utils/whatsappAuctionStore';

const UOM_LIST = ["BAGS", "TONNES", "CFT", "LOADS", "SQFT", "LTR", "NOS", "CUM", "KG"];

export default function BulkBuyingPage() {
  const [activeTab, setActiveTab] = useState<'rfq' | 'auction' | 'tabulation'>('rfq');

  const [buyerName, setBuyerName] = useState("M. Chinnappa Reddy (GM Materials)");
  const [buyerPhone, setBuyerPhone] = useState("+91 98450 99881");
  const [projectName, setProjectName] = useState("Godrej Vanantara & BuildMitra Development");
  const [pinCode, setPinCode] = useState("560068");
  const [fullAddress, setFullAddress] = useState("Plot 42, Green Glen Layout, Bellandur, Bengaluru - 560068");
  const [deliveryTimeline, setDeliveryTimeline] = useState("Tomorrow, by 11:00 AM");
  const [paymentTerms, setPaymentTerms] = useState("COD on Unloading");
  const [gateInstructions, setGateInstructions] = useState("Hydra crane unloading permitted at site entry gate.");
  const [radiusKm, setRadiusKm] = useState<number>(25.0);

  // Dynamic Admin Master Catalog State
  const [masterCatalog, setMasterCatalog] = useState<MasterCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);

  const [items, setItems] = useState([
    { id: 1, name: "UltraTech PPC Cement (50kg Bag)", brand: "UltraTech Cement", uom: "BAGS", qty: 500, targetRate: 365, category: "CEMENT" },
    { id: 2, name: "12mm TMT Steel Rebar (Tata Tiscon Fe550D)", brand: "Tata Tiscon", uom: "TONNES", qty: 10, targetRate: 58500, category: "TMT STEEL" }
  ]);

  const [statusMsg, setStatusMsg] = useState("");
  const [activeAuctionId, setActiveAuctionId] = useState<string>("BM-AUC-410");
  const [activeAuction, setActiveAuction] = useState<BulkAuction | null>(null);

  // Anti-collusion toggle
  const [maskedView, setMaskedView] = useState<boolean>(true);

  // Matched geofenced suppliers
  const [matchedSuppliers, setMatchedSuppliers] = useState<VerifiedSupplier[]>([]);

  // Simulation form
  const [simulatedBasicRate, setSimulatedBasicRate] = useState<string>("");
  const [simulatedSupplier, setSimulatedSupplier] = useState<string>("");

  // Comparative & PO State
  const [comparativeData, setComparativeData] = useState<any>(null);
  const [poResult, setPoResult] = useState<any>(null);
  const [showPoModal, setShowPoModal] = useState<boolean>(false);

  // Fetch Master Catalog Dynamically
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setCatalogLoading(true);
        const data = await fetchAdminMasterCatalog();
        if (isMounted) setMasterCatalog(data);
      } catch (e) {
        console.warn("Failed to load catalog:", e);
      } finally {
        if (isMounted) setCatalogLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Refresh auction from store
  const refreshActiveAuction = () => {
    const all = getAllAuctions();
    const found = all.find((a) => a.id.toLowerCase() === activeAuctionId.toLowerCase()) || all[0];
    if (found) {
      setActiveAuction({ ...found });
    }
  };

  useEffect(() => {
    refreshActiveAuction();
    const interval = setInterval(refreshActiveAuction, 1500);
    return () => clearInterval(interval);
  }, [activeAuctionId]);

  // Update matched suppliers when PIN code changes
  useEffect(() => {
    const categories = Array.from(new Set(items.map((it) => it.category || (it.name.includes("Cement") ? "CEMENT" : "TMT STEEL"))));
    const matched = getNearbyRegionalSuppliers(categories, pinCode, radiusKm, activeAuctionId);
    setMatchedSuppliers((prev) => {
      const prevMap = new Map(prev.map(s => [s.id, s.isSelected]));
      return matched.map(m => ({
        ...m,
        isSelected: prevMap.has(m.id) ? prevMap.get(m.id) : true
      }));
    });
  }, [pinCode, radiusKm, items, activeAuctionId]);

  const toggleSupplier = (id: string) => {
    setMatchedSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isSelected: s.isSelected === false ? true : false } : s))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setMatchedSuppliers((prev) => prev.map((s) => ({ ...s, isSelected: select })));
  };

  const selectedSuppliersCount = useMemo(() => {
    return matchedSuppliers.filter((s) => s.isSelected !== false).length;
  }, [matchedSuppliers]);

  // Tabulation load
  useEffect(() => {
    if (activeTab === "tabulation" && activeAuctionId) {
      const comp = getComparativeStatement(activeAuctionId, maskedView ? "supplier" : "buyer");
      setComparativeData(comp);
    }
  }, [activeTab, activeAuctionId, maskedView, activeAuction]);

  const handleAddItem = () => {
    const sample = masterCatalog[items.length % (masterCatalog.length || 1)] || {
      name: "UltraTech PPC Cement (50kg Bag)",
      itemName: "UltraTech PPC Cement (50kg Bag)",
      brand: "UltraTech",
      unit: "BAGS",
      benchmarkRate: 365,
      category: "CEMENT"
    };

    setItems([
      ...items,
      {
        id: Date.now(),
        name: sample.name || sample.itemName,
        brand: sample.brand || "Standard",
        uom: sample.unit || "BAGS",
        qty: sample.category === "TMT STEEL" ? 10 : 200,
        targetRate: sample.benchmarkRate || 365,
        category: sample.category || "CEMENT"
      }
    ]);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length === 1) {
      alert("At least one material item is required.");
      return;
    }
    setItems(items.filter((i) => i.id !== id));
  };

  const handleBroadcastRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode || !fullAddress || items.length === 0) {
      alert("Please fill in Delivery PIN Code, Full Site Address, and at least one item.");
      return;
    }

    const selectedList = matchedSuppliers.filter((s) => s.isSelected !== false);
    if (selectedList.length === 0) {
      alert("Please select at least one supplier from the recommendation grid to receive the RFQ broadcast.");
      return;
    }

    const created = createAuction({
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      site_address: fullAddress,
      site_pincode: pinCode,
      delivery_deadline: deliveryTimeline,
      payment_terms: paymentTerms,
      items: items.map((it) => ({
        id: `item-${it.id}`,
        material_category: it.category || (it.name.includes("Cement") ? "CEMENT" : "TMT STEEL"),
        specific_item: it.name,
        brand_preference: it.brand,
        grade: "Standard",
        quantity: it.qty,
        unit: it.uom,
        target_price: it.targetRate
      })),
      maxRadiusKm: radiusKm,
      selected_suppliers: selectedList,
      selected_supplier_ids: selectedList.map(s => s.id)
    });

    setActiveAuctionId(created.id);
    setActiveAuction(created);
    setStatusMsg(`🚀 RFQ Batch #${created.id} broadcasted via WhatsApp to ${matchedSuppliers.length} verified regional suppliers within ${radiusKm}km of PIN ${pinCode}!`);
    setActiveTab("auction");
  };

  const handleSimulateBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedBasicRate || !activeAuction) return;

    const basicNum = parseFloat(simulatedBasicRate);
    if (isNaN(basicNum) || basicNum <= 0) return;

    const matchedSup = matchedSuppliers.find((s) => s.companyName === simulatedSupplier || s.name === simulatedSupplier) || matchedSuppliers[0];
    const vendorName = matchedSup ? (matchedSup.companyName || matchedSup.name) : "Verified Regional Depot";
    const vendorPhone = matchedSup ? matchedSup.phone : "+91 98801 55443";

    const res = submitBid({
      auction_id: activeAuction.id,
      vendor_name: vendorName,
      vendor_phone: vendorPhone,
      basic_rate_per_unit: basicNum,
      gst_percent: activeAuction.material_category.includes("CEMENT") ? 28 : 18,
      freight_per_unit: 15,
      unloading_per_unit: 10,
      can_deliver_on_time: true
    });

    if (!res.success) {
      alert(res.error || "Bid rejected.");
      return;
    }

    setSimulatedBasicRate("");
    setStatusMsg(`⚡ Counter-quote accepted from ${res.bid?.masked_code_name}: ₹${res.bid?.total_landed_rate.toFixed(2)} (${res.rank} Rank).`);
    refreshActiveAuction();
  };

  const handleAwardPO = (bidId?: string) => {
    if (!activeAuction) return;
    try {
      const res = generatePurchaseOrderPdf(
        activeAuction.id,
        bidId,
        `BuildMitra Bulk PO for ${projectName} at ${fullAddress}.`
      );
      setPoResult(res);
      setShowPoModal(true);
      refreshActiveAuction();
    } catch (err: any) {
      alert("Error generating PO: " + err.message);
    }
  };

  const handleDownloadPdf = () => {
    if (!poResult?.pdf_base64) return;
    const byteCharacters = atob(poResult.pdf_base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `BuildMitra_PO_${poResult.po_number}.pdf`;
    link.click();
  };

  const totalBenchmarkValue = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.qty * curr.targetRate, 0);
  }, [items]);

  return (
    <>
      <Head>
        <title>BuildMitra | Bulk Buying & Automated Reverse Auction</title>
        <meta name="description" content="Live reverse auction and bulk buying procurement desk with WhatsApp broadcast and automated PO dispatch." />
      </Head>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 bg-slate-950 text-slate-100 min-h-screen font-sans">
        {/* HEADER NAVBAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                BuildMitra Procurement & B2B Desk
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Live Reverse Auction & WhatsApp Bulk Procurement
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-item admin catalog RFQs, 25km-50km geofenced supplier dispatch, X vs Y live descending bidding, and L1 tabulation.
            </p>
          </div>

          <div className="flex flex-wrap bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('rfq')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'rfq' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              📝 1. Bulk RFQ Form
            </button>
            <button
              onClick={() => setActiveTab('auction')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'auction' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ 2. Live Reverse Auction ({activeAuction?.bids.length || 0} Bids)
            </button>
            <button
              onClick={() => setActiveTab('tabulation')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'tabulation' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 3. L1/L2 Tabulation & PO
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-lg">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg("")} className="text-xs text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 10-Minute Warning Buzzer Alert */}
        {activeAuction?.is_ten_min_warning_active && (
          <div className="mb-6 p-3 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 rounded-xl text-white text-xs sm:text-sm font-black flex items-center justify-between shadow-lg animate-pulse">
            <span>⚡ 10-MINUTE FLASH WARNING: Auction #{activeAuction.id} closes soon! Current winning L1: ₹{activeAuction.current_l1_rate.toFixed(2)}/{activeAuction.unit}.</span>
            <span className="font-mono bg-black/40 px-2.5 py-1 rounded">Closing Soon</span>
          </div>
        )}

        {/* TAB 1: BULK RFQ FORM */}
        {activeTab === 'rfq' && (
          <form onSubmit={handleBroadcastRFQ} className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <span>👤</span> Buyer & Project Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Buyer / Procurement Officer Name *</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Project / Development Name *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <span>📋</span> Material Itemization (Admin Master Catalog)
                </h2>
                <span className="text-xs text-slate-400">Total Items: <strong className="text-white">{items.length}</strong></span>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="sm:col-span-1 text-xs font-bold text-slate-400 text-center">#{index + 1}</div>
                    <div className="sm:col-span-5">
                      <select
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[index].name = e.target.value;
                          const found = masterCatalog.find((m) => (m.name || m.itemName) === e.target.value);
                          if (found) {
                            updated[index].uom = found.unit || "BAGS";
                            updated[index].targetRate = found.benchmarkRate || 100;
                            updated[index].category = found.category || "GENERAL";
                            updated[index].brand = found.brand || "Standard";
                          }
                          setItems(updated);
                        }}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-semibold outline-none"
                      >
                        {masterCatalog.map((mat, i) => (
                          <option key={i} value={mat.name || mat.itemName}>
                            {mat.name || mat.itemName} [{mat.category}]
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={item.brand}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[index].brand = e.target.value;
                          setItems(updated);
                        }}
                        placeholder="Brand / Spec"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[index].qty = Number(e.target.value);
                          setItems(updated);
                        }}
                        className="w-16 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs text-center font-bold outline-none"
                      />
                      <select
                        value={item.uom}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[index].uom = e.target.value;
                          setItems(updated);
                        }}
                        className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] outline-none"
                      >
                        {UOM_LIST.map((u, i) => (
                          <option key={i} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg text-xs font-bold transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="mt-4 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl transition flex items-center gap-2"
              >
                <span>+</span> Add Another Material Item from Master Catalog
              </button>
            </div>

            {/* DELIVERY SITE & GEOFENCE RADIUS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <span>📍</span> Delivery Site Location & Geofenced 25km-50km Search Radius
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Delivery Site PIN Code *</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Search Radius</label>
                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                    className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                  >
                    <option value={25.0}>25 km Radius (Local Depot Area)</option>
                    <option value={35.0}>35 km Radius (Extended Belt)</option>
                    <option value={50.0}>50 km Radius (Regional Greater Hub)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Delivery Timeline</label>
                  <select
                    value={deliveryTimeline}
                    onChange={(e) => setDeliveryTimeline(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                  >
                    <option value="Tomorrow, by 11:00 AM">Tomorrow, by 11:00 AM (Priority)</option>
                    <option value="Within 24 Hours">Within 24 Hours</option>
                    <option value="Within 48 Hours">Within 48 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Full Site Delivery Address *</label>
                <input
                  type="text"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Commercial Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                  >
                    <option value="COD on Unloading">COD on Unloading (Physical Inspection)</option>
                    <option value="50% Advance / 50% Delivery">50% Advance / 50% on Delivery</option>
                    <option value="100% Advance via Escrow">100% Advance via Escrow</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Gate Instructions</label>
                  <input
                    type="text"
                    value={gateInstructions}
                    onChange={(e) => setGateInstructions(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* MATCHED GEOFENCED SUPPLIERS LIST WITH INTERACTIVE SELECTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <span>💬</span> Matched Regional Suppliers Within {radiusKm} km ({matchedSuppliers.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select suppliers to receive instant automated WhatsApp broadcasts with secure anonymous code names.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800">
                    {selectedSuppliersCount} of {matchedSuppliers.length} Selected
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(true)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(false)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-semibold transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {matchedSuppliers.map((sup, idx) => {
                  const isSelected = sup.isSelected !== false;
                  return (
                    <div
                      key={sup.id || idx}
                      onClick={() => toggleSupplier(sup.id)}
                      className={`cursor-pointer p-4 rounded-xl text-xs space-y-2 flex flex-col justify-between transition border ${
                        isSelected
                          ? "bg-slate-950/90 border-emerald-500/50 shadow-md shadow-emerald-500/5"
                          : "bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-80"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSupplier(sup.id)}
                              className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                              {sup.maskedCodeName || `Supplier-Alpha-${idx + 10}`}
                            </span>
                          </div>
                          <span className="text-emerald-400 font-bold text-xs">{sup.distanceKm ? `${sup.distanceKm} km` : "Nearby"}</span>
                        </div>
                        <p className="font-bold text-white text-sm mt-2">{sup.companyName || sup.name}</p>
                        <p className="text-slate-400 font-mono text-[11px]">{sup.phone} • PIN {sup.pincode || pinCode}</p>
                        
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-amber-400 font-bold">★ {sup.rating}</span>
                          <span className="text-emerald-400 font-semibold">{sup.fulfillmentRate || "98.5%"} On-Time</span>
                          <span>{sup.pastOrdersFulfilled || "180+"} Orders</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className={isSelected ? "text-emerald-400 font-bold" : "text-slate-500 font-semibold"}>
                          {isSelected ? "✓ Selected for Broadcast" : "Excluded"}
                        </span>
                        <span className="text-slate-500">WhatsApp API</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400">Estimated Total Benchmark Value:</span>
                <span className="text-lg font-black text-white ml-2">₹{totalBenchmarkValue.toLocaleString("en-IN")}</span>
              </div>

              <button
                type="submit"
                disabled={selectedSuppliersCount === 0}
                className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Launch Reverse Auction & Broadcast WhatsApp to {selectedSuppliersCount} Selected Suppliers
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: LIVE REVERSE AUCTION ROOM */}
        {activeTab === 'auction' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 uppercase tracking-widest border border-emerald-800">
                      Current Winning L1 Rate
                    </span>
                    <button
                      onClick={() => setMaskedView(!maskedView)}
                      className="text-[10px] text-amber-400 underline font-bold"
                    >
                      {maskedView ? "Show Real Names" : "Mask Anti-Collusion"}
                    </button>
                  </div>
                  <div className="text-4xl font-black text-emerald-400 mt-3">
                    ₹{activeAuction?.current_l1_rate.toFixed(2)}{' '}
                    <span className="text-xs text-slate-400 font-normal">/ {activeAuction?.unit}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    Leader:{' '}
                    <strong className="text-white">
                      {maskedView
                        ? (activeAuction?.bids[0]?.masked_code_name || "Supplier-Alpha-12")
                        : (activeAuction?.bids[0]?.vendor_name || "Awaiting quote")}
                    </strong>
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between font-mono">
                  <span>Reverse Clock:</span>
                  <span className="font-bold text-amber-400">{activeAuction?.formatted_countdown}</span>
                </div>
              </div>

              {/* Counter-Bid Submission Form */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-2">⚡ Simulate Live Supplier Undercut Quote</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Test live descending prices. Anti-collusion engine automatically assigns masked code names.
                </p>
                <form onSubmit={handleSimulateBid} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={simulatedSupplier}
                    onChange={(e) => setSimulatedSupplier(e.target.value)}
                    className="p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                  >
                    <option value="">Select a supplier...</option>
                    {matchedSuppliers.map((s, i) => (
                      <option key={i} value={s.companyName || s.name}>
                        {s.companyName || s.name} ({s.maskedCodeName})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.5"
                    placeholder={`Lower basic rate (< ₹${activeAuction?.bids[0]?.basic_rate_per_unit || 250})`}
                    value={simulatedBasicRate}
                    onChange={(e) => setSimulatedBasicRate(e.target.value)}
                    className="p-3 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono text-xs font-bold outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-3 rounded-xl shadow transition"
                  >
                    Submit Undercut Quote
                  </button>
                </form>
              </div>
            </div>

            {/* LIVE FEED TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4">
                📊 Live Competing Quotes Leaderboard (Ranked Descending)
              </h3>
              <div className="space-y-3">
                {activeAuction?.bids.map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      idx === 0 ? "bg-emerald-950/30 border-emerald-800" : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-black ${
                          idx === 0 ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {b.rank || `L${idx + 1}`}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {maskedView ? (b.masked_code_name || `Supplier-${idx + 1}`) : b.vendor_name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Basic: ₹{b.basic_rate_per_unit} • Freight + Hamali: ₹{b.freight_per_unit + b.unloading_per_unit} • Round {b.attempt_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-400">₹{b.total_landed_rate.toFixed(2)}</span>
                        <div className="text-[10px] text-slate-500">Total: ₹{b.total_order_value.toLocaleString("en-IN")}</div>
                      </div>
                      <button
                        onClick={() => handleAwardPO(b.bid_id)}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition"
                      >
                        Award PO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TABULATION & PO DISPATCH */}
        {activeTab === 'tabulation' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">📊 Final L1, L2, L3 Tabulation & Purchase Order Dispatch</h2>
                <p className="text-xs text-slate-400">
                  Project: <strong className="text-white">{projectName}</strong> | Site: <strong className="text-white">{fullAddress}</strong>
                </p>
              </div>

              <button
                onClick={() => handleAwardPO()}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition"
              >
                📄 Issue L1 Purchase Order (PO)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">Basic Rate</th>
                    <th className="p-3">GST</th>
                    <th className="p-3">Freight & Hamali</th>
                    <th className="p-3">Landed Rate</th>
                    <th className="p-3">Total Order Value</th>
                    <th className="p-3 text-right">PO Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(comparativeData?.comparative_statement || []).map((row: any, idx: number) => (
                    <tr key={idx} className={row.is_l1 ? "bg-emerald-950/20 font-bold" : ""}>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px]">
                          {row.rank}
                        </span>
                      </td>
                      <td className="p-3 text-white">{row.vendor_name}</td>
                      <td className="p-3 font-mono">₹{row.basic_rate_per_unit.toFixed(2)}</td>
                      <td className="p-3 font-mono">₹{row.gst_amount.toFixed(2)}</td>
                      <td className="p-3 font-mono">₹{(row.freight_per_unit + row.unloading_per_unit).toFixed(2)}</td>
                      <td className="p-3 text-emerald-400 font-black text-sm">₹{row.total_landed_rate.toFixed(2)}</td>
                      <td className="p-3 font-mono text-white">₹{row.total_order_value.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleAwardPO(row.bid_id)}
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-xs shadow"
                        >
                          Award PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PO MODAL */}
        {showPoModal && poResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 my-6 max-h-[92vh] overflow-y-auto">
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                    📄
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Official Purchase Order Generated & Transmitted</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      PO Reference: <strong className="text-emerald-400">{poResult.po_number}</strong> • Status: <strong className="text-emerald-400">OFFICIALLY ISSUED (L1 AWARDED)</strong>
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowPoModal(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
              </div>

              {/* DOCUMENT BODY */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
                {/* 1. Official Header & Logo Branding */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src="/buildmitra-logo.png"
                      alt="BuildMitra"
                      className="h-10 w-auto object-contain rounded bg-white/10 p-1"
                      onError={(e: any) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <div className="font-black text-white text-base tracking-wide">BUILDMITRA INFRA TECH PRIVATE LIMITED</div>
                      <div className="text-[11px] text-sky-400 font-semibold">B2B Digital Materials Procurement & Live Reverse Auction Engine</div>
                      <div className="text-[10px] text-slate-400">CIN: U74999KA2025PTC189211 • GSTIN: 29AAGCB1234F1Z1 • Bellandur, Bengaluru</div>
                    </div>
                  </div>

                  <div className="text-right bg-slate-900 border border-slate-700 p-2.5 rounded-xl font-mono">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">PO Number</div>
                    <div className="text-emerald-400 font-black text-sm">{poResult.po_number}</div>
                    <div className="text-slate-400 text-[10px]">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* 2. Complete "From" and "To" Address Blocks with GSTIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">ISSUED BY / BUYER (CONSIGNOR / BILL TO):</span>
                    <div className="font-bold text-white text-xs">{poResult.po_details?.buyer_name || 'M. Chinnappa Reddy (GM Materials)'}</div>
                    <div className="text-sky-400 font-mono text-[11px]">Buyer GSTIN: 29AAGCB1234F1Z1</div>
                    <div className="text-slate-400">Contact: {poResult.po_details?.buyer_phone || '+91 98450 99881'}</div>
                    <div className="text-slate-400">Delivery Site: {poResult.po_details?.delivery_address}</div>
                    <div className="text-emerald-400 font-mono font-bold">Site PIN Code: {poResult.po_details?.site_pincode}</div>
                  </div>

                  <div className="p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-900/60 space-y-1">
                    <span className="text-emerald-400 uppercase font-bold text-[10px] tracking-wider">AWARDED L1 SUPPLIER (VENDOR / DISPATCH TO):</span>
                    <div className="font-bold text-white text-xs">{poResult.po_details?.vendor_name}</div>
                    <div className="text-emerald-300 font-mono text-[11px] font-bold">Verified GSTIN: {poResult.po_details?.vendor_gst || '29AAACJ1234H1Z5'}</div>
                    <div className="text-slate-300">Registered Phone: {poResult.po_details?.vendor_phone}</div>
                    <div className="text-slate-400">Depot: {poResult.po_details?.vendor_address || 'Regional Depot, Bengaluru'}</div>
                    <div className="text-emerald-400 font-mono text-[11px]">Auction Code Ref: {poResult.po_details?.masked_code_name || 'Supplier-Alpha-12'} (L1 Winner)</div>
                  </div>
                </div>

                {/* 3. Material Details Table */}
                <div>
                  <div className="text-[11px] font-bold text-slate-300 uppercase mb-1.5">Material Details & Landed Value Breakdown</div>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-900 text-slate-300 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="p-2.5">Item Description</th>
                          <th className="p-2.5 text-center">HSN/SAC</th>
                          <th className="p-2.5 text-center">Quantity</th>
                          <th className="p-2.5 text-right">Landed Rate / Unit</th>
                          <th className="p-2.5 text-right">Total Order Value (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr>
                          <td className="p-2.5 text-white font-medium">
                            {poResult.po_details?.material}
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-400">
                            {poResult.po_details?.material?.toUpperCase().includes('CEMENT') ? '252329' : '721420'}
                          </td>
                          <td className="p-2.5 text-center font-mono text-white font-bold">
                            {poResult.po_details?.quantity} {poResult.po_details?.unit}
                          </td>
                          <td className="p-2.5 text-right font-mono text-emerald-400 font-bold">
                            ₹{poResult.po_details?.landed_rate?.toFixed(2)} / {poResult.po_details?.unit}
                          </td>
                          <td className="p-2.5 text-right font-mono text-white font-black text-sm">
                            ₹{poResult.po_details?.total_order_value?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Explicit Loading & Unloading Terms */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-sky-400 text-[11px] uppercase">1. Explicit Loading & Unloading Terms</div>
                  <ul className="text-slate-300 space-y-0.5 text-[11px] list-disc list-inside">
                    <li><strong>Loading Responsibility:</strong> Factory / depot mechanized loading onto transit trucks executed fully by Supplier at their sole cost.</li>
                    <li><strong>Unloading & Stacking Scope:</strong> Material offloading and safe stacking at delivery site gate executed by Supplier&apos;s verified Hamali team / Hydra crane. Buyer facilitates site entry and clear access.</li>
                    <li><strong>Transit Risk & Weighbridge:</strong> In-transit commercial insurance covered by Supplier until safe physical offloading. Computerized weighbridge gross/tare slip mandatory.</li>
                  </ul>
                </div>

                {/* 5. Commercial Payment Terms & Delivery Schedule */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-sky-400 text-[11px] uppercase">2. Commercial Payment Terms & Delivery Schedule</div>
                  <ul className="text-slate-300 space-y-0.5 text-[11px] list-disc list-inside">
                    <li><strong>Payment Terms:</strong> {poResult.po_details?.payment_terms || 'COD on Unloading'}. Released within 24 hours of physical gate inspection.</li>
                    <li><strong>Delivery Schedule:</strong> Strict site delivery by <strong>{poResult.po_details?.delivery_deadline || 'Tomorrow by 11:00 AM'}</strong>. Time is of the essence.</li>
                    <li><strong>Quality Benchmark:</strong> 100% fresh ISI factory stock with Manufacturer Test Certificate (MTC) conforming to relevant IS standards.</li>
                  </ul>
                </div>

                {/* 6. Standard Terms & Conditions */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-sky-400 text-[11px] uppercase">3. Standard Legal Terms & Conditions</div>
                  <ul className="text-slate-300 space-y-0.5 text-[11px] list-disc list-inside">
                    <li><strong>Jurisdiction:</strong> Governed by laws of India. Courts in Bengaluru, Karnataka have exclusive jurisdiction.</li>
                    <li><strong>Defect Liability Period:</strong> 12 months against manufacturing defects or caking. Replacement within 24 hours at Supplier&apos;s cost.</li>
                    <li><strong>Liquidated Damages (LD):</strong> Delayed supply incurs LD @ 0.5% per calendar day of delay up to a maximum of 5.0% of PO value.</li>
                  </ul>
                </div>

                {/* 7. Authorized Signatory Block & Supplier Acceptance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Issued & Digitally Verified By:</div>
                    <div className="font-bold text-emerald-400 mt-1">✔ BUILDMITRA PROCUREMENT DESK</div>
                    <div className="text-[10px] text-slate-400 font-mono">Timestamp: {new Date().toISOString()}</div>
                    <div className="mt-4 pt-2 border-t border-slate-700 text-[10px] text-slate-400">Authorized Digital Seal & Signatory</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Confirmed & Accepted By Supplier:</div>
                    <div className="font-bold text-emerald-400 mt-1">✔ {poResult.po_details?.vendor_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">GSTIN: {poResult.po_details?.vendor_gst || '29AAACJ1234H1Z5'}</div>
                    <div className="mt-4 pt-2 border-t border-slate-700 text-[10px] text-slate-400">Supplier Commercial Acceptance Stamp</div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <span>✅</span>
                  <span>
                    Official PO PDF automatically dispatched via WhatsApp to <strong>{poResult.po_details?.vendor_phone}</strong> and recorded in Buyer procurement ledger.
                  </span>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
                <button
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  Close Preview
                </button>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?phone=${poResult.po_details?.vendor_phone?.replace(/\D/g, "")}&text=${encodeURIComponent(`🎉 Official BuildMitra Purchase Order #${poResult.po_number} awarded for ${poResult.po_details?.material}. Agreed Rate: ₹${poResult.po_details?.landed_rate}/unit.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                  >
                    <span>📱 View in WhatsApp</span>
                  </a>
                  <button
                    onClick={handleDownloadPdf}
                    className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs font-bold shadow"
                  >
                    ⬇️ Download Official Stamped PO (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
