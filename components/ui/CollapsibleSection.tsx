import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: string;
}

export default function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false, 
  icon = 'ⓘ' 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{
      marginBottom: '8px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1',
      backgroundColor: '#ffffff',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          border: 'none',
          cursor: 'pointer',
          fontSize: '11.5px',
          fontWeight: '700',
          color: '#334155',
          textAlign: 'left'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{icon}</span> {title}
        </span>
        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>
          {isOpen ? '▲ Collapse' : '▾ Expand'}
        </span>
      </button>

      {isOpen && (
        <div style={{
          padding: '8px 10px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '11px',
          color: '#475569',
          backgroundColor: '#ffffff'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
