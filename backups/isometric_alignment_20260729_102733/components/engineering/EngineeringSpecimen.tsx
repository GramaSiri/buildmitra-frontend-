import React from 'react';

export type EngineeringSpecimenKind =
  | 'beam' | 'masonry' | 'footing' | 'lintel' | 'pile' | 'slab'
  | 'steel-building' | 'retaining-wall' | 'roof-truss' | 'septic-tank'
  | 'staircase' | 'water-tank' | 'paint' | 'plaster' | 'flooring'
  | 'concrete' | 'arch' | 'generic';

type Props = {
  kind: EngineeringSpecimenKind;
  title?: string;
  material?: string;
  data?: Record<string, string | number | boolean | null | undefined>;
};

const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const txt = (v: unknown, fallback = '-') => (v === null || v === undefined || v === '' ? fallback : String(v));

function Dimension({ x1, y1, x2, y2, label }: { x1:number; y1:number; x2:number; y2:number; label:string }) {
  return <>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="1" markerStart="url(#eng-arrow)" markerEnd="url(#eng-arrow)" />
    <rect x={(x1+x2)/2-34} y={(y1+y2)/2-9} width="68" height="17" rx="3" fill="#fff" stroke="#cbd5e1" />
    <text x={(x1+x2)/2} y={(y1+y2)/2+3} fontSize="9" textAnchor="middle" fill="#0f172a" fontWeight="700">{label}</text>
  </>;
}

export default function EngineeringSpecimen({ kind, title, material = '', data = {} }: Props) {
  const label = title || `${kind.replace(/-/g, ' ')} specimen`;
  const width = num(data.widthIn ?? data.widthFt ?? data.wallThicknessInches, 6);
  const depth = num(data.depthIn ?? data.depthFt ?? data.heightFt, 10);
  const length = num(data.lengthFt ?? data.clearLenFt ?? data.length, 10);
  const height = num(data.heightFt ?? data.floorHeightFt ?? data.height, 8);
  const mat = material.toLowerCase();
  const isAAC = mat.includes('aac');
  const isConcreteBlock = mat.includes('concrete block');
  const isClay = mat.includes('clay') || mat.includes('brick');

  const masonryUnitW = isAAC ? 44 : isConcreteBlock ? 34 : 22;
  const masonryUnitH = isAAC || isConcreteBlock ? 20 : 11;
  const masonryFill = isAAC ? '#dbeafe' : isConcreteBlock ? '#cbd5e1' : '#fca5a5';

  const body = (() => {
    switch (kind) {
      case 'masonry': {
        const rows = 5; const cols = Math.ceil(180 / masonryUnitW) + 1;
        return <>
          <polygon points="45,65 220,65 250,48 75,48" fill="#f8fafc" stroke="#334155" />
          <polygon points="220,65 250,48 250,155 220,172" fill="#94a3b8" stroke="#334155" />
          <rect x="45" y="65" width="175" height="107" fill="#fff" stroke="#334155" />
          {Array.from({length:rows}).map((_,r)=>Array.from({length:cols}).map((__,c)=>{
            const offset = r % 2 ? masonryUnitW/2 : 0;
            const x = 45 + c*masonryUnitW-offset; const y = 65+r*masonryUnitH;
            return <rect key={`${r}-${c}`} x={x} y={y} width={masonryUnitW-2} height={masonryUnitH-2} fill={masonryFill} stroke="#64748b" strokeWidth="0.8" />;
          }))}
          <Dimension x1={45} y1={190} x2={220} y2={190} label={`${txt(data.length ?? data.lengthFt, 10)} ft`} />
          <Dimension x1={28} y1={65} x2={28} y2={172} label={`${txt(data.height ?? data.heightFt, 10)} ft`} />
          <text x="145" y="214" textAnchor="middle" fontSize="10" fill="#475569">{txt(material, 'Masonry')} • {txt(data.wallThicknessInches ?? data.thickness, width)} in wall</text>
        </>;
      }
      case 'beam':
      case 'lintel': return <>
        <polygon points="45,80 220,80 250,63 75,63" fill="#e2e8f0" stroke="#334155" />
        <polygon points="220,80 250,63 250,125 220,142" fill="#94a3b8" stroke="#334155" />
        <rect x="45" y="80" width="175" height="62" fill="#cbd5e1" stroke="#334155" />
        {[96,126].map(y=><line key={y} x1="55" y1={y} x2="210" y2={y} stroke="#b91c1c" strokeWidth="3" />)}
        {Array.from({length:9}).map((_,i)=><rect key={i} x={58+i*18} y="88" width="12" height="45" fill="none" stroke="#15803d" strokeWidth="1" />)}
        <Dimension x1={45} y1={170} x2={220} y2={170} label={`${length} ft`} />
        <text x="145" y="210" textAnchor="middle" fontSize="10">{txt(data.grade,'M20')} • {width} in × {depth} in</text>
      </>;
      case 'footing': return <>
        <polygon points="55,115 180,115 225,90 100,90" fill="#e2e8f0" stroke="#334155" />
        <polygon points="180,115 225,90 225,145 180,170" fill="#94a3b8" stroke="#334155" />
        <polygon points="55,115 180,115 180,170 55,170" fill="#cbd5e1" stroke="#334155" />
        {Array.from({length:6}).map((_,i)=><line key={`a${i}`} x1={70+i*20} y1="105" x2={115+i*20} y2="80" stroke="#b91c1c" />)}
        {Array.from({length:6}).map((_,i)=><line key={`b${i}`} x1="70" y1={100+i*4} x2="195" y2={100+i*4} stroke="#15803d" />)}
        <rect x="122" y="45" width="38" height="72" fill="#cbd5e1" stroke="#334155" />
        <Dimension x1={55} y1={190} x2={180} y2={190} label={`${txt(data.lengthFt,5)} ft`} />
        <text x="145" y="213" textAnchor="middle" fontSize="10">{txt(data.grade,'M20')} footing • {txt(data.depthFt,1.5)} ft depth</text>
      </>;
      case 'pile': return <>
        <ellipse cx="140" cy="60" rx="42" ry="18" fill="#e2e8f0" stroke="#334155" />
        <path d="M98 60 L98 166 Q140 194 182 166 L182 60" fill="#cbd5e1" stroke="#334155" />
        {[-24,-8,8,24].map(dx=><line key={dx} x1={140+dx} y1="55" x2={140+dx} y2="170" stroke="#b91c1c" strokeWidth="2" />)}
        {Array.from({length:7}).map((_,i)=><ellipse key={i} cx="140" cy={72+i*15} rx="32" ry="12" fill="none" stroke="#15803d" />)}
        <Dimension x1={205} y1={60} x2={205} y2={170} label={`${txt(data.depthFt ?? data.lengthFt,20)} ft`} />
        <text x="140" y="213" textAnchor="middle" fontSize="10">Ø {txt(data.diameterMm ?? data.diaMm,450)} mm pile</text>
      </>;
      case 'staircase': return <>
        {Array.from({length:8}).map((_,i)=><polygon key={i} points={`${45+i*18},${165-i*13} ${70+i*18},${165-i*13} ${82+i*18},${158-i*13} ${57+i*18},${158-i*13}`} fill="#cbd5e1" stroke="#334155" />)}
        <line x1="50" y1="176" x2="205" y2="68" stroke="#b91c1c" strokeWidth="2" />
        <Dimension x1={40} y1={195} x2={205} y2={195} label={`${txt(data.treadIn,10)} in tread`} />
        <text x="145" y="215" textAnchor="middle" fontSize="10">{txt(data.finishType,'Finish')} • {txt(data.widthFt,4)} ft wide</text>
      </>;
      case 'water-tank':
      case 'septic-tank': return <>
        <polygon points="55,75 190,75 230,52 95,52" fill="#dbeafe" stroke="#334155" />
        <polygon points="190,75 230,52 230,155 190,178" fill="#93c5fd" stroke="#334155" />
        <rect x="55" y="75" width="135" height="103" fill="#bfdbfe" stroke="#334155" />
        <rect x="75" y="92" width="95" height="66" fill="#eff6ff" stroke="#2563eb" strokeDasharray="4 3" />
        {kind==='septic-tank' && <line x1="135" y1="75" x2="135" y2="178" stroke="#475569" strokeWidth="3" />}
        <Dimension x1={55} y1={197} x2={190} y2={197} label={`${txt(data.lengthFt,10)} ft`} />
        <text x="145" y="218" textAnchor="middle" fontSize="10">{txt(data.wallType, kind==='septic-tank'?'Septic':'RCC')} • {txt(data.widthFt,8)} × {txt(data.heightFt,6)} ft</text>
      </>;
      case 'roof-truss': return <>
        <polyline points="40,155 140,62 240,155" fill="none" stroke="#334155" strokeWidth="5" />
        <line x1="40" y1="155" x2="240" y2="155" stroke="#334155" strokeWidth="5" />
        {[70,100,140,180,210].map(x=><line key={x} x1={x} y1="155" x2="140" y2="62" stroke="#64748b" strokeWidth="2" />)}
        <Dimension x1={40} y1={185} x2={240} y2={185} label={`${txt(data.spanFt ?? data.lengthFt,30)} ft span`} />
        <text x="140" y="214" textAnchor="middle" fontSize="10">{txt(data.trussType ?? material,'Steel roof truss')}</text>
      </>;
      case 'retaining-wall': return <>
        <polygon points="110,55 175,55 195,175 90,175" fill="#cbd5e1" stroke="#334155" />
        <polygon points="55,175 220,175 245,190 80,190" fill="#94a3b8" stroke="#334155" />
        {Array.from({length:6}).map((_,i)=><line key={i} x1={108+i*12} y1="65" x2={94+i*17} y2="168" stroke="#b91c1c" />)}
        <Dimension x1={70} y1={55} x2={70} y2={175} label={`${height} ft`} />
        <text x="145" y="216" textAnchor="middle" fontSize="10">{txt(data.grade,'M20')} retaining wall</text>
      </>;
      case 'slab':
      case 'steel-building':
      case 'paint':
      case 'plaster':
      case 'flooring':
      default: return <>
        <polygon points="45,85 205,85 245,62 85,62" fill={kind==='paint'?'#fde68a':kind==='flooring'?'#ddd6fe':'#e2e8f0'} stroke="#334155" />
        <polygon points="205,85 245,62 245,145 205,168" fill="#94a3b8" stroke="#334155" />
        <rect x="45" y="85" width="160" height="83" fill={kind==='paint'?'#fef3c7':kind==='flooring'?'#ede9fe':'#cbd5e1'} stroke="#334155" />
        {kind==='slab' && Array.from({length:7}).map((_,i)=><line key={i} x1={55+i*22} y1="98" x2={55+i*22} y2="158" stroke="#b91c1c" />)}
        {kind==='flooring' && Array.from({length:6}).map((_,i)=><line key={i} x1={45+i*32} y1="85" x2={85+i*32} y2="62" stroke="#7c3aed" />)}
        <Dimension x1={45} y1={190} x2={205} y2={190} label={`${length} ft`} />
        <text x="145" y="215" textAnchor="middle" fontSize="10">{txt(material || data.grade || data.type, label)}</text>
      </>;
    }
  })();

  return <div style={{width:'100%',maxWidth:300,marginLeft:'auto',padding:10,background:'#eef3f8',border:'1px solid #94a3b8',borderRadius:10,boxShadow:'0 3px 10px rgba(15,23,42,.16)',boxSizing:'border-box'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
      <strong style={{fontSize:13,color:'#7f1d1d',textTransform:'capitalize'}}>{label}</strong>
      <span style={{fontSize:9,fontWeight:700,color:'#475569',background:'#f8fafc',padding:'3px 7px',borderRadius:10}}>DYNAMIC 3D</span>
    </div>
    <svg viewBox="0 0 290 225" width="100%" height="205" style={{display:'block'}}>
      <defs><marker id="eng-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto-start-reverse"><path d="M0,0 L7,3.5 L0,7 Z" fill="#334155" /></marker></defs>
      {body}
    </svg>
  </div>;
}
