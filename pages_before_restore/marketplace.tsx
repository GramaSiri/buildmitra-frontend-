import React from 'react';
import { useRouter } from 'next/router';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '20px', backgroundColor: '#f5f0e8', minHeight: '100vh' },
  header: { backgroundColor: '#8B4513', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' },
  headerTitle: { margin: 0, fontSize: '20px', flex: 1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardIcon: { fontSize: '48px', marginBottom: '10px' },
  cardTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' },
  cardDesc: { fontSize: '12px', color: '#666' }
};

export default function Marketplace() {
  const router = useRouter();
  
  const categories = [
    { name: 'Materials', icon: '🧱', desc: 'Cement, Steel, Bricks, Aggregates' },
    { name: 'Equipment', icon: '🚜', desc: 'JCB, Cranes, Mixers, Tools' },
    { name: 'Labour', icon: '👷', desc: 'Contractors, Workers, Engineers' },
    { name: 'Consultants', icon: '📋', desc: 'Architects, Structural Engineers' }
  ];

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: () => router.push('/'), style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🛒 Marketplace'),
      React.createElement('div', null)
    ),
    React.createElement('div', { style: styles.grid },
      categories.map(cat => React.createElement('div', { key: cat.name, style: styles.card },
        React.createElement('div', { style: styles.cardIcon }, cat.icon),
        React.createElement('h3', { style: styles.cardTitle }, cat.name),
        React.createElement('p', { style: styles.cardDesc }, cat.desc)
      ))
    )
  );
}
