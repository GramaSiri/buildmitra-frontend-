import React from 'react';

export type EngineeringSpecimenKind =
  | 'beam' | 'masonry' | 'footing' | 'lintel' | 'pile' | 'slab'
  | 'steel-building' | 'retaining-wall' | 'roof-truss' | 'septic-tank'
  | 'staircase' | 'water-tank' | 'paint' | 'plaster' | 'flooring'
  | 'concrete' | 'arch' | 'generic';

type Value = string | number | boolean | null | undefined;
type Props = { kind: EngineeringSpecimenKind; title?: string; material?: string; data?: Record<string, Value> };

const n = (v: unknown, fallback = 0) => { const x = Number(v); return Number.isFinite(x) ? x : fallback; };
const t = (v: unknown, fallback = '-') => v === null || v === undefined || v === '' ? fallback : String(v);
const clamp = (v:number, min:number, max:number) => Math.min(max, Math.max(min, v));
const first = (data:Record<string,Value>, keys:string[], fallback:Value='-') => {
  for (const key of keys) if (data[key] !== undefined && data[key] !== null && data[key] !== '') return data[key];
  return fallback;
};

function Dim({x1,y1,x2,y2,label,vertical=false}:{x1:number;y1:number;x2:number;y2:number;label:string;vertical?:boolean}) {
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  return <>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="1" markerStart="url(#eng-arrow)" markerEnd="url(#eng-arrow)" />
    <rect x={mx-(vertical?9:35)} y={my-(vertical?35:9)} width={vertical?18:70} height={vertical?70:18} rx="3" fill="#fff" stroke="#cbd5e1" />
    <text x={mx} y={my+3} textAnchor="middle" transform={vertical?`rotate(-90 ${mx} ${my})`:undefined} fill="#0f172a" fontSize="10" fontWeight="700">{label}</text>
  </>;
}

function Schedule({data, grade, rows}:{data:Record<string,Value>;grade:string;rows:string[]}) {
  return <g>
    <rect x="195" y="18" width="98" height={Math.min(142, 31+rows.length*15)} rx="7" fill="#fff" fillOpacity="0.95" stroke="#cbd5e1" />
    <text x="202" y="34" fill="#7f1d1d" fontSize="10.5" fontWeight="700">{grade}</text>
    {rows.map((row,i)=><text key={i} x="202" y={51+i*15} fill={i===0?'#b91c1c':'#334155'} fontSize="9.5" fontWeight={i===0?700:500}>{row}</text>)}
  </g>;
}

export default function EngineeringSpecimen({kind,title,material='',data={}}:Props) {
  const label=title || `${kind.replace(/-/g,' ')} specimen`;
  const length=n(first(data,['lengthFt','clearLenFt','length','spanFt'],10),10);
  const widthFt=n(first(data,['widthFt','plotWidth'],8),8);
  const heightFt=n(first(data,['heightFt','floorHeightFt','height','depthFt'],8),8);
  const widthIn=n(first(data,['widthIn','wallThicknessInches','wallThickIn','thickness'],9),9);
  const depthIn=n(first(data,['depthIn','thicknessIn','slabThicknessIn'],12),12);
  const grade=t(first(data,['grade','concreteGrade'],material || '-'));
  const showSteel = data.showSteel !== false && !String(data.scopeOption||'').includes('concrete_only');

  const mainDia=t(first(data,['mainDia','bottomDia','vertDia','cornerDia'],'-'));
  const secondDia=t(first(data,['distDia','topDia','horizDia','middleDia'],'-'));
  const stirrupDia=t(first(data,['stirrupDia','tieDia','helicalDia'],'-'));
  const mainNos=t(first(data,['mainNos','bottomNos','cornerNos'],'-'));
  const secondNos=t(first(data,['topNos','middleNos'],'-'));
  const spacing=t(first(data,['spacingMm','mainSpacingMm','tieSpacingMm','vertSpacingMm'],'-'));
  const secondSpacing=t(first(data,['distSpacingMm','horizSpacingMm'],'-'));
  const cover=t(first(data,['coverMm'],'-'));

  const mat=material.toLowerCase();
  const isAAC=mat.includes('aac');
  const isBlock=mat.includes('concrete block');

  let body:React.ReactNode;
  let rows:string[]=[];

  if(kind==='beam'||kind==='lintel') {
    const L=clamp(95+length*6,120,188), H=clamp(32+depthIn*2.2,48,82), D=clamp(18+widthIn*1.2,24,45);
    const x=35,y=78,right=x+L,bottom=y+H;
    const bars=Math.max(2,Math.min(6,n(mainNos,4)));
    const ties=Math.max(4,Math.min(12,Math.round(length*304.8/Math.max(n(spacing,150),50))));
    rows=showSteel?['REINFORCEMENT',`${mainNos} × ${mainDia} mm main`,`${secondNos} × ${secondDia} mm top`,`${stirrupDia} mm @ ${spacing} mm`,`Cover ${cover} mm`]:[];
    body=<>
      <polygon points={`${x},${y} ${right},${y} ${right+D},${y-D*.48} ${x+D},${y-D*.48}`} fill="#e2e8f0" stroke="#334155"/>
      <rect x={x} y={y} width={L} height={H} fill="#cbd5e1" stroke="#334155"/>
      <polygon points={`${right},${y} ${right+D},${y-D*.48} ${right+D},${bottom-D*.48} ${right},${bottom}`} fill="#94a3b8" stroke="#334155"/>
      {showSteel && Array.from({length:bars}).map((_,i)=><line key={`b${i}`} x1={x+12+i*(L-24)/(bars-1)} y1={bottom-12} x2={x+12+i*(L-24)/(bars-1)} y2={bottom-12} stroke="#b91c1c" strokeWidth="5" strokeLinecap="round"/>)}
      {showSteel && Array.from({length:ties}).map((_,i)=>{const tx=x+8+i*(L-16)/(ties-1);return <rect key={`s${i}`} x={tx-3} y={y+8} width="6" height={H-16} fill="none" stroke="#15803d" strokeWidth="1"/>})}
      <Dim x1={x} y1={bottom+22} x2={right} y2={bottom+22} label={`L ${length} ft`}/>
      <Dim x1={x-18} y1={y} x2={x-18} y2={bottom} label={`D ${depthIn}\"`} vertical/>
      <text x={right+D+5} y={bottom-D*.2} fontSize="10" fontWeight="700">W {widthIn}&quot;</text>
    </>;
  } else if(kind==='masonry') {
    const L=clamp(95+length*5,125,185), H=clamp(55+heightFt*7,75,120), D=clamp(14+widthIn*2.2,22,42);
    const x=40,y=55,right=x+L,bottom=y+H;
    const unitW=isAAC?46:isBlock?36:23, unitH=isAAC||isBlock?22:12;
    const fill=isAAC?'#dbeafe':isBlock?'#cbd5e1':'#fca5a5';
    body=<>
      <rect x={x} y={y} width={L} height={H} fill="#fff" stroke="#334155"/>
      <polygon points={`${right},${y} ${right+D},${y-D*.45} ${right+D},${bottom-D*.45} ${right},${bottom}`} fill="#94a3b8" stroke="#334155"/>
      <polygon points={`${x},${y} ${right},${y} ${right+D},${y-D*.45} ${x+D},${y-D*.45}`} fill="#f8fafc" stroke="#334155"/>
      {Array.from({length:Math.ceil(H/unitH)}).flatMap((_,r)=>Array.from({length:Math.ceil(L/unitW)+1}).map((__,c)=>{const ox=r%2?unitW/2:0;const bx=x+c*unitW-ox;return bx+unitW>x&&bx<right?<rect key={`${r}-${c}`} x={Math.max(x,bx)} y={y+r*unitH} width={Math.min(unitW-2,right-Math.max(x,bx))} height={Math.min(unitH-2,bottom-(y+r*unitH))} fill={fill} stroke="#64748b" strokeWidth=".6"/>:null}))}
      <Dim x1={x} y1={bottom+20} x2={right} y2={bottom+20} label={`${length} ft`}/>
      <Dim x1={x-18} y1={y} x2={x-18} y2={bottom} label={`${heightFt} ft`} vertical/>
      <text x={right+D+2} y={bottom-D*.2} fontSize="10" fontWeight="700">{widthIn}&quot;</text>
    </>;
  } else if(kind==='footing') {
    const L=clamp(82+length*11,115,165), W=clamp(24+widthFt*5,32,52), H=clamp(18+n(first(data,['depthFt'],1.5))*18,30,55);
    const x=50,y=112,right=x+L,bottom=y+H;
    rows=showSteel?['REINFORCEMENT',`${mainDia} mm main @ ${spacing}`,`${secondDia} mm distribution`,`${secondSpacing} mm spacing`,`Cover ${cover} mm`]:[];
    body=<>
      <polygon points={`${x},${y} ${right},${y} ${right+W},${y-W*.5} ${x+W},${y-W*.5}`} fill="#e2e8f0" stroke="#334155"/>
      <rect x={x} y={y} width={L} height={H} fill="#cbd5e1" stroke="#334155"/>
      <polygon points={`${right},${y} ${right+W},${y-W*.5} ${right+W},${bottom-W*.5} ${right},${bottom}`} fill="#94a3b8" stroke="#334155"/>
      {showSteel&&Array.from({length:7}).map((_,i)=><line key={i} x1={x+12+i*(L-24)/6} y1={y-3} x2={x+W+12+i*(L-24)/6} y2={y-W*.5-3} stroke="#b91c1c"/>)}
      <rect x={x+L*.43} y={45} width={clamp(widthIn*3,28,48)} height={y-45} fill="#cbd5e1" stroke="#334155"/>
      <Dim x1={x} y1={bottom+22} x2={right} y2={bottom+22} label={`${length} ft`}/>
      <text x={right+W+2} y={bottom-W*.2} fontSize="10" fontWeight="700">W {widthFt} ft</text>
    </>;
  } else if(kind==='pile') {
    const dia=clamp(n(first(data,['diameterMm','diaMm'],450))/10,34,72), H=clamp(80+heightFt*4,105,150), cx=120,top=38,bottom=top+H;
    const bars=Math.max(4,Math.min(10,n(mainNos,6)));
    const ties=Math.max(4,Math.min(11,Math.round(heightFt*304.8/Math.max(n(spacing,150),50))));
    rows=showSteel?['REINFORCEMENT',`${mainNos} × ${mainDia} mm main`,`${stirrupDia} mm helix`,`@ ${spacing} mm`,`Cover ${cover} mm`]:[];
    body=<>
      <ellipse cx={cx} cy={top} rx={dia/2} ry={dia/5} fill="#e2e8f0" stroke="#334155"/>
      <path d={`M${cx-dia/2} ${top} L${cx-dia/2} ${bottom} Q${cx} ${bottom+22} ${cx+dia/2} ${bottom} L${cx+dia/2} ${top}`} fill="#cbd5e1" stroke="#334155"/>
      {showSteel&&Array.from({length:bars}).map((_,i)=>{const bx=cx-dia*.34+i*(dia*.68)/(bars-1);return <line key={i} x1={bx} y1={top+4} x2={bx} y2={bottom} stroke="#b91c1c" strokeWidth="2"/>})}
      {showSteel&&Array.from({length:ties}).map((_,i)=><ellipse key={i} cx={cx} cy={top+12+i*(H-20)/(ties-1)} rx={dia*.38} ry={dia*.12} fill="none" stroke="#15803d"/>)}
      <Dim x1={cx+dia/2+20} y1={top} x2={cx+dia/2+20} y2={bottom} label={`${heightFt} ft`} vertical/>
      <text x={cx} y={bottom+40} textAnchor="middle" fontSize="10" fontWeight="700">Ø {t(first(data,['diameterMm','diaMm'],450))} mm</text>
    </>;
  } else if(kind==='slab') {
    const L=clamp(95+length*5,125,180), W=clamp(28+widthFt*3,35,55), H=clamp(8+depthIn*.7,10,22), x=38,y=90,right=x+L,bottom=y+H;
    rows=showSteel?['REINFORCEMENT',`${mainDia} mm main @ ${spacing}`,`${secondDia} mm distribution`,`${secondSpacing} mm spacing`,`Cover ${cover} mm`]:[];
    body=<>
      <polygon points={`${x},${y} ${right},${y} ${right+W},${y-W*.5} ${x+W},${y-W*.5}`} fill="#e2e8f0" stroke="#334155"/>
      <rect x={x} y={y} width={L} height={H} fill="#cbd5e1" stroke="#334155"/>
      <polygon points={`${right},${y} ${right+W},${y-W*.5} ${right+W},${bottom-W*.5} ${right},${bottom}`} fill="#94a3b8" stroke="#334155"/>
      {showSteel&&Array.from({length:7}).map((_,i)=><line key={`a${i}`} x1={x+10+i*(L-20)/6} y1={y-3} x2={x+W+10+i*(L-20)/6} y2={y-W*.5-3} stroke="#b91c1c"/>)}
      {showSteel&&Array.from({length:5}).map((_,i)=><line key={`b${i}`} x1={x+W*i/4} y1={y-W*i/8} x2={right+W*i/4} y2={y-W*i/8} stroke="#15803d"/>)}
      <Dim x1={x} y1={bottom+30} x2={right} y2={bottom+30} label={`${length} ft`}/>
      <text x={right+W+1} y={bottom-W*.1} fontSize="10" fontWeight="700">W {widthFt} ft</text>
      <text x={x} y={bottom+50} fontSize="10" fontWeight="700">T {depthIn}&quot;</text>
    </>;
  } else if(kind==='retaining-wall') {
    const H=clamp(55+heightFt*8,90,145), stemTop=clamp(18+widthIn,22,38), base=clamp(100+length*2,125,170), x=70,bottom=180,top=bottom-H;
    rows=showSteel?['REINFORCEMENT',`${mainDia} mm vertical`,`${secondDia} mm horizontal`,`@ ${spacing} / ${secondSpacing} mm`,`Cover ${cover} mm`]:[];
    body=<>
      <polygon points={`${x+base*.38},${top} ${x+base*.38+stemTop},${top} ${x+base*.55},${bottom} ${x+base*.25},${bottom}`} fill="#cbd5e1" stroke="#334155"/>
      <polygon points={`${x},${bottom} ${x+base},${bottom} ${x+base+25},${bottom+14} ${x+25},${bottom+14}`} fill="#94a3b8" stroke="#334155"/>
      {showSteel&&Array.from({length:6}).map((_,i)=><line key={i} x1={x+base*.4+i*5} y1={top+8} x2={x+base*.28+i*14} y2={bottom-7} stroke="#b91c1c"/>)}
      <Dim x1={x+5} y1={top} x2={x+5} y2={bottom} label={`${heightFt} ft`} vertical/>
      <Dim x1={x} y1={bottom+32} x2={x+base} y2={bottom+32} label={`L ${length} ft`}/>
    </>;
  } else if(kind==='staircase') {
    const riser=Math.max(n(first(data,['riserIn'],7),7),1), tread=Math.max(n(first(data,['treadIn'],10),10),1);
    const steps=clamp(Math.round(heightFt*12/riser),5,12), rise=clamp(60+heightFt*7,85,145), run=clamp(90+steps*tread*.7,120,185), x=35,bottom=180;
    rows=showSteel?['REINFORCEMENT',`${mainDia} mm main`,`${secondDia} mm distribution`,`@ ${spacing} mm`,`Cover ${cover} mm`]:[];
    body=<>
      {Array.from({length:steps}).map((_,i)=>{const sx=x+i*run/steps,sy=bottom-i*rise/steps;return <polyline key={i} points={`${sx},${sy} ${sx+run/steps},${sy} ${sx+run/steps},${sy-rise/steps}`} fill="none" stroke="#334155" strokeWidth="5"/>})}
      {showSteel&&<line x1={x+8} y1={bottom-10} x2={x+run-8} y2={bottom-rise+8} stroke="#b91c1c" strokeWidth="2.5"/>}
      <Dim x1={x} y1={bottom+25} x2={x+run} y2={bottom+25} label={`Tread ${tread}\"`}/>
      <Dim x1={x-18} y1={bottom-rise} x2={x-18} y2={bottom} label={`${heightFt} ft`} vertical/>
    </>;
  } else if(kind==='water-tank'||kind==='septic-tank') {
    const L=clamp(80+length*7,115,165), W=clamp(24+widthFt*4,32,52), H=clamp(45+heightFt*7,70,115), x=42,y=58,right=x+L,bottom=y+H;
    rows=showSteel?['REINFORCEMENT',`${mainDia} mm main mesh`,`${secondDia} mm distribution`,`@ ${spacing} mm`,`Cover ${cover} mm`]:[];
    body=<>
      <rect x={x} y={y} width={L} height={H} fill="#bfdbfe" stroke="#334155"/>
      <polygon points={`${x},${y} ${right},${y} ${right+W},${y-W*.5} ${x+W},${y-W*.5}`} fill="#dbeafe" stroke="#334155"/>
      <polygon points={`${right},${y} ${right+W},${y-W*.5} ${right+W},${bottom-W*.5} ${right},${bottom}`} fill="#93c5fd" stroke="#334155"/>
      <rect x={x+15} y={y+15} width={L-30} height={H-30} fill="#eff6ff" stroke="#2563eb" strokeDasharray="4 3"/>
      {kind==='septic-tank'&&<line x1={x+L*.58} y1={y} x2={x+L*.58} y2={bottom} stroke="#475569" strokeWidth="3"/>}
      <Dim x1={x} y1={bottom+22} x2={right} y2={bottom+22} label={`${length} ft`}/>
      <Dim x1={x-18} y1={y} x2={x-18} y2={bottom} label={`${heightFt} ft`} vertical/>
      <text x={right+W+2} y={bottom-W*.2} fontSize="10" fontWeight="700">W {widthFt} ft</text>
    </>;
  } else if(kind==='roof-truss') {
    const span=clamp(105+n(first(data,['spanFt','lengthFt'],30))*3,145,205), rise=clamp(38+n(first(data,['heightFt','riseFt'],6))*6,55,95), x=30,bottom=165,mid=x+span/2;
    body=<>
      <polyline points={`${x},${bottom} ${mid},${bottom-rise} ${x+span},${bottom}`} fill="none" stroke="#334155" strokeWidth="5"/>
      <line x1={x} y1={bottom} x2={x+span} y2={bottom} stroke="#334155" strokeWidth="5"/>
      {Array.from({length:5}).map((_,i)=>{const bx=x+span*(i+1)/6;return <line key={i} x1={bx} y1={bottom} x2={mid} y2={bottom-rise} stroke="#64748b" strokeWidth="2"/>})}
      <Dim x1={x} y1={bottom+25} x2={x+span} y2={bottom+25} label={`${t(first(data,['spanFt','lengthFt'],30))} ft span`}/>
      <Dim x1={mid+18} y1={bottom-rise} x2={mid+18} y2={bottom} label={`${t(first(data,['heightFt','riseFt'],6))} ft`} vertical/>
    </>;
  } else {
    const L=clamp(95+length*5,125,180), H=clamp(55+heightFt*5,70,110), D=clamp(25+widthFt*2,30,48), x=38,y=70,right=x+L,bottom=y+H;
    body=<>
      <rect x={x} y={y} width={L} height={H} fill={kind==='paint'?'#fef3c7':kind==='flooring'?'#ede9fe':'#cbd5e1'} stroke="#334155"/>
      <polygon points={`${x},${y} ${right},${y} ${right+D},${y-D*.45} ${x+D},${y-D*.45}`} fill="#e2e8f0" stroke="#334155"/>
      <polygon points={`${right},${y} ${right+D},${y-D*.45} ${right+D},${bottom-D*.45} ${right},${bottom}`} fill="#94a3b8" stroke="#334155"/>
      <Dim x1={x} y1={bottom+22} x2={right} y2={bottom+22} label={`${length} ft`}/>
      <Dim x1={x-18} y1={y} x2={x-18} y2={bottom} label={`${heightFt} ft`} vertical/>
    </>;
  }

  return <div style={{width:'100%',maxWidth:260,marginLeft:'auto',padding:10,background:'#eef3f8',border:'1px solid #94a3b8',borderRadius:10,boxShadow:'0 3px 10px rgba(15,23,42,.16)',boxSizing:'border-box'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
      <strong style={{fontSize:13,color:'#7f1d1d',textTransform:'capitalize'}}>{label}</strong>
      <span style={{fontSize:9,fontWeight:700,color:'#475569',background:'#f1f5f9',padding:'3px 7px',borderRadius:10}}>3D ISOMETRIC</span>
    </div>
    <svg viewBox="0 0 300 225" width="100%" height="195" style={{display:'block'}}>
      <defs><marker id="eng-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto-start-reverse"><path d="M0,0 L7,3.5 L0,7 Z" fill="#334155"/></marker></defs>
      <line x1="22" y1="205" x2="280" y2="205" stroke="#94a3b8" strokeWidth="1.2"/>
      {body}
      {rows.length>0&&<Schedule data={data} grade={grade} rows={rows}/>} 
      {rows.length===0&&<text x="205" y="30" fill="#7f1d1d" fontSize="10.5" fontWeight="700">{grade}</text>}
    </svg>
  </div>;
}
