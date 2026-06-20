import React from 'react';

const Letterhead: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div style={{
      maxWidth: '1000px',
      margin: '20px auto',
      background: 'white',
      border: '1px solid #2c3e50',
      borderRadius: '12px',
      padding: '28px',
      fontFamily: 'Georgia, serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #2563eb', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#1e3c72' }}>🏗️ BuildMitra</h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4a5570' }}>Construction Intelligence Platform</p>
      </div>
      <h2 style={{ color: '#2c3e50', borderLeft: '4px solid #2563eb', paddingLeft: '12px', marginTop: 0 }}>{title}</h2>
      <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
        {children}
      </div>
      <div style={{ marginTop: '32px', paddingTop: '12px', borderTop: '1px solid #ccc', fontSize: '10px', textAlign: 'center', color: '#64748b' }}>
        © BuildMitra 2026 – Official Guideline Document
      </div>
    </div>
  );
};

export default Letterhead;