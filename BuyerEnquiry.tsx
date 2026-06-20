import React, { useState } from 'react';

const BuyerEnquiry = () => {
  const [form, setForm] = useState({
    category: '',
    requirement: '',
    budget: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage
    const enquiries = JSON.parse(localStorage.getItem('vendorEnquiries') || '[]');
    const newEnquiry = { id: Date.now(), ...form, createdAt: new Date().toISOString(), quotes: [] };
    enquiries.push(newEnquiry);
    localStorage.setItem('vendorEnquiries', JSON.stringify(enquiries));
    alert('Enquiry posted! Vendors will see it in their dashboard.');
    setForm({ category: '', requirement: '', budget: '', buyerName: '', buyerEmail: '', buyerPhone: '' });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>📝 Post Your Requirement</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Category *</label>
          <select name="category" value={form.category} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} required>
            <option value="">Select</option>
            <option value="Construction Materials">Construction Materials</option>
            <option value="Contractor">Contractor</option>
            <option value="Machine Hire">Machine Hire</option>
            <option value="Labour Supply">Labour Supply</option>
            <option value="Real Estate">Real Estate</option>
          </select>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Requirement Details *</label>
          <textarea name="requirement" rows="3" value={form.requirement} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} required></textarea>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Budget (₹) *</label>
          <input type="number" name="budget" value={form.budget} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} required />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Your Name</label>
          <input type="text" name="buyerName" value={form.buyerName} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Your Email</label>
          <input type="email" name="buyerEmail" value={form.buyerEmail} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Your Phone</label>
          <input type="tel" name="buyerPhone" value={form.buyerPhone} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
        </div>
        <button type="submit" style={{ background: '#4f46e5', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', marginTop: '8px' }}>Submit Requirement</button>
      </form>
    </div>
  );
};

export default BuyerEnquiry;