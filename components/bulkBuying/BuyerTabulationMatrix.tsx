import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../utils/apiConfig';

interface Props {
  batchCode: string;
  onLaunchAuction: (batchCode: string) => void;
}

export default function BuyerTabulationMatrix({ batchCode, onLaunchAuction }: Props) {
  const [tabulation, setTabulation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTabulation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(getApiUrl(`/api/procurement/rfq/tabulation/${batchCode}`));
      const data = await res.json();

      if (data.success) {
        setTabulation(data);
      } else {
        setError(data.message || 'Failed to load tabulation data.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching tabulation matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchCode) {
      fetchTabulation();
    }
  }, [batchCode]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border border-slate-200 p-8 text-center">
        <div className="animate-spin text-3xl text-amber-500 mb-3">⚙️</div>
        <p className="text-slate-600 font-semibold">Generating Automated BI Tabulation Matrix...</p>
      </div>
    );
  }

  if (error || !tabulation) {
    return (
      <div className="bg-white rounded-xl shadow border border-slate-200 p-8 text-center">
        <div className="text-3xl text-rose-500 mb-3">⚠️</div>
        <p className="text-rose-600 font-semibold mb-4">{error || 'Tabulation data not available.'}</p>
        <button
          onClick={fetchTabulation}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const { rfq, itemMatrix, supplierTotals, consolidatedL1Supplier, bestItemWiseTotal, maxPotentialSavings } = tabulation;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
      {/* Header Summary Bar */}
      <div className="bg-slate-900 text-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded text-xs">BI COMPARISON</span>
              <h2 className="text-xl font-bold">RFQ Batch Tabulation Matrix</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Batch: <span className="font-mono text-amber-400 font-bold">{batchCode}</span> • Pincode: {rfq?.deliverySite?.pincode}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={getApiUrl(`/api/procurement/rfq/download-po/${batchCode}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-1.5"
            >
              <span>📄 Download Comparative PO (PDF)</span>
            </a>

            <button
              onClick={() => onLaunchAuction(batchCode)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-lg shadow transition-all transform hover:-translate-y-0.5"
            >
              ⚡ Launch 5-Hour Reverse Auction
            </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-semibold uppercase">Consolidated L1 Supplier</div>
            <div className="text-lg font-extrabold text-emerald-400 mt-1">
              {consolidatedL1Supplier ? consolidatedL1Supplier.supplierName : 'Awaiting Quotes'}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Total Order: ₹{consolidatedL1Supplier ? consolidatedL1Supplier.grandTotal.toLocaleString('en-IN') : '0'}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-semibold uppercase">Best Item-Wise Split Total</div>
            <div className="text-lg font-extrabold text-amber-400 mt-1">
              ₹{bestItemWiseTotal ? bestItemWiseTotal.toLocaleString('en-IN') : '0'}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">Sum of absolute L1 item rates</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-semibold uppercase">Max Potential Split Savings</div>
            <div className="text-lg font-extrabold text-cyan-400 mt-1">
              ₹{maxPotentialSavings ? maxPotentialSavings.toLocaleString('en-IN') : '0'}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">Split order vs consolidated L1</div>
          </div>
        </div>
      </div>

      {/* Main Tabulation Grid */}
      <div className="p-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Item-Wise Side-by-Side Rate Comparison Matrix
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl mb-8">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <th className="p-3 border-r border-slate-200 w-10 text-center">#</th>
                <th className="p-3 border-r border-slate-200 min-w-[200px]">Material Item</th>
                <th className="p-3 border-r border-slate-200 w-24 text-right">Qty</th>
                <th className="p-3 border-r border-slate-200 w-28 text-right">Target Rate</th>

                {/* Supplier Columns */}
                {supplierTotals.map((sup: any, idx: number) => (
                  <th key={sup.supplierUserCode || idx} className="p-3 border-r border-slate-200 min-w-[180px] bg-slate-50">
                    <div className="font-extrabold text-slate-900">{sup.supplierName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Rank: {sup.consolidatedRank}</div>
                  </th>
                ))}

                {/* L1 Best Rate */}
                <th className="p-3 text-right min-w-[150px] bg-emerald-50 text-emerald-900">
                  <div className="font-extrabold">Best L1 Rate</div>
                  <div className="text-[10px] text-emerald-700">Recommended</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {itemMatrix.map((item: any, idx: number) => (
                <tr key={item.itemCode || idx} className="border-b border-slate-200 hover:bg-slate-50/80">
                  <td className="p-3 border-r border-slate-200 text-center font-bold text-slate-400 bg-slate-50">
                    {idx + 1}
                  </td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                    {item.itemName}
                    <div className="text-[10px] font-normal text-slate-500">{item.category}</div>
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-semibold">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right text-slate-500 font-mono">
                    ₹{item.targetRate}
                  </td>

                  {/* Supplier Rates */}
                  {supplierTotals.map((sup: any) => {
                    const supMatch = item.supplierRates.find((sr: any) => sr.supplierUserCode === sup.supplierUserCode);
                    const isL1 = supMatch && supMatch.rank === 'L1';
                    return (
                      <td
                        key={sup.supplierUserCode}
                        className={`p-3 border-r border-slate-200 text-right font-mono ${
                          isL1 ? 'bg-emerald-100/60 text-emerald-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        {supMatch ? (
                          <div>
                            <span className="font-bold">₹{supMatch.rate.toLocaleString('en-IN')}</span>
                            <span
                              className={`ml-1.5 px-1.5 py-0.2 text-[9px] rounded font-bold ${
                                isL1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {supMatch.rank}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No Quote</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Best L1 Rate Column */}
                  <td className="p-3 text-right font-extrabold text-emerald-800 bg-emerald-50 font-mono">
                    {item.lowestRate !== null ? (
                      <div>
                        ₹{item.lowestRate.toLocaleString('en-IN')}
                        <div className="text-[10px] font-normal text-emerald-600 truncate">{item.bestSupplier}</div>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {/* Grand Total Row */}
              <tr className="bg-slate-900 text-white font-extrabold text-sm">
                <td colSpan={4} className="p-4 text-right">
                  CONSOLIDATED GRAND TOTAL (₹):
                </td>
                {supplierTotals.map((sup: any) => (
                  <td key={sup.supplierUserCode} className="p-4 text-right font-mono text-emerald-400 border-r border-slate-800">
                    ₹{sup.grandTotal.toLocaleString('en-IN')}
                  </td>
                ))}
                <td className="p-4 text-right font-mono text-amber-400 bg-emerald-900">
                  ₹{bestItemWiseTotal.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
