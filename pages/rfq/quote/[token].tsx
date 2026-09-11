import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getApiUrl } from '../../../utils/apiConfig';

export default function SupplierQuotePortal() {
  const router = useRouter();
  const { token, quick } = router.query;

  const [loading, setLoading] = useState<boolean>(true);
  const [rfqData, setRfqData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [lineItems, setLineItems] = useState<any[]>([]);
  const [freightCharge, setFreightCharge] = useState<string>('0');
  const [deliveryTimelineDays, setDeliveryTimelineDays] = useState<string>('1');
  const [validityDays, setValidityDays] = useState<string>('7');
  const [paymentTermsAccepted, setPaymentTermsAccepted] = useState<string>('COD');
  const [supplierNotes, setSupplierNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  const fetchRfqDetails = async (quoteToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(getApiUrl(`/api/procurement/rfq/token/${quoteToken}`));
      const data = await res.json();

      if (data.success) {
        setRfqData(data);
        const rfq = data.rfq;
        const initialItems = (rfq.items || []).map((item: any) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          rate: item.targetRate || 0,
          taxPercent: 18,
          remarks: ''
        }));
        setLineItems(initialItems);
      } else {
        setError(data.message || 'Invalid or expired quote token.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error loading RFQ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && typeof token === 'string') {
      fetchRfqDetails(token);
    }
  }, [token]);

  const handleRateChange = (idx: number, field: string, val: any) => {
    setLineItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleQuickOneClickSubmit = async () => {
    if (!lineItems || lineItems.length === 0) return;
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch(getApiUrl('/api/procurement/rfq/submit-quote'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteToken: token,
          lineItems,
          freightCharge: Number(freightCharge),
          deliveryTimelineDays: Number(deliveryTimelineDays),
          validityDays: Number(validityDays),
          paymentTermsAccepted,
          supplierNotes: '1-Click WhatsApp Quick Quote Submission'
        })
      });

      const data = await res.json();

      if (data.success) {
        setSubmitResult(data);
      } else {
        alert(data.message || 'Quote submission failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error submitting quote.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickOneClickSubmit();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center">
          <div className="animate-spin text-4xl text-amber-500 mb-4">⚙️</div>
          <h2 className="text-lg font-bold">Loading BuildMitra WhatsApp Quoting Portal...</h2>
        </div>
      </div>
    );
  }

  if (error || !rfqData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="text-4xl text-rose-500 mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-rose-400 mb-2">Quote Link Error</h2>
          <p className="text-sm text-slate-300 mb-6">{error || 'Unable to access RFQ.'}</p>
        </div>
      </div>
    );
  }

  const { rfq, supplierRfq } = rfqData;
  const estimatedGrandTotal = lineItems.reduce((acc, item) => acc + (Number(item.rate || 0) * Number(item.quantity || 1) * 1.18), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Branding Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded text-xs">WHATSAPP QUICK BID</span>
              <h1 className="text-xl font-bold">BuildMitra Supplier 1-Click Quote Portal</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              RFQ Batch: <span className="font-mono font-bold text-amber-400">{rfq.batchCode}</span> • Supplier: {supplierRfq.supplierName}
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-right">
            <div className="text-xs text-slate-400">Target Delivery Pincode</div>
            <div className="text-base font-extrabold text-white">{rfq.deliverySite?.pincode}</div>
          </div>
        </div>

        {submitResult ? (
          <div className="bg-emerald-950 border border-emerald-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Quotation Submitted Successfully!</h2>
            <p className="text-sm text-emerald-200 mb-6">{submitResult.message}</p>
            <div className="inline-block bg-slate-900 border border-emerald-800 rounded-xl p-4 text-left text-xs font-mono mb-6">
              <div>Quote Version: V{submitResult.quote?.version}</div>
              <div>Grand Total: ₹{submitResult.quote?.grandTotal?.toLocaleString('en-IN')}</div>
              <div>Status: Active in Buyer BI Tabulation Matrix</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1-CLICK INSTANT BID ACTION BANNER */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 border-2 border-emerald-500 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-extrabold uppercase text-emerald-300 tracking-wider">
                  ⚡ INSTANT ONE-CLICK BID SUBMISSION
                </div>
                <div className="text-lg font-black text-white mt-1">
                  Submit Target Quote Total: ₹{Math.round(estimatedGrandTotal).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-emerald-200 mt-0.5">
                  1-Tap instant submission directly from WhatsApp into Buyer BI Matrix.
                </div>
              </div>

              <button
                onClick={handleQuickOneClickSubmit}
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-xl shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : '🚀 1-CLICK SUBMIT BID NOW'}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitQuote} className="space-y-6">
              {/* Delivery & Buyer Notes */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  📍 Delivery Site & Buyer Requirements
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block">Site Address:</span>
                    <span className="font-semibold text-white">{rfq.deliverySite?.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Required Timeline:</span>
                    <span className="font-semibold text-white">{rfq.deliverySite?.requiredDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Buyer Payment Terms:</span>
                    <span className="font-semibold text-white">{rfq.deliverySite?.paymentTerms}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Buyer Notes:</span>
                    <span className="font-semibold text-white">{rfq.deliverySite?.notes || 'Standard Delivery'}</span>
                  </div>
                </div>
              </div>

              {/* Line Item Quoting Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  📦 Line Item Rates & Pricing Breakdown (Editable)
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                        <th className="p-3">Item Name</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-right">Target Rate</th>
                        <th className="p-3 text-right w-36">Your Rate (₹/Unit) *</th>
                        <th className="p-3 text-right w-28">GST %</th>
                        <th className="p-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => {
                        const amount = (Number(item.rate) || 0) * (Number(item.quantity) || 1);
                        return (
                          <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                            <td className="p-3 font-semibold text-white">
                              {item.itemName}
                              <div className="text-[10px] text-slate-500">{item.category}</div>
                            </td>
                            <td className="p-3 text-right font-semibold text-slate-300">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="p-3 text-right text-slate-500 font-mono">₹{item.targetRate}</td>
                            <td className="p-2 text-right">
                              <input
                                type="number"
                                min="0"
                                value={item.rate}
                                onChange={(e) => handleRateChange(idx, 'rate', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-amber-500/50 rounded font-mono font-bold text-right text-amber-300 focus:ring-2 focus:ring-amber-500"
                                required
                              />
                            </td>
                            <td className="p-2 text-right">
                              <select
                                value={item.taxPercent}
                                onChange={(e) => handleRateChange(idx, 'taxPercent', e.target.value)}
                                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-300"
                              >
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                                <option value="12">12%</option>
                                <option value="5">5%</option>
                                <option value="0">0% (Exempt)</option>
                              </select>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">
                              ₹{amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Freight & Validity */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Freight / Transport Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={freightCharge}
                    onChange={(e) => setFreightCharge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Delivery Timeline (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={deliveryTimelineDays}
                    onChange={(e) => setDeliveryTimelineDays(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Quote Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-base rounded-2xl shadow-xl transition-all"
              >
                {submitting ? 'Submitting Quotation...' : '🚀 Submit Customized Quotation to BuildMitra'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
