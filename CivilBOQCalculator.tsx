import React, { useState } from 'react';

const CivilBOQ = () => {
  const [inputs, setInputs] = useState({
    plotLength: 20, plotWidth: 15, floors: 2, wallHeight: 3,
    doorsPerFloor: 4, windowsPerFloor: 6, constructionType: 'standard', setback: 1.5,
  });
  const [items, setItems] = useState([]);

  const buildableArea = (inputs.plotLength-2*inputs.setback)*(inputs.plotWidth-2*inputs.setback);
  const netBUA = buildableArea * inputs.floors;
  const multiplier = inputs.constructionType === 'luxury' ? 1.8 : inputs.constructionType === 'premium' ? 1.4 : 1.0;

  const generate = () => {
    const perimeter = 2*((inputs.plotLength-2*inputs.setback)+(inputs.plotWidth-2*inputs.setback));
    const wallArea = perimeter * inputs.wallHeight * inputs.floors;
    const blockWork = wallArea * 0.8 * multiplier;
    const flooring = netBUA * multiplier;
    const concrete = netBUA * 0.15 * multiplier;
    const doors = inputs.doorsPerFloor * inputs.floors;
    const windows = inputs.windowsPerFloor * inputs.floors;
    setItems([
      { name: 'Block Work (6")', qty: Math.round(blockWork), unit: 'sqm', rate: 450 },
      { name: 'Flooring (Vitrified)', qty: Math.round(flooring), unit: 'sqm', rate: 120 },
      { name: 'RCC Concrete M20', qty: Math.round(concrete), unit: 'cum', rate: 5500 },
      { name: 'Doors (Single leaf)', qty: doors, unit: 'nos', rate: 4500 },
      { name: 'Windows (Sliding)', qty: windows, unit: 'nos', rate: 3500 },
    ]);
  };

  const handleInput = (f, v) => setInputs(prev => ({ ...prev, [f]: v }));
  const updateItem = (idx, f, v) => { const newI = [...items]; newI[idx][f] = (f==='qty'||f==='rate')?parseFloat(v)||0:v; setItems(newI); };
  const addRow = () => setItems([...items, { name: 'New', qty:0, unit:'sqm', rate:0 }]);
  const delRow = idx => setItems(items.filter((_,i)=>i!==idx));
  const total = items.reduce((s,i)=>s+(i.qty||0)*(i.rate||0),0);
  const exportCSV = () => { const rows = [['Item','Qty','Unit','Rate','Amount'], ...items.map(i=>[i.name,i.qty,i.unit,i.rate,(i.qty*i.rate).toFixed(2)])]; const csv=rows.map(r=>r.join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='civil_boq.csv'; a.click(); URL.revokeObjectURL(blob); };
  const shareWhatsApp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(`Civil BOQ Total: ₹${total.toFixed(2)}`)}`,'_blank'); };
  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-4">🏗️ Civil BOQ (IS based)</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {Object.entries(inputs).map(([k,v]) => <div key={k}><label className="block font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}</label><input type={k.includes('Type')?'text':'number'} value={v} onChange={e=>handleInput(k, k.includes('Type')?e.target.value:parseFloat(e.target.value))} className="input-field w-full" /></div>)}
      </div>
      <div className="bg-gray-50 p-3 rounded mb-4 text-sm">Net BUA: {netBUA.toFixed(2)} sqm</div>
      <div className="flex gap-3 mb-4"><button onClick={generate} className="btn-primary">Generate BOQ</button><button onClick={exportCSV} className="btn-outline">Export CSV</button><button onClick={shareWhatsApp} className="btn-outline">WhatsApp</button><button onClick={()=>window.print()} className="btn-outline">Print</button><button onClick={addRow} className="btn-secondary">+ Add Row</button></div>
      <div className="overflow-x-auto"><table className="w-full text-sm border"><thead className="bg-gray-100"><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{items.map((i,idx)=><tr key={idx}><td><input value={i.name} onChange={e=>updateItem(idx,'name',e.target.value)} className="input-field w-40" /></td><td><input type="number" value={i.qty} onChange={e=>updateItem(idx,'qty',e.target.value)} className="input-field w-28" /></td><td><input value={i.unit} onChange={e=>updateItem(idx,'unit',e.target.value)} className="input-field w-20" /></td><td><input type="number" value={i.rate} onChange={e=>updateItem(idx,'rate',e.target.value)} className="input-field w-28" /></td><td>₹{(i.qty*i.rate).toFixed(2)}</td><td><button onClick={()=>delRow(idx)} className="text-red-600">X</button></td></tr>))}</tbody></table></div>
      <div className="mt-4 text-right font-bold">Total: ₹{total.toFixed(2)}</div>
    </div>
  );
};
export default CivilBOQ;