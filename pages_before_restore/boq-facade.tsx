import React from 'react';
import { useRouter } from 'next/router';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '$($cat.color)', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px' },
  headerTitle: { margin: 0, fontSize: '20px', flex: 1 },
  content: { textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '12px' }
};

export default function BOQPage() {
  const router = useRouter();

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: () => router.push('/boq'), style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '$($cat.icon) $($cat.title)')
    ),
    React.createElement('div', { style: styles.content },
      React.createElement('div', { style: { fontSize: '48px', marginBottom: '10px' } }, '🚧'),
      React.createElement('h2', null, 'Coming Soon'),
      React.createElement('p', null, 'This BOQ calculator is under development.')
    )
  );
}
