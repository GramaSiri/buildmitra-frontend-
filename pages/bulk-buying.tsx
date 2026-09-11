import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../components/DashboardLayout";
import ExcelSpreadsheetRfqForm from "../components/bulkBuying/ExcelSpreadsheetRfqForm";
import WhatsappBroadcastStatus from "../components/bulkBuying/WhatsappBroadcastStatus";
import BuyerTabulationMatrix from "../components/bulkBuying/BuyerTabulationMatrix";
import ReverseAuctionLiveRoom from "../components/bulkBuying/ReverseAuctionLiveRoom";
import { getApiUrl } from "../utils/apiConfig";

export default function BulkBuyingPage() {
  const router = useRouter();
  const { batchCode: urlBatchCode } = router.query;

  const [activeTab, setActiveTab] = useState<"launch_form" | "my_rfqs" | "tabulation_bi" | "live_auction">("launch_form");
  const [buyerRfqs, setBuyerRfqs] = useState<any[]>([]);
  const [selectedBatchCode, setSelectedBatchCode] = useState<string>("");
  const [broadcastData, setBroadcastData] = useState<{ batchCode: string; suppliers: any[] } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingRfqs, setLoadingRfqs] = useState<boolean>(false);

  // Sync batchCode from query parameter if present
  useEffect(() => {
    if (urlBatchCode && typeof urlBatchCode === "string") {
      setSelectedBatchCode(urlBatchCode);
      setActiveTab("tabulation_bi");
    }
  }, [urlBatchCode]);

  // Fetch list of buyer RFQs
  const fetchBuyerRfqs = async () => {
    try {
      setLoadingRfqs(true);
      const res = await fetch(getApiUrl("/api/procurement/rfq/buyer-list"));
      const data = await res.json();
      if (data.success) {
        setBuyerRfqs(data.rfqs || []);
      }
    } catch (err) {
      console.error("Error fetching buyer RFQs:", err);
    } finally {
      setLoadingRfqs(false);
    }
  };

  useEffect(() => {
    fetchBuyerRfqs();
  }, []);

  // Handle RFQ creation submission
  const handleLaunchRfq = async (rfqPayload: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl("/api/procurement/rfq/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rfqPayload)
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`);
      }

      const data = await res.json();

      if (data.success) {
        setSelectedBatchCode(data.batchCode);
        setBroadcastData({
          batchCode: data.batchCode,
          suppliers: data.suppliers || []
        });
        fetchBuyerRfqs();
      } else {
        alert(data.message || "Failed to launch RFQ batch.");
      }
    } catch (err: any) {
      alert(err.message || "Network error launching RFQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAuction = async (batchCode: string) => {
    try {
      const res = await fetch(getApiUrl("/api/procurement/rfq/start-auction"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchCode, durationHours: 5, minDecrement: 10 })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBatchCode(batchCode);
        setActiveTab("live_auction");
      } else {
        alert(data.message || "Failed to launch auction.");
      }
    } catch (err: any) {
      alert(err.message || "Network error launching auction.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* CLEARLY VISIBLE HIGHLIGHTED NAVIGATION TABS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {/* TAB 1: CREATE NEW RFQ */}
          <button
            onClick={() => setActiveTab("launch_form")}
            className={`p-4 rounded-2xl font-black text-sm transition-all border-2 text-center shadow-lg flex flex-col items-center justify-center gap-1.5 ${
              activeTab === "launch_form"
                ? "bg-amber-400 text-slate-950 border-amber-500 ring-4 ring-amber-400/30 scale-[1.02]"
                : "bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="text-xl">📝</span>
            <span>Create New RFQ</span>
          </button>

          {/* TAB 2: MY ACTIVE RFQS */}
          <button
            onClick={() => {
              setActiveTab("my_rfqs");
              fetchBuyerRfqs();
            }}
            className={`p-4 rounded-2xl font-black text-sm transition-all border-2 text-center shadow-lg flex flex-col items-center justify-center gap-1.5 ${
              activeTab === "my_rfqs"
                ? "bg-amber-400 text-slate-950 border-amber-500 ring-4 ring-amber-400/30 scale-[1.02]"
                : "bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="text-xl">📋</span>
            <span>My Active RFQs ({buyerRfqs.length})</span>
          </button>

          {/* TAB 3: QUOTE COMPARISON BI */}
          <button
            onClick={() => setActiveTab("tabulation_bi")}
            disabled={!selectedBatchCode}
            className={`p-4 rounded-2xl font-black text-sm transition-all border-2 text-center shadow-lg flex flex-col items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none ${
              activeTab === "tabulation_bi"
                ? "bg-amber-400 text-slate-950 border-amber-500 ring-4 ring-amber-400/30 scale-[1.02]"
                : "bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="text-xl">📊</span>
            <span>Quote Comparison BI</span>
          </button>

          {/* TAB 4: LIVE REVERSE AUCTION */}
          <button
            onClick={() => setActiveTab("live_auction")}
            disabled={!selectedBatchCode}
            className={`p-4 rounded-2xl font-black text-sm transition-all border-2 text-center shadow-lg flex flex-col items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none ${
              activeTab === "live_auction"
                ? "bg-amber-400 text-slate-950 border-amber-500 ring-4 ring-amber-400/30 scale-[1.02]"
                : "bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="text-xl">⚡</span>
            <span>Live Reverse Auction</span>
          </button>
        </div>

        {/* Tab 1: Excel RFQ Creation Form */}
        {activeTab === "launch_form" && (
          <ExcelSpreadsheetRfqForm onLaunchRfq={handleLaunchRfq} isLoading={isSubmitting} />
        )}

        {/* Tab 2: My Active RFQs List */}
        {activeTab === "my_rfqs" && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">My Bulk Procurement RFQs</h2>

            {loadingRfqs ? (
              <div className="text-center py-8 text-slate-500 font-medium">Loading active RFQs...</div>
            ) : buyerRfqs.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-slate-700 font-bold mb-4">No RFQ batches created yet.</p>
                <button
                  onClick={() => setActiveTab("launch_form")}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all"
                >
                  + Create Your First RFQ
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {buyerRfqs.map((rfq) => (
                  <div
                    key={rfq._id}
                    className="bg-slate-50 hover:bg-amber-50/50 border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-600 text-sm">{rfq.batchCode}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            rfq.status === "AUCTION_ACTIVE"
                              ? "bg-rose-500 text-white"
                              : rfq.status === "QUOTES_RECEIVED"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {rfq.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1">{rfq.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Items: {rfq.items?.length || 0} • PIN Code: <span className="font-bold text-slate-800">{rfq.deliverySite?.pincode}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs font-mono">
                        <div className="font-bold text-emerald-600">{rfq.quotesCount || 0} Quotes Received</div>
                        <div className="text-slate-400">{rfq.assignedSupplierCount || 0} Suppliers Notified</div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedBatchCode(rfq.batchCode);
                          setActiveTab("tabulation_bi");
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
                      >
                        View BI Matrix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: BI Tabulation Matrix */}
        {activeTab === "tabulation_bi" && selectedBatchCode && (
          <BuyerTabulationMatrix batchCode={selectedBatchCode} onLaunchAuction={handleStartAuction} />
        )}

        {/* Tab 4: Live 5-Hour Reverse Auction Room */}
        {activeTab === "live_auction" && selectedBatchCode && (
          <ReverseAuctionLiveRoom batchCode={selectedBatchCode} userRole="buyer" />
        )}

        {/* WhatsApp Broadcast Popup Modal */}
        {broadcastData && (
          <WhatsappBroadcastStatus
            batchCode={broadcastData.batchCode}
            suppliers={broadcastData.suppliers}
            onClose={() => setBroadcastData(null)}
            onViewTabulation={() => {
              setBroadcastData(null);
              setActiveTab("tabulation_bi");
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
