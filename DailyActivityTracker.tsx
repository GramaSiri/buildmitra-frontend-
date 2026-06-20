import React, { useState, useEffect } from 'react';

interface MaterialTransaction {
  id: string;
  date: string;
  materialName: string;
  type: 'receive' | 'consume';
  quantity: number;
  unit: string;
  supplier?: string;
  invoiceNo?: string;
  amount?: number;
  remarks?: string;
}

interface ProjectMaster {
  projectName: string;
  startDate: string;
  plotSize: string;
  buildingType: string;
  floors: number;
  totalBUA: number;
  milestones: Array<{ name: string; targetDate: string; completed: boolean }>;
}

const DailyActivityTracker = () => {
  // ----- Project Master Data -----
  const [project, setProject] = useState<ProjectMaster>(() => {
    const saved = localStorage.getItem('projectMaster');
    return saved ? JSON.parse(saved) : {
      projectName: 'Green Valley Apartments',
      startDate: new Date().toISOString().slice(0,10),
      plotSize: '2400 sqft',
      buildingType: 'Residential',
      floors: 4,
      totalBUA: 9600,
      milestones: [],
    };
  });

  // ----- Material Inventory -----
  const [materials, setMaterials] = useState<MaterialTransaction[]>(() => {
    const saved = localStorage.getItem('materialTransactions');
    return saved ? JSON.parse(saved) : [];
  });

  // ----- Form states for adding material transaction -----
  const [transForm, setTransForm] = useState({
    date: new Date().toISOString().slice(0,10),
    materialName: '',
    type: 'receive' as 'receive' | 'consume',
    quantity: 0,
    unit: 'kg',
    supplier: '',
    invoiceNo: '',
    amount: 0,
    remarks: '',
  });

  // ----- Update Project Master -----
  const updateProject = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  // Auto‑generate milestones when project data changes (simplified: every 15 days)
  const generateMilestones = () => {
    const start = new Date(project.startDate);
    const durationDays = 120; // mock project duration
    const step = 15;
    const milestones = [];
    for (let i = step; i <= durationDays; i += step) {
      const target = new Date(start);
      target.setDate(start.getDate() + i);
      milestones.push({
        name: `Milestone ${i/step}`,
        targetDate: target.toISOString().slice(0,10),
        completed: false,
      });
    }
    setProject(prev => ({ ...prev, milestones }));
  };

  const saveProject = () => {
    localStorage.setItem('projectMaster', JSON.stringify(project));
    alert('Project data saved');
  };

  // ----- Material Inventory Logic -----
  const addTransaction = () => {
    if (!transForm.materialName || transForm.quantity <= 0) {
      alert('Material name and positive quantity required');
      return;
    }
    const newTrans: MaterialTransaction = {
      id: Date.now().toString(),
      date: transForm.date,
      materialName: transForm.materialName,
      type: transForm.type,
      quantity: transForm.quantity,
      unit: transForm.unit,
      supplier: transForm.supplier,
      invoiceNo: transForm.invoiceNo,
      amount: transForm.amount,
      remarks: transForm.remarks,
    };
    const updated = [...materials, newTrans];
    setMaterials(updated);
    localStorage.setItem('materialTransactions', JSON.stringify(updated));
    // Reset form
    setTransForm({
      date: new Date().toISOString().slice(0,10),
      materialName: '',
      type: 'receive',
      quantity: 0,
      unit: 'kg',
      supplier: '',
      invoiceNo: '',
      amount: 0,
      remarks: '',
    });
  };

  const deleteTransaction = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    localStorage.setItem('materialTransactions', JSON.stringify(updated));
  };

  // Compute stock per material (receive - consume)
  const stockMap = new Map<string, number>();
  materials.forEach(m => {
    const curr = stockMap.get(m.materialName) || 0;
    if (m.type === 'receive') stockMap.set(m.materialName, curr + m.quantity);
    else stockMap.set(m.materialName, curr - m.quantity);
  });

  // ----- Exports -----
  const exportToCSV = () => {
    const headers = ['Date', 'Material', 'Type', 'Quantity', 'Unit', 'Supplier', 'Invoice', 'Amount', 'Remarks'];
    const rows = materials.map(m => [m.date, m.materialName, m.type, m.quantity, m.unit, m.supplier || '', m.invoiceNo || '', m.amount || '', m.remarks || '']);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${project.projectName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => window.print();
  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Project: ${project.projectName}\nInventory stock: ${Array.from(stockMap.entries()).map(([k,v])=>`${k}: ${v}`).join(', ')}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  const shareEmail = () => {
    window.location.href = `mailto:?subject=Project Inventory Report&body=Stock summary: ${Array.from(stockMap.entries()).map(([k,v])=>`${k}: ${v}`).join(', ')}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">🏗️ Project Management & Inventory</h1>
      <p className="text-gray-600 mb-6">Project master data, automated milestones, material stock tracking.</p>

      {/* Project Master Data Section */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-bold mb-4">📋 Project Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block font-medium">Project Name</label><input type="text" name="projectName" value={project.projectName} onChange={updateProject} className="input-field w-full" /></div>
          <div><label className="block font-medium">Start Date</label><input type="date" name="startDate" value={project.startDate} onChange={updateProject} className="input-field w-full" /></div>
          <div><label className="block font-medium">Plot Size</label><input type="text" name="plotSize" value={project.plotSize} onChange={updateProject} className="input-field w-full" /></div>
          <div><label className="block font-medium">Building Type</label><input type="text" name="buildingType" value={project.buildingType} onChange={updateProject} className="input-field w-full" /></div>
          <div><label className="block font-medium">No. of Floors</label><input type="number" name="floors" value={project.floors} onChange={updateProject} className="input-field w-full" /></div>
          <div><label className="block font-medium">Total BUA (sqft)</label><input type="number" name="totalBUA" value={project.totalBUA} onChange={updateProject} className="input-field w-full" /></div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={generateMilestones} className="btn-secondary">Generate Milestone Schedule</button>
          <button onClick={saveProject} className="btn-primary">Save Project</button>
        </div>
        {project.milestones.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">📅 System‑Generated Milestones</h3>
            <ul className="list-disc pl-5">{project.milestones.map((m, idx) => <li key={idx}>{m.name} – due {m.targetDate} {m.completed ? '✅' : '⏳'}</li>)}</ul>
          </div>
        )}
      </div>

      {/* Material Inventory Section */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-bold mb-4">📦 Material Stock & Transactions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 border p-4 rounded">
          <div><label>Date</label><input type="date" value={transForm.date} onChange={e => setTransForm({...transForm, date: e.target.value})} className="input-field w-full" /></div>
          <div><label>Material Name</label><input type="text" value={transForm.materialName} onChange={e => setTransForm({...transForm, materialName: e.target.value})} className="input-field w-full" /></div>
          <div><label>Type</label><select value={transForm.type} onChange={e => setTransForm({...transForm, type: e.target.value as any})} className="input-field w-full"><option value="receive">Receive (Purchase)</option><option value="consume">Consume (Issue)</option></select></div>
          <div><label>Quantity</label><input type="number" value={transForm.quantity} onChange={e => setTransForm({...transForm, quantity: parseFloat(e.target.value)})} className="input-field w-full" /></div>
          <div><label>Unit</label><input type="text" value={transForm.unit} onChange={e => setTransForm({...transForm, unit: e.target.value})} className="input-field w-full" /></div>
          <div><label>Supplier Name</label><input type="text" value={transForm.supplier} onChange={e => setTransForm({...transForm, supplier: e.target.value})} className="input-field w-full" /></div>
          <div><label>Invoice No.</label><input type="text" value={transForm.invoiceNo} onChange={e => setTransForm({...transForm, invoiceNo: e.target.value})} className="input-field w-full" /></div>
          <div><label>Amount (₹)</label><input type="number" value={transForm.amount} onChange={e => setTransForm({...transForm, amount: parseFloat(e.target.value)})} className="input-field w-full" /></div>
          <div><label>Remarks</label><input type="text" value={transForm.remarks} onChange={e => setTransForm({...transForm, remarks: e.target.value})} className="input-field w-full" /></div>
        </div>
        <button onClick={addTransaction} className="btn-primary mb-4">Add Transaction</button>

        <h3 className="font-bold text-lg mt-4">Current Stock</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {Array.from(stockMap.entries()).map(([name, qty]) => <div key={name} className="bg-gray-100 p-2 rounded">🧱 {name}: {qty} {materials.find(m=>m.materialName===name)?.unit || ''}</div>)}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100"><tr><th className="p-2">Date</th><th>Material</th><th>Type</th><th>Qty</th><th>Supplier</th><th>Invoice</th><th>Amount</th><th>Actions</th></tr></thead>
            <tbody>{materials.map(m => <tr key={m.id} className="border-b"><td className="p-2">{m.date}</td><td>{m.materialName}</td><td>{m.type}</td><td>{m.quantity}</td><td>{m.supplier}</td><td>{m.invoiceNo}</td><td>₹{m.amount}</td><td><button onClick={()=>deleteTransaction(m.id)} className="text-red-600">Delete</button></td></tr>)}</tbody>
          </table>
        </div>
      </div>

      {/* Export / Share */}
      <div className="flex flex-wrap gap-3 mt-4">
        <button onClick={exportToCSV} className="bg-green-700 text-white px-4 py-2 rounded-xl">📎 Export Excel</button>
        <button onClick={exportPDF} className="bg-red-700 text-white px-4 py-2 rounded-xl">🖨️ Print / PDF</button>
        <button onClick={shareWhatsApp} className="bg-green-600 text-white px-4 py-2 rounded-xl">📱 WhatsApp</button>
        <button onClick={shareEmail} className="bg-blue-700 text-white px-4 py-2 rounded-xl">✉️ Email</button>
      </div>
    </div>
  );
};

export default DailyActivityTracker;