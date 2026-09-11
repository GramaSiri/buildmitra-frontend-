import React from 'react';

interface Supplier {
  supplierUserCode: string;
  supplierName: string;
  supplierPhone: string;
  enquiryCode: string;
  whatsappStatus: string;
  quoteUrl: string;
  whatsappUrl: string;
}

interface Props {
  batchCode: string;
  suppliers: Supplier[];
  onClose: () => void;
  onViewTabulation: () => void;
}

export default function WhatsappBroadcastStatus({ batchCode, suppliers, onClose, onViewTabulation }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl text-2xl">📱</div>
            <div>
              <h2 className="text-lg font-bold">WhatsApp RFQ Broadcast Dispatched!</h2>
              <p className="text-emerald-100 text-xs">
                Batch Code: <span className="font-mono font-bold text-white">{batchCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white text-2xl font-bold p-1 rounded hover:bg-emerald-800"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-emerald-900 text-sm flex items-start gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-bold">Automated RFQ Successfully Broadcasted</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Matched <span className="font-bold">{suppliers.length} verified local suppliers</span> within delivery pincode. Use the active buttons below to trigger WhatsApp messages or submit quotes directly.
              </p>
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Target Supplier Broadcast Registry ({suppliers.length})
          </h3>

          <div className="space-y-3 mb-6 max-h-[360px] overflow-y-auto pr-1">
            {suppliers.map((sup, idx) => {
              const cleanPhone = (sup.supplierPhone || '').replace(/\D/g, '');
              const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
              const webWhatsappUrl = sup.whatsappUrl ? sup.whatsappUrl.replace('api.whatsapp.com', 'web.whatsapp.com') : `https://web.whatsapp.com/send?phone=${formattedPhone}`;

              return (
                <div
                  key={sup.supplierUserCode || idx}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{sup.supplierName}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        Phone: {sup.supplierPhone || 'Verified Vendor'} • Code: {sup.supplierUserCode}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mobile WhatsApp Button */}
                    <a
                      href={sup.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors"
                    >
                      <span>📱 Mobile WhatsApp</span>
                    </a>

                    {/* Web WhatsApp Button */}
                    <a
                      href={webWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-lg shadow transition-colors"
                    >
                      <span>💻 Web WhatsApp</span>
                    </a>

                    {/* 1-Click Submit Bid Link */}
                    <a
                      href={sup.quoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-lg shadow transition-colors"
                    >
                      <span>⚡ Submit Bid (1-Click)</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Close Window
            </button>

            <button
              onClick={onViewTabulation}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>📊 Open Automated BI Tabulation & Live Quotes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
