import React, { useState, useEffect } from 'react';
import { getCurrentUser, logout, getEnquiriesForVendor, addQuote } from './VendorAuth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VendorDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState({
    businessType: '', address: '', gst: '', pan: '', logo: '', images: [], catalog: '',
    phone: '', email: '', offers: []
  });
  const [materials, setMaterials] = useState([]);
  const [services, setServices] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quoteAmounts, setQuoteAmounts] = useState({});
  const [quoteDetails, setQuoteDetails] = useState({});
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Material form state
  const [newMaterial, setNewMaterial] = useState({
    name: '', unit: '', price: '', stock: '', discount: 0, offerValidFrom: '', offerValidTo: '',
    description: '', images: [], catalogUrl: ''
  });
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Service form state
  const [newService, setNewService] = useState({
    name: '', description: '', rate: '', discount: 0, offerValidFrom: '', offerValidTo: '', images: [], catalogUrl: ''
  });
  const [serviceImagePreviews, setServiceImagePreviews] = useState([]);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) window.location.href = '/vendor-auth';
    else setUser(u);
    const vendorData = JSON.parse(localStorage.getItem(`vendorData_${u.id}`) || '{}');
    setProfile({ ...profile, ...vendorData.profile, phone: u.phone, email: u.email });
    setMaterials(vendorData.materials || []);
    setServices(vendorData.services || []);
    const enqs = getEnquiriesForVendor(u.id);
    setEnquiries(enqs);
    setOrders(vendorData.orders || []);
    // dummy chart data (can be replaced with real aggregation)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    setChartData(months.map((m, idx) => ({
      month: m,
      enquiries: Math.floor(Math.random() * 10) + 1,
      quotes: Math.floor(Math.random() * 8) + 1,
      orders: Math.floor(Math.random() * 5) + 1
    })));
  }, []);

  const saveVendorData = () => {
    const data = { profile, materials, services, orders };
    localStorage.setItem(`vendorData_${user.id}`, JSON.stringify(data));
    alert('Profile saved');
  };

  // Material handlers
  const handleMaterialImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
    const base64Promises = files.map(f => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(f);
    }));
    Promise.all(base64Promises).then(imgs => setNewMaterial({ ...newMaterial, images: imgs }));
  };

  const handleCatalogUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewMaterial({ ...newMaterial, catalogUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const addMaterial = () => {
    if (!newMaterial.name || !newMaterial.price) return alert('Name and price required');
    setMaterials([...materials, { id: Date.now(), ...newMaterial, createdAt: new Date().toISOString() }]);
    setNewMaterial({ name: '', unit: '', price: '', stock: '', discount: 0, offerValidFrom: '', offerValidTo: '', description: '', images: [], catalogUrl: '' });
    setImagePreviews([]);
  };

  const updateMaterial = () => {
    if (!editingMaterial) return;
    setMaterials(materials.map(m => m.id === editingMaterial.id ? { ...m, ...newMaterial } : m));
    setEditingMaterial(null);
    setNewMaterial({ name: '', unit: '', price: '', stock: '', discount: 0, offerValidFrom: '', offerValidTo: '', description: '', images: [], catalogUrl: '' });
    setImagePreviews([]);
  };

  const editMaterial = (mat) => {
    setEditingMaterial(mat);
    setNewMaterial({ ...mat });
    if (mat.images && mat.images.length) setImagePreviews(mat.images);
  };

  const deleteMaterial = (id) => window.confirm('Delete?') && setMaterials(materials.filter(m => m.id !== id));

  // CSV upload with unit
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split(/\r?\n/);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = [];
      for (let i=1; i<lines.length; i++) {
        if (!lines[i].trim()) continue;
        const vals = lines[i].split(',').map(v => v.trim());
        let row = {};
        headers.forEach((h, idx) => { row[h] = vals[idx]; });
        data.push(row);
      }
      setCsvPreview(data);
      setCsvFile(data);
    };
    reader.readAsText(file);
  };

  const importCsv = () => {
    if (!csvFile) return;
    const newItems = csvFile.map(row => ({
      id: Date.now() + Math.random(),
      name: row.name || row['item name'],
      unit: row.unit || row.uom || '',
      price: parseFloat(row.price) || 0,
      stock: parseFloat(row.stock) || 0,
      discount: parseFloat(row.discount) || 0,
      offerValidFrom: row.offerfrom || '',
      offerValidTo: row.offerto || '',
      description: row.description || '',
      images: [],
      catalogUrl: '',
    }));
    setMaterials([...materials, ...newItems]);
    setCsvFile(null);
    setCsvPreview([]);
    alert(`Imported ${newItems.length} items`);
  };

  // Services
  const handleServiceImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => URL.createObjectURL(f));
    setServiceImagePreviews(previews);
    const base64Promises = files.map(f => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(f);
    }));
    Promise.all(base64Promises).then(imgs => setNewService({ ...newService, images: imgs }));
  };

  const addService = () => {
    if (!newService.name || !newService.rate) return alert('Name and rate required');
    setServices([...services, { id: Date.now(), ...newService }]);
    setNewService({ name: '', description: '', rate: '', discount: 0, offerValidFrom: '', offerValidTo: '', images: [], catalogUrl: '' });
    setServiceImagePreviews([]);
  };

  const updateService = () => {
    if (!editingService) return;
    setServices(services.map(s => s.id === editingService.id ? { ...s, ...newService } : s));
    setEditingService(null);
    setNewService({ name: '', description: '', rate: '', discount: 0, offerValidFrom: '', offerValidTo: '', images: [], catalogUrl: '' });
    setServiceImagePreviews([]);
  };

  const editService = (svc) => {
    setEditingService(svc);
    setNewService({ ...svc });
    if (svc.images && svc.images.length) setServiceImagePreviews(svc.images);
  };

  const deleteService = (id) => window.confirm('Delete?') && setServices(services.filter(s => s.id !== id));

  // Enquiries & quotes
  const sendQuote = (enquiryId, amount, detail) => {
    addQuote(enquiryId, { vendorId: user.id, vendorName: user.name, reply: detail, amount });
    alert('Quote sent!');
    setEnquiries(getEnquiriesForVendor(user.id));
  };

  const shareWhatsApp = (quote) => {
    const msg = `🏗️ BuildMitra Quote\nVendor: ${user.name}\nQuote: ${quote.reply}\nAmount: ₹${quote.amount}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const tabs = ['dashboard', 'profile', 'materials', 'services', 'enquiries', 'orders'];
  const tabLabels = { dashboard: '📊 Dashboard', profile: '🏢 Profile', materials: '📦 Materials', services: '🛠️ Services', enquiries: '📩 Enquiries', orders: '📋 Orders' };
  const totalQuotesSent = enquiries.reduce((sum, e) => sum + (e.quotes ? e.quotes.length : 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Vendor Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name} ({user?.role})</p>
          </div>
          <button onClick={logout} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">Logout</button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {tabLabels[tab]}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg"><div className="p-5"><div className="flex items-center"><div className="flex-shrink-0 bg-indigo-500 rounded-md p-3"><svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div><div className="ml-5"><dt className="text-sm font-medium text-gray-500">Materials</dt><dd className="text-2xl font-semibold text-gray-900">{materials.length}</dd></div></div></div></div>
              <div className="bg-white overflow-hidden shadow rounded-lg"><div className="p-5"><div className="flex items-center"><div className="flex-shrink-0 bg-green-500 rounded-md p-3"><svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div><div className="ml-5"><dt className="text-sm font-medium text-gray-500">Services</dt><dd className="text-2xl font-semibold text-gray-900">{services.length}</dd></div></div></div></div>
              <div className="bg-white overflow-hidden shadow rounded-lg"><div className="p-5"><div className="flex items-center"><div className="flex-shrink-0 bg-yellow-500 rounded-md p-3"><svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div><div className="ml-5"><dt className="text-sm font-medium text-gray-500">Enquiries</dt><dd className="text-2xl font-semibold text-gray-900">{enquiries.length}</dd></div></div></div></div>
              <div className="bg-white overflow-hidden shadow rounded-lg"><div className="p-5"><div className="flex items-center"><div className="flex-shrink-0 bg-purple-500 rounded-md p-3"><svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></div><div className="ml-5"><dt className="text-sm font-medium text-gray-500">Orders</dt><dd className="text-2xl font-semibold text-gray-900">{orders.length}</dd></div></div></div></div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Activity (Enquiries / Quotes / Orders)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enquiries" fill="#f59e0b" name="Enquiries" />
                  <Bar dataKey="quotes" fill="#10b981" name="Quotes Sent" />
                  <Bar dataKey="orders" fill="#6366f1" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center text-sm text-gray-500">Total Quotes Sent: {totalQuotesSent}</div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Business Profile</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input className="border rounded-md p-2 w-full" placeholder="Business Type" value={profile.businessType} onChange={e=>setProfile({...profile,businessType:e.target.value})} />
              <input className="border rounded-md p-2 w-full" placeholder="GSTIN" value={profile.gst} onChange={e=>setProfile({...profile,gst:e.target.value})} />
              <input className="border rounded-md p-2 w-full" placeholder="PAN" value={profile.pan} onChange={e=>setProfile({...profile,pan:e.target.value})} />
              <input className="border rounded-md p-2 w-full" placeholder="Phone" value={profile.phone} readOnly />
              <textarea className="border rounded-md p-2 w-full" placeholder="Address" rows="2" value={profile.address} onChange={e=>setProfile({...profile,address:e.target.value})} />
              <input className="border rounded-md p-2 w-full" placeholder="Logo URL" value={profile.logo} onChange={e=>setProfile({...profile,logo:e.target.value})} />
              <input type="file" accept=".pdf" onChange={e=>{if(e.target.files[0]) setProfile({...profile,catalog:URL.createObjectURL(e.target.files[0])})}} />
            </div>
            <button onClick={saveVendorData} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save Profile</button>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <h2 className="text-xl font-bold">Materials / Products</h2>
              <div className="flex gap-2">
                <label className="bg-gray-200 hover:bg-gray-300 cursor-pointer px-3 py-1 rounded-md text-sm">📂 Bulk CSV Upload<input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" /></label>
                <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm" onClick={() => { setEditingMaterial(null); setNewMaterial({ name: '', unit: '', price: '', stock: '', discount: 0, offerValidFrom: '', offerValidTo: '', description: '', images: [], catalogUrl: '' }); setImagePreviews([]); }}>+ Add Material</button>
              </div>
            </div>
            {csvPreview.length > 0 && (
              <div className="bg-gray-50 p-3 mb-4 rounded-md">
                <p><strong>CSV Preview:</strong> {csvPreview.length} items ready. <button onClick={importCsv} className="text-indigo-600">Confirm Import</button></p>
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <div className="grid md:grid-cols-3 gap-3">
                <input placeholder="Name" value={newMaterial.name} onChange={e=>setNewMaterial({...newMaterial,name:e.target.value})} className="border rounded-md p-2" />
                <input placeholder="Unit (kg, bag, etc.)" value={newMaterial.unit} onChange={e=>setNewMaterial({...newMaterial,unit:e.target.value})} className="border rounded-md p-2" />
                <input placeholder="Price (₹)" type="number" value={newMaterial.price} onChange={e=>setNewMaterial({...newMaterial,price:e.target.value})} className="border rounded-md p-2" />
                <input placeholder="Stock" type="number" value={newMaterial.stock} onChange={e=>setNewMaterial({...newMaterial,stock:e.target.value})} className="border rounded-md p-2" />
                <input placeholder="Discount %" type="number" value={newMaterial.discount} onChange={e=>setNewMaterial({...newMaterial,discount:e.target.value})} className="border rounded-md p-2" />
                <input placeholder="Offer Valid From" type="date" value={newMaterial.offerValidFrom} onChange={e=>setNewMaterial({...newMaterial,offerValidFrom:e.target.value})} className="border rounded-md p-2" />
                <input placeholder="Offer Valid To" type="date" value={newMaterial.offerValidTo} onChange={e=>setNewMaterial({...newMaterial,offerValidTo:e.target.value})} className="border rounded-md p-2" />
                <textarea placeholder="Description" rows="2" value={newMaterial.description} onChange={e=>setNewMaterial({...newMaterial,description:e.target.value})} className="border rounded-md p-2 md:col-span-2" />
                <div><label className="block text-sm font-medium">Upload Images</label><input type="file" multiple accept="image/*" onChange={handleMaterialImageUpload} /></div>
                {imagePreviews.length > 0 && <div className="flex gap-2">{imagePreviews.map((img,i)=><img key={i} src={img} className="w-16 h-16 object-cover rounded" />)}</div>}
                <div><label className="block text-sm font-medium">Upload Catalog (PDF)</label><input type="file" accept=".pdf" onChange={handleCatalogUpload} /></div>
                {editingMaterial ? <button onClick={updateMaterial} className="bg-green-600 text-white px-3 py-1 rounded-md">Update</button> : <button onClick={addMaterial} className="bg-indigo-600 text-white px-3 py-1 rounded-md">Add</button>}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valid Till</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td className="px-4 py-2">{m.name}</td>
                      <td className="px-4 py-2">{m.unit}</td>
                      <td className="px-4 py-2">₹{m.price}</td>
                      <td className="px-4 py-2">{m.stock}</td>
                      <td className="px-4 py-2">{m.discount}%</td>
                      <td className="px-4 py-2">{m.offerValidTo || '-'}</td>
                      <td className="px-4 py-2">
                        <button onClick={()=>editMaterial(m)} className="text-indigo-600 mr-2">Edit</button>
                        <button onClick={()=>deleteMaterial(m.id)} className="text-red-600">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Services</h2><button className="bg-indigo-600 text-white px-3 py-1 rounded-md" onClick={() => { setEditingService(null); setNewService({ name: '', description: '', rate: '', discount: 0, offerValidFrom: '', offerValidTo: '', images: [], catalogUrl: '' }); setServiceImagePreviews([]); }}>+ Add Service</button></div>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <div className="grid md:grid-cols-2 gap-3">
                <input placeholder="Name" value={newService.name} onChange={e=>setNewService({...newService,name:e.target.value})} className="border rounded-md p-2" />
                <input placeholder="Rate (₹)" type="number" value={newService.rate} onChange={e=>setNewService({...newService,rate:e.target.value})} className="border rounded-md p-2" />
                <input placeholder="Discount %" type="number" value={newService.discount} onChange={e=>setNewService({...newService,discount:e.target.value})} className="border rounded-md p-2" />
                <input placeholder="Offer Valid From" type="date" value={newService.offerValidFrom} onChange={e=>setNewService({...newService,offerValidFrom:e.target.value})} className="border rounded-md p-2" />
                <input placeholder="Offer Valid To" type="date" value={newService.offerValidTo} onChange={e=>setNewService({...newService,offerValidTo:e.target.value})} className="border rounded-md p-2" />
                <textarea placeholder="Description" rows="2" value={newService.description} onChange={e=>setNewService({...newService,description:e.target.value})} className="border rounded-md p-2" />
                <div><label className="block text-sm font-medium">Upload Images</label><input type="file" multiple accept="image/*" onChange={handleServiceImageUpload} /></div>
                {serviceImagePreviews.length > 0 && <div className="flex gap-2">{serviceImagePreviews.map((img,i)=><img key={i} src={img} className="w-16 h-16 object-cover rounded" />)}</div>}
                {editingService ? <button onClick={updateService} className="bg-green-600 text-white px-3 py-1 rounded-md">Update</button> : <button onClick={addService} className="bg-indigo-600 text-white px-3 py-1 rounded-md">Add</button>}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2">Name</th><th>Rate</th><th>Discount</th><th>Valid Till</th><th>Actions</th></tr></thead>
                <tbody>{services.map(s => <tr key={s.id}><td className="px-4 py-2">{s.name}</td><td className="px-4 py-2">₹{s.rate}</td><td className="px-4 py-2">{s.discount}%</td><td className="px-4 py-2">{s.offerValidTo || '-'}</td><td className="px-4 py-2"><button onClick={()=>editService(s)} className="text-indigo-600 mr-2">Edit</button><button onClick={()=>deleteService(s.id)} className="text-red-600">Delete</button></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enquiries Tab */}
        {activeTab === 'enquiries' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">📩 Enquiries Received</h2>
            {enquiries.length === 0 && <p className="text-gray-500">No enquiries yet.</p>}
            {enquiries.map(e => (
              <div key={e.id} className="border rounded-lg p-4 mb-4 bg-gray-50">
                <p><strong>Requirement:</strong> {e.requirement}</p>
                <p><strong>Quantity:</strong> {e.quantity}</p>
                <p><strong>Delivery Address:</strong> {e.deliveryAddress}</p>
                <p><strong>Buyer:</strong> {e.buyerName} ({e.buyerEmail})</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input type="text" placeholder="Quote Amount (₹)" className="border rounded-md p-1 w-32" value={quoteAmounts[e.id]||''} onChange={t=>setQuoteAmounts({...quoteAmounts, [e.id]: t.target.value})} />
                  <textarea placeholder="Quote details" rows="2" className="border rounded-md p-1 w-64" value={quoteDetails[e.id]||''} onChange={t=>setQuoteDetails({...quoteDetails, [e.id]: t.target.value})} />
                  <button onClick={()=>sendQuote(e.id, quoteAmounts[e.id], quoteDetails[e.id])} className="bg-blue-600 text-white px-3 py-1 rounded-md">Send Quote</button>
                </div>
                {e.quotes?.map(q => (
                  <div key={q.id} className="mt-2 p-2 bg-white border rounded-md">
                    <p><strong>Your Quote:</strong> {q.reply} - ₹{q.amount}</p>
                    <button onClick={()=>shareWhatsApp(q)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">📱 WhatsApp</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">📦 Orders Received</h2>
            {orders.length === 0 && <p className="text-gray-500">No orders yet. Quotes accepted will appear here.</p>}
            {orders.map(o => (
              <div key={o.id} className="border rounded-lg p-4 mb-4">
                <p><strong>Order ID:</strong> {o.id}</p>
                <p><strong>Item:</strong> {o.itemName}</p>
                <p><strong>Quantity:</strong> {o.qty}</p>
                <p><strong>Total:</strong> ₹{o.total}</p>
                <p><strong>Status:</strong> {o.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default VendorDashboard;
'@

