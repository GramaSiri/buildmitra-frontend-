import React, { useState, useEffect } from 'react';
import {
  getNearbyRegionalSuppliers,
  createAuction,
  VerifiedSupplier,
  MasterCatalogItem,
  fetchAdminMasterCatalog
} from '../../utils/whatsappAuctionStore';

const UOM_LIST = ["BAGS", "TONNES", "CFT", "LOADS", "SQFT", "LTR", "NOS", "CUM", "KG"];

export default function ExcelSpreadsheetRfqForm({ onRfqCreated }: { onRfqCreated?: (auctionId: string) => void }) {
  const [masterCatalog, setMasterCatalog] = useState<MasterCatalogItem[]>([]);
  const [items, setItems] = useState([
    { id: 1, name: "UltraTech PPC Cement (50kg Bag)", brand: "UltraTech Cement", uom: "BAGS", qty: 500, targetRate: 365, category: "CEMENT" }
  ]);
  const [pinCode, setPinCode] = useState("560068");
  const [address, setAddress] = useState("Plot 42, Green Glen Layout, Bellandur, Bengaluru");
  const [radiusKm, setRadiusKm] = useState<number>(25.0);
  const [statusMsg, setStatusMsg] = useState("");
  const [matchedSuppliers, setMatchedSuppliers] = useState<VerifiedSupplier[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchAdminMasterCatalog();
        if (isMounted) setMasterCatalog(data);
      } catch (e) {}
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const cats = Array.from(new Set(items.map(it => it.category || (it.name.includes("Cement") ? "CEMENT" : "TMT STEEL"))));
    const matched = getNearbyRegionalSuppliers(cats, pinCode, radiusKm);
    setMatchedSuppliers(matched);
  }, [pinCode, radiusKm, items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode || items.length === 0) return;

    const selectedSuppliers = matchedSuppliers.filter(s => s.isSelected !== false);

    const created = createAuction({
      site_address: address,
      site_pincode: pinCode,
      items: items.map(it => ({
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
      selected_suppliers: selectedSuppliers.length ? selectedSuppliers : matchedSuppliers
    });

    setStatusMsg(`🚀 RFQ #${created.id} broadcasted via WhatsApp to ${matchedSuppliers.length} nearby suppliers within ${radiusKm}km of PIN ${pinCode}!`);
    if (onRfqCreated) {
      onRfqCreated(created.id);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>📝</span> Bulk Procurement RFQ & Geofenced Dispatch
        </h2>
        <span className="text-xs text-emerald-400 font-mono">
          {matchedSuppliers.length} Nearby Suppliers Ready
        </span>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-300 text-xs">
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2.5">
          {items.map((it, idx) => (
            <div key={it.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="sm:col-span-1 text-slate-500 font-mono text-center">#{idx + 1}</span>
              <select
                value={it.name}
                onChange={(e) => {
                  const updated = [...items];
                  updated[idx].name = e.target.value;
                  const found = masterCatalog.find(m => (m.name || m.itemName) === e.target.value);
                  if (found) {
                    updated[idx].uom = found.unit || "BAGS";
                    updated[idx].targetRate = found.benchmarkRate || 100;
                    updated[idx].category = found.category || "GENERAL";
                    updated[idx].brand = found.brand || "Standard";
                  }
                  setItems(updated);
                }}
                className="sm:col-span-5 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold outline-none"
              >
                {masterCatalog.map((m, i) => (
                  <option key={i} value={m.name || m.itemName}>
                    {m.name || m.itemName} [{m.category}]
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={it.brand}
                onChange={(e) => {
                  const updated = [...items];
                  updated[idx].brand = e.target.value;
                  setItems(updated);
                }}
                placeholder="Brand"
                className="sm:col-span-3 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none"
              />
              <input
                type="number"
                value={it.qty}
                onChange={(e) => {
                  const updated = [...items];
                  updated[idx].qty = Number(e.target.value);
                  setItems(updated);
                }}
                className="sm:col-span-2 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-center font-bold font-mono outline-none"
              />
              <span className="sm:col-span-1 text-slate-400 font-mono text-right">{it.uom}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Site PIN Code *</label>
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Search Radius</label>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
            >
              <option value={25.0}>25 km (Default Hub)</option>
              <option value={35.0}>35 km (Suburban)</option>
              <option value={50.0}>50 km (Regional)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Site Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition"
        >
          🚀 Broadcast RFQ via WhatsApp to {matchedSuppliers.length} Nearby Suppliers
        </button>
      </form>
    </div>
  );
}
