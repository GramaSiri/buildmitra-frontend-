import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const FullAdmin = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Sri Balaji Steels', email: 'balaji@test.com', status: 'active', subscription: 'annual', expiry: '2027-05-01', drawingCredits: 50 },
    { id: 2, name: 'Kumar Cement Works', email: 'kumar@test.com', status: 'pending', subscription: 'none', expiry: null, drawingCredits: 0 },
    { id: 3, name: 'Sandhu TMT', email: 'sandhu@test.com', status: 'blocked', subscription: 'monthly', expiry: '2026-06-01', drawingCredits: 10 },
    { id: 4, name: 'Premier Constructions', email: 'premier@test.com', status: 'active', subscription: 'free', expiry: null, drawingCredits: 0 },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New vendor: Kumar Cement Works - pending approval', read: false, timestamp: new Date().toISOString() },
    { id: 2, text: 'Drawing purchase: ₹100 from Sri Balaji Steels', read: false, timestamp: new Date().toISOString() },
  ]);

  const [payments] = useState([
    { id: 1, vendor: 'Sri Balaji Steels', amount: 2000, type: 'Annual Subscription', date: '2026-01-10', status: 'Completed' },
    { id: 2, vendor: 'Sandhu TMT', amount: 250, type: 'Monthly Subscription', date: '2026-05-01', status: 'Completed' },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [bulkIds, setBulkIds] = useState([]);

  // Stats for charts and cards
  const stats = useMemo(() => {
    const pending = users.filter(u => u.status === 'pending').length;
    const active = users.filter(u => u.status === 'active').length;
    const blocked = users.filter(u => u.status === 'blocked').length;
    const monthly = users.filter(u => u.subscription === 'monthly').length;
    const annual = users.filter(u => u.subscription === 'annual').length;
    const free = users.filter(u => u.subscription === 'free').length;
    const monthlyRevenue = monthly * 250;
    const annualMonthlyAvg = (annual * 2000) / 12;
    const totalMonthlyRevenue = monthlyRevenue + annualMonthlyAvg;
    const unread = notifications.filter(n => !n.read).length;
    return { pending, active, blocked, monthly, annual, free, totalMonthlyRevenue, unread };
  }, [users, notifications]);

  // Chart data for vertical bar chart (user status counts)
  const statusBarData = [
    { name: 'Active', count: stats.active },
    { name: 'Pending', count: stats.pending },
    { name: 'Blocked', count: stats.blocked },
  ];

  // Pie chart data for subscription distribution (optional, but nice)
  const subscriptionPieData = [
    { name: 'Monthly', value: stats.monthly },
    { name: 'Annual', value: stats.annual },
    { name: 'Free', value: stats.free },
  ];
  const SUB_COLORS = ['#3b82f6', '#8b5cf6', '#ec489a'];

  // Helper: add notification
  const addNotification = (text) => {
    setNotifications(prev => [{ id: Date.now(), text, read: false, timestamp: new Date().toISOString() }, ...prev]);
  };

  // ----- User actions -----
  const approveUser = (id) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active', subscription: 'monthly', expiry: new Date(Date.now() + 30*86400000).toISOString().slice(0,10) } : u));
    addNotification('Approved ' + user.name);
  };

  const toggleBlock = (id) => {
    const user = users.find(u => u.id === id);
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    const action = user.status === 'blocked' ? 'Unblocked' : 'Blocked';
    addNotification(action + ' ' + user.name);
  };

  const resetPassword = (id) => {
    const user = users.find(u => u.id === id);
    // In real app: API call to send reset email or set temp password
    addNotification('Password reset link sent to ' + user.email);
    alert('Password reset email sent to ' + user.email);
  };

  const setSubscription = (id, plan) => {
    let expiry = null;
    if (plan === 'monthly') expiry = new Date(Date.now() + 30*86400000).toISOString().slice(0,10);
    if (plan === 'annual') expiry = new Date(Date.now() + 365*86400000).toISOString().slice(0,10);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, subscription: plan, expiry } : u));
    const user = users.find(u => u.id === id);
    addNotification('Subscription changed to ' + plan + ' for ' + user.name);
    setShowModal(false);
  };

  const extendAccess = (id, days) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      let exp = u.expiry ? new Date(u.expiry) : new Date();
      exp.setDate(exp.getDate() + days);
      return { ...u, expiry: exp.toISOString().slice(0,10), status: 'active' };
    }));
    const user = users.find(u => u.id === id);
    addNotification('Extended ' + days + ' days for ' + user.name);
    setShowModal(false);
  };

  const giveFreeAccess = (id, reason) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, subscription: 'free', expiry: null, status: 'active' } : u));
    const user = users.find(u => u.id === id);
    addNotification('Free access granted to ' + user.name + ' (Reason: ' + reason + ')');
    setShowModal(false);
  };

  const addDrawingCredits = (id, credits) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, drawingCredits: (u.drawingCredits || 0) + credits } : u));
    const user = users.find(u => u.id === id);
    addNotification('Added ' + credits + ' drawing credits to ' + user.name + ' (₹' + (credits*20) + ' value)');
    setShowModal(false);
  };

  // Bulk approval
  const bulkApprove = () => {
    const toApprove = users.filter(u => u.status === 'pending' && bulkIds.includes(u.id)).map(u => u.id);
    if (toApprove.length === 0) return;
    setUsers(prev => prev.map(u => toApprove.includes(u.id) ? { ...u, status: 'active', subscription: 'monthly', expiry: new Date(Date.now()+30*86400000).toISOString().slice(0,10) } : u));
    addNotification('Bulk approved ' + toApprove.length + ' vendors');
    setBulkIds([]);
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div style={{ padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>
      {/* Header with notification bell */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#3730a3' }}>BuildMitra Admin Portal</h1>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotif(!showNotif)} style={{ background: '#e0e7ff', padding: '8px 12px', borderRadius: '9999px' }}>
            🔔 {stats.unread > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', marginLeft: '4px' }}>{stats.unread}</span>}
          </button>
          {showNotif && (
            <div style={{ position: 'absolute', right: 0, top: '40px', width: '280px', background: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 20 }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                <strong>Notifications</strong>
                <button onClick={markAllRead} style={{ fontSize: '12px', color: '#4f46e5' }}>Mark all read</button>
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', background: n.read ? 'white' : '#e0e7ff' }}>
                  <div style={{ fontSize: '14px' }}>{n.text}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(n.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', borderLeft: '8px solid #f59e0b' }}><strong>Pending</strong><br/>{stats.pending}</div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', borderLeft: '8px solid #10b981' }}><strong>Active</strong><br/>{stats.active}</div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', borderLeft: '8px solid #ef4444' }}><strong>Blocked</strong><br/>{stats.blocked}</div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', borderLeft: '8px solid #3b82f6' }}><strong>Monthly Revenue</strong><br/>₹{Math.round(stats.totalMonthlyRevenue)}</div>
      </div>

      {/* Charts: Vertical Bar Chart + Subscription Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>User Status (Bar Chart)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusBarData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Subscription Plans (Pie)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={subscriptionPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {subscriptionPieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={SUB_COLORS[idx % SUB_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Tracking */}
      <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Recent Payments</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Vendor</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px' }}>{p.vendor}</td>
                <td style={{ padding: '8px' }}>₹{p.amount}</td>
                <td style={{ padding: '8px' }}>{p.type}<tr>
                <td style={{ padding: '8px' }}>{p.date}</td>
                <td style={{ padding: '8px' }}><span style={{ background: '#d1fae5', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Approval Banner */}
      {stats.pending > 0 && (
        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>{stats.pending}</strong> pending approvals</span>
          <button onClick={bulkApprove} disabled={bulkIds.length === 0} style={{ background: bulkIds.length ? '#16a34a' : '#9ca3af', color: 'white', padding: '6px 12px', borderRadius: '4px' }}>Bulk Approve Selected</button>
        </div>
      )}

      {/* Users Table with full management */}
      <div style={{ background: 'white', borderRadius: '8px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '8px', width: '40px' }}><input type="checkbox" onChange={e => e.target.checked ? setBulkIds(users.filter(u => u.status === 'pending').map(u => u.id)) : setBulkIds([])} /></th>
              <th style={{ padding: '8px' }}>Name</th>
              <th style={{ padding: '8px' }}>Email</th>
              <th style={{ padding: '8px' }}>Status</th>
              <th style={{ padding: '8px' }}>Subscription</th>
              <th style={{ padding: '8px' }}>Expiry</th>
              <th style={{ padding: '8px' }}>Drawing Credits</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <input type="checkbox" checked={bulkIds.includes(u.id)} onChange={() => setBulkIds(prev => prev.includes(u.id) ? prev.filter(i => i !== u.id) : [...prev, u.id])} disabled={u.status !== 'pending'} />
                </td>
                <td style={{ padding: '8px' }}>{u.name}</td>
                <td style={{ padding: '8px' }}>{u.email}</td>
                <td style={{ padding: '8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '12px', background: u.status === 'active' ? '#d1fae5' : u.status === 'pending' ? '#fef3c7' : '#fee2e2' }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '8px' }}>{u.subscription}</td>
                <td style={{ padding: '8px' }}>{u.expiry || '—'}</td>
                <td style={{ padding: '8px' }}>{u.drawingCredits}</td>
                <td style={{ padding: '8px' }}>
                  {u.status === 'pending' && <button onClick={() => approveUser(u.id)} style={{ background: '#16a34a', color: 'white', padding: '4px 8px', borderRadius: '4px', marginRight: '4px' }}>Approve</button>}
                  <button onClick={() => toggleBlock(u.id)} style={{ background: u.status === 'blocked' ? '#2563eb' : '#dc2626', color: 'white', padding: '4px 8px', borderRadius: '4px', marginRight: '4px' }}>{u.status === 'blocked' ? 'Unblock' : 'Block'}</button>
                  <button onClick={() => resetPassword(u.id)} style={{ background: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', marginRight: '4px' }}>Reset Pwd</button>
                  <button onClick={() => { setSelectedUser(u); setShowModal(true); }} style={{ background: '#4f46e5', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manage Modal */}
      {showModal && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Manage {selectedUser.name}</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Change Subscription</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => setSubscription(selectedUser.id, 'monthly')} style={{ background: '#2563eb', color: 'white', padding: '6px 12px', borderRadius: '4px' }}>Monthly (₹250)</button>
                <button onClick={() => setSubscription(selectedUser.id, 'annual')} style={{ background: '#16a34a', color: 'white', padding: '6px 12px', borderRadius: '4px' }}>Annual (₹2000)</button>
                <button onClick={() => setSubscription(selectedUser.id, 'free')} style={{ background: '#9333ea', color: 'white', padding: '6px 12px', borderRadius: '4px' }}>Free</button>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Extend Access (days)</label>
              <div>
                <input type="number" id="extend" defaultValue={30} style={{ border: '1px solid #d1d5db', padding: '4px', borderRadius: '4px', width: '80px' }} />
                <button onClick={() => { const days = parseInt(document.getElementById('extend').value); extendAccess(selectedUser.id, days); }} style={{ background: '#4f46e5', color: 'white', padding: '4px 12px', borderRadius: '4px', marginLeft: '8px' }}>Extend</button>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Add Drawing Credits (₹20/credit)</label>
              <div>
                <input type="number" id="credits" defaultValue={10} style={{ border: '1px solid #d1d5db', padding: '4px', borderRadius: '4px', width: '80px' }} />
                <button onClick={() => { const credits = parseInt(document.getElementById('credits').value); addDrawingCredits(selectedUser.id, credits); }} style={{ background: '#d97706', color: 'white', padding: '4px 12px', borderRadius: '4px', marginLeft: '8px' }}>Add</button>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Grant Free Access (reason)</label>
              <input type="text" id="reason" placeholder="Reason" style={{ border: '1px solid #d1d5db', padding: '4px', borderRadius: '4px', width: '100%', marginBottom: '4px' }} />
              <button onClick={() => { const reason = document.getElementById('reason').value; giveFreeAccess(selectedUser.id, reason); }} style={{ background: '#10b981', color: 'white', padding: '6px 12px', borderRadius: '4px', width: '100%' }}>Grant Free Access</button>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#6b7280', color: 'white', padding: '8px 16px', borderRadius: '4px' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullAdmin;