import React, { useState } from 'react';
import { useRouter } from 'next/router';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#1a1a1a', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#000000', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' },
  card: { backgroundColor: '#2d2d2d', borderRadius: '12px', padding: '16px 8px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transition: 'transform 0.2s, background 0.2s' },
  cardHover: { transform: 'scale(1.02)', backgroundColor: '#3d3d3d' },
  cardIcon: { fontSize: '32px', marginBottom: '8px' },
  cardTitle: { fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: 0 },
  cardSub: { fontSize: '10px', color: '#aaaaaa', marginTop: '4px' }
};

const calculators = [
  { id: 'rcc-slab-calculator', name: 'RCC Slab', icon: '📏', sub: 'Slab & Beam' },
  { id: 'column-calculator', name: 'Column', icon: '🏛️', sub: 'Column Design' },
  { id: 'beam-calculator', name: 'Beam', icon: '📊', sub: 'Beam Design' },
  { id: 'footing-calculator', name: 'Footing', icon: '🏗️', sub: 'Foundation' },
  { id: 'staircase-calculator', name: 'Staircase', icon: '🪜', sub: 'Stair Design' },
  { id: 'concrete-calculator', name: 'Concrete', icon: '🧱', sub: 'Concrete Mix' },
  { id: 'patio-calculator', name: 'Patio', icon: '🏡', sub: 'Patio Design' },
  { id: 'retaining-wall-calculator', name: 'Retaining Wall', icon: '🧱', sub: 'Wall Design' },
  { id: 'water-tank-calculator', name: 'Water Tank', icon: '💧', sub: 'Tank Design' },
  { id: 'septic-tank-calculator', name: 'Septic Tank', icon: '🚽', sub: 'Tank Design' },
  { id: 'pile-calculator', name: 'Pile Foundation', icon: '🥧', sub: 'Pile Design' },
  { id: 'arch-calculator', name: 'Arch', icon: '⛩️', sub: 'Arch Design' },
  { id: 'lintel-calculator', name: 'Lintel', icon: '🚪', sub: 'Lintel Design' },
  { id: 'roof-truss-calculator', name: 'Roof Truss', icon: '🏠', sub: 'Truss Design' },
  { id: 'brick-work-calculator', name: 'Brick Work', icon: '🧱', sub: 'Brick Estimation' },
  { id: 'plaster-calculator', name: 'Plaster', icon: '🪣', sub: 'Plaster Estimation' },
  { id: 'paint-calculator', name: 'Paint', icon: '🎨', sub: 'Paint Estimation' },
  { id: 'tile-calculator', name: 'Tile', icon: '🔲', sub: 'Tile Estimation' }
];

export default function CalculatorsPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: () => router.push('/'), style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '📐 All Calculators'),
      React.createElement('div', { style: { fontSize: '12px', opacity: 0.8 } }, `${calculators.length} Tools`)
    ),
    React.createElement('div', { style: styles.grid },
      calculators.map(calc => React.createElement('div', 
        { 
          key: calc.id, 
          onClick: () => router.push(`/${calc.id}`),
          onMouseEnter: () => setHovered(calc.id),
          onMouseLeave: () => setHovered(null),
          style: { ...styles.card, ...(hovered === calc.id ? styles.cardHover : {}) }
        },
        React.createElement('div', { style: styles.cardIcon }, calc.icon),
        React.createElement('h3', { style: styles.cardTitle }, calc.name),
        React.createElement('p', { style: styles.cardSub }, calc.sub)
      ))
    )
  );
}

