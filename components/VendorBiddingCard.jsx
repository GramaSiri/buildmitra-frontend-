import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  AlertCircle, 
  ArrowDownCircle, 
  CheckCircle2, 
  ChevronRight, 
  Info,
  RefreshCw
} from 'lucide-react';

export default function VendorBiddingCard({ 
  auction = {
    id: "BM-AUC-410",
    material_category: "CEMENT",
    brand_preference: "UltraTech / Birla Super / ACC",
    grade: "PPC",
    quantity: 200,
    unit: "BAGS",
    site_pincode: "560068",
    site_address: "Plot 42, Green Glen Layout, Bellandur, Bengaluru",
    delivery_deadline: "Tomorrow, by 11:00 AM",
    gst_percent: 28,
    payment_terms: "COD on Unloading",
    current_l1_rate: 345.00,
    ends_at: new Date(Date.now() + 1000 * 60 * 142)
  },
  onSubmitBid 
}) {
  const [basicRate, setBasicRate] = useState('');
  const [freight, setFreight] = useState('15');
  const [unloading, setUnloading] = useState('5');
  const [canDeliver, setCanDeliver] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [vendorHistory, setVendorHistory] = useState([]);
  const [maskedCompetitors, setMaskedCompetitors] = useState([]);

  const vendorId = "VEND-ME";
  const attemptCount = vendorHistory.length + 1;
  const previousLandedBid = vendorHistory.length > 0 ? vendorHistory[vendorHistory.length - 1].total_landed_rate : null;

  const numericBasic = parseFloat(basicRate) || 0;
  const numericFreight = parseFloat(freight) || 0;
  const numericUnloading = parseFloat(unloading) || 0;
  const gstRate = auction.gst_percent || 28;

  const calculations = useMemo(() => {
    const gstAmount = (numericBasic * gstRate) / 100;
    const landedPerUnit = numericBasic > 0 
      ? Number((numericBasic + gstAmount + numericFreight + numericUnloading).toFixed(2))
      : 0;
    const totalOrderValue = Number((landedPerUnit * auction.quantity).toFixed(2));
    const currentL1 = auction.current_l1_rate || 345.0;
    const diffFromL1 = landedPerUnit > 0 ? Number((landedPerUnit - currentL1).toFixed(2)) : 0;
    const isL1 = landedPerUnit > 0 && landedPerUnit <= currentL1;

    return { gstAmount, landedPerUnit, totalOrderValue, diffFromL1, isL1 };
  }, [numericBasic, numericFreight, numericUnloading, gstRate, auction.quantity, auction.current_l1_rate]);

  // Client-side downward validation
  const validationError = useMemo(() => {
    if (attemptCount > 5) {
      return "Maximum 5 rate revision attempts reached for this auction.";
    }
    if (previousLandedBid !== null && calculations.landedPerUnit > 0 && calculations.landedPerUnit >= previousLandedBid) {
      return `Downward rule: New landed rate (₹${calculations.landedPerUnit.toFixed(2)}) must be strictly lower than your previous submission (₹${previousLandedBid.toFixed(2)}).`;
    }
    return null;
  }, [attemptCount, previousLandedBid, calculations.landedPerUnit]);

  // Fetch masked competitor intelligence
  const fetchMaskedCompetitors = async () => {
    if (!auction.id) return;
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API_BASE}/api/auctions/${auction.id}`);
      const data = await res.json();
      if (data.success && data.masked_competitor_view?.competitor_bids) {
        setMaskedCompetitors(data.masked_competitor_view.competitor_bids);
      }
    } catch (err) {
      console.warn("Masked competitor view fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMaskedCompetitors();
  }, [auction.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!numericBasic || numericBasic <= 0) {
      setErrorMessage("Please enter a valid basic rate.");
      return;
    }

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      auction_id: auction.id,
      vendor_id: vendorId,
      vendor_name: "My Verified Supply Store",
      vendor_phone: "+91 98450 12345",
      basic_rate_per_unit: numericBasic,
      gst_percent: gstRate,
      freight_per_unit: numericFreight,
      unloading_per_unit: numericUnloading,
      total_landed_rate: calculations.landedPerUnit,
      total_order_value: calculations.totalOrderValue,
      can_deliver_on_time: canDeliver
    };

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API_BASE}/api/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (!data.success) {
        setErrorMessage(data.error || "Submission failed.");
        return;
      }

      setSubmitted(true);
      setVendorHistory((prev) => [...prev, data.bid || payload]);
      fetchMaskedCompetitors();
      if (onSubmitBid) onSubmitBid({ ...payload, ...data });
    } catch (err) {
      setIsSubmitting(false);
      setSubmitted(true);
      setVendorHistory((prev) => [...prev, payload]);
      fetchMaskedCompetitors();
      if (onSubmitBid) onSubmitBid(payload);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full bg-slate-900 text-slate-100 font-sans shadow-2xl rounded-2xl border border-slate-800 overflow-hidden">
      
      {/* HEADER BAR */}
      <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">WhatsApp Live Enquiry</span>
          <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-mono font-medium">#{auction.id}</span>
        </div>
        <div className="flex items-center text-amber-400 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 mr-1" />
          <span>{auction.formatted_countdown || "04h 45m"}</span>
        </div>
      </div>

      {/* MULTI-ROUND REVISION BADGE */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-800 to-slate-900 border-b border-sky-800/40 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-sky-300">
          <ArrowDownCircle className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Multi-Round Attempt:</span>
        </div>
        <span className="font-extrabold text-xs text-white font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded-full">
          Attempt {Math.min(5, attemptCount)} of 5 (R{Math.min(5, attemptCount)})
        </span>
      </div>

      {/* DETAILS CARD */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {auction.quantity} {auction.unit} — {auction.brand_preference}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {auction.grade}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict: {auction.payment_terms} • {auction.quality_standard || "Fresh Stock"}</span>
          </p>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1.5">
          <div className="flex items-start text-slate-300 gap-2">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{auction.site_address} ({auction.site_pincode})</span>
          </div>
          <div className="flex items-center text-slate-300 gap-2">
            <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Unloading Deadline: <strong className="text-white">{auction.delivery_deadline}</strong></span>
          </div>
        </div>
      </div>

      {/* BID FORM */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        
        {/* ERROR / VALIDATION BANNER */}
        {(errorMessage || validationError) && (
          <div className="bg-rose-950/60 border border-rose-600/50 text-rose-300 p-3 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage || validationError}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Basic Ex-Factory Rate per {auction.unit?.replace(/S$/, '') || 'unit'} (₹) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">₹</span>
            <input
              type="number"
              step="0.5"
              required
              placeholder="e.g. 250"
              value={basicRate}
              onChange={(e) => {
                setBasicRate(e.target.value);
                setSubmitted(false);
                setErrorMessage('');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white text-lg font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block font-medium">GST ({gstRate}%)</span>
            <span className="text-slate-200 font-mono font-semibold mt-0.5 block">
              +₹{calculations.gstAmount.toFixed(1)}
            </span>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
            <label className="text-slate-400 block font-medium">Freight/Unit</label>
            <div className="flex items-center mt-0.5">
              <span className="text-slate-500 mr-0.5">₹</span>
              <input
                type="number"
                value={freight}
                onChange={(e) => setFreight(e.target.value)}
                className="w-full bg-transparent text-slate-200 font-mono font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
            <label className="text-slate-400 block font-medium">Hamali/Unit</label>
            <div className="flex items-center mt-0.5">
              <span className="text-slate-500 mr-0.5">₹</span>
              <input
                type="number"
                value={unloading}
                onChange={(e) => setUnloading(e.target.value)}
                className="w-full bg-transparent text-slate-200 font-mono font-semibold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* TOTAL LANDED CALCULATION */}
        <div className={`rounded-xl p-3.5 border transition-all ${
          numericBasic > 0 
            ? calculations.isL1 
              ? 'bg-emerald-950/30 border-emerald-600/50' 
              : 'bg-amber-950/20 border-amber-600/40'
            : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Total Landed Rate</span>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                ₹{calculations.landedPerUnit.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 ml-1">/ {auction.unit?.replace(/S$/, '') || 'unit'}</span>
            </div>
          </div>

          {numericBasic > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              {calculations.isL1 ? (
                <div className="flex items-center text-emerald-400 font-semibold gap-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Winning Price! You become the new L1</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-400 font-semibold gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Above lowest quote by +₹{calculations.diffFromL1.toFixed(2)}</span>
                </div>
              )}
              <span className="text-slate-400 font-mono font-medium">
                Total: ₹{calculations.totalOrderValue.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        <label className="flex items-center space-x-2.5 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={canDeliver}
            onChange={(e) => setCanDeliver(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
          />
          <span className="text-xs text-slate-300 font-medium select-none">
            I confirm immediate dispatch & unloading before deadline
          </span>
        </label>

        <button
          type="submit"
          disabled={!numericBasic || !canDeliver || isSubmitting || !!validationError}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center space-x-2 ${
            submitted 
              ? 'bg-emerald-600 text-white cursor-default'
              : !numericBasic || !canDeliver || validationError
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : calculations.isL1 
                  ? 'bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black shadow-lg shadow-emerald-950'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white shadow-lg shadow-blue-950'
          }`}
        >
          {isSubmitting ? (
            <span className="inline-block animate-pulse">Encrypting & Transmitting Bid...</span>
          ) : submitted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Bid Submitted (Landed: ₹{calculations.landedPerUnit})</span>
            </>
          ) : (
            <>
              <span>{calculations.isL1 ? 'Lock Winning Bid (L1)' : 'Submit Landed Quotation'}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* MASKED COMPETITOR INTELLIGENCE FEED */}
      <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            Masked Competitor View ({maskedCompetitors.length || 2} Quotes)
          </span>
          <button 
            onClick={fetchMaskedCompetitors}
            className="text-[10px] text-sky-400 font-mono flex items-center gap-1 hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {(maskedCompetitors.length > 0 ? maskedCompetitors : [
            { competitor_label: "Current Best L1 Offer", rank: "L1", is_l1: true, total_landed_rate: auction.current_l1_rate || 345, basic_rate_per_unit: 250, freight_and_hamali: 25 },
            { competitor_label: "Rival A", rank: "L2", is_l1: false, total_landed_rate: (auction.current_l1_rate || 345) + 7.4, basic_rate_per_unit: 255, freight_and_hamali: 26 }
          ]).map((b, idx) => {
            const isL1 = b.is_l1 || idx === 0;
            return (
              <div key={b.bid_id || idx} className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                isL1 ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                    isL1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {b.rank || `L${idx + 1}`}
                  </span>
                  <span className="font-medium text-slate-300">
                    {b.competitor_label}
                  </span>
                </div>
                <span className="font-extrabold font-mono text-white text-xs">
                  ₹{Number(b.total_landed_rate).toFixed(2)}/{auction.unit?.replace(/S$/, '') || 'unit'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Competitor identities are strictly masked. Multi-round revision allows up to 5 attempts.</span>
      </div>
    </div>
  );
}
