// @ts-nocheck
import React from 'react';
import { useRouter } from 'next/router';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100dvh', boxSizing: 'border-box' },
  header: { backgroundColor: '#1e3a8a', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px' },
  headerTitle: { margin: 0, fontSize: '20px', flex: 1 },
  content: { textAlign: 'center', padding: '40px 16px', backgroundColor: '#fff', borderRadius: '12px', maxWidth: '600px', margin: '0 auto' }
};

export default function BOQPage() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => router.push('/boq')} style={styles.backButton}>←</button>
        <h1 style={styles.headerTitle} className="boq-header-title">🏢 Facade & Elevation BOQ</h1>
      </div>
      <div style={styles.content} className="boq-content-box">
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚧</div>
        <h2>Coming Soon</h2>
        <p>This BOQ calculator is under development.</p>
      </div>
      <style jsx>{`
        @media (max-width: 700px) {
          .boq-content-box {
            padding: 24px 12px !important;
          }
          .boq-header-title {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
