import React, { useState } from "react";
import { useRouter } from "next/router";

type Facing = "East" | "West" | "North" | "South";
type Parking = "Full Parking" | "Half Parking" | "No Parking";
type BuildingType = "Own Use" | "Rental Use";
type StaircaseType = "Internal" | "External" | "Duplex";
type Inputs = {
  plotLength:number; plotWidth:number; facing:Facing; floors:number; parking:Parking;
  buildingType:BuildingType; staircaseType:StaircaseType; lift:boolean; bedrooms:number; toilets:number;
  poojaRoom:boolean; storeRoom:boolean; terraceRoom:boolean; clayTileRoom:boolean;
  pantry:boolean; utility:boolean; balcony:boolean; ugTank:boolean;
};
type Box = { x:number; y:number; w:number; h:number };
type Room = Box & { id:string; label:string; sub?:string; kind?:"bed"|"living"|"dining"|"kitchen"|"toilet"|"stair"|"lift"|"utility"|"lounge"|"terrace" };
type StandardRoom = { id:string; label:string; min:number; max:number };
type Allocation = { rooms:Record<string,number>; items:StandardRoom[]; circulation:number; required:number; available:number; fit:boolean };

const ink="#202b33", faint="#94a3b8", blue="#155eaa", green="#166534", paper="#fffef9";
const B:Box={x:150,y:105,w:640,h:455};
const CW:Box={x:112,y:67,w:716,h:531};
const xs=[B.x,B.x+190,B.x+380,B.x+500,B.x+B.w];
const ys=[B.y,B.y+165,B.y+275,B.y+B.h];
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Number(n)||min));
const floorName=(level:number)=>level===0?"Ground Floor":level===1?"First Floor":level===2?"Second Floor":level===3?"Third Floor":level===4?"Fourth Floor":level===5?"Fifth Floor":level===6?"Sixth Floor":level+"th Floor";
const roomDim=(w:number,h:number,input:Inputs)=>`${(w/B.w*input.plotWidth*.88).toFixed(1)}′ × ${(h/B.h*input.plotLength*.88).toFixed(1)}′`;
const areaText=(allocation:Allocation,id:string)=>allocation.rooms[id]?`${Math.round(allocation.rooms[id])} sq.ft allocated`:undefined;
const S={living:[120,300],dining:[80,160],kitchen:[80,140],master:[120,220],bed:[100,180],attached:[35,60],common:[30,50],pooja:[25,60],stair:[70,120],balcony:[35,100],utility:[30,80]} as const;
const std=(id:string,label:string,key:keyof typeof S):StandardRoom=>({id,label,min:S[key][0],max:S[key][1]});
function allocate(items:StandardRoom[],available:number):Allocation{const circulation=available*.10,minRooms=items.reduce((s,r)=>s+r.min,0),required=minRooms+circulation,capacity=items.reduce((s,r)=>s+r.max-r.min,0),extra=Math.max(0,Math.min(available-required,capacity)),rooms:Record<string,number>={};items.forEach(r=>rooms[r.id]=r.min+(capacity?extra*(r.max-r.min)/capacity:0));return{rooms,items,circulation,required,available,fit:required<=available}}
function allocations(input:Inputs){
  const bua=input.plotLength*input.plotWidth*.88;
  const first:StandardRoom[]=[std("living",input.buildingType==="Rental Use"?"Rental Unit Living":"Living","living"),std("dining","Dining","dining"),std("kitchen",input.pantry?"Kitchen + Pantry":"Kitchen","kitchen"),std("master","Master Bedroom","master"),std("master-toilet","Master Attached Toilet","attached"),std("stair",input.staircaseType+" Staircase","stair")];
  if(input.poojaRoom)first.push(std("pooja","Pooja","pooja"));
  if(input.balcony){first.push(std("living-balcony","Living Balcony","balcony"),std("master-balcony","Master Balcony","balcony"));}
  if(input.utility)first.push(std("utility","Utility","utility"));
  if(input.pantry)first.push(std("pantry","Pantry","utility"));
  if(input.storeRoom)first.push(std("store","Store Room","utility"));
  if(input.bedrooms>=2)first.push(std("guest","Guest Bedroom","bed"));
  if(input.toilets>=2)first.push(std("guest-toilet","Guest Attached Toilet","attached"));
  if(input.toilets>input.bedrooms)first.push(std("common-toilet","Common Toilet","common"));
  const second:StandardRoom[]=[std("family",input.buildingType==="Rental Use"?"Rental Unit Lounge":"Family Lounge","living"),std("stair-2",input.staircaseType+" Staircase","stair")];
  if(input.balcony)second.push(std("balcony-2","Road-side Balcony","balcony"));
  if(input.terraceRoom)second.push(std("terrace-room","Terrace Room","bed"));
  if(input.clayTileRoom)second.push(std("clay-room","Clay Tile Covered Room","bed"));
  if(input.bedrooms>=3)second.push(std("bed3","Bedroom 3","bed"));
  if(input.bedrooms>=4)second.push(std("bed4","Bedroom 4","bed"));
  if(input.toilets>=3)second.push(std("bed3-toilet","Bedroom 3 Toilet","attached"));
  if(input.toilets>=4)second.push(std("bed4-toilet","Bedroom 4 Toilet","attached"));
  return{bua,first:allocate(first,bua),second:allocate(second,bua)};
}

const styles:Record<string,React.CSSProperties>={
  page:{minHeight:"100vh",background:"#edf1f5",color:ink,padding:16},
  header:{display:"flex",gap:14,alignItems:"center",padding:"16px 20px",borderRadius:14,background:"linear-gradient(135deg,#641229,#8b1d39)",color:"white",marginBottom:16},
  back:{width:38,height:38,borderRadius:8,border:"1px solid rgba(255,255,255,.35)",background:"rgba(255,255,255,.12)",color:"white",fontSize:20,cursor:"pointer"},
  controls:{background:"white",padding:16,borderRadius:14,boxShadow:"0 3px 14px rgba(15,23,42,.08)",marginBottom:16},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12},
  label:{display:"block",fontSize:10,fontWeight:800,color:"#475569",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"},
  input:{width:"100%",boxSizing:"border-box",padding:"9px 10px",border:"1px solid #cbd5e1",borderRadius:8,background:"white",color:ink},
  checkRow:{display:"flex",gap:20,marginTop:13,paddingTop:12,borderTop:"1px solid #e2e8f0",fontSize:12,fontWeight:700},
  warning:{marginTop:13,padding:"10px 12px",borderRadius:8,background:"#fff7ed",border:"1px solid #fdba74",color:"#9a3412",fontSize:12,fontWeight:700},
  sheet:{background:"white",borderRadius:14,padding:14,marginBottom:18,boxShadow:"0 3px 16px rgba(15,23,42,.08)"},
  sheetHead:{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:10},
  svgWrap:{overflowX:"auto",border:"1px solid #d7dde5",borderRadius:8,background:paper}
};

function Field({label,children}:{label:string;children:React.ReactNode}){return <label><span style={styles.label}>{label}</span>{children}</label>}
function Select({label,value,values,onChange}:{label:string;value:string;values:string[];onChange:(v:string)=>void}){return <Field label={label}><select aria-label={label} value={value} onChange={e=>onChange(e.target.value)} style={styles.input}>{values.map(v=><option key={v}>{v}</option>)}</select></Field>}
function NorthArrow({x=920,y=72}:{x?:number;y?:number}){return <g transform={`translate(${x} ${y})`}><text y="-24" textAnchor="middle" fontSize="13" fontWeight="800">N</text><path d="M0,-18 L-9,9 L0,4 L9,9 Z" fill={ink}/><line y1="-18" y2="25" stroke={ink} strokeWidth="1.5"/></g>}
function Tick({x,y,vertical=false}:{x:number;y:number;vertical?:boolean}){return vertical?<path d={`M${x-4},${y-4} l8,8`} stroke={ink}/>:<path d={`M${x-4},${y+4} l8,-8`} stroke={ink}/>}

function Dimensions({input,segmentsX=[0,.3,.6,.78,1],segmentsY=[0,.36,.6,1]}:{input:Inputs;segmentsX?:number[];segmentsY?:number[]}){
  const top=input.facing==="North"?B.y-18:B.y-28,bottom=B.y+B.h+28,left=input.facing==="West"?B.x-18:B.x-30,right=input.facing==="East"?B.x+B.w+18:B.x+B.w+30;
  return <g fill={ink} fontSize="8" strokeWidth=".8">
    <line x1={B.x} y1={top} x2={B.x+B.w} y2={top} stroke={ink}/><line x1={B.x} y1={bottom} x2={B.x+B.w} y2={bottom} stroke={ink}/>
    {segmentsX.map((v,i)=><React.Fragment key={`x${v}`}><line x1={B.x+B.w*v} y1={top-7} x2={B.x+B.w*v} y2={B.y} stroke={faint}/><line x1={B.x+B.w*v} y1={B.y+B.h} x2={B.x+B.w*v} y2={bottom+7} stroke={faint}/><Tick x={B.x+B.w*v} y={top}/><Tick x={B.x+B.w*v} y={bottom}/>{i<segmentsX.length-1&&<text x={B.x+B.w*(v+segmentsX[i+1])/2} y={top-5} textAnchor="middle" stroke="none">{((segmentsX[i+1]-v)*input.plotWidth).toFixed(1)}′</text>}</React.Fragment>)}
    <line x1={left} y1={B.y} x2={left} y2={B.y+B.h} stroke={ink}/><line x1={right} y1={B.y} x2={right} y2={B.y+B.h} stroke={ink}/>
    {segmentsY.map((v,i)=><React.Fragment key={`y${v}`}><line x1={left-7} y1={B.y+B.h*v} x2={B.x} y2={B.y+B.h*v} stroke={faint}/><line x1={B.x+B.w} y1={B.y+B.h*v} x2={right+7} y2={B.y+B.h*v} stroke={faint}/><Tick x={left} y={B.y+B.h*v} vertical/><Tick x={right} y={B.y+B.h*v} vertical/>{i<segmentsY.length-1&&<text x={left-6} y={B.y+B.h*(v+segmentsY[i+1])/2} transform={`rotate(-90 ${left-6} ${B.y+B.h*(v+segmentsY[i+1])/2})`} textAnchor="middle" stroke="none">{((segmentsY[i+1]-v)*input.plotLength).toFixed(1)}′</text>}</React.Fragment>)}
    <text x={B.x+B.w/2} y={input.facing==="North"?B.y-10:B.y-49} textAnchor="middle" fontSize="9" stroke="none">OVERALL {input.plotWidth}′-0″</text><text x={B.x-53} y={B.y+B.h/2} transform={`rotate(-90 ${B.x-53} ${B.y+B.h/2})`} textAnchor="middle" fontSize="9" stroke="none">OVERALL {input.plotLength}′-0″</text>
  </g>
}

function RoadAndGate({input,compound=false}:{input:Inputs;compound?:boolean}){
  const R=compound?CW:B, f=input.facing;
  const road=f==="North"?{x:R.x-24,y:55,w:R.w+48,h:20}:f==="South"?{x:R.x-24,y:R.y+R.h+(compound?29:38),w:R.w+48,h:24}:f==="West"?{x:R.x-57,y:R.y-24,w:28,h:R.h+48}:{x:R.x+R.w+29,y:R.y-24,w:28,h:R.h+48};
  const gx=f==="North"||f==="South"?R.x+R.w*.52:(f==="West"?R.x:R.x+R.w), gy=f==="North"?R.y:f==="South"?R.y+R.h:R.y+R.h*.62;
  return <g><rect {...road} fill="#e2e8f0"/><text x={road.x+road.w/2} y={road.y+road.h/2+4} transform={f==="East"||f==="West"?`rotate(-90 ${road.x+road.w/2} ${road.y+road.h/2})`:undefined} textAnchor="middle" fontSize="10" fontWeight="700">{f.toUpperCase()} ROAD</text>
    {compound&&<g stroke={green} fill="none" strokeWidth="2"><line x1={f==="North"||f==="South"?gx-42:gx} y1={f==="North"||f==="South"?gy:gy-42} x2={f==="North"||f==="South"?gx+42:gx} y2={f==="North"||f==="South"?gy:gy+42} stroke="white" strokeWidth="9"/><line x1={f==="North"||f==="South"?gx-42:gx} y1={f==="North"||f==="South"?gy:gy-42} x2={f==="North"||f==="South"?gx:gx} y2={f==="North"||f==="South"?gy:gy} stroke={green} strokeWidth="3"/><line x1={f==="North"||f==="South"?gx:gx} y1={f==="North"||f==="South"?gy:gy} x2={f==="North"||f==="South"?gx+42:gx} y2={f==="North"||f==="South"?gy:gy+42} stroke={green} strokeWidth="3"/><text x={gx+(f==="East"?10:f==="West"?-10:0)} y={gy+(f==="South"?-8:16)} textAnchor={f==="East"?"start":f==="West"?"end":"middle"} fill={green} stroke="none" fontSize="8">SLIDING GATE 12′-0″</text></g>}
  </g>
}

function FacingEntry({input}:{input:Inputs}){
  const f=input.facing;
  const point=f==="North"?{x:B.x+B.w*.62,y:B.y,side:"north" as const,labelX:B.x+B.w*.62,labelY:B.y+18}:
    f==="South"?{x:B.x+B.w*.62,y:B.y+B.h,side:"south" as const,labelX:B.x+B.w*.62,labelY:B.y+B.h-10}:
    f==="West"?{x:B.x,y:B.y+B.h*.48,side:"west" as const,labelX:B.x+10,labelY:B.y+B.h*.48-18}:
    {x:B.x+B.w,y:B.y+B.h*.48,side:"east" as const,labelX:B.x+B.w-10,labelY:B.y+B.h*.48-18};
  return <g><Door x={point.x} y={point.y} side={point.side} size={32}/><text x={point.labelX} y={point.labelY} textAnchor={f==="West"?"start":f==="East"?"end":"middle"} fontSize="7" fill={green}>MAIN ENTRY • {f.toUpperCase()}</text></g>;
}

function Window({x,y,length=36,vertical=false}:{x:number;y:number;length?:number;vertical?:boolean}){return vertical?<g><line x1={x} y1={y-length/2} x2={x} y2={y+length/2} stroke="white" strokeWidth="8"/><line x1={x-2} y1={y-length/2} x2={x-2} y2={y+length/2} stroke={blue}/><line x1={x+2} y1={y-length/2} x2={x+2} y2={y+length/2} stroke={blue}/><line x1={x-5} y1={y} x2={x+5} y2={y} stroke={blue}/></g>:<g><line x1={x-length/2} y1={y} x2={x+length/2} y2={y} stroke="white" strokeWidth="8"/><line x1={x-length/2} y1={y-2} x2={x+length/2} y2={y-2} stroke={blue}/><line x1={x-length/2} y1={y+2} x2={x+length/2} y2={y+2} stroke={blue}/><line x1={x} y1={y-5} x2={x} y2={y+5} stroke={blue}/></g>}
function Door({x,y,side="south",size=25,out=false}:{x:number;y:number;side?:"north"|"south"|"east"|"west";size?:number;out?:boolean}){
  if(side==="north"||side==="south"){const dir=side==="north"?(out?-1:1):(out?1:-1);return <g><line x1={x-size/2} y1={y} x2={x+size/2} y2={y} stroke="white" strokeWidth="8"/><line x1={x-size/2} y1={y} x2={x-size/2} y2={y+dir*size} stroke={ink}/><path d={`M${x+size/2},${y} A${size},${size} 0 0 ${dir>0?1:0} ${x-size/2},${y+dir*size}`} fill="none" stroke={faint}/></g>}
  const dir=side==="west"?(out?-1:1):(out?1:-1);return <g><line x1={x} y1={y-size/2} x2={x} y2={y+size/2} stroke="white" strokeWidth="8"/><line x1={x} y1={y+size/2} x2={x+dir*size} y2={y+size/2} stroke={ink}/><path d={`M${x},${y-size/2} A${size},${size} 0 0 ${dir>0?1:0} ${x+dir*size},${y+size/2}`} fill="none" stroke={faint}/></g>
}
function Bed({x,y,w=72,h=98}:{x:number;y:number;w?:number;h?:number}){return <g stroke={faint} fill="none"><rect x={x} y={y} width={w} height={h} rx="2"/><line x1={x} y1={y+22} x2={x+w} y2={y+22}/><rect x={x+7} y={y+5} width={w/2-10} height="13" rx="3"/><rect x={x+w/2+3} y={y+5} width={w/2-10} height="13" rx="3"/></g>}
function Sofa({x,y}:{x:number;y:number}){return <g stroke={faint} fill="none"><path d={`M${x},${y} h90 v28 h-62 v38 h-28 z`}/><line x1={x+28} y1={y} x2={x+28} y2={y+28}/><rect x={x+112} y={y+15} width="35" height="8"/><text x={x+130} y={y+11} fontSize="7" textAnchor="middle">TV</text></g>}
function Dining({x,y}:{x:number;y:number}){return <g stroke={faint} fill="none"><ellipse cx={x} cy={y} rx="36" ry="20"/>{[-1,1].map(a=><React.Fragment key={a}><circle cx={x+a*48} cy={y} r="6"/><circle cx={x+a*20} cy={y-31} r="6"/><circle cx={x+a*20} cy={y+31} r="6"/></React.Fragment>)}</g>}
function Toilet({x,y,w=75,h=70}:{x:number;y:number;w?:number;h?:number}){return <g stroke={faint} fill="none"><ellipse cx={x+18} cy={y+21} rx="8" ry="13"/><rect x={x+w-27} y={y+8} width="17" height="10"/><circle cx={x+w-18} cy={y+13} r="2"/><path d={`M${x+w-30},${y+h-12} h20 M${x+w-20},${y+h-22} v20`}/></g>}
function Kitchen({x,y,w,h}:{x:number;y:number;w:number;h:number}){return <g stroke={faint} fill="none"><path d={`M${x+7},${y+7} H${x+w-8} V${y+23} H${x+24} V${y+h-8} H${x+7} Z`}/><rect x={x+w-42} y={y+11} width="20" height="9"/><circle cx={x+16} cy={y+38} r="5"/><circle cx={x+16} cy={y+54} r="5"/></g>}
function Stair({x,y,w,h}:{x:number;y:number;w:number;h:number}){return <g stroke={faint} fill="none">{Array.from({length:10}).map((_,i)=><line key={i} x1={x+8} y1={y+10+i*(h-20)/10} x2={x+w-8} y2={y+10+i*(h-20)/10}/>)}<path d={`M${x+w/2},${y+h-14} V${y+20} l-6,9 m6,-9 l6,9`} stroke={ink} strokeWidth="1.5"/><text x={x+w/2+10} y={y+27} fontSize="8" fill={ink}>UP</text></g>}
function Lift({x,y,w,h}:{x:number;y:number;w:number;h:number}){return <g stroke={ink} fill="none"><rect x={x+7} y={y+7} width={w-14} height={h-14}/><path d={`M${x+w/2-12},${y+h/2} l12,-10 l12,10 l-12,10 z`} stroke={faint}/><line x1={x+w/2} y1={y+h-14} x2={x+w/2} y2={y+h}/></g>}
function Car({x,y,w=100,h=190}:{x:number;y:number;w?:number;h?:number}){return <g stroke={faint} fill="none" strokeWidth="1.3"><rect x={x} y={y} width={w} height={h} rx="24"/><rect x={x+w*.18} y={y+h*.18} width={w*.64} height={h*.64} rx="12"/><line x1={x+w*.18} y1={y+h*.5} x2={x+w*.82} y2={y+h*.5}/><circle cx={x+3} cy={y+h*.25} r="4"/><circle cx={x+w-3} cy={y+h*.25} r="4"/><circle cx={x+3} cy={y+h*.75} r="4"/><circle cx={x+w-3} cy={y+h*.75} r="4"/></g>}
function Bike({x,y}:{x:number;y:number}){return <g stroke={faint} fill="none"><circle cx={x} cy={y+35} r="12"/><circle cx={x+42} cy={y+35} r="12"/><path d={`M${x},${y+35} l15,-25 h15 l12,25 h-22 l10,-20 M${x+30},${y+5} h10`}/></g>}

function RoomLayer({room,input}:{room:Room;input:Inputs}){return <g><rect x={room.x} y={room.y} width={room.w} height={room.h} fill={room.kind==="toilet"?"#f4fafb":room.kind==="terrace"?"#f8fafc":"white"}/>{room.kind==="bed"&&<Bed x={room.x+room.w/2-36} y={room.y+20} w={72} h={Math.min(94,room.h-54)}/>} {room.kind==="living"&&<Sofa x={room.x+25} y={room.y+30}/>} {room.kind==="dining"&&<Dining x={room.x+room.w/2} y={room.y+room.h/2}/>} {room.kind==="kitchen"&&<Kitchen x={room.x} y={room.y} w={room.w} h={room.h}/>} {room.kind==="toilet"&&<Toilet x={room.x+4} y={room.y+5} w={room.w-8} h={room.h-8}/>} {room.kind==="stair"&&<Stair x={room.x} y={room.y} w={room.w} h={room.h}/>} {room.kind==="lift"&&<Lift x={room.x} y={room.y} w={room.w} h={room.h}/>}<text x={room.x+room.w/2} y={room.y+room.h-18} textAnchor="middle" fontSize="9" fontWeight="800">{room.label}</text><text x={room.x+room.w/2} y={room.y+room.h-7} textAnchor="middle" fontSize="7" fill={faint}>{room.sub||roomDim(room.w,room.h,input)}</text></g>}
function Balcony({facing,label="BALCONY"}:{facing:Facing;label?:string}){const f=facing;if(f==="North"||f==="South"){const y=f==="North"?B.y-17:B.y+B.h;return <g><rect x={B.x+B.w*.32} y={y} width={B.w*.38} height="17" fill="#f8fafc" stroke={ink}/><line x1={B.x+B.w*.32+8} y1={y+5} x2={B.x+B.w*.7-8} y2={y+5} stroke={faint} strokeDasharray="4 3"/><text x={B.x+B.w*.51} y={y+(f==="North"?-4:29)} textAnchor="middle" fontSize="7">{label} • ROAD SIDE</text></g>}const x=f==="West"?B.x-17:B.x+B.w;return <g><rect x={x} y={B.y+B.h*.28} width="17" height={B.h*.42} fill="#f8fafc" stroke={ink}/><line x1={x+5} y1={B.y+B.h*.28+8} x2={x+5} y2={B.y+B.h*.7-8} stroke={faint} strokeDasharray="4 3"/><text x={x+(f==="West"?-5:29)} y={B.y+B.h*.49} transform={`rotate(-90 ${x+(f==="West"?-5:29)} ${B.y+B.h*.49})`} textAnchor="middle" fontSize="7">{label} • ROAD SIDE</text></g>}

function SheetFrame({title,number,input,children}:{title:string;number:string;input:Inputs;children:React.ReactNode}){return <section style={styles.sheet}><div style={styles.sheetHead}><h2 style={{margin:0,fontSize:17}}>{number} — {title}</h2><span style={{fontSize:10,color:faint}}>Scale: NTS • {input.facing} facing • Plot {input.plotWidth}′ × {input.plotLength}′</span></div><div style={styles.svgWrap}><svg viewBox="0 0 980 710" width="100%" style={{minWidth:780,display:"block"}} role="img" aria-label={title}><rect width="980" height="710" fill={paper}/><text x="24" y="28" fontSize="15" fontWeight="800">BUILDMITRA — {title.toUpperCase()}</text><text x="24" y="45" fontSize="8" fill={faint}>CONCEPT ARCHITECTURAL DRAFT • ALL DIMENSIONS IN FEET • NORTH KEPT UP</text><NorthArrow/>{children}<text x="24" y="692" fontSize="8" fill={faint}>DRG-V3 • Concept only • Verify dimensions, setbacks and structure before execution</text></svg></div></section>}

function StructuralSheet({input}:{input:Inputs}){const G={x:210,y:120,w:560,h:400}, gx=[G.x,G.x+G.w/2,G.x+G.w], gy=[G.y,G.y+G.h/2,G.y+G.h], footing=input.floors>=4?"6′-0″ × 6′-0″":"5′-0″ × 5′-0″",column=input.floors>=4?"12″ × 18″":"9″ × 15″";return <SheetFrame title="Structural Grid / Footing Plan" number="01" input={input}><g>{gx.map((x,i)=><g key={x}><line x1={x} y1={G.y-40} x2={x} y2={G.y+G.h+40} stroke={faint} strokeDasharray="6 5"/><circle cx={x} cy={G.y-52} r="12" fill="white" stroke={ink}/><text x={x} y={G.y-48} textAnchor="middle" fontSize="10" fontWeight="800">{String.fromCharCode(65+i)}</text></g>)}{gy.map((y,i)=><g key={y}><line x1={G.x-40} y1={y} x2={G.x+G.w+40} y2={y} stroke={faint} strokeDasharray="6 5"/><circle cx={G.x-53} cy={y} r="12" fill="white" stroke={ink}/><text x={G.x-53} y={y+4} textAnchor="middle" fontSize="10" fontWeight="800">{i+1}</text></g>)}{gx.flatMap((x,i)=>gy.map((y,j)=><g key={`${i}-${j}`}><rect x={x-22} y={y-22} width="44" height="44" fill="none" stroke={ink} strokeWidth="1.5"/><rect x={x-7} y={y-10} width="14" height="20" fill={ink}/>{i===0&&j===0&&<text x={x+30} y={y-28} fontSize="8">F1 {footing}</text>}</g>))}<line x1={G.x} y1={G.y-25} x2={G.x+G.w/2} y2={G.y-25} stroke={ink}/><text x={G.x+G.w/4} y={G.y-31} textAnchor="middle" fontSize="9">A–B = {(input.plotWidth/2).toFixed(1)}′</text><line x1={G.x-26} y1={G.y} x2={G.x-26} y2={G.y+G.h/2} stroke={ink}/><text x={G.x-32} y={G.y+G.h/4} transform={`rotate(-90 ${G.x-32} ${G.y+G.h/4})`} textAnchor="middle" fontSize="9">1–2 = {(input.plotLength/2).toFixed(1)}′</text></g><g><rect x="165" y="585" width="650" height="70" fill="#f8fafc" stroke="#cbd5e1"/><text x="180" y="605" fontSize="9">FOOTING: {footing} • COLUMN: {column} • PLINTH/ROOF BEAM: 9″ × 15″ • SLAB: {input.floors>=4?"6″":"5″"}</text><text x="180" y="624" fontSize="8" fill={faint}>STEEL THUMB RULE — Footing mesh: 12 mm @ 6″ c/c; columns: 4–8 nos. 16 mm; ties: 8 mm @ 6″ c/c.</text><text x="180" y="642" fontSize="8" fill={faint}>Final footing, reinforcement and member sizes depend on soil report, spans and licensed structural engineer design.</text></g></SheetFrame>}

function GroundParking({input}:{input:Inputs}){const full=input.parking==="Full Parking",half=input.parking==="Half Parking";return <SheetFrame title={`Ground Floor — ${input.parking}`} number="02" input={input}><RoadAndGate input={input} compound/><rect x={CW.x} y={CW.y} width={CW.w} height={CW.h} fill="none" stroke={ink} strokeWidth="5"/><rect x={B.x} y={B.y} width={B.w} height={B.h} fill="white" stroke={ink} strokeWidth="3"/>{full||half?<g><Car x={B.x+55} y={B.y+95} w="105" h="215"/><Car x={B.x+210} y={B.y+95} w="105" h="215"/>{full&&<Bike x={B.x+75} y={B.y+B.h-75}/>}<text x={B.x+240} y={B.y+B.h-22} textAnchor="middle" fontSize="12" fontWeight="800">{full?"FULL OPEN PARKING":"HALF PARKING"}</text></g>:<g><text x={B.x+B.w*.35} y={B.y+B.h/2} textAnchor="middle" fontSize="12" fontWeight="800">{input.buildingType.toUpperCase()} GROUND FLOOR RESIDENTIAL</text></g>}<g><line x1={B.x+500} y1={B.y} x2={B.x+500} y2={B.y+B.h} stroke={ink}/><line x1={B.x+500} y1={B.y+225} x2={B.x+B.w} y2={B.y+225} stroke={ink}/><line x1={B.x+570} y1={B.y+225} x2={B.x+570} y2={B.y+B.h} stroke={ink}/><line x1={B.x+500} y1={B.y+335} x2={B.x+B.w} y2={B.y+335} stroke={ink}/><Stair x={B.x+500} y={B.y} w="140" h="225"/><text x={B.x+570} y={B.y+214} textAnchor="middle" fontSize="9" fontWeight="800">{input.staircaseType.toUpperCase()} STAIR</text>{input.lift?<g><Lift x={B.x+500} y={B.y+225} w="70" h="110"/><text x={B.x+535} y={B.y+323} textAnchor="middle" fontSize="8" fontWeight="800">LIFT</text></g>:<text x={B.x+535} y={B.y+283} textAnchor="middle" fontSize="8">{input.storeRoom?"STORE ROOM":"OPEN LOBBY"}</text>}<Toilet x={B.x+574} y={B.y+232} w="62" h="95"/><text x={B.x+605} y={B.y+323} textAnchor="middle" fontSize="7" fontWeight="800">COMMON WC</text>{input.ugTank?<g><rect x={B.x+500} y={B.y+335} width="140" height="120" fill="#e0f2fe" stroke={blue}/><path d={`M${B.x+515},${B.y+365} h110 v60 h-110 z M${B.x+515},${B.y+395} h110 M${B.x+570},${B.y+365} v60`} stroke={blue} fill="none"/><text x={B.x+570} y={B.y+442} textAnchor="middle" fontSize="8" fontWeight="800">UG TANK</text></g>:<text x={B.x+570} y={B.y+405} textAnchor="middle" fontSize="8">SERVICES / STORE</text>}</g><Door x={B.x+500} y={B.y+190} side="west"/><Door x={B.x+570} y={B.y+280} side="east" out/><Dimensions input={input}/><text x={CW.x+12} y={CW.y+18} fontSize="8" fill={faint}>9″ COMPOUND WALL</text><text x={B.x+240} y={B.y+34} fontSize="8" fill={green}>CLEAR DRIVEWAY → STAIR / LIFT LOBBY</text></SheetFrame>}

function FirstFloorLegacy({input}:{input:Inputs}){const bed2=input.bedrooms>=2, t2=input.toilets>=2;const rooms:Room[]=[{id:"b1",label:"BEDROOM 1",x:xs[0],y:ys[0],w:190,h:165,kind:"bed"},{id:"liv",label:"LIVING ROOM",x:xs[1],y:ys[0],w:310,h:165,kind:"living"},{id:"b2",label:bed2?"BEDROOM 2":"STUDY / LOUNGE",x:xs[3],y:ys[0],w:140,h:165,kind:bed2?"bed":"lounge"},{id:"t1",label:"ATTACHED TOILET",x:xs[0],y:ys[1],w:85,h:110,kind:"toilet"},{id:"pas",label:"PASSAGE",x:xs[0]+85,y:ys[1],w:105,h:110},{id:"din",label:"DINING",x:xs[1],y:ys[1],w:190,h:110,kind:"dining"},{id:"st",label:"STAIRCASE",x:xs[2],y:ys[1],w:120,h:290,kind:"stair"},{id:"lift",label:input.lift?"LIFT":"STORE",x:xs[3],y:ys[1],w:70,h:110,kind:input.lift?"lift":undefined},{id:"t2",label:t2?"COMMON TOILET":"LINEN / STORE",x:xs[3]+70,y:ys[1],w:70,h:110,kind:t2?"toilet":undefined},{id:"kit",label:"KITCHEN",x:xs[0],y:ys[2],w:190,h:180,kind:"kitchen"},{id:"util",label:"UTILITY",x:xs[1],y:ys[2],w:190,h:180,kind:"utility"},{id:"lobby",label:"STAIR / LIFT LOBBY",x:xs[3],y:ys[2],w:140,h:180}];return <SheetFrame title="First Floor Residential Plan" number="03" input={input}><RoadAndGate input={input}/><rect x={B.x} y={B.y} width={B.w} height={B.h} fill="white" stroke={ink} strokeWidth="4"/>{rooms.map(r=><RoomLayer key={r.id} room={r} input={input}/>)}<g stroke={ink} strokeWidth="1.3"><line x1={xs[1]} y1={B.y} x2={xs[1]} y2={B.y+B.h}/><line x1={xs[2]} y1={ys[1]} x2={xs[2]} y2={B.y+B.h}/><line x1={xs[3]} y1={B.y} x2={xs[3]} y2={B.y+B.h}/><line x1={B.x} y1={ys[1]} x2={B.x+B.w} y2={ys[1]}/><line x1={B.x} y1={ys[2]} x2={xs[2]} y2={ys[2]}/><line x1={xs[3]+70} y1={ys[1]} x2={xs[3]+70} y2={ys[2]}/><line x1={B.x+85} y1={ys[1]} x2={B.x+85} y2={ys[2]}/></g><Door x={xs[1]} y={ys[0]+115} side="west"/><Door x={xs[1]+80} y={ys[1]} side="north"/><Door x={xs[1]} y={ys[1]+55} side="west"/><Door x={xs[2]} y={ys[1]+55} side="east"/><Door x={xs[0]+85} y={ys[1]+55} side="east" out/><Door x={xs[3]+70} y={ys[1]+55} side="east" out/><Door x={xs[1]+80} y={ys[2]} side="north"/><Door x={xs[3]} y={ys[2]+55} side="east"/><Window x={B.x+85} y={B.y}/><Window x={B.x+285} y={B.y}/><Window x={B.x+B.w} y={B.y+82} vertical/><Window x={B.x} y={B.y+82} vertical/><Window x={B.x} y={B.y+365} vertical/><Window x={B.x+95} y={B.y+B.h}/><Window x={B.x+285} y={B.y+B.h}/><Balcony facing={input.facing}/><Dimensions input={input}/></SheetFrame>}

function SecondFloorLegacy({input}:{input:Inputs}){const bed3=input.bedrooms>=3,bed4=input.bedrooms>=4,t3=input.toilets>=3;const rooms:Room[]=[{id:"b3",label:bed3?"BEDROOM 3":"OPEN TERRACE",x:xs[0],y:ys[0],w:190,h:165,kind:bed3?"bed":"terrace"},{id:"fam",label:"FAMILY LOUNGE",x:xs[1],y:ys[0],w:310,h:165,kind:"living"},{id:"b4",label:bed4?"BEDROOM 4":"STUDY / TERRACE",x:xs[3],y:ys[0],w:140,h:165,kind:bed4?"bed":"terrace"},{id:"to",label:t3?"COMMON TOILET":"STORE",x:xs[0],y:ys[1],w:85,h:110,kind:t3?"toilet":undefined},{id:"pas",label:"PASSAGE",x:xs[0]+85,y:ys[1],w:105,h:110},{id:"lou",label:"LOUNGE EXTENSION",x:xs[1],y:ys[1],w:190,h:110,kind:"lounge"},{id:"st",label:"STAIRCASE",x:xs[2],y:ys[1],w:120,h:290,kind:"stair"},{id:"li",label:input.lift?"LIFT":"STORE",x:xs[3],y:ys[1],w:70,h:110,kind:input.lift?"lift":undefined},{id:"linen",label:"LINEN / STORE",x:xs[3]+70,y:ys[1],w:70,h:110},{id:"terr",label:"OPEN TERRACE / MULTIPURPOSE",x:xs[0],y:ys[2],w:380,h:180,kind:"terrace"},{id:"lob",label:"STAIR / LIFT LOBBY",x:xs[3],y:ys[2],w:140,h:180}];return <SheetFrame title="Second Floor Residential Plan" number="04" input={input}><RoadAndGate input={input}/><rect x={B.x} y={B.y} width={B.w} height={B.h} fill="white" stroke={ink} strokeWidth="4"/>{rooms.map(r=><RoomLayer key={r.id} room={r} input={input}/>)}<g stroke={ink} strokeWidth="1.3"><line x1={xs[1]} y1={B.y} x2={xs[1]} y2={B.y+B.h}/><line x1={xs[2]} y1={ys[1]} x2={xs[2]} y2={B.y+B.h}/><line x1={xs[3]} y1={B.y} x2={xs[3]} y2={B.y+B.h}/><line x1={B.x} y1={ys[1]} x2={B.x+B.w} y2={ys[1]}/><line x1={B.x} y1={ys[2]} x2={xs[2]} y2={ys[2]}/><line x1={B.x+85} y1={ys[1]} x2={B.x+85} y2={ys[2]}/><line x1={xs[3]+70} y1={ys[1]} x2={xs[3]+70} y2={ys[2]}/></g><Door x={xs[1]} y={B.y+115} side="west"/><Door x={xs[3]} y={B.y+115} side="east"/><Door x={B.x+85} y={ys[1]+55} side="east" out/><Door x={xs[2]} y={ys[1]+55} side="east"/><Door x={xs[3]} y={ys[2]+55} side="east"/><Window x={B.x+85} y={B.y}/><Window x={B.x+285} y={B.y}/><Window x={B.x+B.w} y={B.y+82} vertical/><Window x={B.x} y={B.y+82} vertical/><Window x={B.x+95} y={B.y+B.h}/><Balcony facing={input.facing}/><Dimensions input={input}/></SheetFrame>}

function DualBalconies({facing}:{facing:Facing}){
  const horizontal=facing==="North"||facing==="South";
  if(horizontal){
    const y=facing==="North"?B.y-17:B.y+B.h;
    return <g>
      <rect x={B.x+35} y={y} width="155" height="17" fill="#f8fafc" stroke={ink}/><text x={B.x+112} y={y+(facing==="North"?-4:29)} textAnchor="middle" fontSize="7">MASTER BALCONY</text>
      <rect x={B.x+265} y={y} width="210" height="17" fill="#f8fafc" stroke={ink}/><text x={B.x+370} y={y+(facing==="North"?-4:29)} textAnchor="middle" fontSize="7">LIVING BALCONY</text>
    </g>;
  }
  const x=facing==="West"?B.x-17:B.x+B.w;
  return <g>
    <rect x={x} y={B.y+35} width="17" height="135" fill="#f8fafc" stroke={ink}/><text x={x+(facing==="West"?-5:29)} y={B.y+102} transform={"rotate(-90 "+(x+(facing==="West"?-5:29))+" "+(B.y+102)+")"} textAnchor="middle" fontSize="7">LIVING BALCONY</text>
    <rect x={x} y={B.y+300} width="17" height="125" fill="#f8fafc" stroke={ink}/><text x={x+(facing==="West"?-5:29)} y={B.y+362} transform={"rotate(-90 "+(x+(facing==="West"?-5:29))+" "+(B.y+362)+")"} textAnchor="middle" fontSize="7">MASTER BALCONY</text>
  </g>;
}

function AllocationSummary({plan}:{plan:ReturnType<typeof allocations>}){
  return <div style={{marginTop:14,border:"1px solid #dbe2ea",borderRadius:9,overflow:"hidden"}}>
    <div style={{padding:"9px 11px",background:"#f1f5f9",fontSize:12,fontWeight:800}}>BUA Room Allocation — Available {Math.round(plan.bua)} sq.ft/floor • Circulation reserved 10%</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:1,background:"#e2e8f0"}}>
      {plan.first.items.map(r=><div key={r.id} style={{padding:8,background:"white",fontSize:10}}><b>{r.label}</b><br/>{Math.round(plan.first.rooms[r.id])} sq.ft <span style={{color:faint}}>({r.min}–{r.max})</span></div>)}
      <div style={{padding:8,background:"white",fontSize:10}}><b>Passage / circulation</b><br/>{Math.round(plan.first.circulation)} sq.ft <span style={{color:faint}}>(10% BUA)</span></div>
    </div>
  </div>;
}

function FirstFloor({input,allocation,level=1,number="03"}:{input:Inputs;allocation:Allocation;level?:number;number?:string}){
  const guest=input.bedrooms>=2,guestToilet=input.toilets>=2,common=input.toilets>input.bedrooms;
  const rooms:Room[]=[
    {id:"guest",label:guest?"GUEST / CHILD BEDROOM":"STUDY / FAMILY AREA",x:150,y:105,w:190,h:165,kind:guest?"bed":"lounge",sub:guest?areaText(allocation,"guest"):undefined},
    {id:"living",label:input.buildingType==="Rental Use"?"RENTAL UNIT LIVING":"LIVING ROOM",x:340,y:105,w:310,h:165,kind:"living",sub:areaText(allocation,"living")},
    {id:"pooja",label:input.poojaRoom?"POOJA • NE":"FOYER / READING NOOK",x:650,y:105,w:140,h:75,sub:input.poojaRoom?areaText(allocation,"pooja"):undefined},
    {id:"foyer",label:"ENTRY FOYER",x:650,y:180,w:140,h:90},
    {id:"master-wc",label:"MASTER TOILET",x:150,y:270,w:75,h:110,kind:"toilet",sub:areaText(allocation,"master-toilet")},
    {id:"guest-wc",label:guestToilet?"GUEST TOILET":"PASSAGE / LINEN",x:225,y:270,w:75,h:110,kind:guestToilet?"toilet":undefined,sub:guestToilet?areaText(allocation,"guest-toilet"):undefined},
    {id:"passage",label:"PASSAGE",x:300,y:270,w:40,h:110},
    {id:"dining",label:"DINING",x:340,y:270,w:190,h:110,kind:"dining",sub:areaText(allocation,"dining")},
    {id:"stair",label:input.staircaseType.toUpperCase()+" STAIR • S/W",x:530,y:270,w:120,h:290,kind:"stair",sub:areaText(allocation,"stair")},
    {id:"lift",label:input.lift?"LIFT":"STORE",x:650,y:270,w:70,h:110,kind:input.lift?"lift":undefined},
    {id:"common",label:common?"COMMON TOILET":input.storeRoom?"STORE ROOM":"LIFT LOBBY",x:720,y:270,w:70,h:110,kind:common?"toilet":undefined,sub:common?areaText(allocation,"common-toilet"):input.storeRoom?areaText(allocation,"store"):undefined},
    {id:"master",label:"MASTER BEDROOM • SW",x:150,y:380,w:190,h:180,kind:"bed",sub:areaText(allocation,"master")},
    {id:"utility",label:input.utility?"UTILITY":"MULTIPURPOSE / DRY AREA",x:340,y:380,w:190,h:180,kind:input.utility?"utility":undefined,sub:input.utility?areaText(allocation,"utility"):undefined},
    {id:"kitchen",label:input.pantry?"KITCHEN + PANTRY • SE":"KITCHEN • SE",x:650,y:380,w:140,h:180,kind:"kitchen",sub:areaText(allocation,"kitchen")}
  ];
  return <SheetFrame title={floorName(level)+" Residential Plan"} number={number} input={input}>
    <RoadAndGate input={input}/><rect x={B.x} y={B.y} width={B.w} height={B.h} fill="white" stroke={ink} strokeWidth="4"/>
    {rooms.map(r=><RoomLayer key={r.id} room={r} input={input}/>)}
    <g stroke={ink} strokeWidth="1.3">
      <line x1="340" y1="105" x2="340" y2="560"/><line x1="530" y1="270" x2="530" y2="560"/><line x1="650" y1="105" x2="650" y2="560"/>
      <line x1="720" y1="270" x2="720" y2="380"/><line x1="225" y1="270" x2="225" y2="380"/><line x1="300" y1="270" x2="300" y2="380"/>
      <line x1="150" y1="270" x2="790" y2="270"/><line x1="150" y1="380" x2="790" y2="380"/><line x1="650" y1="180" x2="790" y2="180"/>
    </g>
    {guest&&<Door x={340} y={215} side="east"/>}<Door x={650} y={225} side="west" size={30}/><Door x={680} y={180} side="south" size={20}/>
    <Door x={187} y={380} side="south" size={20}/>{guestToilet&&<Door x={262} y={270} side="north" size={20}/>}
    <Door x={435} y={270} side="north"/><Door x={530} y={330} side="west"/>{input.lift&&<Door x={650} y={325} side="west" size={20}/>}
    {common&&<Door x={755} y={270} side="north" size={20}/>}<Door x={320} y={380} side="north"/><Door x={435} y={380} side="north"/><Door x={650} y={465} side="west"/>
    <Window x={225} y={105}/><Window x={470} y={105}/><Window x={720} y={105}/><Window x={150} y={188} vertical/><Window x={150} y={470} vertical/><Window x={245} y={560}/><Window x={720} y={560}/><Window x={790} y={470} vertical/>
    <FacingEntry input={input}/>{input.balcony&&<DualBalconies facing={input.facing}/>}<Dimensions input={input}/>
    <g stroke={green} fill="none" strokeDasharray="5 4"><path d="M755,225 L650,225 L500,205 L435,325 L650,465"/><text x="478" y="250" fontSize="7" fill={green}>FOYER → LIVING → DINING → KITCHEN</text></g>
  </SheetFrame>;
}

function SecondFloor({input,allocation,level=2,number="04"}:{input:Inputs;allocation:Allocation;level?:number;number?:string}){
  const bed3=input.bedrooms>=3,bed4=input.bedrooms>=4,t3=input.toilets>=3,t4=input.toilets>=4;
  const rooms:Room[]=[
    {id:"b3",label:bed3?"BEDROOM 3 • NW/W":"OPEN TERRACE",x:150,y:105,w:190,h:165,kind:bed3?"bed":"terrace",sub:bed3?areaText(allocation,"bed3"):undefined},
    {id:"family",label:input.buildingType==="Rental Use"?"RENTAL UNIT LOUNGE":"FAMILY LOUNGE",x:340,y:105,w:310,h:165,kind:"living",sub:areaText(allocation,"family")},
    {id:"b4",label:bed4?"BEDROOM 4":"STUDY / TERRACE",x:650,y:105,w:140,h:165,kind:bed4?"bed":"terrace",sub:bed4?areaText(allocation,"bed4"):undefined},
    {id:"t3",label:t3?"BEDROOM 3 TOILET":"STORE",x:150,y:270,w:85,h:110,kind:t3?"toilet":undefined,sub:t3?areaText(allocation,"bed3-toilet"):undefined},
    {id:"pass",label:"PASSAGE",x:235,y:270,w:105,h:110},
    {id:"lounge",label:"LOUNGE EXTENSION",x:340,y:270,w:190,h:110,kind:"lounge"},
    {id:"stair2",label:input.staircaseType.toUpperCase()+" STAIR",x:530,y:270,w:120,h:290,kind:"stair",sub:areaText(allocation,"stair-2")},
    {id:"lift2",label:input.lift?"LIFT":"STORE",x:650,y:270,w:70,h:110,kind:input.lift?"lift":undefined},
    {id:"t4",label:t4?"BEDROOM 4 TOILET":input.storeRoom?"STORE ROOM":"LINEN / LOBBY",x:720,y:270,w:70,h:110,kind:t4?"toilet":undefined,sub:t4?areaText(allocation,"bed4-toilet"):input.storeRoom?areaText(allocation,"store"):undefined},
    {id:"terrace",label:input.clayTileRoom?"CLAY TILE COVERED ROOM":input.terraceRoom?"ENCLOSED TERRACE ROOM":"OPEN TERRACE / MULTIPURPOSE",x:150,y:380,w:380,h:180,kind:input.terraceRoom||input.clayTileRoom?"lounge":"terrace",sub:input.clayTileRoom?areaText(allocation,"clay-room"):input.terraceRoom?areaText(allocation,"terrace-room"):undefined},
    {id:"lobby2",label:"STAIR / LIFT LOBBY",x:650,y:380,w:140,h:180}
  ];
  return <SheetFrame title={floorName(level)+" Residential Plan"} number={number} input={input}>
    <RoadAndGate input={input}/><rect x={B.x} y={B.y} width={B.w} height={B.h} fill="white" stroke={ink} strokeWidth="4"/>{rooms.map(r=><RoomLayer key={r.id} room={r} input={input}/>)}
    <g stroke={ink} strokeWidth="1.3"><line x1="340" y1="105" x2="340" y2="560"/><line x1="530" y1="270" x2="530" y2="560"/><line x1="650" y1="105" x2="650" y2="560"/><line x1="720" y1="270" x2="720" y2="380"/><line x1="235" y1="270" x2="235" y2="380"/><line x1="150" y1="270" x2="790" y2="270"/><line x1="150" y1="380" x2="790" y2="380"/></g>
    {bed3&&<Door x={340} y={215} side="east"/>}{bed4&&<Door x={650} y={215} side="west"/>}{t3&&<Door x={192} y={270} side="north" size={20}/>}
    {t4&&<Door x={755} y={270} side="north" size={20}/>}<Door x={530} y={330} side="west"/>{input.lift&&<Door x={650} y={325} side="west" size={20}/>}<Door x={650} y={455} side="west"/>
    <Window x={230} y={105}/><Window x={480} y={105}/><Window x={720} y={105}/><Window x={150} y={188} vertical/><Window x={790} y={188} vertical/><Window x={245} y={560}/>
    <FacingEntry input={input}/>{input.balcony&&<Balcony facing={input.facing} label="FAMILY LOUNGE BALCONY"/>}<Dimensions input={input}/>
  </SheetFrame>;
}

function RoofTerracePlan({input,number}:{input:Inputs;number:string}){
  const both=input.terraceRoom&&input.clayTileRoom;
  const terraceBox:Box={x:150,y:105,w:both?190:300,h:165};
  const clayBox:Box={x:input.terraceRoom?340:150,y:105,w:both?190:300,h:165};
  return <SheetFrame title="Roof / Terrace Plan" number={number} input={input}>
    <RoadAndGate input={input}/>
    <rect x={B.x} y={B.y} width={B.w} height={B.h} fill="#fbfdfc" stroke={ink} strokeWidth="5"/>
    <rect x={B.x+9} y={B.y+9} width={B.w-18} height={B.h-18} fill="none" stroke={faint} strokeWidth="1.2"/>
    <text x={B.x+18} y={B.y+27} fontSize="8" fill={faint}>3′-6″ PARAPET WALL</text>
    {input.terraceRoom&&<g><rect {...terraceBox} fill="white" stroke={ink} strokeWidth="1.5"/><text x={terraceBox.x+terraceBox.w/2} y={terraceBox.y+terraceBox.h/2} textAnchor="middle" fontSize="10" fontWeight="800">TERRACE ROOM</text><Window x={terraceBox.x+terraceBox.w/2} y={terraceBox.y}/><Door x={terraceBox.x+terraceBox.w} y={terraceBox.y+terraceBox.h*.68} side="east"/></g>}
    {input.clayTileRoom&&<g><rect {...clayBox} fill="#fff7ed" stroke={ink} strokeWidth="1.5"/>{Array.from({length:7}).map((_,i)=><line key={i} x1={Math.min(clayBox.x+clayBox.w-10,clayBox.x+10+i*25)} y1={clayBox.y+8} x2={Math.min(clayBox.x+clayBox.w-10,clayBox.x+42+i*25)} y2={clayBox.y+clayBox.h-8} stroke="#c2410c" strokeWidth=".7"/>)}<rect x={clayBox.x+34} y={clayBox.y+clayBox.h/2-13} width={clayBox.w-68} height="26" fill="#fff7ed"/><text x={clayBox.x+clayBox.w/2} y={clayBox.y+clayBox.h/2+3} textAnchor="middle" fontSize="8" fontWeight="800">CLAY TILE COVERED ROOM</text><Door x={clayBox.x+clayBox.w} y={clayBox.y+clayBox.h*.68} side="east"/></g>}
    <g><rect x="530" y="310" width="120" height="180" fill="white" stroke={ink} strokeWidth="1.5"/><Stair x={530} y={310} w={120} h={180}/><text x="590" y="475" textAnchor="middle" fontSize="8" fontWeight="800">STAIR HEADROOM</text></g>
    <g><rect x="665" y="125" width="100" height="85" rx="8" fill="#e0f2fe" stroke={blue}/><ellipse cx="715" cy="125" rx="50" ry="10" fill="#eff6ff" stroke={blue}/><text x="715" y="171" textAnchor="middle" fontSize="8" fontWeight="800">O.H. TANK</text><text x="715" y="184" textAnchor="middle" fontSize="7">PLACEHOLDER</text></g>
    <text x="360" y="405" textAnchor="middle" fontSize="13" fontWeight="800" fill={faint}>OPEN TERRACE AREA</text>
    <path d="M180,430 H500 M480,420 l20,10 l-20,10" stroke={green} fill="none" strokeDasharray="6 5"/><text x="340" y="447" textAnchor="middle" fontSize="7" fill={green}>CLEAR ACCESS TO STAIR HEADROOM</text>
    <Dimensions input={input}/>
  </SheetFrame>;
}

export default function DrgDraftingEngineV3(){
  const router=useRouter();
  const [input,setInput]=useState<Inputs>({
    plotLength:40,plotWidth:30,facing:"East",floors:3,parking:"Full Parking",buildingType:"Own Use",staircaseType:"Internal",
    lift:true,bedrooms:4,toilets:3,poojaRoom:true,storeRoom:true,terraceRoom:false,clayTileRoom:false,
    pantry:false,utility:true,balcony:true,ugTank:true
  });
  const [generated,setGenerated]=useState<Inputs|null>(null);
  const normalize=(value:Inputs):Inputs=>({...value,plotLength:clamp(value.plotLength,30,120),plotWidth:clamp(value.plotWidth,20,90),floors:clamp(value.floors,1,6),bedrooms:clamp(value.bedrooms,1,4),toilets:clamp(value.toilets,1,4)});
  const safe=generated?normalize(generated):null;
  const plan=safe?allocations(safe):null,warnings:string[]=[];
  if(safe&&plan){
    if(!plan.first.fit||(safe.floors>=3&&!plan.second.fit))warnings.push("Your room requirement cannot fit in available built-up area. Reduce room sizes/rooms or increase plot size.");
    if(safe.toilets<safe.bedrooms)warnings.push("Attached toilet cannot be provided for all bedrooms. Master bedroom remains first priority.");
    if(safe.balcony&&!plan.first.fit)warnings.push("Requested living and master balconies cannot both be provided within the available area.");
    if(safe.balcony&&(safe.facing==="South"||safe.facing==="West"))warnings.push("Vaastu compromise: road-side balcony differs from the preferred East/North balcony orientation.");
    if(safe.bedrooms>=4)warnings.push("Vaastu compromise: Bedroom 4 uses the east-side bay; review the exact placement with the project architect.");
    if(safe.staircaseType==="External")warnings.push("External staircase selected: verify setback and fire-access clearance before approval.");
  }
  const update=<K extends keyof Inputs>(key:K,value:Inputs[K])=>setInput(v=>({...v,[key]:value}));
  const checks:{key:keyof Inputs;label:string}[]=[
    {key:"lift",label:"Lift"},{key:"poojaRoom",label:"Pooja Room"},{key:"storeRoom",label:"Store Room"},{key:"terraceRoom",label:"Terrace Room"},
    {key:"clayTileRoom",label:"Clay Tile Covered Room"},{key:"pantry",label:"Pantry"},{key:"utility",label:"Utility"},{key:"balcony",label:"Balcony"},{key:"ugTank",label:"UG Tank"}
  ];
  return <main style={styles.page}>
    <header style={styles.header}><button style={styles.back} onClick={()=>router.push("/")}>←</button><div><h1 style={{margin:0,fontSize:21}}>BuildMitra DRG Drafting Engine V3</h1><p style={{margin:"4px 0 0",fontSize:12,opacity:.88}}>BUA-standard room allocation • architect-style fixed drafting • Vaastu-aware planning</p></div></header>
    <section style={styles.controls}>
      <h2 style={{margin:"0 0 13px",fontSize:17}}>User Requirement Input</h2>
      <div style={styles.grid}>
        <Field label="Plot Length (ft)"><input aria-label="Plot Length" type="number" min="30" max="120" value={input.plotLength} onChange={e=>update("plotLength",Number(e.target.value))} style={styles.input}/></Field>
        <Field label="Plot Width (ft)"><input aria-label="Plot Width" type="number" min="20" max="90" value={input.plotWidth} onChange={e=>update("plotWidth",Number(e.target.value))} style={styles.input}/></Field>
        <Select label="Road Facing" value={input.facing} values={["East","West","North","South"]} onChange={v=>update("facing",v as Facing)}/>
        <Field label="Floors"><input aria-label="Floors" type="number" min="1" max="6" value={input.floors} onChange={e=>update("floors",Number(e.target.value))} style={styles.input}/></Field>
        <Select label="Parking Type" value={input.parking} values={["Full Parking","Half Parking","No Parking"]} onChange={v=>update("parking",v as Parking)}/>
        <Field label="Bedrooms"><input aria-label="Bedrooms" type="number" min="1" max="4" value={input.bedrooms} onChange={e=>update("bedrooms",Number(e.target.value))} style={styles.input}/></Field>
        <Field label="Toilets"><input aria-label="Toilets" type="number" min="1" max="4" value={input.toilets} onChange={e=>update("toilets",Number(e.target.value))} style={styles.input}/></Field>
        <Select label="Building Type" value={input.buildingType} values={["Own Use","Rental Use"]} onChange={v=>update("buildingType",v as BuildingType)}/>
        <Select label="Staircase Type" value={input.staircaseType} values={["Internal","External","Duplex"]} onChange={v=>update("staircaseType",v as StaircaseType)}/>
      </div>
      <div style={{...styles.checkRow,flexWrap:"wrap"}}>{checks.map(item=><label key={String(item.key)} style={{display:"flex",alignItems:"center",gap:5}}><input type="checkbox" checked={Boolean(input[item.key])} onChange={e=>update(item.key,e.target.checked as never)}/>{item.label}</label>)}</div>
      <button onClick={()=>setGenerated(normalize(input))} style={{marginTop:16,padding:"11px 24px",border:0,borderRadius:8,background:"#7f1d1d",color:"white",fontWeight:800,cursor:"pointer"}}>Generate DRG</button>
      <div style={styles.warning}>This is a conceptual architectural/structural drawing. Final approval drawing must be verified by licensed architect/structural engineer.</div>
      {!safe&&<div style={{marginTop:12,padding:12,border:"1px dashed #94a3b8",borderRadius:8,color:faint,fontSize:12}}>Enter your requirements and click Generate DRG to create the drawing set.</div>}
      {safe&&plan&&<><div style={styles.checkRow}><span>Generated BUA: {Math.round(plan.bua)} sq.ft/floor</span><span>{safe.buildingType} • {safe.staircaseType} staircase</span></div>{warnings.map((warning,i)=><div key={i} style={{...styles.warning,background:i===0&&!plan.first.fit?"#fef2f2":"#fff7ed",color:i===0&&!plan.first.fit?"#b91c1c":"#9a3412"}}>{warning}</div>)}<AllocationSummary plan={plan}/></>}
    </section>
    {safe&&plan&&<>
      <StructuralSheet input={safe}/><GroundParking input={safe}/>
      {Array.from({length:safe.floors},(_,index)=>index+1).map(level=>level===1?
        <FirstFloor key={level} input={safe} allocation={plan.first} level={level} number={String(level+2).padStart(2,"0")}/>:
        <SecondFloor key={level} input={safe} allocation={plan.second} level={level} number={String(level+2).padStart(2,"0")}/>
      )}
      {(safe.terraceRoom||safe.clayTileRoom)&&<RoofTerracePlan input={safe} number={String(safe.floors+3).padStart(2,"0")}/>}
    </>}
  </main>;
}
