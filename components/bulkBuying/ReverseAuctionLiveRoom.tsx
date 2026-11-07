import React, { useState, useEffect } from 'react';
import { getAuctionById, submitBid, getMaskedCompetitorView, BulkAuction } from '../../utils/whatsappAuctionStore';

export default function ReverseAuctionLiveRoom({ batchCode }: { batchCode?: string }) {
  const auctionId = batchCode || "BM-AUC-410";
  const [auction, setAuction] = useState<BulkAuction | null>(null);
  const [maskedView, setMaskedView] = useState<boolean>(true);
  const [counterRate, setCounterRate] = useState<string>("");
  const [supplierName, setSupplierName] = useState<string>("");

  const refreshAuction = () => {
    const auc = getAuctionById(auctionId);
    if (auc) setAuction({ ...auc });
  };

  useEffect(() => {
    refreshAuction();
    const interval = setInterval(refreshAuction, 2000);
    return () => clearInterval(interval);
  }, [auctionId]);

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterRate || !auction) return;
    const rateNum = parseFloat(counterRate);
    if (isNaN(rateNum) || rateNum <= 0) return;

    const res = submitBid({
      auction_id: auction.id,
      vendor_name: supplierName || "Verified Regional Depot",
      basic_rate_per_unit: rateNum,
      can_deliver_on_time: true
    });

    if (!res.success) {
      alert(res.error || "Counter-bid failed");
      return;
    }

    setCounterRate("");
    refreshAuction();
  };

  const competitorView = getMaskedCompetitorView(auctionId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⚡</span> Real-Time Reverse Auction Room ({auctionId})
          </h2>
          <p className="text-xs text-slate-400">
            {auction?.specific_item || "Bulk Procurement Item"} • Reverse Clock:{" "}
            <span className="font-mono text-amber-400 font-bold">{auction?.formatted_countdown}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {auction?.is_ten_min_warning_active && (
            <span className="px-2.5 py-1 rounded bg-rose-950 border border-rose-700 text-rose-300 text-xs font-bold animate-pulse">
              🚨 10-Min Flash Warning
            </span>
          )}

          <button
            onClick={() => setMaskedView(!maskedView)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 text-xs font-bold rounded-lg text-amber-400 hover:text-white"
          >
            {maskedView ? "🔒 Anonymous Anti-Collusion Mode" : "🔓 Verified Profile View"}
          </button>
        </div>
      </div>

      {/* WINNING L1 CARD */}
      <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Winning L1 Benchmark</span>
          <div className="text-2xl font-black text-emerald-400">
            ₹{auction?.current_l1_rate.toFixed(2)} <span className="text-xs text-slate-400">/ {auction?.unit || "BAGS"}</span>
          </div>
          <span className="text-xs text-slate-300">
            Leader: {maskedView ? (auction?.bids[0]?.masked_code_name || "Supplier-Alpha-12") : (auction?.bids[0]?.vendor_name || "Awaiting quote")}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          {auction?.bids.length || 0} Submissions Logged
        </span>
      </div>

      {/* LIVE DESCENDING QUOTES FEED */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Live Descending Leaderboard Feed
        </h3>
        {competitorView.competitor_bids?.map((b: any, idx: number) => (
          <div
            key={b.bid_id || idx}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              idx === 0 ? "bg-emerald-950/30 border-emerald-700" : "bg-slate-950 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded font-mono font-black text-[11px] ${idx === 0 ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                {b.rank}
              </span>
              <span className="font-bold text-white">
                {maskedView ? b.competitor_label : (auction?.bids[idx]?.vendor_name || b.competitor_label)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-emerald-400 font-mono">₹{b.total_landed_rate.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* COUNTER-BID SUBMISSION */}
      <form onSubmit={handleBidSubmit} className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Supplier Name / Mask"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          className="p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
        />
        <input
          type="number"
          step="0.5"
          placeholder={`Rate (< ₹${auction?.current_l1_rate.toFixed(2)})`}
          value={counterRate}
          onChange={(e) => setCounterRate(e.target.value)}
          className="p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono text-xs font-bold outline-none"
          required
        />
        <button
          type="submit"
          className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow transition"
        >
          Submit Undercut Rate
        </button>
      </form>
    </div>
  );
}
