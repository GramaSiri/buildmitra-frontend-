import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../utils/apiConfig';

interface LineItem {
  id: string;
  itemCode: string;
  itemName: string;
  brandSpec: string;
  unit: string;
  quantity: number | string;
  category: string;
  targetRate: number;
}

interface DeliverySite {
  address: string;
  city: string;
  pincode: string;
  requiredDate: string;
  paymentTerms: string;
  notes: string;
}

interface Props {
  onLaunchRfq: (rfqData: { items: any[]; deliverySite: DeliverySite; selectedSuppliers: string[] }) => void;
  isLoading: boolean;
}

const DEFAULT_UNITS = ['BAGS', 'TONNES', 'SQFT', 'LTR', 'NOS', 'CFT', 'CUM', 'MTR', 'KG', 'SETS', 'LOADS'];

export default function ExcelSpreadsheetRfqForm({ onLaunchRfq, isLoading }: Props) {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: '1',
      itemCode: 'CEM-53-01',
      itemName: 'UltraTech OPC 53 Grade Cement',
      brandSpec: 'UltraTech / OPC 53 Grade',
      unit: 'BAGS',
      quantity: 200,
      category: 'CEMENT',
      targetRate: 345
    },
    {
      id: '2',
      itemCode: 'STL-12-02',
      itemName: '12mm TMT Rebar Fe550D',
      brandSpec: 'Tata Tiscon / Fe550D Seismic',
      unit: 'TONNES',
      quantity: 5,
      category: 'TMT STEEL',
      targetRate: 58500
    }
  ]);

  const [deliverySite, setDeliverySite] = useState<DeliverySite>({
    address: 'Plot 42, Green Glen Layout, Outer Ring Road, Bellandur',
    city: 'Bengaluru',
    pincode: '560068',
    requiredDate: 'Within 48 Hours',
    paymentTerms: 'COD on Unloading',
    notes: 'Site accessible for 10-wheeler trucks'
  });

  // Admin Master Materials state
  const [masterItems, setMasterItems] = useState<any[]>([]);
  const [loadingMaster, setLoadingMaster] = useState<boolean>(false);

  // Active dropdown search state per row
  const [activeSearchRowId, setActiveSearchRowId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Fetch Admin Master Items from backend API
  useEffect(() => {
    const fetchMasterMaterials = async () => {
      try {
        setLoadingMaster(true);
        const res = await fetch(getApiUrl('/api/master/materials'));
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.materials || data.data || [];
        setMasterItems(rawList);
      } catch (err) {
        console.error('Error fetching Admin Master Materials:', err);
      } finally {
        setLoadingMaster(false);
      }
    };

    fetchMasterMaterials();
  }, []);

  const handleRowChange = (id: string, field: keyof LineItem, value: any) => {
    setLineItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        let processedValue = value;
        if (field === 'quantity') {
          processedValue = value === '' ? '' : value.replace(/\D/g, '');
        }

        return { ...row, [field]: processedValue };
      })
    );
  };

  const handleSelectMasterItem = (rowId: string, masterItem: any) => {
    const name = masterItem.itemName || masterItem.product_name || masterItem.name || 'Master Material';
    const cat = (masterItem.category || masterItem.itemType || 'General').toUpperCase();
    const unit = (masterItem.unit || 'BAGS').toUpperCase();
    const spec = masterItem.brand || masterItem.specification || masterItem.subCategory || '';
    const rate = Number(masterItem.referenceRate || masterItem.rate || 0);
    const code = masterItem.masterItemCode || masterItem.material_code || `MAT-${Date.now()}`;

    setLineItems((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          itemCode: code,
          itemName: name,
          brandSpec: spec || row.brandSpec || 'Standard Grade',
          category: cat,
          unit: DEFAULT_UNITS.includes(unit) ? unit : 'BAGS',
          targetRate: rate
        };
      })
    );

    setActiveSearchRowId(null);
    setSearchFilter('');
  };

  const handleAddRow = () => {
    const newId = String(Date.now());
    setLineItems((prev) => [
      ...prev,
      {
        id: newId,
        itemCode: `ITEM-${prev.length + 1}`,
        itemName: '',
        brandSpec: '',
        unit: 'BAGS',
        quantity: 100,
        category: 'General',
        targetRate: 0
      }
    ]);
  };

  const handleDeleteRow = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = lineItems.filter((i) => i.itemName.trim() !== '' && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      alert('Please enter at least one valid material item with quantity.');
      return;
    }
    if (!deliverySite.pincode || deliverySite.pincode.trim().length !== 6) {
      alert('Please enter a valid 6-digit PIN Code.');
      return;
    }
    if (!deliverySite.address || deliverySite.address.trim() === '') {
      alert('Please fill the complete delivery site address.');
      return;
    }

    const formattedItems = validItems.map((it) => ({
      itemCode: it.itemCode,
      itemName: it.itemName,
      category: it.category || 'General',
      quantity: Number(it.quantity) || 1,
      unit: it.unit,
      targetRate: it.targetRate || 0,
      remarks: it.brandSpec
    }));

    onLaunchRfq({ items: formattedItems, deliverySite, selectedSuppliers: [] });
  };

  // Filtered master items for search dropdown
  const filteredMasterItems = masterItems.filter((item) => {
    const q = searchFilter.toLowerCase();
    const name = (item.itemName || item.product_name || '').toLowerCase();
    const code = (item.masterItemCode || item.material_code || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    return name.includes(q) || code.includes(q) || cat.includes(q);
  }).slice(0, 12);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
      {/* Clean Form Header */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 text-white">
        <h2 className="text-lg font-extrabold flex items-center gap-2">
          <span>📝</span> Bulk Procurement RFQ Form
        </h2>
        <span className="text-xs text-slate-400 font-medium">BuildMitra Procurement Desk</span>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Table Container */}
        <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-sm mb-6">
          <table className="w-full text-left text-sm border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-xs uppercase tracking-wider">
                <th className="p-3 border-r border-slate-300 text-center w-12">Sl.No</th>
                <th className="p-3 border-r border-slate-300 min-w-[300px]">
                  Material Item Name (Pick from Admin Master List)
                </th>
                <th className="p-3 border-r border-slate-300 min-w-[220px]">Brand / Specification</th>
                <th className="p-3 border-r border-slate-300 w-28">UOM</th>
                <th className="p-3 border-r border-slate-300 w-36 text-right">QTY</th>
                <th className="p-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row, index) => (
                <tr key={row.id} className="hover:bg-amber-50/40 transition-colors border-b border-slate-200">
                  {/* Sl. No */}
                  <td className="p-3 border-r border-slate-200 text-center text-slate-600 font-bold bg-slate-50">
                    {index + 1}
                  </td>

                  {/* Material Name Search Input + Master List Dropdown */}
                  <td className="p-2.5 border-r border-slate-200 relative">
                    <input
                      type="text"
                      value={row.itemName}
                      onFocus={() => {
                        setActiveSearchRowId(row.id);
                        setSearchFilter(row.itemName);
                      }}
                      onChange={(e) => {
                        handleRowChange(row.id, 'itemName', e.target.value);
                        setActiveSearchRowId(row.id);
                        setSearchFilter(e.target.value);
                      }}
                      placeholder="Search material from Admin Master List..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900 bg-white"
                      required
                    />

                    {/* Master Items Search Dropdown */}
                    {activeSearchRowId === row.id && (
                      <div className="absolute left-0 top-full mt-1 w-full max-w-md bg-white border border-slate-300 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                        <div className="bg-slate-900 text-amber-400 px-3 py-1.5 text-xs font-bold flex justify-between items-center">
                          <span>ADMIN MASTER CATALOG</span>
                          <button
                            type="button"
                            onClick={() => setActiveSearchRowId(null)}
                            className="text-slate-400 hover:text-white font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        {loadingMaster ? (
                          <div className="p-3 text-xs text-slate-500 text-center">Loading master materials...</div>
                        ) : filteredMasterItems.length === 0 ? (
                          <div className="p-3 text-xs text-slate-500">
                            Custom material name entered. Keep typing or select from master.
                          </div>
                        ) : (
                          filteredMasterItems.map((item) => (
                            <div
                              key={item._id || item.id || item.masterItemCode}
                              onClick={() => handleSelectMasterItem(row.id, item)}
                              className="px-3.5 py-2.5 text-xs border-b border-slate-100 hover:bg-amber-50 cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <div className="font-bold text-slate-900">
                                  {item.itemName || item.product_name}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Code: {item.masterItemCode || item.material_code} • {item.category || 'General'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-emerald-700 font-mono">
                                  {item.unit || 'BAGS'}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </td>

                  {/* Brand / Specification Input */}
                  <td className="p-2.5 border-r border-slate-200">
                    <input
                      type="text"
                      value={row.brandSpec}
                      onChange={(e) => handleRowChange(row.id, 'brandSpec', e.target.value)}
                      placeholder="e.g. UltraTech / Fe550D / Grade A"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                    />
                  </td>

                  {/* UOM Dropdown */}
                  <td className="p-2.5 border-r border-slate-200">
                    <select
                      value={row.unit}
                      onChange={(e) => handleRowChange(row.id, 'unit', e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white text-slate-800"
                    >
                      {DEFAULT_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Quantity Input (UNRESTRICTED NUMERIC) */}
                  <td className="p-2.5 border-r border-slate-200">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.quantity}
                      onChange={(e) => handleRowChange(row.id, 'quantity', e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-right font-black text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono bg-amber-50/40"
                      required
                    />
                  </td>

                  {/* Delete Button */}
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      disabled={lineItems.length === 1}
                      className="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-2 rounded-lg hover:bg-rose-50 transition-colors text-base font-bold"
                      title="Delete row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PROMINENT ADD MATERIAL BUTTON */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-500 border border-amber-500 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span className="text-xl font-black">+</span> Add Material Item
          </button>

          <div className="text-sm font-bold text-slate-700">
            Total Items Added: <span className="font-extrabold text-amber-600 font-mono text-base">{lineItems.length}</span>
          </div>
        </div>

        {/* DELIVERY & LOCATION COMMERCIAL TERMS SECTION */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-200 pb-3">
            <span>📍</span> Delivery Site Location & Commercial Terms
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* PROMINENT PIN CODE FIELD */}
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 md:col-span-1 shadow-sm">
              <label className="block text-xs font-black text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>📌</span> Delivery Site PIN Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={deliverySite.pincode}
                onChange={(e) => setDeliverySite({ ...deliverySite, pincode: e.target.value.replace(/\D/g, '') })}
                placeholder="560068"
                className="w-full px-4 py-2.5 text-xl font-black font-mono tracking-widest text-slate-900 border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                required
              />
              <span className="text-[11px] text-amber-800 mt-1 block font-semibold">
                Essential for local supplier auto-matching.
              </span>
            </div>

            {/* SPACIOUS FULL ADDRESS FIELD */}
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                Full Site Delivery Address & Landmark *
              </label>
              <textarea
                rows={3}
                value={deliverySite.address}
                onChange={(e) => setDeliverySite({ ...deliverySite, address: e.target.value })}
                placeholder="Enter site address, street name, plot number, and landmark..."
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900 bg-white"
                required
              />
            </div>

            {/* Required By Timeline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Required By (Delivery Timeline)
              </label>
              <input
                type="text"
                value={deliverySite.requiredDate}
                onChange={(e) => setDeliverySite({ ...deliverySite, requiredDate: e.target.value })}
                placeholder="e.g. Within 24-48 Hours"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Payment Terms (COD) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Payment Terms
              </label>
              <select
                value={deliverySite.paymentTerms}
                onChange={(e) => setDeliverySite({ ...deliverySite, paymentTerms: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
              >
                <option value="COD on Unloading">COD on Unloading</option>
                <option value="100% Advance">100% Advance</option>
                <option value="50% Advance / 50% Delivery">50% Advance / 50% Delivery</option>
                <option value="7 Days Credit (Verified Buyer)">7 Days Credit (Verified Buyer)</option>
              </select>
            </div>

            {/* Unloading Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Unloading / Gate Instructions
              </label>
              <input
                type="text"
                value={deliverySite.notes}
                onChange={(e) => setDeliverySite({ ...deliverySite, notes: e.target.value })}
                placeholder="e.g. Crane required / Narrow lane..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* FINAL SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Broadcasting RFQ...</span>
            ) : (
              <span>🚀 Submit RFQ</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
