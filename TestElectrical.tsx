import React, { useState } from 'react';

const TestElectrical = () => {
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(15);
  const [floors, setFloors] = useState(2);
  const area = length * width * floors;

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">⚡ Electrical BOQ (TEST)</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div><label>Length (m)</label><input type="number" value={length} onChange={e => setLength(Number(e.target.value))} className="border p-2 w-full" /></div>
        <div><label>Width (m)</label><input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="border p-2 w-full" /></div>
        <div><label>Floors</label><input type="number" value={floors} onChange={e => setFloors(Number(e.target.value))} className="border p-2 w-full" /></div>
      </div>
      <p>Total Area: {area} sqm</p>
      <p>Wire length (auto): {(area * 2.5).toFixed(0)} m</p>
    </div>
  );
};

export default TestElectrical;