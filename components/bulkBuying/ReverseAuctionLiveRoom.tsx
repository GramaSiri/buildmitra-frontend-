import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../utils/apiConfig';

interface Props {
  batchCode: string;
  userRole: 'buyer' | 'supplier';
  supplierUserCode?: string;
  supplierName?: string;
}

export default function ReverseAuctionLiveRoom({ batchCode, userRole, supplierUserCode, supplierName }: Props) {
  const [auctionData, setAuctionData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bidInput, setBidInput] = useState<string>('');
  const [biddingMsg, setBiddingMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<string>('05h 00m 00s');

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl(`/api/procurement/rfq/tabulation/${batchCode}`));
      const data = await res.json();

      if (data.success && data.rfq) {
        setAuctionData(data.rfq);
      }
    } catch (err) {
      console.error('Error loading auction room:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
    const interval = setInterval(fetchAuction, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [batchCode]);

  // Countdown timer logic
  useEffect(() => {
    if (!auctionData || !auctionData.auctionSettings?.endTime) return;

    const timer = setInterval(() => {
      const end = new Date(auctionData.auctionSettings.endTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, end - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTime(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionData]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidInput || Number(bidInput) <= 0) return;

    setSubmitting(true);
    setBiddingMsg(null);

    try {
      const res = await fetch(getApiUrl('/api/procurement/rfq/submit-bid'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchCode,
          supplierUserCode: supplierUserCode || 'SUP-GUEST',
          supplierName: supplierName || 'Verified Supplier',
          bidAmount: Number(bidInput)
        })
      });

      const data = await res.json();

      if (data.success) {
        setBiddingMsg({ type: 'success', text: data.message });
        setBidInput('');
        fetchAuction();
      } else {
        setBiddingMsg({ type: 'error', text: data.message });
      }
    } catch (err: any) {
      setBiddingMsg({ type: 'error', text: err.message || 'Bid submission failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !auctionData) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-8 text-center border border-slate-800">
        <div className="animate-spin text-4xl text-amber-500 mb-4">⚡</div>
        <p className="font-bold">Connecting to Live Reverse Auction Room...</p>
      </div>
    );
  }

  const currentL1 = auctionData?.auctionSettings?.currentL1Rate || auctionData?.grandTotalEstValue || 0;
  const minDecrement = auctionData?.auctionSettings?.minDecrement || 10;
  const isAuctionActive = auctionData?.auctionSettings?.isAuctionActive;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden mb-8 text-white">
      {/* Live Room Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
              LIVE REVERSE AUCTION
            </span>
            <span className="text-xs text-slate-400 font-mono">#{batchCode}</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">BuildMitra 5-Hour Downward Bidding Room</h2>
        </div>

        {/* Clock Badge */}
        <div className="bg-slate-900 border border-amber-500/40 rounded-xl px-5 py-2.5 text-center shadow-lg">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">TIME REMAINING</div>
          <div className="text-2xl font-black font-mono text-amber-300 tracking-wider">{remainingTime}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current L1 Rate Card */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between shadow-inner">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">CURRENT LOWEST (L1) RATE</div>
            <div className="text-4xl font-extrabold text-emerald-400 mt-2 tracking-tight">
              ₹{currentL1.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Minimum Required Decrement: <span className="font-bold text-amber-400">₹{minDecrement}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
            Target Price Cap: ₹{(auctionData?.grandTotalEstValue || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Masked Competitor Intelligence Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🛡️ Anonymized Competitor Rate Stream</span>
          </h3>

          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-bold text-slate-200">Rival A (Verified Supplier)</span>
              </div>
              <div className="font-mono font-bold text-emerald-400">Submitted ₹{currentL1.toLocaleString('en-IN')}</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                <span className="font-bold text-slate-400">Rival B (Verified Supplier)</span>
              </div>
              <div className="font-mono text-slate-400">Submitted ₹{(currentL1 + 500).toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Bidding Control Box for Suppliers */}
          {userRole === 'supplier' && isAuctionActive && (
            <form onSubmit={handlePlaceBid} className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  max={currentL1 - minDecrement}
                  value={bidInput}
                  onChange={(e) => setBidInput(e.target.value)}
                  placeholder={`Enter bid ≤ ₹${(currentL1 - minDecrement).toLocaleString('en-IN')}`}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500"
                  required
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Downward Bid'}
                </button>
              </div>

              {biddingMsg && (
                <div
                  className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-lg ${
                    biddingMsg.type === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {biddingMsg.text}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
