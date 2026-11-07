import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Head from "next/head";
import {
  BulkAuction,
  AuctionBid,
  VerifiedSupplier,
  getAllAuctions,
  getAuctionById,
  createAuction,
  submitBid,
  getComparativeStatement,
  generatePurchaseOrderPdf,
  getNearbyRegionalSuppliers,
  getWorkerNotifications,
  WorkerNotification,
  CODE_NAME_ALPHABETS,
  MasterCatalogItem,
  fetchAdminMasterCatalog
} from "../utils/whatsappAuctionStore";

const UOM_OPTIONS = ["BAGS", "TONNES", "CFT", "LOADS", "SQFT", "NOS", "CUM", "KG"];

export default function LiveReverseAuctionPage() {
  const [activeTab, setActiveTab] = useState<"rfq" | "live" | "tabulation">("live");

  // Global Auctions List and Active Auction
  const [auctions, setAuctions] = useState<BulkAuction[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>("BM-AUC-410");
  const [activeAuction, setActiveAuction] = useState<BulkAuction | null>(null);

  // Anti-collusion view toggle: 'supplier' (masked code names) vs 'buyer' (verified profiles)
  const [viewRole, setViewRole] = useState<"supplier" | "buyer">("supplier");

  // 10-Minute Warning Buzzer Alarm State
  const [isBuzzerActive, setIsBuzzerActive] = useState<boolean>(false);
  const [buzzerAudioMuted, setBuzzerAudioMuted] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // RFQ Form State
  const [buyerName, setBuyerName] = useState("M. Chinnappa Reddy (GM Materials)");
  const [buyerPhone, setBuyerPhone] = useState("+91 98450 99881");
  const [sitePincode, setSitePincode] = useState("560068");
  const [siteAddress, setSiteAddress] = useState("Plot 42, Green Glen Layout, Bellandur, Bengaluru");
  const [deliveryDeadline, setDeliveryDeadline] = useState("Tomorrow, by 11:00 AM");
  const [paymentTerms, setPaymentTerms] = useState("COD on Unloading");
  const [radiusKm, setRadiusKm] = useState<number>(25.0);

  // RFQ Multi-Item Lines
  const [rfqItems, setRfqItems] = useState([
    {
      id: "item-1",
      material_category: "CEMENT",
      specific_item: "UltraTech PPC Cement (50kg Bag)",
      brand_preference: "UltraTech Cement",
      grade: "PPC",
      quantity: 500,
      unit: "BAGS",
      target_price: 365
    }
  ]);

  // Geofenced Supplier Matching Preview & Interactive Selection
  const [geofencedSuppliers, setGeofencedSuppliers] = useState<VerifiedSupplier[]>([]);

  // Dynamic Master Catalog state from Admin Master Database
  const [masterCatalog, setMasterCatalog] = useState<MasterCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>("ALL");
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>("");

  // WhatsApp Broadcast Modal & Worker Logs
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [latestBroadcastPayload, setLatestBroadcastPayload] = useState<any>(null);
  const [notifications, setNotifications] = useState<WorkerNotification[]>([]);

  // Live Reverse Auction Counter-Bid Form
  const [bidSupplierName, setBidSupplierName] = useState("");
  const [bidBasicRate, setBidBasicRate] = useState("");
  const [bidFreight, setBidFreight] = useState("15");
  const [bidUnloading, setBidUnloading] = useState("10");
  const [bidGstPercent, setBidGstPercent] = useState("28");
  const [bidMessage, setBidMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tabulation & PO Generation State
  const [comparativeData, setComparativeData] = useState<any>(null);
  const [poGenerated, setPoGenerated] = useState<any>(null);
  const [poLoading, setPoLoading] = useState<boolean>(false);
  const [showPoModal, setShowPoModal] = useState<boolean>(false);

  // High-precision Millisecond Clock
  const [clockTick, setClockTick] = useState<number>(Date.now());

  // Fetch Admin Master Items Catalogue Dynamically
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setCatalogLoading(true);
      try {
        const items = await fetchAdminMasterCatalog();
        if (isMounted) {
          setMasterCatalog(items);
        }
      } catch (err) {
        console.warn("Failed to load dynamic master catalog:", err);
      } finally {
        if (isMounted) setCatalogLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Derived Dynamic Categories from Admin Master Items
  const catalogCategories = useMemo(() => {
    const cats = new Set<string>();
    masterCatalog.forEach((item) => {
      if (item.category) cats.add(item.category.toUpperCase());
    });
    return Array.from(cats).sort();
  }, [masterCatalog]);

  // Filtered Catalog Items based on Category & Search
  const filteredCatalogItems = useMemo(() => {
    return masterCatalog.filter((item) => {
      const matchCat = selectedCatalogCategory === "ALL" || item.category.toUpperCase() === selectedCatalogCategory.toUpperCase();
      const matchSearch = !catalogSearchQuery ||
        item.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        item.specification.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        item.masterItemCode.toLowerCase().includes(catalogSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [masterCatalog, selectedCatalogCategory, catalogSearchQuery]);

  // Initialize and load auctions
  const refreshAuctions = useCallback(() => {
    const all = getAllAuctions();
    setAuctions(all);

    const current = all.find((a) => a.id.toLowerCase() === selectedAuctionId.toLowerCase()) || all[0];
    if (current) {
      setActiveAuction({ ...current });
      setIsBuzzerActive(Boolean(current.is_ten_min_warning_active));
    }
    setNotifications(getWorkerNotifications(selectedAuctionId));
  }, [selectedAuctionId]);

  useEffect(() => {
    refreshAuctions();
  }, [refreshAuctions]);

  // Live Polling / Timer Heartbeat (High-Precision 1000ms clock)
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(Date.now());
      refreshAuctions();
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshAuctions]);

  // Dynamic Geofence Supplier Matching on PIN Code, Radius, or Categories
  useEffect(() => {
    const categories = Array.from(new Set(rfqItems.map((i) => i.material_category)));
    const matched = getNearbyRegionalSuppliers(categories.length ? categories : ["CEMENT"], sitePincode, radiusKm);
    
    // Preserve selection states
    setGeofencedSuppliers((prev) => {
      const prevSelectedMap = new Map(prev.map((s) => [s.id, s.isSelected]));
      return matched.map((m) => ({
        ...m,
        isSelected: prevSelectedMap.has(m.id) ? prevSelectedMap.get(m.id) : true
      }));
    });
  }, [sitePincode, radiusKm, rfqItems]);

  // Toggle individual supplier selection in the recommendation grid
  const toggleSupplierSelection = (id: string) => {
    setGeofencedSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isSelected: s.isSelected === false ? true : false } : s))
    );
  };

  // Select all or deselect all suppliers
  const handleSelectAllSuppliers = (selectAll: boolean) => {
    setGeofencedSuppliers((prev) => prev.map((s) => ({ ...s, isSelected: selectAll })));
  };

  const selectedSuppliersCount = useMemo(() => {
    return geofencedSuppliers.filter((s) => s.isSelected !== false).length;
  }, [geofencedSuppliers]);

  // Refresh comparative statement when Tabulation is clicked
  useEffect(() => {
    if (activeTab === "tabulation" && selectedAuctionId) {
      const comp = getComparativeStatement(selectedAuctionId, viewRole);
      setComparativeData(comp);
    }
  }, [activeTab, selectedAuctionId, viewRole, clockTick]);

  // Synthesize Web Audio Warning Buzzer (Pure Web Audio API - Zero Asset Dependency)
  const playBuzzerChime = useCallback(() => {
    if (buzzerAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 high note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3); // Drop to A4
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio not permitted without user gesture
    }
  }, [buzzerAudioMuted]);

  // Trigger sound when 10-minute warning becomes active
  useEffect(() => {
    if (isBuzzerActive && !buzzerAudioMuted) {
      playBuzzerChime();
    }
  }, [isBuzzerActive, buzzerAudioMuted, playBuzzerChime]);

  // Manual 10-Minute Warning Trigger (Demonstration & Verification)
  const handleTriggerWarningBuzzer = () => {
    if (!activeAuction) return;
    activeAuction.ends_at = Date.now() + 1000 * 60 * 9.5; // Set to 9m 30s remaining
    activeAuction.is_ten_min_warning_active = true;
    setIsBuzzerActive(true);
    playBuzzerChime();
    refreshAuctions();
  };

  // RFQ Item Management from Dynamic Master Catalog
  const handleAddRfqItem = (catalogItem: MasterCatalogItem) => {
    const newItem = {
      id: `item-${Date.now()}`,
      material_category: catalogItem.category,
      specific_item: catalogItem.name,
      brand_preference: catalogItem.brand,
      grade: catalogItem.grade || catalogItem.specification || "Standard Grade",
      quantity: catalogItem.category === "TMT STEEL" ? 10 : (catalogItem.category === "RMC" ? 25 : 200),
      unit: catalogItem.unit,
      target_price: catalogItem.benchmarkRate
    };
    setRfqItems([...rfqItems, newItem]);
  };

  const handleRemoveRfqItem = (idx: number) => {
    if (rfqItems.length === 1) {
      alert("At least one line item is required for the RFQ.");
      return;
    }
    setRfqItems(rfqItems.filter((_, i) => i !== idx));
  };

  // Launch RFQ Batch & Automated WhatsApp Dispatch to Selected Suppliers
  const handleLaunchRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sitePincode || rfqItems.length === 0) {
      alert("Please provide delivery site PIN code and at least one item.");
      return;
    }

    const selectedList = geofencedSuppliers.filter((s) => s.isSelected !== false);
    if (selectedList.length === 0) {
      alert("Please select at least one verified supplier from the recommendation grid to receive the automated RFQ broadcast.");
      return;
    }

    const created = createAuction({
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      site_address: siteAddress,
      site_pincode: sitePincode,
      delivery_deadline: deliveryDeadline,
      payment_terms: paymentTerms,
      items: rfqItems,
      maxRadiusKm: radiusKm,
      selected_suppliers: selectedList,
      selected_supplier_ids: selectedList.map((s) => s.id)
    });

    setSelectedAuctionId(created.id);
    setActiveAuction(created);
    setLatestBroadcastPayload({
      batchCode: created.id,
      pincode: sitePincode,
      suppliers: selectedList,
      items: rfqItems
    });
    setShowBroadcastModal(true);
    setActiveTab("live");
    refreshAuctions();
  };

  // Calculate live countdown timer numbers
  const countdownDetails = useMemo(() => {
    if (!activeAuction) return { hours: 0, mins: 0, secs: 0, ms: 0, percentRemaining: 100 };
    const diff = activeAuction.ends_at - clockTick;
    if (diff <= 0) return { hours: 0, mins: 0, secs: 0, ms: 0, percentRemaining: 0 };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    const ms = Math.floor((diff % 1000) / 100);

    const totalDuration = activeAuction.ends_at - activeAuction.created_at;
    const percentRemaining = Math.max(0, Math.min(100, (diff / totalDuration) * 100));

    return { hours, mins, secs, ms, percentRemaining };
  }, [activeAuction, clockTick]);

  // Live Counter-Bid Submission
  const handleCounterBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBidMessage(null);
    if (!activeAuction) return;

    const basic = parseFloat(bidBasicRate);
    if (isNaN(basic) || basic <= 0) {
      setBidMessage({ type: "error", text: "Please enter a valid basic ex-factory rate per unit." });
      return;
    }

    const matchedSupplier = geofencedSuppliers.find(
      (s) => s.companyName === bidSupplierName || s.name === bidSupplierName || s.maskedCodeName === bidSupplierName
    );

    const vendorName = matchedSupplier ? (matchedSupplier.companyName || matchedSupplier.name) : (bidSupplierName || "Regional Supplier");
    const vendorPhone = matchedSupplier ? matchedSupplier.phone : "+91 98801 55443";

    const res = submitBid({
      auction_id: activeAuction.id,
      vendor_name: vendorName,
      vendor_phone: vendorPhone,
      basic_rate_per_unit: basic,
      freight_per_unit: parseFloat(bidFreight) || 15,
      unloading_per_unit: parseFloat(bidUnloading) || 10,
      gst_percent: parseFloat(bidGstPercent) || 28,
      can_deliver_on_time: true
    });

    if (!res.success) {
      setBidMessage({ type: "error", text: res.error || "Bid submission failed." });
      return;
    }

    setBidMessage({
      type: "success",
      text: `🎉 Quote Accepted! Landed Rate: ₹${res.bid?.total_landed_rate.toFixed(2)} (${res.rank} Rank). Current winning L1 is now updated.`
    });

    setBidBasicRate("");
    playBuzzerChime();
    refreshAuctions();
  };

  // One-Click Purchase Order Generation
  const handleAwardL1Po = (bidId?: string) => {
    if (!activeAuction) return;
    try {
      setPoLoading(true);
      const res = generatePurchaseOrderPdf(
        activeAuction.id,
        bidId,
        `BuildMitra Zero-Touch Reverse Auction PO for ${activeAuction.specific_item}. Dispatched to winning L1 supplier.`
      );
      setPoGenerated(res);
      setShowPoModal(true);
      refreshAuctions();
    } catch (err: any) {
      alert("Error generating PO: " + err.message);
    } finally {
      setPoLoading(false);
    }
  };

  // Download PDF PO Trigger
  const handleDownloadPoPdf = () => {
    if (!poGenerated?.pdf_base64) return;
    const byteCharacters = atob(poGenerated.pdf_base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `BuildMitra_PO_${poGenerated.po_number}.pdf`;
    link.click();
  };

  return (
    <>
      <Head>
        <title>BuildMitra | Live Reverse Auction & Automated RFQ Procurement Engine</title>
        <meta name="description" content="Global standard B2B procurement engine: 25km-50km geofenced PIN code matching, real-time descending reverse auctions, anonymous code-name anti-collusion masking, 10-minute warning buzzer, L1 comparative statements, and automated PO generation." />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-16 selection:bg-emerald-500 selection:text-slate-950">
        {/* TOP LIVE STRIP & ALERT BUZZER */}
        <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-black tracking-wider text-emerald-400 uppercase">
                BuildMitra Procurement Cloud
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden sm:inline text-slate-400">
                Industry-Standard Reverse Auction & Automated RFQ Engine (SAP Ariba / ProcurePort Tier)
              </span>
            </div>

            {/* Auction Switcher & Confidentiality Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-slate-400 font-medium hidden md:inline">Auction ID:</label>
              <select
                value={selectedAuctionId}
                onChange={(e) => setSelectedAuctionId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-emerald-400 font-mono font-bold outline-none cursor-pointer"
              >
                {auctions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} • {a.specific_item.slice(0, 24)}... (L1: ₹{a.current_l1_rate})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setViewRole(viewRole === "supplier" ? "buyer" : "supplier")}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  viewRole === "supplier"
                    ? "bg-amber-950/60 border-amber-600 text-amber-300"
                    : "bg-emerald-950/60 border-emerald-600 text-emerald-300"
                }`}
                title="Toggle between Anonymous Anti-Collusion View and Verified Buyer/Admin View"
              >
                {viewRole === "supplier" ? "🔒 Anti-Collusion Mode (Masked)" : "🔓 Verified Buyer View"}
              </button>
            </div>
          </div>
        </div>

        {/* 10-MINUTE FLASH WARNING BANNER */}
        {isBuzzerActive && (
          <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white px-4 py-2.5 text-center font-black text-xs sm:text-sm tracking-wide shadow-lg animate-pulse flex items-center justify-center gap-3">
            <span>⚡ URGENT 10-MINUTE WARNING BUZZER:</span>
            <span>
              Reverse Auction #{activeAuction?.id} closes in less than 10 minutes! Current L1 Benchmark: ₹{activeAuction?.current_l1_rate.toFixed(2)}/{activeAuction?.unit}.
            </span>
            <button
              onClick={() => setBuzzerAudioMuted(!buzzerAudioMuted)}
              className="px-2 py-0.5 rounded bg-black/40 hover:bg-black/60 text-xs font-bold transition ml-2"
            >
              {buzzerAudioMuted ? "🔇 Unmute Alarm" : "🔊 Mute Alarm"}
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          {/* MAIN HEADER WITH NAVIGATION TABS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  Live Reverse Auction Active
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Site PIN: {activeAuction?.site_pincode || "560068"} (25-50km Radius Match)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeAuction?.specific_item || "Bulk Procurement Demand"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Real-time descending supplier quotes, anonymous code-name masking, geofenced automated WhatsApp broadcast, and instant L1, L2, L3 purchase order award.
              </p>
            </div>

            {/* TAB SELECTOR BUTTONS */}
            <div className="flex flex-wrap bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-1 self-stretch lg:self-auto">
              <button
                onClick={() => setActiveTab("rfq")}
                className={`flex-1 lg:flex-none px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "rfq"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>📝</span> 1. Geofenced RFQ Launch
              </button>
              <button
                onClick={() => setActiveTab("live")}
                className={`flex-1 lg:flex-none px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "live"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>⚡</span> 2. Live Reverse Auction Room
              </button>
              <button
                onClick={() => setActiveTab("tabulation")}
                className={`flex-1 lg:flex-none px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "tabulation"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>📊</span> 3. L1/L2 Tabulation & Auto-PO
              </button>
            </div>
          </div>

          {/* TAB 1: GEOFENCED PIN CODE SUPPLIER MATCHING & RFQ AUTOMATION */}
          {activeTab === "rfq" && (
            <div className="space-y-6 animate-fadeIn">
              <form onSubmit={handleLaunchRfq} className="space-y-6">
                {/* BUYER & DELIVERY SITE DETAILS */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>📍</span> Delivery Site PIN Code & Geofenced Radius Matching
                    </h2>
                    <span className="text-xs text-emerald-400 font-mono">
                      Radius: <strong>{radiusKm} km</strong> (Haversine Matrix)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Delivery Site PIN Code *
                      </label>
                      <input
                        type="text"
                        value={sitePincode}
                        onChange={(e) => setSitePincode(e.target.value)}
                        placeholder="e.g. 560068"
                        className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono font-bold focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Supplier Search Radius
                      </label>
                      <select
                        value={radiusKm}
                        onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                        className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none"
                      >
                        <option value={25.0}>25 km Radius (Hyper-Local Construction Hub)</option>
                        <option value={35.0}>35 km Radius (Expanded Suburban Belt)</option>
                        <option value={50.0}>50 km Radius (Greater Regional Logistics Hub)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Delivery Timeline
                      </label>
                      <select
                        value={deliveryDeadline}
                        onChange={(e) => setDeliveryDeadline(e.target.value)}
                        className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm outline-none"
                      >
                        <option value="Tomorrow, by 11:00 AM">Tomorrow, by 11:00 AM (Priority)</option>
                        <option value="Within 24 Hours">Within 24 Hours</option>
                        <option value="Within 48 Hours">Within 48 Hours</option>
                        <option value="Within 7 Days">Scheduled (Within 7 Days)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Full Delivery Site Address *
                      </label>
                      <input
                        type="text"
                        value={siteAddress}
                        onChange={(e) => setSiteAddress(e.target.value)}
                        className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Commercial Payment Terms
                      </label>
                      <select
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                      >
                        <option value="COD on Unloading">Cash on Delivery (COD on Physical Unloading)</option>
                        <option value="50% Advance / 50% on Unloading">50% Advance / 50% on Site Unloading</option>
                        <option value="100% Advance via Escrow">100% Advance via BuildMitra Escrow</option>
                        <option value="15-Day Net Credit">15-Day Verified Builder Credit Line</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* MATCHED GEOFENCED SUPPLIERS PREVIEW & INTERACTIVE SELECTION GRID */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>📡</span> Geofenced Regional Suppliers ({geofencedSuppliers.length} Matched within {radiusKm} km)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Verified active suppliers filtered by delivery PIN <strong>{sitePincode}</strong>. Review and select suppliers to receive the instant automated WhatsApp RFQ broadcast.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800">
                        {selectedSuppliersCount} of {geofencedSuppliers.length} Selected
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllSuppliers(true)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAllSuppliers(false)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-semibold transition"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {geofencedSuppliers.map((sup, idx) => {
                      const isSelected = sup.isSelected !== false;
                      return (
                        <div
                          key={sup.id || idx}
                          onClick={() => toggleSupplierSelection(sup.id)}
                          className={`cursor-pointer rounded-xl p-4 transition border flex flex-col justify-between ${
                            isSelected
                              ? "bg-slate-950/90 border-emerald-500/50 shadow-md shadow-emerald-500/5"
                              : "bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-80"
                          }`}
                        >
                          <div>
                            {/* Card Top: Checkbox + Anonymous Mask + Proximity */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSupplierSelection(sup.id)}
                                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                                  {sup.maskedCodeName || `Supplier-Alpha-${idx + 10}`}
                                </span>
                              </div>
                              <span className="text-emerald-400 font-bold text-xs font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                                {sup.distanceKm ? `${sup.distanceKm} km away` : "Nearby"}
                              </span>
                            </div>

                            {/* Supplier Name & Verification */}
                            <div className="font-bold text-white text-sm">
                              {viewRole === "buyer" ? (sup.companyName || sup.name) : (sup.maskedCodeName || "Verified Regional Depot")}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                              <span>PIN: {sup.pincode || sitePincode}</span>
                              <span>•</span>
                              <span className="text-amber-400 font-bold">★ {sup.rating} / 5.0</span>
                              <span>•</span>
                              <span className="text-slate-500">{sup.verifiedGst ? `GST: ${sup.verifiedGst}` : "GST Verified"}</span>
                            </div>

                            {/* Intelligent Recommendation Metrics Grid */}
                            <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                              <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                                <span className="text-slate-500 block text-[10px] uppercase font-bold">Fulfillment</span>
                                <span className="text-emerald-400 font-bold">{sup.fulfillmentRate || "98.5%"} On-Time</span>
                              </div>
                              <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                                <span className="text-slate-500 block text-[10px] uppercase font-bold">Track Record</span>
                                <span className="text-slate-300 font-bold">{sup.pastOrdersFulfilled || "180+"} Orders</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 truncate max-w-[150px]">
                              {sup.categories.slice(0, 2).join(", ")}
                            </span>
                            <span className={`font-bold flex items-center gap-1 ${isSelected ? "text-emerald-400" : "text-slate-500"}`}>
                              {isSelected ? "✓ Selected for WhatsApp" : "Excluded"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DYNAMIC MATERIAL LINE ITEMS & ADMIN MASTER CATALOG PICKER */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>📦</span> RFQ Material Line Items ({rfqItems.length})
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Dynamically populated from BuildMitra Admin Master Items & Live Market Benchmark Rates.
                      </p>
                    </div>

                    {/* Master Catalog Quick-Add Selector */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        onChange={(e) => {
                          const found = masterCatalog.find((m) => m.id === e.target.value || m.masterItemCode === e.target.value);
                          if (found) handleAddRfqItem(found);
                          e.target.value = "";
                        }}
                        defaultValue=""
                        className="w-full sm:w-80 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sky-400 text-xs font-bold outline-none cursor-pointer focus:border-sky-500"
                      >
                        <option value="" disabled>+ Add Material from Admin Master...</option>
                        {filteredCatalogItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} [{item.category}] • ₹{item.benchmarkRate}/{item.unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Category Filtering Chips & Search */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Filter Category:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCatalogCategory("ALL")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          selectedCatalogCategory === "ALL"
                            ? "bg-sky-600 text-white"
                            : "bg-slate-900 text-slate-400 hover:text-white"
                        }`}
                      >
                        All Categories ({masterCatalog.length})
                      </button>
                      {catalogCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCatalogCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            selectedCatalogCategory === cat
                              ? "bg-sky-600 text-white"
                              : "bg-slate-900 text-slate-400 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search Admin Master (brand, grade, spec)..."
                        value={catalogSearchQuery}
                        onChange={(e) => setCatalogSearchQuery(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Active RFQ Line Items Table */}
                  <div className="space-y-3">
                    {rfqItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800"
                      >
                        <div className="sm:col-span-1 text-center font-mono font-bold text-slate-500 text-xs">
                          #{idx + 1}
                        </div>

                        <div className="sm:col-span-5">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Material Item Specification</label>
                          <input
                            type="text"
                            value={item.specific_item}
                            onChange={(e) => {
                              const updated = [...rfqItems];
                              updated[idx].specific_item = e.target.value;
                              setRfqItems(updated);
                            }}
                            className="w-full mt-0.5 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-semibold outline-none"
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...rfqItems];
                              updated[idx].quantity = Number(e.target.value);
                              setRfqItems(updated);
                            }}
                            className="w-full mt-0.5 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs text-center font-mono font-bold outline-none"
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Unit of Measure</label>
                          <select
                            value={item.unit}
                            onChange={(e) => {
                              const updated = [...rfqItems];
                              updated[idx].unit = e.target.value;
                              setRfqItems(updated);
                            }}
                            className="w-full mt-0.5 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none"
                          >
                            {UOM_OPTIONS.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Benchmark (₹)</label>
                            <input
                              type="number"
                              value={item.target_price}
                              onChange={(e) => {
                                const updated = [...rfqItems];
                                updated[idx].target_price = Number(e.target.value);
                                setRfqItems(updated);
                              }}
                              className="w-full mt-0.5 p-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono text-xs font-bold outline-none"
                              required
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveRfqItem(idx)}
                            className="mt-4 p-2 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg text-xs font-bold transition"
                            title="Remove Line Item"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Estimated Grand Total & Savings Target */}
                  <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-400">Total Benchmark Order Target:</span>
                      <span className="text-xl font-black text-white ml-2">
                        ₹{rfqItems.reduce((acc, i) => acc + i.quantity * i.target_price, 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={selectedSuppliersCount === 0}
                      className="px-6 py-3.5 bg-gradient-to-r from-sky-500 via-emerald-500 to-emerald-600 hover:from-sky-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>🚀 Launch Reverse Auction & Broadcast WhatsApp to {selectedSuppliersCount} Selected Suppliers</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: REAL-TIME REVERSE AUCTION ROOM */}
          {activeTab === "live" && (
            <div className="space-y-6 animate-fadeIn">
              {/* TOP DASHBOARD METRICS: L1 PRICE + COUNTDOWN TICKER + 10-MIN WARNING */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* L1 RATE CARD */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-400 font-mono text-8xl font-black select-none">
                    L1
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-400 uppercase tracking-widest border border-emerald-800">
                        Current Winning L1 Rate
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {activeAuction?.bids.length || 0} Competing Quotes
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                        ₹{activeAuction?.current_l1_rate.toFixed(2)}
                      </span>
                      <span className="text-sm text-slate-400 font-medium">/ {activeAuction?.unit}</span>
                    </div>

                    <div className="mt-2 text-xs text-slate-300">
                      Lowest Landed Bidder:{" "}
                      <strong className="text-white">
                        {viewRole === "buyer"
                          ? (activeAuction?.bids[0]?.vendor_name || "Awaiting First Bid")
                          : (activeAuction?.bids[0]?.masked_code_name || "Supplier-Alpha-12")}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Target Benchmark: ₹{activeAuction?.target_price.toFixed(2)}</span>
                    <span className="text-emerald-400 font-bold">
                      Savings: ₹{Math.max(0, (activeAuction?.target_price || 0) - (activeAuction?.current_l1_rate || 0)).toFixed(2)} / {activeAuction?.unit}
                    </span>
                  </div>
                </div>

                {/* HIGH-PRECISION COUNTDOWN TICKER & BUZZER CONTROLS */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                          High-Precision Reverse Clock
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        Status: <strong className="text-emerald-400">{activeAuction?.status || "ACTIVE"}</strong>
                      </span>
                    </div>

                    {/* DIGITS DISPLAY */}
                    <div className="grid grid-cols-4 gap-2 text-center my-3">
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                        <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                          {String(countdownDetails.hours).padStart(2, "0")}
                        </span>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mt-1">Hours</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                        <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                          {String(countdownDetails.mins).padStart(2, "0")}
                        </span>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mt-1">Minutes</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                        <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
                          {String(countdownDetails.secs).padStart(2, "0")}
                        </span>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mt-1">Seconds</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                        <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
                          .{countdownDetails.ms}
                        </span>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mt-1">Msec</span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden mt-3">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          countdownDetails.hours === 0 && countdownDetails.mins <= 10
                            ? "bg-gradient-to-r from-amber-500 to-rose-500"
                            : "bg-gradient-to-r from-sky-500 to-emerald-500"
                        }`}
                        style={{ width: `${countdownDetails.percentRemaining}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Warning Buzzer & Quick Triggers */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Buzzer Protocol:</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isBuzzerActive
                            ? "bg-rose-950 text-rose-300 border border-rose-700 animate-pulse"
                            : "bg-slate-950 text-slate-400"
                        }`}
                      >
                        {isBuzzerActive ? "🚨 10-MIN WARNING BROADCAST ACTIVE" : "ARMED (Triggers at T-10m)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTriggerWarningBuzzer}
                        className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-600 rounded-lg text-xs font-bold transition"
                        title="Simulate 10-minute warning buzzer alert across UI and WhatsApp"
                      >
                        ⚡ Test 10-Min Buzzer Alarm
                      </button>

                      <button
                        onClick={() => {
                          if (activeAuction) {
                            activeAuction.ends_at = Date.now() - 1000;
                            activeAuction.status = "EVALUATING";
                            refreshAuctions();
                            setActiveTab("tabulation");
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition"
                      >
                        ⏱️ Close Auction Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE LEADERBOARD WITH ANONYMOUS CODE-NAMES & COUNTER-BID SUBMISSION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LIVE LEADERBOARD FEED */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>🏆</span> Real-Time Reverse Auction Leaderboard (X vs Y Competing Feed)
                      </h3>
                      <p className="text-xs text-slate-400">
                        {viewRole === "supplier"
                          ? "Commercial Anti-Collusion Mode active: Suppliers masked under randomized code names."
                          : "Buyer Mode active: Verified supplier names and contacts revealed."}
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {activeAuction?.bids.length || 0} Submissions
                    </span>
                  </div>

                  {activeAuction?.bids.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No quotes submitted yet. Use the counter-bid panel to place the first downward rate.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeAuction?.bids.map((bid, idx) => (
                        <div
                          key={bid.bid_id || idx}
                          className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            idx === 0
                              ? "bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-950/20"
                              : idx === 1
                              ? "bg-slate-950 border-sky-800/40"
                              : "bg-slate-950 border-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center ${
                                idx === 0
                                  ? "bg-emerald-500 text-slate-950 shadow"
                                  : idx === 1
                                  ? "bg-sky-600 text-white"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {bid.rank || `L${idx + 1}`}
                            </span>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs sm:text-sm">
                                  {viewRole === "buyer"
                                    ? bid.vendor_name
                                    : (bid.masked_code_name || `Supplier-${CODE_NAME_ALPHABETS[idx % CODE_NAME_ALPHABETS.length]}-${idx + 12}`)}
                                </span>
                                {idx === 0 && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                    Winning L1
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Basic: ₹{bid.basic_rate_per_unit} • GST {bid.gst_percent}%: ₹{bid.gst_amount} • Freight: ₹{bid.freight_per_unit} • Hamali: ₹{bid.unloading_per_unit}
                              </div>
                            </div>
                          </div>

                          <div className="text-right self-end sm:self-auto flex items-center gap-3">
                            <div>
                              <div className="text-base sm:text-lg font-black text-emerald-400">
                                ₹{bid.total_landed_rate.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Total: ₹{bid.total_order_value.toLocaleString("en-IN")}
                              </div>
                            </div>

                            {viewRole === "buyer" && (
                              <button
                                onClick={() => handleAwardL1Po(bid.bid_id)}
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs shadow transition"
                              >
                                Award PO
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ZERO-LATENCY SUPPLIER COUNTER-BIDDING SUBMISSION PANEL */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>⚡</span> Submit Downward Price Quote (R1 / R2 / R3)
                      </h3>
                      <span className="text-xs text-amber-400 font-mono font-bold">
                        Zero-Latency State
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Quotes must be strictly lower than current L1 rate (₹{activeAuction?.current_l1_rate.toFixed(2)}) to qualify.
                    </p>

                    {bidMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs mb-4 ${
                          bidMessage.type === "success"
                            ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                            : "bg-rose-950 border border-rose-800 text-rose-300"
                        }`}
                      >
                        {bidMessage.text}
                      </div>
                    )}

                    <form onSubmit={handleCounterBidSubmit} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Select Submitting Supplier
                        </label>
                        <select
                          value={bidSupplierName}
                          onChange={(e) => setBidSupplierName(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                          required
                        >
                          <option value="">Select a registered supplier...</option>
                          {geofencedSuppliers.map((s) => (
                            <option key={s.id} value={s.companyName || s.name}>
                              {s.companyName || s.name} ({s.maskedCodeName}) - {s.distanceKm} km away
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Basic Rate / Unit *
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="e.g. 245"
                            value={bidBasicRate}
                            onChange={(e) => setBidBasicRate(e.target.value)}
                            className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono text-sm font-bold outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            GST Rate (%)
                          </label>
                          <select
                            value={bidGstPercent}
                            onChange={(e) => setBidGstPercent(e.target.value)}
                            className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                          >
                            <option value="28">28% (Cement / RMC)</option>
                            <option value="18">18% (Steel / Blocks / Sand)</option>
                            <option value="12">12% (Paints / Chemicals)</option>
                            <option value="5">5% (Special Standard)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Freight / Unit (₹)
                          </label>
                          <input
                            type="number"
                            value={bidFreight}
                            onChange={(e) => setBidFreight(e.target.value)}
                            className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Hamali / Unit (₹)
                          </label>
                          <input
                            type="number"
                            value={bidUnloading}
                            onChange={(e) => setBidUnloading(e.target.value)}
                            className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
                          />
                        </div>
                      </div>

                      {/* Live Calculated Landed Cost Preview */}
                      {bidBasicRate && !isNaN(parseFloat(bidBasicRate)) && (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Ex-Factory Rate:</span>
                            <span className="font-mono text-white">₹{parseFloat(bidBasicRate).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>GST ({bidGstPercent}%):</span>
                            <span className="font-mono text-white">
                              ₹{((parseFloat(bidBasicRate) * parseFloat(bidGstPercent)) / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Freight + Hamali:</span>
                            <span className="font-mono text-white">
                              ₹{(parseFloat(bidFreight || "0") + parseFloat(bidUnloading || "0")).toFixed(2)}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                            <span className="text-emerald-400">Calculated Landed Rate:</span>
                            <span className="text-emerald-400 font-mono">
                              ₹{
                                (
                                  parseFloat(bidBasicRate) +
                                  (parseFloat(bidBasicRate) * parseFloat(bidGstPercent)) / 100 +
                                  parseFloat(bidFreight || "0") +
                                  parseFloat(bidUnloading || "0")
                                ).toFixed(2)
                              }
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-600/30 transition mt-2"
                      >
                        ⚡ Submit Undercut Landed Quote (Instant Re-Rank)
                      </button>
                    </form>
                  </div>

                  {/* Anti-collusion Notice */}
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Anti-Collusion Masking: Active</span>
                    <span>All quotes verified via audit hash</span>
                  </div>
                </div>
              </div>

              {/* RECENT WORKER DISPATCH LOGS */}
              {notifications.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Automated Worker Dispatch Telemetry & WhatsApp Broadcast Stream
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>📱</span>
                            <span>{n.title}</span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{n.message}</div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                          {new Date(n.sent_at).toLocaleTimeString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUTOMATED L1, L2, L3 COMPARISON & STATEMENT GENERATION & PO */}
          {activeTab === "tabulation" && (
            <div className="space-y-6 animate-fadeIn">
              {/* SAVINGS KPI SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 uppercase font-bold">Baseline Benchmark Value</span>
                  <div className="text-2xl font-black text-white mt-1">
                    ₹{((activeAuction?.target_price || 365) * (activeAuction?.quantity || 1)).toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] text-slate-500">Benchmark: ₹{activeAuction?.target_price}/unit</span>
                </div>

                <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-2xl">
                  <span className="text-xs text-emerald-400 uppercase font-bold">Winning L1 Landed Value</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    ₹{((activeAuction?.current_l1_rate || 345) * (activeAuction?.quantity || 1)).toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] text-emerald-300">L1 Rate: ₹{activeAuction?.current_l1_rate.toFixed(2)}/unit</span>
                </div>

                <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-500/50 p-5 rounded-2xl">
                  <span className="text-xs text-emerald-300 uppercase font-bold">Net Project Cash Savings</span>
                  <div className="text-2xl font-black text-emerald-300 mt-1">
                    ₹{
                      (
                        ((activeAuction?.target_price || 365) - (activeAuction?.current_l1_rate || 345)) *
                        (activeAuction?.quantity || 1)
                      ).toLocaleString("en-IN")
                    }
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">
                    {(
                      (((activeAuction?.target_price || 365) - (activeAuction?.current_l1_rate || 345)) /
                        (activeAuction?.target_price || 365)) *
                      100
                    ).toFixed(1)}% Cost Reduction via Reverse Auction
                  </span>
                </div>
              </div>

              {/* L1, L2, L3 COMPARATIVE STATEMENT TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>📊</span> Official L1, L2, L3 Comparative Statement Table
                    </h2>
                    <p className="text-xs text-slate-400">
                      Standardized commercial audit matrix comparing Ex-Factory, GST, Freight, and Hamali landed costs.
                    </p>
                  </div>

                  {/* 1-Click PO Generation Button */}
                  <button
                    onClick={() => handleAwardL1Po()}
                    disabled={poLoading || !activeAuction?.bids.length}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <span>📄</span>
                    <span>{poLoading ? "Generating Official PO..." : "Issue Purchase Order (PO) to L1 Vendor"}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Rank</th>
                        <th className="p-3.5">Supplier Name</th>
                        <th className="p-3.5">Basic Ex-Factory</th>
                        <th className="p-3.5">GST</th>
                        <th className="p-3.5">Freight</th>
                        <th className="p-3.5">Hamali</th>
                        <th className="p-3.5">Landed / Unit</th>
                        <th className="p-3.5">Total Order Value</th>
                        <th className="p-3.5">Net Savings</th>
                        <th className="p-3.5 text-right">PO Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {(comparativeData?.comparative_statement || []).map((row: any, idx: number) => (
                        <tr
                          key={row.bid_id || idx}
                          className={`hover:bg-slate-950/60 transition ${
                            row.is_l1 ? "bg-emerald-950/20 font-bold" : ""
                          }`}
                        >
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded font-mono font-black text-xs ${
                                row.is_l1
                                  ? "bg-emerald-500 text-slate-950"
                                  : idx === 1
                                  ? "bg-sky-600 text-white"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {row.rank}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white text-xs">{row.vendor_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Phone: {row.vendor_phone} • Rating: {row.vendor_rating} ★
                            </div>
                          </td>
                          <td className="p-3.5 font-mono">₹{row.basic_rate_per_unit.toFixed(2)}</td>
                          <td className="p-3.5 font-mono text-slate-400">
                            ₹{row.gst_amount.toFixed(2)} ({row.gst_percent}%)
                          </td>
                          <td className="p-3.5 font-mono text-slate-400">₹{row.freight_per_unit.toFixed(2)}</td>
                          <td className="p-3.5 font-mono text-slate-400">₹{row.unloading_per_unit.toFixed(2)}</td>
                          <td className="p-3.5 font-mono text-emerald-400 font-black text-sm">
                            ₹{row.total_landed_rate.toFixed(2)}
                          </td>
                          <td className="p-3.5 font-mono text-white font-bold">
                            ₹{row.total_order_value.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5 font-mono text-emerald-400 font-bold">
                            ₹{row.total_savings.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleAwardL1Po(row.bid_id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                row.is_l1
                                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              }`}
                            >
                              {row.is_l1 ? "Award L1 PO" : "Select PO"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL 1: WHATSAPP BROADCAST CONFIRMATION MODAL */}
        {showBroadcastModal && latestBroadcastPayload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                    📱
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">WhatsApp Automated RFQ Broadcast Dispatched</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Batch Code: <strong className="text-emerald-400">{latestBroadcastPayload.batchCode}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                <p className="text-xs text-slate-300">
                  Instant WhatsApp notifications dispatched to <strong>{latestBroadcastPayload.suppliers?.length || 0} verified suppliers</strong> within 25km radius of PIN <strong>{latestBroadcastPayload.pincode}</strong>:
                </p>

                {latestBroadcastPayload.suppliers?.map((s: any, i: number) => {
                  const phoneClean = (s.phone || "").replace(/\D/g, "");
                  const formattedPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
                  const itemSummary = latestBroadcastPayload.items?.map((it: any) => `• ${it.specific_item} (${it.quantity} ${it.unit})`).join("\n");
                  const messageText = `*BUILDMITRA BULK RFQ ALERT (#${latestBroadcastPayload.batchCode})*\n\nDear *${s.companyName || s.name}* (${s.distanceKm || 2.4} km away),\nYou have received a bulk demand inquiry at PIN ${latestBroadcastPayload.pincode}.\n\n*Required Materials:*\n${itemSummary}\n\n🔒 *Anonymous Code Name Assigned:* ${s.maskedCodeName || "Supplier-Alpha-12"}\n\n👉 *SUBMIT YOUR RATE IN 1 CLICK:*\nhttp://localhost:3000/live-reverse-auction?auctionId=${latestBroadcastPayload.batchCode}`;
                  const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(messageText)}`;

                  return (
                    <div
                      key={s.id || i}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">
                          {s.companyName || s.name} ({s.maskedCodeName})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {s.phone} • Distance: {s.distanceKm || 2.4} km • Rating: {s.rating} ★
                        </div>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-1"
                      >
                        <span>📱 WhatsApp Link</span>
                      </a>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Proceed to Live Reverse Auction Room →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: OFFICIAL PURCHASE ORDER (PO) VIEWER & DISPATCH */}
        {showPoModal && poGenerated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl animate-fadeIn my-6 max-h-[92vh] overflow-y-auto">
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                    📄
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Official Purchase Order Generated & Transmitted</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      PO Reference: <strong className="text-emerald-400">{poGenerated.po_number}</strong> • Status: <strong className="text-emerald-400">OFFICIALLY ISSUED (L1 AWARDED)</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPoModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* DOCUMENT BODY */}
              <div className="my-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
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
                    <div className="text-emerald-400 font-black text-sm">{poGenerated.po_number}</div>
                    <div className="text-slate-400 text-[10px]">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* 2. Complete "From" and "To" Address Blocks with GSTIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">ISSUED BY / BUYER (CONSIGNOR / BILL TO):</span>
                    <div className="font-bold text-white text-xs">{poGenerated.po_details?.buyer_name || 'M. Chinnappa Reddy (GM Materials)'}</div>
                    <div className="text-sky-400 font-mono text-[11px]">Buyer GSTIN: 29AAGCB1234F1Z1</div>
                    <div className="text-slate-400">Contact: {poGenerated.po_details?.buyer_phone || '+91 98450 99881'}</div>
                    <div className="text-slate-400">Delivery Site: {poGenerated.po_details?.delivery_address}</div>
                    <div className="text-emerald-400 font-mono font-bold">Site PIN Code: {poGenerated.po_details?.site_pincode}</div>
                  </div>

                  <div className="p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-900/60 space-y-1">
                    <span className="text-emerald-400 uppercase font-bold text-[10px] tracking-wider">AWARDED L1 SUPPLIER (VENDOR / DISPATCH TO):</span>
                    <div className="font-bold text-white text-xs">{poGenerated.po_details?.vendor_name}</div>
                    <div className="text-emerald-300 font-mono text-[11px] font-bold">Verified GSTIN: {poGenerated.po_details?.vendor_gst || '29AAACJ1234H1Z5'}</div>
                    <div className="text-slate-300">Registered Phone: {poGenerated.po_details?.vendor_phone}</div>
                    <div className="text-slate-400">Depot: {poGenerated.po_details?.vendor_address || 'Regional Depot, Bengaluru'}</div>
                    <div className="text-emerald-400 font-mono text-[11px]">Auction Code Ref: {poGenerated.po_details?.masked_code_name || 'Supplier-Alpha-12'} (L1 Winner)</div>
                  </div>
                </div>

                {/* 3. Comprehensive Material Details Table */}
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
                            {poGenerated.po_details?.material}
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-400">
                            {poGenerated.po_details?.material?.toUpperCase().includes('CEMENT') ? '252329' : '721420'}
                          </td>
                          <td className="p-2.5 text-center font-mono text-white font-bold">
                            {poGenerated.po_details?.quantity} {poGenerated.po_details?.unit}
                          </td>
                          <td className="p-2.5 text-right font-mono text-emerald-400 font-bold">
                            ₹{poGenerated.po_details?.landed_rate?.toFixed(2)} / {poGenerated.po_details?.unit}
                          </td>
                          <td className="p-2.5 text-right font-mono text-white font-black text-sm">
                            ₹{poGenerated.po_details?.total_order_value?.toLocaleString('en-IN')}
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
                    <li><strong>Payment Terms:</strong> {poGenerated.po_details?.payment_terms || 'COD on Unloading'}. Released within 24 hours of physical gate inspection.</li>
                    <li><strong>Delivery Schedule:</strong> Strict site delivery by <strong>{poGenerated.po_details?.delivery_deadline || 'Tomorrow by 11:00 AM'}</strong>. Time is of the essence.</li>
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
                    <div className="font-bold text-emerald-400 mt-1">✔ {poGenerated.po_details?.vendor_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">GSTIN: {poGenerated.po_details?.vendor_gst || '29AAACJ1234H1Z5'}</div>
                    <div className="mt-4 pt-2 border-t border-slate-700 text-[10px] text-slate-400">Supplier Commercial Acceptance Stamp</div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <span>✅</span>
                  <span>
                    Official PO PDF automatically dispatched via WhatsApp to <strong>{poGenerated.po_details?.vendor_phone}</strong> and recorded in Buyer procurement ledger.
                  </span>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Close Preview
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?phone=${poGenerated.po_details?.vendor_phone?.replace(/\D/g, "")}&text=${encodeURIComponent(`🎉 Official BuildMitra Purchase Order #${poGenerated.po_number} awarded for ${poGenerated.po_details?.material}. Agreed Rate: ₹${poGenerated.po_details?.landed_rate}/unit.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
                  >
                    <span>📱 View in WhatsApp</span>
                  </a>

                  <button
                    onClick={handleDownloadPoPdf}
                    className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5"
                  >
                    <span>⬇️ Download Official Stamped PO (PDF)</span>
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
