import React from 'react';
import { useRouter } from 'next/router';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f5f5', minHeight: '100vh' },
  header: { backgroundColor: '#800020', padding: '12px', borderRadius: '10px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' },
  headerTitle: { margin: 0, fontSize: '18px' },
  content: { textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }
};

export default function TabPage() {
  const router = useRouter();
  const pageName = '$tab'.toUpperCase();
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => router.push('/')} style={styles.backButton}>←</button>
        <h1 style={styles.headerTitle}>{pageName}</h1>
      </div>
      <div style={styles.content}>
        <div style={{ fontSize: '48px' }}>🚧</div>
        <h2>{pageName} Page</h2>
        <p>Coming Soon...</p>
      </div>
    </div>
  );
}
