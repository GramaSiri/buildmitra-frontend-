import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export default function LayoutPlansPage() {
  const [plotLength, setPlotLength] = useState<number>(60);
  const [plotWidth, setPlotWidth] = useState<number>(40);
  const [rooms, setRooms] = useState<{ id: number; name: string; width: number; length: number; x: number; y: number }[]>([
    { id: 1, name: 'Living', width: 20, length: 25, x: 10, y: 10 },
    { id: 2, name: 'Bedroom 1', width: 15, length: 18, x: 35, y: 10 },
    { id: 3, name: 'Kitchen', width: 12, length: 15, x: 10, y: 30 },
  ]);
  const [nextId, setNextId] = useState(4);

  const addRoom = () => {
    setRooms([...rooms, { id: nextId, name: 'New Room', width: 10, length: 10, x: 10, y: 10 }]);
    setNextId(nextId + 1);
  };

  const updateRoom = (id: number, field: string, value: number | string) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const deleteRoom = (id: number) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const svgWidth = 600;
  const svgHeight = 400;
  const scaleX = svgWidth / plotLength;
  const scaleY = svgHeight / plotWidth;

  const exportToPNG = () => {
    const svgElement = document.getElementById('layout-svg');
    if (!svgElement) return;
    const canvas = document.createElement('canvas');
    canvas.width = svgWidth;
    canvas.height = svgHeight;
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob!);
        const a = document.createElement('a');
        a.href = url;
        a.download = `layout_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Layout Plan', 14, 16);
    // Simplified: you can add more content
    doc.save(`layout_${Date.now()}.pdf`);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#1a7f6e' }}>🏡 Layout Plan Generator</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        <div><label>Plot Length (ft)</label><input type="number" value={plotLength} onChange={e => setPlotLength(parseFloat(e.target.value))} style={{ width: '100%', padding: 8 }} /></div>
        <div><label>Plot Width (ft)</label><input type="number" value={plotWidth} onChange={e => setPlotWidth(parseFloat(e.target.value))} style={{ width: '100%', padding: 8 }} /></div>
      </div>

      <h3>Rooms</h3>
      <button onClick={addRoom} style={{ background: '#1a7f6e', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: 6, marginBottom: 16 }}>+ Add Room</button>
      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f0f7f5' }}><th>Name</th><th>Width (ft)</th><th>Length (ft)</th><th>X pos (ft)</th><th>Y pos (ft)</th><th>Action</th></tr></thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id} style={{ borderBottom: '1px solid #eee' }}>
                <td><input type="text" value={room.name} onChange={e => updateRoom(room.id, 'name', e.target.value)} style={{ width: '100%', padding: 4 }} /></td>
                <td><input type="number" value={room.width} onChange={e => updateRoom(room.id, 'width', parseFloat(e.target.value))} style={{ width: '70px' }} /></td>
                <td><input type="number" value={room.length} onChange={e => updateRoom(room.id, 'length', parseFloat(e.target.value))} style={{ width: '70px' }} /></td>
                <td><input type="number" value={room.x} onChange={e => updateRoom(room.id, 'x', parseFloat(e.target.value))} style={{ width: '70px' }} /></td>
                <td><input type="number" value={room.y} onChange={e => updateRoom(room.id, 'y', parseFloat(e.target.value))} style={{ width: '70px' }} /></td>
                <td><button onClick={() => deleteRoom(room.id)} style={{ background: '#dc2626', color: '#fff', padding: '2px 8px', border: 'none', borderRadius: 4 }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={exportToPNG} style={{ background: '#f59e0b', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: 8 }}>📷 Export as PNG</button>
        <button onClick={exportToPDF} style={{ background: '#dc2626', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: 8 }}>📄 Export PDF</button>
      </div>

      <svg id="layout-svg" width={svgWidth} height={svgHeight} style={{ border: '1px solid #ccc', background: '#f9fafb' }}>
        {/* Outer plot boundary */}
        <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="none" stroke="#1a7f6e" strokeWidth="2" strokeDasharray="5" />
        {/* Rooms */}
        {rooms.map(room => (
          <g key={room.id}>
            <rect
              x={room.x * scaleX}
              y={room.y * scaleY}
              width={room.width * scaleX}
              height={room.length * scaleY}
              fill="#e8f0fe"
              stroke="#20a39e"
              strokeWidth="1.5"
            />
            <text x={room.x * scaleX + (room.width * scaleX) / 2} y={room.y * scaleY + (room.length * scaleY) / 2} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#1a7f6e">{room.name}</text>
          </g>
        ))}
        {/* Dimensions (simple) */}
        <line x1={0} y1={svgHeight + 5} x2={svgWidth} y2={svgHeight + 5} stroke="#666" strokeWidth="1" />
        <text x={svgWidth / 2} y={svgHeight + 18} textAnchor="middle" fontSize="10" fill="#666">{plotLength} ft</text>
        <line x1={svgWidth + 5} y1={0} x2={svgWidth + 5} y2={svgHeight} stroke="#666" strokeWidth="1" />
        <text x={svgWidth + 18} y={svgHeight / 2} textAnchor="middle" fontSize="10" fill="#666" transform={`rotate(90, ${svgWidth + 18}, ${svgHeight / 2})`}>{plotWidth} ft</text>
      </svg>
    </div>
  );
}
