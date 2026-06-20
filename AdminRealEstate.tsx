import React, { useState, useEffect } from 'react';
import { getCurrentUser, logout } from './auth';

const AdminRealEstate = () => {
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || u.role !== 'admin') window.location.href = '/real-estate';
    loadData();
  }, []);

  const loadData = () => {
    setProperties(JSON.parse(localStorage.getItem('reProperties') || '[]'));
    setUsers(JSON.parse(localStorage.getItem('reUsers') || '[]'));
    setContactRequests(JSON.parse(localStorage.getItem('reContactRequests') || '[]'));
    setRequirements(JSON.parse(localStorage.getItem('reRequirements') || '[]'));
  };

  useEffect(() => {
    filterRequests();
  }, [contactRequests, filter]);

  const filterRequests = () => {
    const now = new Date();
    let filtered = [...contactRequests];
    if (filter === 'day') {
      filtered = filtered.filter(r => new Date(r.id).toDateString() === now.toDateString());
    } else if (filter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(r => new Date(r.id) >= weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filtered = filtered.filter(r => new Date(r.id) >= monthAgo);
    }
    setFilteredRequests(filtered);
  };

  const approveContact = (reqId) => {
    const updated = contactRequests.map(r => r.id === reqId ? { ...r, status: 'approved' } : r);
    localStorage.setItem('reContactRequests', JSON.stringify(updated));
    setContactRequests(updated);
    const req = updated.find(r => r.id === reqId);
    const buyer = users.find(u => u.id === req.buyerId);
    const seller = users.find(u => u.id === req.sellerId);
    const property = properties.find(p => p.id === req.propertyId);
    if (buyer && seller && property) {
      alert(`✔ Contact approved!\nBuyer: ${buyer.name} (${buyer.email})\nSeller: ${seller.name} (${seller.phone})`);
    }
  };

  const exportCRM = () => {
    const rows = [['Date', 'Buyer Name', 'Buyer Email', 'Buyer Phone', 'Property Title', 'Seller Name', 'Seller Phone', 'Status']];
    contactRequests.forEach(r => {
      const buyer = users.find(u => u.id === r.buyerId);
      const seller = users.find(u => u.id === r.sellerId);
      const prop = properties.find(p => p.id === r.propertyId);
      rows.push([
        new Date(r.id).toLocaleString(),
        buyer?.name || '', buyer?.email || '', buyer?.phone || '',
        prop?.title || '', seller?.name || '', seller?.phone || '',
        r.status
      ]);
    });
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingCount = contactRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-800">👑 Real Estate Admin</h1>
          <div className="flex gap-4 items-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">Pending: {pendingCount}</span>
            <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition">Logout</button>
          </div>
        </div>

        {/* CRM Enquiries Sheet */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📊 CRM – Enquiries & Contact Requests</h2>
            <div className="flex gap-2">
              <button onClick={() => setFilter('day')} className={`px-3 py-1 rounded ${filter === 'day' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Today</button>
              <button onClick={() => setFilter('week')} className={`px-3 py-1 rounded ${filter === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>This Week</button>
              <button onClick={() => setFilter('month')} className={`px-3 py-1 rounded ${filter === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>This Month</button>
              <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>All</button>
              <button onClick={exportCRM} className="bg-green-600 text-white px-3 py-1 rounded">📎 Export CSV</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Buyer Name</th>
                  <th className="p-2 border">Buyer Email</th>
                  <th className="p-2 border">Buyer Phone</th>
                  <th className="p-2 border">Property</th>
                  <th className="p-2 border">Seller Name</th>
                  <th className="p-2 border">Seller Phone</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(r => {
                  const buyer = users.find(u => u.id === r.buyerId);
                  const seller = users.find(u => u.id === r.sellerId);
                  const prop = properties.find(p => p.id === r.propertyId);
                  return (
                    <tr key={r.id} className="even:bg-gray-50">
                      <td className="p-2 border">{new Date(r.id).toLocaleString()}</td>
                      <td className="p-2 border">{buyer?.name || '-'}</td>
                      <td className="p-2 border">{buyer?.email || '-'}</td>
                      <td className="p-2 border">{buyer?.phone || '-'}</td>
                      <td className="p-2 border">{prop?.title || '-'}</td>
                      <td className="p-2 border">{seller?.name || '-'}</td>
                      <td className="p-2 border">{seller?.phone || '-'}</td>
                      <td className="p-2 border"><span className={`px-2 py-1 rounded-full text-xs ${r.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span></td>
                      <td className="p-2 border">{r.status === 'pending' && <button onClick={() => approveContact(r.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Approve</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Properties & Users sections (compact) */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🏢 Properties</h2>
            {properties.map(p => (
              <div key={p.id} className="border p-3 mb-2 rounded flex justify-between items-center">
                <div><strong>{p.title}</strong> - {p.type} - ₹{p.price}<br/><span className="text-xs">Seller: {p.sellerName} ({p.sellerPhone})</span></div>
                <button onClick={()=>{const updated=properties.filter(x=>x.id!==p.id);localStorage.setItem('reProperties',JSON.stringify(updated));setProperties(updated);}} className="text-red-600">Delete</button>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">👥 Users</h2>
            {users.map(u => (
              <div key={u.id} className="border p-3 mb-2 rounded flex justify-between items-center">
                <div>{u.name} ({u.email}) - {u.role}<br/><span className="text-xs">Phone: {u.phone}</span></div>
                <button onClick={()=>{const updated=users.filter(x=>x.id!==u.id);localStorage.setItem('reUsers',JSON.stringify(updated));setUsers(updated);}} className="text-red-600">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminRealEstate;
'@

$adminFixed | Out-File -FilePath src/components/RealEstate/AdminRealEstate.tsx -Encoding utf8 -Force

Write-Host "✅ AdminRealEstate.tsx fixed (HTML comment removed)." -ForegroundColor Green

# Also ensure BuyerDashboard and SellerDashboard are error‑free (they were already correct)
Write-Host "Restart dev server: npm run dev" -ForegroundColor Yellow