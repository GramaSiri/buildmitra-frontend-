import React, { useState } from "react";
import { useRouter } from "next/router";

type Facing = "East" | "West" | "North" | "South";
type Parking = "Full Parking" | "Half Parking" | "No Parking";
type BuildingType = "Own Use" | "Rental Use" | "Multi-unit" | "Commercial mixed";
type StaircaseType = "Internal" | "External" | "Duplex";
type Inputs = {
  plotLength:number; plotWidth:number; facing:Facing; floors:number; parking:Parking;
  buildingType:BuildingType; staircaseType:StaircaseType; lift:boolean; bedrooms:number; toilets:number;
  floorHeight:number; kitchens:number; livingRooms:number; diningRooms:number; northDirection:Facing;
  vaastuPreference:boolean; setbackPercent:number; staircasePosition:string;
  poojaRoom:boolean; storeRoom:boolean; terraceRoom:boolean; clayTileRoom:boolean;
  pantry:boolean; utility:boolean; balcony:boolean; ugTank:boolean;
};
type Box = { x:number; y:number; w:number; h:number };
type Room = Box & { id:string; label:string; sub?:string; kind?:"bed"|"living"|"dining"|"kitchen"|"toilet"|"stair"|"lift"|"utility"|"lounge"|"terrace" };
type StandardRoom = { id:string; label:string; min:number; max:number };
type Allocation = { rooms:Record<string,number>; items:StandardRoom[]; circulation:number; required:number; available:number; fit:boolean };
type AreaSummary = { plotArea:number; setbackArea:number; footprintArea:number; totalBUA:number; usableFloorArea:number; unitCount:number };
type RoomScheduleRow = { floorNo:string; unitNo:string; roomName:string; length:number; width:number; area:number; doors:number; windows:number; ventilators:number; notes:string };
type StructuralScheduleRow = { columnId:string; gridPosition:string; columnSize:string; footingSize:string; beamSize:string; slabThickness:string; concreteGrade:string };
type RoomRect = { id:string; floor:number; unitNo:string; name:string; kind:Room["kind"]|"pooja"|"passage"|"balcony"|"foyer"|"core"; x:number; y:number; w:number; h:number; doors:{side:"north"|"south"|"east"|"west"; offset:number; out?:boolean}[]; windows:{side:"north"|"south"|"east"|"west"; offset:number; vent?:boolean}[]; notes:string };
type StructuralPoint = { id:string; gridPosition:string; x:number; y:number; core?:boolean };
type LayoutModel = { input:Inputs; areas:AreaSummary; footprint:{width:number;length:number}; floors:{level:number; name:string; rooms:RoomRect[]}[]; structural:{points:StructuralPoint[]; schedule:StructuralScheduleRow[]}; warnings:string[]; boq:any };

const ink="#202b33", faint="#94a3b8", blue="#155eaa", green="#166534", paper="#fffef9";
const B:Box={x:150,y:105,w:640,h:455};
const CW:Box={x:112,y:67,w:716,h:531};
const xs=[B.x,B.x+190,B.x+380,B.x+500,B.x+B.w];
const ys=[B.y,B.y+165,B.y+275,B.y+B.h];
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Number(n)||min));
const floorName=(level:number)=>level===0?"Ground Floor":level===1?"First Floor":level===2?"Second Floor":level===3?"Third Floor":level===4?"Fourth Floor":level===5?"Fifth Floor":level===6?"Sixth Floor":level+"th Floor";
const roomDim=(w:number,h:number,input:Inputs)=>`${(w/B.w*input.plotWidth*.88).toFixed(1)}′ × ${(h/B.h*input.plotLength*.88).toFixed(1)}′`;
const areaText=(allocation:Allocation,id:string)=>allocation.rooms[id]?`${Math.round(allocation.rooms[id])} sq.ft allocated`:undefined;
const isSharedBuilding=(input:Inputs)=>input.buildingType==="Rental Use"||input.buildingType==="Multi-unit"||input.buildingType==="Commercial mixed"||input.kitchens>1;
const getUnitCount=(input:Inputs)=>Math.max(1,Math.min(12,Math.round(input.kitchens||1)));
const minRequiredToilets=(input:Inputs)=>Math.max(1,Math.min(40,Math.round(input.bedrooms||1)+1));
const S={living:[120,300],dining:[80,160],kitchen:[80,140],master:[120,220],bed:[100,180],attached:[35,60],common:[30,50],pooja:[25,60],stair:[70,120],balcony:[35,100],utility:[30,80]} as const;
const std=(id:string,label:string,key:keyof typeof S):StandardRoom=>({id,label,min:S[key][0],max:S[key][1]});
function allocate(items:StandardRoom[],available:number):Allocation{const circulation=available*.10,minRooms=items.reduce((s,r)=>s+r.min,0),required=minRooms+circulation,capacity=items.reduce((s,r)=>s+r.max-r.min,0),extra=Math.max(0,Math.min(available-required,capacity)),rooms:Record<string,number>={};items.forEach(r=>rooms[r.id]=r.min+(capacity?extra*(r.max-r.min)/capacity:0));return{rooms,items,circulation,required,available,fit:required<=available}}
function allocations(input:Inputs){
  const area=calculateAreas(input),bua=area.usableFloorArea,unitCount=getUnitCount(input),shared=isSharedBuilding(input);
  const livingLabel=shared?`${unitCount} Independent Unit Living Spaces`:"Living";
  const kitchenLabel=unitCount>1?`${unitCount} Independent Kitchens`:input.pantry?"Kitchen + Pantry":"Kitchen";
  const first:StandardRoom[]=[std("living",livingLabel,"living"),std("dining",input.diningRooms>0?"Dining":"Dining / Family","dining"),std("kitchen",kitchenLabel,"kitchen"),std("master","Master Bedroom","master"),std("master-toilet","Master Attached Toilet","attached"),std("stair",input.staircaseType+" Staircase","stair")];
  if(input.poojaRoom)first.push(std("pooja","Pooja","pooja"));
  if(input.balcony){first.push(std("living-balcony","Living Balcony","balcony"),std("master-balcony","Master Balcony","balcony"));}
  if(input.utility)first.push(std("utility","Utility","utility"));
  if(input.pantry)first.push(std("pantry","Pantry","utility"));
  if(input.storeRoom)first.push(std("store","Store Room","utility"));
  if(input.bedrooms>=2)first.push(std("guest","Guest Bedroom","bed"));
  if(input.toilets>=2)first.push(std("guest-toilet","Guest Attached Toilet","attached"));
  if(input.toilets>input.bedrooms)first.push(std("common-toilet","Common Toilet","common"));
  const second:StandardRoom[]=[std("family",shared?"Typical Unit Lounge":"Family Lounge","living"),std("stair-2",input.staircaseType+" Staircase","stair")];
  if(input.balcony)second.push(std("balcony-2","Road-side Balcony","balcony"));
  if(input.terraceRoom)second.push(std("terrace-room","Terrace Room","bed"));
  if(input.clayTileRoom)second.push(std("clay-room","Clay Tile Covered Room","bed"));
  if(input.bedrooms>=3)second.push(std("bed3","Bedroom 3","bed"));
  if(input.bedrooms>=4)second.push(std("bed4","Bedroom 4","bed"));
  if(input.bedrooms>=5)second.push(std("bed5","Bedroom 5","bed"));
  if(input.toilets>=3)second.push(std("bed3-toilet","Bedroom 3 Toilet","attached"));
  if(input.toilets>=4)second.push(std("bed4-toilet","Bedroom 4 Toilet","attached"));
  if(input.toilets>=5)second.push(std("bed5-toilet","Bedroom 5 Toilet","attached"));
  return{bua,first:allocate(first,bua),second:allocate(second,bua)};
}

function calculateAreas(input:Inputs):AreaSummary{
  const plotArea=Math.max(0,input.plotLength*input.plotWidth);
  const setbackArea=plotArea*.10;
  const footprintArea=Math.max(0,plotArea-setbackArea);
  const floors=Math.max(1,Math.round(input.floors||1));
  return{plotArea,setbackArea,footprintArea,totalBUA:footprintArea*floors,usableFloorArea:footprintArea,unitCount:getUnitCount(input)};
}

function generateDrawingCode(){
  const now=new Date(),stamp=`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
  let sequence=1;
  if(typeof window!=="undefined"){
    sequence=Number(localStorage.getItem("buildmitraDrawingSequence")||"0")+1;
    localStorage.setItem("buildmitraDrawingSequence",String(sequence));
  }
  return`DRG-${stamp}-${String(sequence).padStart(6,"0")}`;
}

function getStructuralSpecs(input:Inputs){
  const floors=Math.max(1,input.floors),high=floors>=4,mid=floors>=2,veryHigh=floors>5;
  return{
    columnSize:veryHigh?"300 × 600 mm minimum — engineer design required":high?"300 × 600 mm":mid?"300 × 450 mm":"230 × 300 mm",
    beamSize:high?"300 × 600 mm":mid?"230 × 450 mm":"230 × 300 mm",
    slabThickness:high?"150 mm":mid?"125 mm":"120 mm",
    footingSize:high?"1800 × 1800 × 500 mm":mid?"1500 × 1500 × 450 mm":"1200 × 1200 × 300 mm",
    concreteGrade:high?"M30 preliminary":mid?"M25 preliminary":"M20 preliminary",
    steelThumbRule:high?"5.5–6.5 kg/sqft BUA":"3.5–4.5 kg/sqft BUA"
  };
}

function roomArea(r:RoomRect){return Math.round(r.w*r.h)}
function addDoor(room:RoomRect,side:"north"|"south"|"east"|"west",offset=.5,out=false){room.doors.push({side,offset,out});return room}
function addWindow(room:RoomRect,side:"north"|"south"|"east"|"west",offset=.5,vent=false){room.windows.push({side,offset,vent});return room}
function makeRoom(id:string,floor:number,unitNo:string,name:string,kind:RoomRect["kind"],x:number,y:number,w:number,h:number,notes:string):RoomRect{
  return{id,floor,unitNo,name,kind,x,y,w,h,doors:[],windows:[],notes};
}

function allocateRooms(input:Inputs,unitCount:number,usableArea:number){
  const compact=usableArea<700||unitCount>1;
  const perUnitArea=usableArea/unitCount;
  const bedroomsPerUnit=Math.max(1,Math.ceil(input.bedrooms/unitCount));
  const toiletsPerUnit=Math.max(1,Math.ceil(minRequiredToilets(input)/unitCount));
  const minFunctional=120+60+bedroomsPerUnit*100+toiletsPerUnit*30+(input.diningRooms?80:0)+(input.poojaRoom?25:0)+70;
  const scale=Math.min(1.35,Math.max(.78,(perUnitArea*.86)/Math.max(1,minFunctional)));
  const pick=(min:number,pref:number,max:number)=>Math.round(clamp(pref*scale,min,max));
  return{
    fit:perUnitArea*.86>=minFunctional,
    circulation:Math.round(clamp(usableArea*.10,usableArea*.08,usableArea*.15)),
    living:pick(120,compact?135:190,250),
    dining:input.diningRooms?pick(80,compact?90:120,160):0,
    kitchen:pick(60,compact?75:100,120),
    master:pick(140,compact?150:185,220),
    bedroom:pick(100,compact?110:135,160),
    attachedToilet:pick(30,compact?35:42,50),
    commonToilet:pick(25,compact?30:38,45),
    pooja:input.poojaRoom?pick(20,compact?24:35,50):0,
    balcony:input.balcony?pick(30,compact?36:55,80):0,
    bedroomsPerUnit,
    toiletsPerUnit
  };
}

function attachDoorsWindows(rooms:RoomRect[],input:Inputs,footprint:{width:number;length:number}){
  rooms.forEach(r=>{
    if(r.doors.length===0){
      if(r.kind==="toilet")addDoor(r,r.y<footprint.length/2?"south":"north",.5,true);
      else if(r.kind==="bed"||r.kind==="kitchen"||r.kind==="living"||r.kind==="dining"||r.kind==="pooja")addDoor(r,r.y<footprint.length/2?"south":"north",.5,false);
    }
    const touchesNorth=r.y<=.05,touchesSouth=r.y+r.h>=footprint.length-.05,touchesWest=r.x<=.05,touchesEast=r.x+r.w>=footprint.width-.05;
    if(r.kind==="toilet"&&(touchesWest||touchesEast||touchesNorth||touchesSouth)&&!r.windows.some(w=>w.vent))addWindow(r,touchesWest?"west":touchesEast?"east":touchesNorth?"north":"south",.5,true);
    if((r.kind==="bed"||r.kind==="living"||r.kind==="kitchen")&&!r.windows.length){
      if(touchesNorth)addWindow(r,"north");else if(touchesSouth)addWindow(r,"south");else if(touchesEast)addWindow(r,"east");else if(touchesWest)addWindow(r,"west");
    }
  });
  return rooms;
}

function createSingleUnitRectangles(input:Inputs,footprint:{width:number;length:number},level:number){
  const W=footprint.width,L=footprint.length,rooms:RoomRect[]=[];
  const clampFit=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
  const livingW=clampFit(W*.42,14,18),livingH=clampFit(L*.35,9.5,11);
  const bedW=clampFit(W*.31,10,12.5),bedH=clampFit(L*.40,10,12);
  const toiletW=clampFit(W*.13,4.5,5.5),toiletH=clampFit(L*.25,7,8);
  const kitchenW=clampFit(W*.26,8,10.5),kitchenH=clampFit(L*.34,9,11);
  const stairW=clampFit(W*.17,6,7.5),stairH=clampFit(L*.40,11,13);
  const coreX=Math.max(0,W-stairW),coreY=0;
  if(level===1){
    const balconyH=input.balcony?clampFit(L*.10,3,4.5):0;
    const bed2X=0,bed2Y=0,liveX=bedW,liveY=balconyH,passageY=Math.max(bedH,liveY+livingH),diningH=clampFit(L*.17,5,6.2);
    const diningX=bedW,diningW=Math.max(9,Math.min(12,coreX-bedW-kitchenW*.45));
    const kitchenX=Math.max(coreX-kitchenW,bedW+diningW),commonToiletY=passageY,kitchenY=Math.min(L-8,commonToiletY+toiletH);
    const masterY=Math.max(passageY+diningH,L-bedH),masterW=Math.max(12,Math.min(14,W*.36)),masterBalconyH=input.balcony?Math.min(3.5,Math.max(0,bedH-10)):0,masterBedH=bedH-masterBalconyH;
    const passageX=bedW+diningW,passageW=Math.max(3.5,Math.min(5,coreX-passageX));
    rooms.push(addDoor(addWindow(makeRoom(`f${level}-bed2`,level,"Unit 1","Bedroom 2","bed",bed2X,bed2Y,bedW,bedH,"NW/West bedroom with direct passage door"),"west"),"east",.55));
    rooms.push(addDoor(addWindow(makeRoom(`f${level}-living`,level,"Unit 1","Living","living",liveX,liveY,livingW,livingH,"Living preferred N/E/NE; main entry connects to foyer and passage"),"north"),input.facing==="East"?"east":input.facing==="West"?"west":input.facing==="South"?"south":"north",.45));
    if(input.balcony)rooms.push(addDoor(addWindow(makeRoom(`f${level}-balcony`,level,"Unit 1","Living Balcony","balcony",liveX,0,livingW,balconyH,"Balcony connected to living room"),"north"),"south",.5));
    if(input.poojaRoom){const poojaW=Math.max(3.5,Math.min(5,coreX-(liveX+livingW)));rooms.push(addDoor(addWindow(makeRoom(`f${level}-pooja`,level,"Unit 1","Pooja","pooja",coreX-poojaW,Math.max(balconyH,stairH*.68),poojaW,5,"NE preferred"),"north"),"west"));}
    rooms.push(addDoor(makeRoom(`f${level}-dining`,level,"Unit 1","Dining","dining",diningX,passageY,diningW,diningH,"Dining links living and kitchen"),"north"));
    rooms.push(addDoor(makeRoom(`f${level}-passage`,level,"Unit 1","Passage","passage",passageX,passageY,passageW,Math.max(8,L-passageY),"Compact access passage"),"north"));
    rooms.push(addDoor(addWindow(makeRoom(`f${level}-kitchen`,level,"Unit 1","Kitchen","kitchen",kitchenX,kitchenY,kitchenW,Math.max(8,Math.min(kitchenH,L-kitchenY)),"Kitchen SE/NW with ventilation"),"east"),"west",.42));
    rooms.push(addDoor(addWindow(makeRoom(`f${level}-master`,level,"Unit 1","Master Bedroom","bed",0,masterY,masterW,masterBedH,"SW master bedroom with attached toilet and balcony"),"south"),"east",.45));
    if(masterBalconyH)rooms.push(addDoor(addWindow(makeRoom(`f${level}-masterbalcony`,level,"Unit 1","Master Balcony","balcony",0,masterY+masterBedH,masterW,masterBalconyH,"Balcony attached to master bedroom"),"south"),"north",.5));
    rooms.push(addDoor(addWindow(makeRoom(`f${level}-masterwc`,level,"Unit 1","Attached Toilet","toilet",masterW,Math.min(L-toiletH,masterY+masterBedH-toiletH),toiletW,toiletH,"Attached toilet opens from master bedroom"),"south",.5,true),"west",.5,true));
    if(input.toilets>=2)rooms.push(addDoor(addWindow(makeRoom(`f${level}-commonwc`,level,"Unit 1","Common Toilet","toilet",passageX+passageW,commonToiletY,toiletW,toiletH,"Common toilet opens from passage/living"),"east",.5,true),"west",.5,true));
    rooms.push(addDoor(makeRoom(`f${level}-stair`,level,"Common","Auto Staircase","stair",coreX,coreY,stairW,input.lift?stairH*.68:stairH,"Stair auto-positioned S/W/SW"),"north"));
    if(input.lift)rooms.push(addDoor(makeRoom(`f${level}-lift`,level,"Common","Lift","lift",coreX,coreY+stairH*.68,Math.min(5.5,stairW),stairH*.32,"Lift connected to stair lobby"),"north"));
  }else{
    rooms.push(addDoor(addWindow(makeRoom(`f${level}-family`,level,"Unit 1","Family Lounge","living",bedW,0,W-bedW,Math.max(10,L*.38),"Upper floor family lounge"),"north"),"south"));
    rooms.push(addDoor(addWindow(makeRoom(`f${level}-bed${level+1}`,level,"Unit 1",`Bedroom ${level+1}`,"bed",0,0,bedW,Math.max(10,L*.42),"NW/West bedroom"),"west"),"east"));
    rooms.push(addDoor(makeRoom(`f${level}-passage`,level,"Unit 1","Passage","passage",bedW,Math.max(10,L*.38),W-bedW-stairW,Math.max(4,L*.18),"Common upper passage"),"north"));
    rooms.push(addDoor(addWindow(makeRoom(`f${level}-bed${level+2}`,level,"Unit 1",`Bedroom ${level+2}`,"bed",0,L-bedH,Math.max(12,W*.42),bedH,"South/West bedroom"),"south"),"north"));
    rooms.push(addDoor(addWindow(makeRoom(`f${level}-toilet`,level,"Unit 1","Toilet","toilet",Math.max(12,W*.42),L-toiletH,toiletW,toiletH,"Toilet opens from passage"),"south",.5,true),"north",.5,true));
    rooms.push(addDoor(makeRoom(`f${level}-stair`,level,"Common","Auto Staircase","stair",coreX,coreY,stairW,input.lift?stairH*.68:stairH,"Vertical core aligned floor-to-floor"),"north"));
    if(input.lift)rooms.push(addDoor(makeRoom(`f${level}-lift`,level,"Common","Lift","lift",coreX,coreY+stairH*.68,Math.min(5.5,stairW),stairH*.32,"Lift connected to stair lobby"),"north"));
  }
  return attachDoorsWindows(rooms,input,footprint);
}

function createMultiUnitRectangles(input:Inputs,footprint:{width:number;length:number},level:number){
  const unitCount=getUnitCount(input),W=footprint.width,L=footprint.length,rooms:RoomRect[]=[],corridorW=Math.max(3.5,Math.min(5,W*.11)),coreW=Math.max(6,Math.min(8,W*.18)),unitW=(W-coreW-corridorW)/Math.min(2,unitCount),unitRows=Math.ceil(unitCount/2),unitH=L/unitRows;
  rooms.push(addDoor(makeRoom(`f${level}-common-lobby`,level,"Common",`${unitCount} HOUSE COMMON LOBBY / PASSAGE`,"passage",W-coreW-corridorW,0,corridorW,L,"One kitchen = one independent house; every unit door opens from this common passage"),input.facing==="East"?"east":"north"));
  rooms.push(addDoor(makeRoom(`f${level}-common-stair`,level,"Common","Auto Staircase","stair",W-coreW,0,coreW,input.lift?L*.55:L*.78,"Common stair adjacent to lobby"),"west"));
  if(input.lift)rooms.push(addDoor(makeRoom(`f${level}-common-lift`,level,"Common","Lift","lift",W-coreW,L*.55,coreW,Math.min(6,L*.18),"Lift connected to common lobby"),"west"));
  rooms.push(addDoor(addWindow(makeRoom(`f${level}-general-wc`,level,"Common","General Toilet","toilet",W-coreW,Math.min(L*.74,L-7),coreW,Math.min(7,L*.18),"One general/common toilet provided apart from attached toilets"),"east",.5,true),"west",.5,true));
  Array.from({length:unitCount},(_,i)=>i).forEach(i=>{
    const col=i%2,row=Math.floor(i/2),ux=col*unitW,uy=row*unitH,u=`Unit ${i+1}`,prefix=`f${level}-u${i+1}`;
    const balconyH=input.balcony&&row===0?3.5:0,livingH=Math.max(9,unitH*.34-balconyH),serviceH=Math.max(7,unitH*.22),bedH=Math.max(10,unitH-balconyH-livingH-serviceH),kitchenW=Math.max(7,unitW*.54),toiletW=Math.max(4,unitW-kitchenW);
    if(balconyH)rooms.push(addDoor(addWindow(makeRoom(`${prefix}-balcony`,level,u,`${u} Balcony`,"balcony",ux,uy,unitW,balconyH,"Road-side balcony attached to living"),"north"),"south",.5));
    rooms.push(addDoor(addWindow(makeRoom(`${prefix}-living`,level,u,`${u} Living / Entry`,"living",ux,uy+balconyH,unitW,livingH,"Independent house entry from common lobby; living connects kitchen and bedroom"),col===0?"west":"north"),"east",.5));
    rooms.push(addDoor(addWindow(makeRoom(`${prefix}-kitchen`,level,u,`${u} Kitchen`,"kitchen",ux,uy+balconyH+livingH,kitchenW,serviceH,"Independent kitchen; SE/NW ventilation preferred"),col===0?"west":"north"),"east",.5));
    rooms.push(addDoor(addWindow(makeRoom(`${prefix}-toilet`,level,u,`${u} Attached Toilet`,"toilet",ux+kitchenW,uy+balconyH+livingH,toiletW,serviceH,"Attached toilet paired to unit bedroom; ventilated on external/shaft side"),col===0?"west":"east",.5,true),"south",.5,true));
    rooms.push(addDoor(addWindow(makeRoom(`${prefix}-bed`,level,u,`${u} Bedroom`,"bed",ux,uy+balconyH+livingH+serviceH,unitW,bedH,"Bedroom accessed from living/passage and paired with attached toilet"),col===0?"west":"south"),"north",.5));
  });
  return attachDoorsWindows(rooms,input,footprint);
}

function allocateUnits(input:Inputs,footprint:{width:number;length:number},level:number){return isSharedBuilding(input)?createMultiUnitRectangles(input,footprint,level):createSingleUnitRectangles(input,footprint,level)}
function createRoomRectangles(input:Inputs,footprint:{width:number;length:number}){return Array.from({length:Math.max(1,input.floors)},(_,i)=>({level:i+1,name:floorName(i+1),rooms:allocateUnits(input,footprint,i+1)}))}

function structuralBayCount(length:number){
  if(length<=20)return 1;
  let bays=Math.ceil(length/20);
  while(bays>1&&length/bays<10)bays--;
  return Math.max(1,bays);
}

function generateStructuralGrid(input:Inputs,footprint:{width:number;length:number},rooms:RoomRect[]){
  const specs=getStructuralSpecs(input),maxSpan=20,minSpan=10,baysX=structuralBayCount(footprint.width),baysY=structuralBayCount(footprint.length);
  const xs=Array.from({length:baysX+1},(_,i)=>Number((i*footprint.width/baysX).toFixed(2))),ys=Array.from({length:baysY+1},(_,i)=>Number((i*footprint.length/baysY).toFixed(2)));
  const points:StructuralPoint[]=[];
  xs.forEach((x,xi)=>ys.forEach((y,yi)=>{if(xi===0||yi===0||xi===xs.length-1||yi===ys.length-1)points.push({id:`C${String(points.length+1).padStart(2,"0")}`,gridPosition:`${String.fromCharCode(65+xi)}-${yi+1}`,x,y})}));
  rooms.filter(r=>r.kind==="stair"||r.kind==="lift").slice(0,2).forEach(r=>[[r.x,r.y],[r.x+r.w,r.y],[r.x,r.y+r.h],[r.x+r.w,r.y+r.h]].forEach(([x,y])=>{if(!points.some(p=>Math.abs(p.x-x)<1&&Math.abs(p.y-y)<1))points.push({id:`C${String(points.length+1).padStart(2,"0")}`,gridPosition:"CORE",x:Number(x.toFixed(2)),y:Number(y.toFixed(2)),core:true})}));
  const schedule=points.map(p=>({columnId:p.id,gridPosition:p.gridPosition,columnSize:specs.columnSize,footingSize:specs.footingSize,beamSize:specs.beamSize,slabThickness:specs.slabThickness,concreteGrade:specs.concreteGrade}));
  return{points,schedule,minSpan,maxSpan};
}

function generateRoomScheduleFromRects(model:LayoutModel):RoomScheduleRow[]{
  return model.floors.flatMap(f=>f.rooms.filter(r=>!["passage","core"].includes(String(r.kind))).map(r=>({floorNo:f.name,unitNo:r.unitNo,roomName:r.name,length:Number(r.h.toFixed(1)),width:Number(r.w.toFixed(1)),area:roomArea(r),doors:r.doors.length,windows:r.windows.filter(w=>!w.vent).length,ventilators:r.windows.filter(w=>w.vent).length,notes:r.notes})));
}

function generateBOQDataFromLayout(model:LayoutModel,roomSchedule:RoomScheduleRow[]){
  const externalWallLength=2*(model.footprint.width+model.footprint.length)*model.input.floors,internalWallLength=model.floors.reduce((s,f)=>s+f.rooms.length*10,0);
  return{drawingCode:"",footprintArea:Math.round(model.areas.footprintArea),totalBUA:Math.round(model.areas.totalBUA),wallLengths:{external:Math.round(externalWallLength),internal:Math.round(internalWallLength),total:Math.round(externalWallLength+internalWallLength)},doorsCount:roomSchedule.reduce((s,r)=>s+r.doors,0),windowsCount:roomSchedule.reduce((s,r)=>s+r.windows,0),ventilatorsCount:roomSchedule.reduce((s,r)=>s+r.ventilators,0),columnCount:model.structural.points.length,footingCount:model.structural.points.length,unitCount:model.areas.unitCount};
}

function createLayoutModel(input:Inputs):LayoutModel{
  const normalized={...input,setbackPercent:10,staircaseType:"Internal" as StaircaseType,staircasePosition:"Auto S/W/SW"};
  const areas=calculateAreas(normalized),linear=Math.sqrt(.9),footprint={width:normalized.plotWidth*linear,length:normalized.plotLength*linear},floors=createRoomRectangles(normalized,footprint),allRooms=floors.flatMap(f=>f.rooms),structural=generateStructuralGrid(normalized,footprint,allRooms);
  const warnings:string[]=[];const fit=allocateRooms(normalized,getUnitCount(normalized),areas.footprintArea);
  if(!fit.fit)warnings.push("Requested rooms exceed compact minimum planning area. Best-fit compact layout generated; reduce rooms/units or increase plot.");
  if(normalized.floors>5)warnings.push("More than 5 floors selected: licensed structural engineer review is mandatory.");
  if(normalized.toilets<normalized.bedrooms)warnings.push("Attached toilets cannot be provided for all bedrooms. Master bedroom is prioritized.");
  if(normalized.balcony&&areas.footprintArea<700)warnings.push("Balcony requested, but compact footprint may restrict balcony depth.");
  if(structural.points.length>12)warnings.push("Extra columns inserted around stair/lift core and long spans; final locations require structural review.");
  return{input:normalized,areas,footprint,floors,structural:{points:structural.points,schedule:structural.schedule},warnings,boq:{}};
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
  return <g fill="#153e75" fontSize="10" fontWeight="800" strokeWidth="1">
    <line x1={B.x} y1={top} x2={B.x+B.w} y2={top} stroke="#7f1d1d"/><line x1={B.x} y1={bottom} x2={B.x+B.w} y2={bottom} stroke="#7f1d1d"/>
    {segmentsX.map((v,i)=><React.Fragment key={`x${v}`}><line x1={B.x+B.w*v} y1={top-7} x2={B.x+B.w*v} y2={B.y} stroke={faint}/><line x1={B.x+B.w*v} y1={B.y+B.h} x2={B.x+B.w*v} y2={bottom+7} stroke={faint}/><Tick x={B.x+B.w*v} y={top}/><Tick x={B.x+B.w*v} y={bottom}/>{i<segmentsX.length-1&&<text x={B.x+B.w*(v+segmentsX[i+1])/2} y={top-5} textAnchor="middle" stroke="none">{((segmentsX[i+1]-v)*input.plotWidth).toFixed(1)}′</text>}</React.Fragment>)}
    <line x1={left} y1={B.y} x2={left} y2={B.y+B.h} stroke="#7f1d1d"/><line x1={right} y1={B.y} x2={right} y2={B.y+B.h} stroke="#7f1d1d"/>
    {segmentsY.map((v,i)=><React.Fragment key={`y${v}`}><line x1={left-7} y1={B.y+B.h*v} x2={B.x} y2={B.y+B.h*v} stroke={faint}/><line x1={B.x+B.w} y1={B.y+B.h*v} x2={right+7} y2={B.y+B.h*v} stroke={faint}/><Tick x={left} y={B.y+B.h*v} vertical/><Tick x={right} y={B.y+B.h*v} vertical/>{i<segmentsY.length-1&&<text x={left-6} y={B.y+B.h*(v+segmentsY[i+1])/2} transform={`rotate(-90 ${left-6} ${B.y+B.h*(v+segmentsY[i+1])/2})`} textAnchor="middle" stroke="none">{((segmentsY[i+1]-v)*input.plotLength).toFixed(1)}′</text>}</React.Fragment>)}
    <text x={B.x+B.w/2} y={input.facing==="North"?B.y-10:B.y-49} textAnchor="middle" fontSize="11" stroke="none">OVERALL {input.plotWidth}′-0″</text><text x={B.x-53} y={B.y+B.h/2} transform={`rotate(-90 ${B.x-53} ${B.y+B.h/2})`} textAnchor="middle" fontSize="11" stroke="none">OVERALL {input.plotLength}′-0″</text>
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

function Window({x,y,length=36,vertical=false}:{x:number;y:number;length?:number;vertical?:boolean}){const c="#0284c7";return vertical?<g><line x1={x} y1={y-length/2} x2={x} y2={y+length/2} stroke="white" strokeWidth="8"/><line x1={x-2} y1={y-length/2} x2={x-2} y2={y+length/2} stroke={c} strokeWidth="3"/><line x1={x+2} y1={y-length/2} x2={x+2} y2={y+length/2} stroke={c} strokeWidth="3"/><line x1={x-5} y1={y} x2={x+5} y2={y} stroke={c} strokeWidth="2"/></g>:<g><line x1={x-length/2} y1={y} x2={x+length/2} y2={y} stroke="white" strokeWidth="8"/><line x1={x-length/2} y1={y-2} x2={x+length/2} y2={y-2} stroke={c} strokeWidth="3"/><line x1={x-length/2} y1={y+2} x2={x+length/2} y2={y+2} stroke={c} strokeWidth="3"/><line x1={x} y1={y-5} x2={x} y2={y+5} stroke={c} strokeWidth="2"/></g>}
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

const sx=(x:number,model:LayoutModel)=>B.x+x*B.w/model.footprint.width;
const sy=(y:number,model:LayoutModel)=>B.y+y*B.h/model.footprint.length;
const sw=(w:number,model:LayoutModel)=>w*B.w/model.footprint.width;
const sh=(h:number,model:LayoutModel)=>h*B.h/model.footprint.length;
function rectSvg(r:RoomRect,model:LayoutModel):Box{return{x:sx(r.x,model),y:sy(r.y,model),w:sw(r.w,model),h:sh(r.h,model)}}
function fitLabel(text:string,maxChars:number){return text.length<=maxChars?text:text.slice(0,Math.max(6,maxChars-1))+"…"}
function ModelOpening({room,model}:{room:RoomRect;model:LayoutModel}){
  return <>{room.doors.map((d,i)=>{const rr=rectSvg(room,model),x=d.side==="east"?rr.x+rr.w:d.side==="west"?rr.x:rr.x+rr.w*d.offset,y=d.side==="north"?rr.y:d.side==="south"?rr.y+rr.h:rr.y+rr.h*d.offset;return <Door key={`d${i}`} x={x} y={y} side={d.side} size={22} out={d.out}/>})}{room.windows.map((w,i)=>{const rr=rectSvg(room,model),x=w.side==="east"?rr.x+rr.w:w.side==="west"?rr.x:rr.x+rr.w*w.offset,y=w.side==="north"?rr.y:w.side==="south"?rr.y+rr.h:rr.y+rr.h*w.offset;return <Window key={`w${i}`} x={x} y={y} length={w.vent?18:34} vertical={w.side==="east"||w.side==="west"}/>})}</>
}
function ModelRoomLayer({room,model}:{room:RoomRect;model:LayoutModel}){
  const r=rectSvg(room,model),fill=room.kind==="toilet"?"#f4fafb":room.kind==="balcony"?"#f8fafc":room.kind==="passage"?"#f1f5f9":"white";
  const maxChars=Math.max(8,Math.floor(r.w/6)),centerY=r.y+r.h/2,dim=`${room.w.toFixed(1)}′ × ${room.h.toFixed(1)}′`;
  return <g><rect {...r} fill={fill} stroke="#111827" strokeWidth="2.6" vectorEffect="non-scaling-stroke"/>
    {room.kind==="bed"&&r.w>46&&r.h>48&&<Bed x={r.x+r.w/2-30} y={r.y+14} w={60} h={Math.min(82,r.h-36)}/>}
    {room.kind==="living"&&r.w>90&&r.h>55&&<Sofa x={r.x+12} y={r.y+18}/>}
    {room.kind==="dining"&&r.w>70&&r.h>45&&<Dining x={r.x+r.w/2} y={r.y+r.h/2}/>}
    {room.kind==="kitchen"&&<Kitchen x={r.x} y={r.y} w={r.w} h={r.h}/>}
    {room.kind==="toilet"&&<Toilet x={r.x+3} y={r.y+4} w={r.w-6} h={r.h-8}/>}
    {room.kind==="stair"&&<Stair x={r.x} y={r.y} w={r.w} h={r.h}/>}
    {room.kind==="lift"&&<Lift x={r.x} y={r.y} w={r.w} h={r.h}/>}
    <rect x={r.x+r.w/2-Math.min(62,r.w*.46)} y={centerY-16} width={Math.min(124,r.w*.92)} height="30" rx="3" fill="rgba(255,255,255,.86)" stroke="#e2e8f0" strokeWidth=".7"/>
    <text x={r.x+r.w/2} y={centerY-4} textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#111827">{fitLabel(room.name,maxChars)}</text>
    <text x={r.x+r.w/2} y={centerY+9} textAnchor="middle" fontSize="7.6" fontWeight="900" fill="#7f1d1d">{dim}</text>
  </g>
}

function ModelRoomDimensionLines({model,floor}:{model:LayoutModel;floor:LayoutModel["floors"][number]}){
  return <g stroke="#475569" fill="none" fontSize="6.7" fontWeight="900">
    {floor.rooms.filter(r=>r.w>=4&&r.h>=4).map(room=>{
      const r=rectSvg(room,model),inside=r.w>58&&r.h>42;
      if(!inside)return null;
      const y=r.y+r.h-10,x=r.x+8,x2=r.x+r.w-8,midX=r.x+r.w/2;
      const vx=r.x+r.w-10,y1=r.y+8,y2=r.y+r.h-8,midY=r.y+r.h/2;
      return <g key={`dimline-${room.id}`}>
        <line x1={x} y1={y} x2={x2} y2={y} strokeDasharray="3 2"/>
        <line x1={x} y1={y-4} x2={x} y2={y+4}/><line x1={x2} y1={y-4} x2={x2} y2={y+4}/>
        <rect x={midX-22} y={y-9} width="44" height="10" fill={paper}/>
        <text x={midX} y={y-1.5} textAnchor="middle" fill="#334155">{room.w.toFixed(1)}′</text>
        <line x1={vx} y1={y1} x2={vx} y2={y2} strokeDasharray="3 2"/>
        <line x1={vx-4} y1={y1} x2={vx+4} y2={y1}/><line x1={vx-4} y1={y2} x2={vx+4} y2={y2}/>
        <rect x={vx-8} y={midY-18} width="16" height="36" fill={paper}/>
        <text x={vx+2} y={midY} transform={`rotate(-90 ${vx+2} ${midY})`} textAnchor="middle" fill="#334155">{room.h.toFixed(1)}′</text>
      </g>
    })}
  </g>
}

function ModelWallOverlay({model,floor}:{model:LayoutModel;floor:LayoutModel["floors"][number]}){
  return <g fill="none" pointerEvents="none">
    {floor.rooms.map(room=>{const r=rectSvg(room,model);return <rect key={`wall2-${room.id}`} x={r.x} y={r.y} width={r.w} height={r.h} stroke="#000000" strokeWidth="3.2" vectorEffect="non-scaling-stroke"/>})}
    <rect x={B.x} y={B.y} width={B.w} height={B.h} stroke="#000" strokeWidth="6" vectorEffect="non-scaling-stroke"/>
  </g>
}

function ModelFloorPlan({model,floor,number}:{model:LayoutModel;floor:LayoutModel["floors"][number];number:string}){
  const input=model.input;
  return <SheetFrame title={`${floor.name} Model-Synchronized Plan`} number={number} input={input}>
    <RoadAndGate input={input} compound/>
    <rect {...CW} fill="none" stroke={ink} strokeWidth="2.4"/><text x={CW.x+12} y={CW.y+18} fontSize="8" fontWeight="900">PLOT BOUNDARY {input.plotWidth}′ × {input.plotLength}′</text>
    <rect x={B.x} y={B.y} width={B.w} height={B.h} fill="#fff" stroke="#000000" strokeWidth="4"/><text x={B.x+10} y={B.y-8} fontSize="8" fontWeight="900" fill="#7f1d1d">BUILDING FOOTPRINT {model.footprint.width.toFixed(1)}′ × {model.footprint.length.toFixed(1)}′ = {Math.round(model.areas.footprintArea)} sft</text>
    <rect x={CW.x+22} y={CW.y+22} width={CW.w-44} height={CW.h-44} fill="none" stroke="#f59e0b" strokeDasharray="6 5"/><text x={CW.x+36} y={CW.y+42} fontSize="7" fill="#b45309">AUTO 10% SETBACK ZONE</text>
    {floor.rooms.map(r=><ModelRoomLayer key={r.id} room={r} model={model}/>)}
    <ModelWallOverlay model={model} floor={floor}/>
    {floor.rooms.map(r=><ModelOpening key={`op-${r.id}`} room={r} model={model}/>)}
    <ModelWallOverlay model={model} floor={floor}/>
    <ModelRoomDimensionLines model={model} floor={floor}/>
    {model.structural.points.map(p=><g key={p.id}><rect x={sx(p.x,model)-3} y={sy(p.y,model)-3} width="6" height="6" fill="#dc2626"/><text x={sx(p.x,model)+6} y={sy(p.y,model)-5} fontSize="5" fill="#7f1d1d" fontWeight="900">{p.id}</text></g>)}
    {input.balcony&&<text x={B.x+B.w/2} y={B.y+B.h+48} textAnchor="middle" fontSize="8" fontWeight="900" fill={green}>Balcony is part of room rectangle and connected through door marker — not floating outside plan</text>}
    <Dimensions input={input} segmentsX={[0,.25,.5,.75,1]} segmentsY={[0,.25,.5,.75,1]}/>
  </SheetFrame>
}

function ModelStructuralSheet({model}:{model:LayoutModel}){
  const input=model.input,specs=getStructuralSpecs(input),points=model.structural.points;
  return <SheetFrame title="Structural Grid / Footing Plan" number="01" input={input}>
    <RoadAndGate input={input} compound/><rect {...CW} fill="none" stroke={ink} strokeWidth="2"/>
    <rect x={B.x} y={B.y} width={B.w} height={B.h} fill="#fff" stroke="#000000" strokeWidth="4"/>
    {points.map(p=><g key={p.id}><line x1={sx(p.x,model)} y1={B.y-24} x2={sx(p.x,model)} y2={B.y+B.h+24} stroke={faint} strokeDasharray="5 5"/><line x1={B.x-24} y1={sy(p.y,model)} x2={B.x+B.w+24} y2={sy(p.y,model)} stroke={faint} strokeDasharray="5 5"/></g>)}
    {points.map(p=><g key={`c-${p.id}`}><rect x={sx(p.x,model)-11} y={sy(p.y,model)-11} width="22" height="22" fill="#fef3c7" stroke="#7f1d1d"/><rect x={sx(p.x,model)-3} y={sy(p.y,model)-3} width="6" height="6" fill="#dc2626"/><text x={sx(p.x,model)+13} y={sy(p.y,model)-13} fontSize="6" fontWeight="900">{p.id}</text></g>)}
    <g><rect x="150" y="575" width="690" height="82" fill="#f8fafc" stroke="#94a3b8"/><text x="165" y="594" fontSize="9" fontWeight="900" fill="#153e75">STRUCTURAL SCHEDULE MATCHES DRAWING: {points.length} columns / {points.length} footings • Span rule 10′ min / 20′ max</text><text x="165" y="613" fontSize="8">Column: {specs.columnSize} • Footing: {specs.footingSize} • Beam: {specs.beamSize} • Slab: {specs.slabThickness} • Concrete: {specs.concreteGrade}</text><text x="165" y="632" fontSize="8" fill={faint}>Columns align floor-to-floor. Stair/lift core corner columns are added where required. Final design must be verified by a licensed structural engineer.</text></g>
    <Dimensions input={input} segmentsX={[0,.5,1]} segmentsY={[0,.5,1]}/>
  </SheetFrame>
}

function ModernElevation({input,number}:{input:Inputs;number:string}){
  const floors=Math.max(1,input.floors),baseY=585,floorH=Math.min(95,Math.max(58,360/(floors+1))),buildingW=430,left=230,liftW=input.lift?76:0,totalH=floorH*(floors+1);
  return <SheetFrame title="Front Modern Elevation" number={number} input={input}>
    <RoadAndGate input={input}/>
    <g stroke={ink} fill="none">
      <line x1="150" y1={baseY} x2="845" y2={baseY} strokeWidth="3"/>
      <rect x={left} y={baseY-totalH} width={buildingW} height={totalH} fill="#f8fafc" strokeWidth="3"/>
      {input.lift&&<rect x={left+buildingW} y={baseY-totalH-30} width={liftW} height={totalH+30} fill="#eef2f7" strokeWidth="3"/>}
      {Array.from({length:floors+1}).map((_,i)=>{
        const y=baseY-i*floorH;
        return <g key={i}><line x1={left} y1={y} x2={left+buildingW+liftW} y2={y} strokeWidth="2"/>{i>0&&<text x={left-35} y={y+floorH/2} textAnchor="middle" fontSize="8" fontWeight="800">F{i}</text>}</g>
      })}
      <rect x={left+18} y={baseY-floorH*.78} width="110" height={floorH*.52} fill="#e5e7eb"/>
      <rect x={left+148} y={baseY-floorH*.78} width="110" height={floorH*.52} fill="#e5e7eb"/>
      <rect x={left+278} y={baseY-floorH*.78} width="110" height={floorH*.52} fill="#e5e7eb"/>
      {Array.from({length:floors}).map((_,i)=>{
        const y=baseY-(i+1)*floorH;
        return <g key={`fl${i}`}>
          <rect x={left+28} y={y+15} width="96" height={floorH*.42} fill="#dbeafe"/>
          <rect x={left+160} y={y+15} width="112" height={floorH*.42} fill="#dbeafe"/>
          <rect x={left+304} y={y+15} width="82" height={floorH*.42} fill="#dbeafe"/>
          <rect x={left+16} y={y+floorH*.66} width="395" height="12" fill="#d1d5db"/>
          <line x1={left+16} y1={y+floorH*.66} x2={left+411} y2={y+floorH*.66} strokeWidth="3"/>
          {input.lift&&<g><rect x={left+buildingW+16} y={y+10} width={liftW-32} height={floorH-18} fill="#dbeafe"/><path d={`M${left+buildingW+28},${y+floorH-14} l${liftW-56},-${floorH-25}`} strokeDasharray="5 4"/></g>}
        </g>
      })}
      <rect x={left+4} y={baseY+2} width={buildingW+liftW-8} height="32" fill="#e7e5e4"/>
      <rect x={left+30} y={baseY+8} width="120" height="24" fill="#f1f5f9"/>
      <rect x={left+buildingW+liftW-154} y={baseY+8} width="120" height="24" fill="#f1f5f9"/>
      <text x={left+buildingW/2} y={baseY+64} textAnchor="middle" fontSize="18" fontWeight="900">FRONT ({input.buildingType.toUpperCase()}) ELEVATION</text>
      <g fontSize="8" fontWeight="800" strokeWidth="1">
        <line x1={left+buildingW+liftW+35} y1={baseY} x2={left+buildingW+liftW+35} y2={baseY-totalH}/>
        <text x={left+buildingW+liftW+52} y={baseY-totalH/2} transform={`rotate(-90 ${left+buildingW+liftW+52} ${baseY-totalH/2})`} textAnchor="middle">TOTAL HEIGHT APPROX. {Math.round((floors+1)*10)}′</text>
        {Array.from({length:floors+1}).map((_,i)=><React.Fragment key={`dim${i}`}><line x1={left+buildingW+liftW+24} y1={baseY-i*floorH} x2={left+buildingW+liftW+46} y2={baseY-i*floorH}/>{i<floors+1&&<text x={left+buildingW+liftW+20} y={baseY-i*floorH-floorH/2+3} textAnchor="end">10′</text>}</React.Fragment>)}
      </g>
    </g>
    <text x="490" y="655" textAnchor="middle" fontSize="8" fill={faint}>Concept elevation generated from floor count, lift, balcony/opening rules and road-facing input.</text>
  </SheetFrame>
}

function MiniDoor({x,y,side="south",size=16}:{x:number;y:number;side?:"north"|"south"|"east"|"west";size?:number}){
  if(side==="north"||side==="south"){const dir=side==="north"?1:-1;return <g><line x1={x-size/2} y1={y} x2={x+size/2} y2={y} stroke="white" strokeWidth="5"/><path d={`M${x-size/2},${y} v${dir*size} M${x+size/2},${y} A${size},${size} 0 0 ${dir>0?0:1} ${x-size/2},${y+dir*size}`} stroke="#111827" fill="none" strokeWidth="1.2"/></g>}
  const dir=side==="west"?1:-1;return <g><line x1={x} y1={y-size/2} x2={x} y2={y+size/2} stroke="white" strokeWidth="5"/><path d={`M${x},${y+size/2} h${dir*size} M${x},${y-size/2} A${size},${size} 0 0 ${dir>0?1:0} ${x+dir*size},${y+size/2}`} stroke="#111827" fill="none" strokeWidth="1.2"/></g>
}

function MiniWindow({x,y,vertical=false}:{x:number;y:number;vertical?:boolean}){
  return vertical?<g stroke="#0284c7" strokeWidth="2"><line x1={x-2} y1={y-13} x2={x-2} y2={y+13}/><line x1={x+2} y1={y-13} x2={x+2} y2={y+13}/></g>:<g stroke="#0284c7" strokeWidth="2"><line x1={x-16} y1={y-2} x2={x+16} y2={y-2}/><line x1={x-16} y1={y+2} x2={x+16} y2={y+2}/></g>
}

function MiniFloorPlan({model,floor,x,y,w,h,title}:{model:LayoutModel;floor:LayoutModel["floors"][number];x:number;y:number;w:number;h:number;title:string}){
  const mx=(v:number)=>x+v*w/model.footprint.width,my=(v:number)=>y+v*h/model.footprint.length,mw=(v:number)=>v*w/model.footprint.width,mh=(v:number)=>v*h/model.footprint.length;
  return <g>
    <rect x={x} y={y} width={w} height={h} fill="#fffef9" stroke="#000" strokeWidth="4"/>
    {floor.rooms.map(room=>{const rx=mx(room.x),ry=my(room.y),rw=mw(room.w),rh=mh(room.h),fs=Math.max(7,Math.min(12,rw/8));return <g key={`mini-${room.id}`}>
      <rect x={rx} y={ry} width={rw} height={rh} fill={room.kind==="toilet"?"#f8fafc":room.kind==="balcony"?"#f1f5f9":"white"} stroke="#000000" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
      {room.kind==="bed"&&rw>42&&rh>36&&<g stroke="#94a3b8" fill="none"><rect x={rx+8} y={ry+8} width={rw*.45} height={rh*.48}/><line x1={rx+8} y1={ry+22} x2={rx+8+rw*.45} y2={ry+22}/></g>}
      {room.kind==="kitchen"&&<g stroke="#94a3b8" fill="none"><path d={`M${rx+7},${ry+7} H${rx+rw-7} V${ry+24} H${rx+24} V${ry+rh-7}`}/><circle cx={rx+rw-18} cy={ry+16} r="4"/></g>}
      {room.kind==="toilet"&&<g stroke="#94a3b8" fill="none"><ellipse cx={rx+rw*.30} cy={ry+rh*.45} rx="5" ry="8"/><rect x={rx+rw*.62} y={ry+rh*.25} width="12" height="7"/></g>}
      {room.kind==="stair"&&<g stroke="#94a3b8">{Array.from({length:8}).map((_,i)=><line key={i} x1={rx+5} y1={ry+7+i*(rh-14)/8} x2={rx+rw-5} y2={ry+7+i*(rh-14)/8}/>) }<text x={rx+rw/2} y={ry+rh-8} textAnchor="middle" fontSize="7">UP</text></g>}
      {room.kind==="lift"&&<rect x={rx+rw*.18} y={ry+rh*.18} width={rw*.64} height={rh*.64} fill="none" stroke="#111827"/>}
      {room.doors.map((d,i)=>{const dx=d.side==="east"?rx+rw:d.side==="west"?rx:rx+rw*d.offset,dy=d.side==="north"?ry:d.side==="south"?ry+rh:ry+rh*d.offset;return <MiniDoor key={i} x={dx} y={dy} side={d.side} size={Math.min(18,Math.max(10,Math.min(rw,rh)*.35))}/>})}
      {room.windows.map((win,i)=>{const wx=win.side==="east"?rx+rw:win.side==="west"?rx:rx+rw*win.offset,wy=win.side==="north"?ry:win.side==="south"?ry+rh:ry+rh*win.offset;return <MiniWindow key={i} x={wx} y={wy} vertical={win.side==="east"||win.side==="west"}/>})}
      <rect x={rx+rw/2-Math.min(48,rw*.45)} y={ry+rh/2-15} width={Math.min(96,rw*.9)} height="29" rx="2" fill="rgba(255,255,255,.9)" stroke="#e2e8f0" strokeWidth=".6"/>
      <text x={rx+rw/2} y={ry+rh/2-3} textAnchor="middle" fontSize={fs} fontWeight="900" fill="#111827">{fitLabel(room.name,Math.max(8,Math.floor(rw/6)))}</text>
      <text x={rx+rw/2} y={ry+rh/2+10} textAnchor="middle" fontSize={Math.max(7,fs-1.5)} fontWeight="900" fill="#7f1d1d">{room.w.toFixed(1)}′×{room.h.toFixed(1)}′</text>
      {rw>52&&rh>38&&<g stroke="#64748b" fill="none" fontSize="6" fontWeight="900">
        <line x1={rx+7} y1={ry+rh-8} x2={rx+rw-7} y2={ry+rh-8} strokeDasharray="2 2"/>
        <text x={rx+rw/2} y={ry+rh-11} textAnchor="middle" fill="#334155">{room.w.toFixed(1)}′</text>
        <line x1={rx+rw-8} y1={ry+7} x2={rx+rw-8} y2={ry+rh-7} strokeDasharray="2 2"/>
        <text x={rx+rw-13} y={ry+rh/2} transform={`rotate(-90 ${rx+rw-13} ${ry+rh/2})`} textAnchor="middle" fill="#334155">{room.h.toFixed(1)}′</text>
      </g>}
    </g>})}
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#000" strokeWidth="5" vectorEffect="non-scaling-stroke"/>
    {model.structural.points.map(p=><rect key={`mp-${p.id}`} x={mx(p.x)-2} y={my(p.y)-2} width="4" height="4" fill="#dc2626"/>)}
    <g stroke="#334155" fontSize="9" fontWeight="900">
      <line x1={x} y1={y-22} x2={x+w} y2={y-22}/><text x={x+w/2} y={y-27} textAnchor="middle">{model.input.plotWidth}′-0″</text>
      <line x1={x-22} y1={y} x2={x-22} y2={y+h}/><text x={x-30} y={y+h/2} transform={`rotate(-90 ${x-30} ${y+h/2})`} textAnchor="middle">{model.input.plotLength}′-0″</text>
    </g>
    <text x={x} y={y+h+32} fontSize="19" fontWeight="900">{title.toUpperCase()}</text>
    <line x1={x} y1={y+h+38} x2={x+Math.min(250,w*.7)} y2={y+h+38} stroke="#111827" strokeWidth="2"/>
  </g>
}

function MiniGroundPlan({input,x,y,w,h}:{input:Inputs;x:number;y:number;w:number;h:number}){
  const coreW=w*.24,coreX=x+w-coreW;
  return <g>
    <rect x={x} y={y} width={w} height={h} fill="#fffef9" stroke="#000" strokeWidth="4"/>
    <rect x={coreX} y={y} width={coreW} height={h} fill="none" stroke="#111827" strokeWidth="2.5"/>
    <rect x={x+10} y={y+18} width={w-coreW-20} height={h*.34} fill="none" stroke="#94a3b8" strokeDasharray="5 5"/>
    <rect x={x+10} y={y+h*.56} width={w-coreW-20} height={h*.30} fill="none" stroke="#94a3b8" strokeDasharray="5 5"/>
    {[0,1,2].map(i=><g key={i} transform={`translate(${x+30+i*(w-coreW-70)/3} ${y+35}) scale(.58)`}><Car x={0} y={0}/></g>)}
    <g transform={`translate(${x+40} ${y+h*.60}) scale(.62)`}><Car x={0} y={0}/></g>
    <Bike x={x+w*.58} y={y+h*.47}/><Bike x={x+w*.66} y={y+h*.72}/>
    <text x={x+(w-coreW)/2} y={y+h*.49} textAnchor="middle" fontSize="15" fontWeight="900">FULL PARKING AREA</text>
    <rect x={coreX+12} y={y+18} width={coreW-24} height={h*.24} fill="#f8fafc" stroke="#111827" strokeWidth="2.5"/><text x={coreX+coreW/2} y={y+50} textAnchor="middle" fontSize="9" fontWeight="900">TOILET 1</text><text x={coreX+coreW/2} y={y+64} textAnchor="middle" fontSize="8">4′×6′</text><MiniDoor x={coreX+12} y={y+80} side="west"/>
    <rect x={coreX+12} y={y+h*.32} width={coreW-24} height={h*.16} fill="#f8fafc" stroke="#111827" strokeWidth="2.5"/><text x={coreX+coreW/2} y={y+h*.41} textAnchor="middle" fontSize="9" fontWeight="900">LIFT</text>
    <rect x={coreX+12} y={y+h*.50} width={coreW-24} height={h*.28} fill="#fff" stroke="#111827" strokeWidth="2.5"/><Stair x={coreX+12} y={y+h*.50} w={coreW-24} h={h*.28}/><text x={coreX+coreW/2} y={y+h*.49} textAnchor="middle" fontSize="10" fontWeight="900">INTERNAL STAIRCASE</text>
    <rect x={coreX+12} y={y+h*.80} width={coreW-24} height={h*.16} fill="#e0f2fe" stroke="#0284c7" strokeWidth="2"/><text x={coreX+coreW/2} y={y+h*.88} textAnchor="middle" fontSize="9" fontWeight="900">UG TANK</text>
    <rect x={x+50} y={y+h+8} width={w-100} height="36" fill="#f8fafc" stroke="#111827" strokeWidth="2.5"/><text x={x+w/2} y={y+h+31} textAnchor="middle" fontSize="12" fontWeight="900">MAIN SLIDING GATE</text>
    <text x={x} y={y+h+74} fontSize="22" fontWeight="900">GROUND FLOOR PLAN</text>
    <NorthArrow x={x-40} y={y+h+58}/>
  </g>
}

function MiniElevation({input,x,y,w,h}:{input:Inputs;x:number;y:number;w:number;h:number}){
  const floors=Math.max(1,input.floors),floorH=h/(floors+1),liftW=input.lift?w*.17:0,bw=w-liftW;
  return <g stroke="#111827" fill="none">
    <line x1={x} y1={y+h} x2={x+w} y2={y+h} strokeWidth="3"/>
    <rect x={x} y={y} width={bw} height={h} fill="#f8fafc" strokeWidth="3"/>
    {input.lift&&<rect x={x+bw} y={y-25} width={liftW} height={h+25} fill="#eef2f7" strokeWidth="3"/>}
    {Array.from({length:floors+1}).map((_,i)=>{const yy=y+h-i*floorH;return <line key={i} x1={x} y1={yy} x2={x+w} y2={yy} strokeWidth="2"/>})}
    {Array.from({length:floors}).map((_,i)=>{const yy=y+h-(i+1)*floorH;return <g key={i}><rect x={x+25} y={yy+12} width={bw*.24} height={floorH*.45} fill="#dbeafe"/><rect x={x+bw*.38} y={yy+12} width={bw*.25} height={floorH*.45} fill="#dbeafe"/><rect x={x+bw*.72} y={yy+12} width={bw*.18} height={floorH*.45} fill="#dbeafe"/><rect x={x+14} y={yy+floorH*.68} width={bw-28} height="9" fill="#d1d5db"/></g>})}
    <rect x={x+5} y={y+h+4} width={w-10} height="28" fill="#e7e5e4"/>
    <text x={x+w/2} y={y+h+62} textAnchor="middle" fontSize="20" fontWeight="900">FRONT (MODERN) ELEVATION</text>
  </g>
}

function ArchitecturalPresentationSheet({model}:{model:LayoutModel}){
  const input=model.input,first=model.floors[0],second=model.floors[1]||model.floors[0];
  return <section style={styles.sheet}>
    <div style={styles.sheetHead}><h2 style={{margin:0,fontSize:17}}>Architectural Presentation Sheet</h2><span style={{fontSize:10,color:faint}}>Sample-like output • Generated from user inputs</span></div>
    <div style={styles.svgWrap}><svg viewBox="0 0 1720 930" width="100%" style={{minWidth:1180,display:"block"}} role="img" aria-label="Architectural Presentation Sheet">
      <rect width="1720" height="930" fill={paper}/><rect x="25" y="25" width="1670" height="880" fill="none" stroke="#111827" strokeWidth="2"/>
      {(input.parking==="Full Parking"||input.parking==="Half Parking")?<MiniGroundPlan input={input} x={90} y={110} w={500} h={650}/>:<MiniFloorPlan model={model} floor={first} x={90} y={110} w={500} h={650} title="Ground Floor Plan"/>}
      <MiniFloorPlan model={model} floor={first} x={720} y={110} w={400} h={460} title={input.parking==="No Parking"?"Ground Floor Plan":"First Floor Plan"}/>
      <MiniFloorPlan model={model} floor={second} x={1220} y={110} w={400} h={365} title="Second Floor Plan"/>
      <MiniElevation input={input} x={1190} y={590} w={440} h={220}/>
      <g fontSize="10" fontWeight="900" fill="#111827"><text x="90" y="86">30′-0″ / 40′-0″ style dimension chain</text><text x="720" y="86">ROOM DIMENSIONS AUTO FROM MODEL</text><text x="1220" y="86">UPPER FLOOR GENERATED BY FLOOR COUNT</text></g>
      <text x="850" y="888" textAnchor="middle" fontSize="10" fill={faint}>Conceptual BuildMitra DRG sheet. Final approval drawing must be verified by licensed architect/structural engineer.</text>
    </svg></div>
  </section>
}

function StructuralSheet({input}:{input:Inputs}){const G={x:210,y:120,w:560,h:400}, gx=[G.x,G.x+G.w/2,G.x+G.w], gy=[G.y,G.y+G.h/2,G.y+G.h], footing=input.floors>=4?"6′-0″ × 6′-0″":"5′-0″ × 5′-0″",column=input.floors>=4?"12″ × 18″":"9″ × 15″";return <SheetFrame title="Structural Grid / Footing Plan" number="01" input={input}><g>{gx.map((x,i)=><g key={x}><line x1={x} y1={G.y-40} x2={x} y2={G.y+G.h+40} stroke={faint} strokeDasharray="6 5"/><circle cx={x} cy={G.y-52} r="12" fill="white" stroke={ink}/><text x={x} y={G.y-48} textAnchor="middle" fontSize="10" fontWeight="800">{String.fromCharCode(65+i)}</text></g>)}{gy.map((y,i)=><g key={y}><line x1={G.x-40} y1={y} x2={G.x+G.w+40} y2={y} stroke={faint} strokeDasharray="6 5"/><circle cx={G.x-53} cy={y} r="12" fill="white" stroke={ink}/><text x={G.x-53} y={y+4} textAnchor="middle" fontSize="10" fontWeight="800">{i+1}</text></g>)}{gx.flatMap((x,i)=>gy.map((y,j)=><g key={`${i}-${j}`}><rect x={x-22} y={y-22} width="44" height="44" fill="none" stroke={ink} strokeWidth="1.5"/><rect x={x-7} y={y-10} width="14" height="20" fill={ink}/>{i===0&&j===0&&<text x={x+30} y={y-28} fontSize="8">F1 {footing}</text>}</g>))}<line x1={G.x} y1={G.y-25} x2={G.x+G.w/2} y2={G.y-25} stroke={ink}/><text x={G.x+G.w/4} y={G.y-31} textAnchor="middle" fontSize="9">A–B = {(input.plotWidth/2).toFixed(1)}′</text><line x1={G.x-26} y1={G.y} x2={G.x-26} y2={G.y+G.h/2} stroke={ink}/><text x={G.x-32} y={G.y+G.h/4} transform={`rotate(-90 ${G.x-32} ${G.y+G.h/4})`} textAnchor="middle" fontSize="9">1–2 = {(input.plotLength/2).toFixed(1)}′</text></g><g><rect x="165" y="585" width="650" height="70" fill="#f8fafc" stroke="#cbd5e1"/><text x="180" y="605" fontSize="9">FOOTING: {footing} • COLUMN: {column} • PLINTH/ROOF BEAM: 9″ × 15″ • SLAB: {input.floors>=4?"6″":"5″"}</text><text x="180" y="624" fontSize="8" fill={faint}>STEEL THUMB RULE — Footing mesh: 12 mm @ 6″ c/c; columns: 4–8 nos. 16 mm; ties: 8 mm @ 6″ c/c.</text><text x="180" y="642" fontSize="8" fill={faint}>Final footing, reinforcement and member sizes depend on soil report, spans and licensed structural engineer design.</text></g></SheetFrame>}

function StructuralSheetOptimized({input}:{input:Inputs}){
  const G={x:205,y:112,w:570,h:405},builtW=input.plotWidth*.88,builtL=input.plotLength*.88,intervalX=Math.max(2,Math.min(5,Math.ceil(builtW/15))),intervalY=Math.max(2,Math.min(5,Math.ceil(builtL/15))),nx=intervalX+1,ny=intervalY+1,gx=Array.from({length:nx},(_,i)=>G.x+i*G.w/intervalX),gy=Array.from({length:ny},(_,i)=>G.y+i*G.h/intervalY),spanXFt=builtW/intervalX,spanYFt=builtL/intervalY,spanX=Math.round(spanXFt*304.8/50)*50,spanY=Math.round(spanYFt*304.8/50)*50,maxSpanFt=Math.max(spanXFt,spanYFt),maxSpan=Math.max(spanX,spanY),minSpan=Math.min(spanX,spanY),special=maxSpanFt>20;
  const level=input.floors<=1?0:input.floors<=3?1:input.floors<=5?2:input.floors<=10?3:4,column=["230 × 300 mm","300 × 450 mm","300 × 600 mm","450 × 600 mm","600 × 600 mm min."][level],concrete=["M20","M25","M30","M35","M40+"][level],footing=["1200 × 1200 × 300 mm","1500 × 1500 × 450 mm","1800 × 1800 × 500 mm","2200 × 2200 × 600 mm","As per load design"][Math.min(4,level+(maxSpanFt>15?1:0))],beam=maxSpanFt<=10?"230 × 300 mm":maxSpanFt<=15?"230 × 450 mm":maxSpanFt<=20?"300 × 600 mm":"350 × 750 mm preliminary",slab=maxSpanFt<=12&&input.floors<=1?"125 mm":maxSpanFt<=15&&input.floors<=3?"150 mm":"175 mm",steelRate=input.floors<=1?3.5:input.floors<=3?4.5:input.floors<=5?5.5:6.5,estimatedSteel=Math.round(input.plotWidth*input.plotLength*.88*Math.max(1,input.floors)*steelRate);
  const perimeter:{x:number;y:number;tag:string;foot:string;core?:boolean}[]=[];gx.forEach((x,i)=>gy.forEach((y,j)=>{if(i===0||i===nx-1||j===0||j===ny-1){const corner=(i===0||i===nx-1)&&(j===0||j===ny-1);perimeter.push({x,y,tag:corner?"C1":"C2",foot:corner?"F1":"F2"})}}));
  const needCore=input.floors>=2||maxSpanFt>15,core=needCore?[{x:G.x+G.w/2-28,y:G.y+G.h/2-36,tag:"C3",foot:"F3",core:true},{x:G.x+G.w/2+28,y:G.y+G.h/2-36,tag:"C3",foot:"F3",core:true},{x:G.x+G.w/2-28,y:G.y+G.h/2+36,tag:"C3",foot:"F3",core:true},{x:G.x+G.w/2+28,y:G.y+G.h/2+36,tag:"C3",foot:"F3",core:true}]:[],columns=[...perimeter,...core],summaryY=552;
  return <SheetFrame title="Optimized Structural Grid / Footing Plan" number="01" input={input}><g>
    {gx.map((x,i)=><g key={`ogx${i}`}><line x1={x} y1={G.y-24} x2={x} y2={G.y+G.h+24} stroke="#94a3b8" strokeWidth=".8" strokeDasharray="3 6"/><circle cx={x} cy={G.y-38} r="11" fill="#dbeafe" stroke="#153e75" strokeWidth="1.4"/><text x={x} y={G.y-34} textAnchor="middle" fontSize="10" fontWeight="900" fill="#153e75">{String.fromCharCode(65+i)}</text>{i<nx-1&&<text x={(x+gx[i+1])/2} y={G.y-13} textAnchor="middle" fontSize="9" fontWeight="900" fill="#153e75">{spanX} mm</text>}</g>)}
    {gy.map((y,i)=><g key={`ogy${i}`}><line x1={G.x-24} y1={y} x2={G.x+G.w+24} y2={y} stroke="#94a3b8" strokeWidth=".8" strokeDasharray="3 6"/><circle cx={G.x-38} cy={y} r="11" fill="#dbeafe" stroke="#153e75" strokeWidth="1.4"/><text x={G.x-38} y={y+4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#153e75">{i+1}</text>{i<ny-1&&<text x={G.x-13} y={(y+gy[i+1])/2+3} transform={`rotate(-90 ${G.x-13} ${(y+gy[i+1])/2+3})`} textAnchor="middle" fontSize="9" fontWeight="900" fill="#153e75">{spanY} mm</text>}</g>)}
    <rect x={G.x} y={G.y} width={G.w} height={G.h} fill="none" stroke="#7f1d1d" strokeWidth="3"/><text x={G.x+15} y={G.y+14} fontSize="8" fontWeight="900" fill="#7f1d1d">B1 PERIMETER • {beam}</text>
    {needCore&&<g><rect x={G.x+G.w/2-28} y={G.y+G.h/2-36} width="56" height="72" fill="none" stroke="#7f1d1d" strokeWidth="2"/><line x1={G.x} y1={G.y+G.h/2} x2={G.x+G.w} y2={G.y+G.h/2} stroke="#7f1d1d" strokeWidth="1.8"/><line x1={G.x+G.w/2} y1={G.y} x2={G.x+G.w/2} y2={G.y+G.h} stroke="#7f1d1d" strokeWidth="1.8"/><text x={G.x+G.w/2+38} y={G.y+G.h/2-44} fontSize="8" fontWeight="900" fill="#7f1d1d">B2 CORE / TRANSFER • {beam}</text><text x={G.x+G.w/2+38} y={G.y+G.h/2-31} fontSize="7" fontWeight="900" fill="#153e75">B3 STAIR/LIFT TRIMMER • {beam}</text></g>}
    {columns.map((c,i)=><g key={`col${i}`}><rect x={c.x-(c.core?14:12)} y={c.y-(c.core?14:12)} width={c.core?28:24} height={c.core?28:24} fill="none" stroke="#7f1d1d" strokeWidth="1.3"/><rect x={c.x-6} y={c.y-8} width="12" height="16" fill="#153e75"/><text x={c.x} y={c.y+3} textAnchor="middle" fontSize="5" fontWeight="900" fill="white">{c.tag}</text><text x={c.x+14} y={c.y-15} fontSize="5.5" fontWeight="900" fill="#7f1d1d">{c.foot}</text></g>)}
    <g transform={`translate(${G.x+8} ${G.y+G.h-42})`}><rect width="238" height="34" fill="white" stroke="#94a3b8"/><text x="7" y="12" fontSize="7" fontWeight="900" fill="#153e75">C1/C2 {column} • F1/F2 {footing}</text><text x="7" y="25" fontSize="7" fontWeight="900" fill="#7f1d1d">C3/F3 — STAIR/LIFT CORE SUPPORTS ONLY</text></g>
  </g><g><rect x="145" y={summaryY} width="690" height="112" fill="#f8fafc" stroke="#94a3b8"/><text x="160" y={summaryY+18} fontSize="10" fontWeight="900" fill="#153e75">STRUCTURAL SUMMARY • MINIMUM-COLUMN RESIDENTIAL SCHEME</text><text x="160" y={summaryY+37} fontSize="8.5" fontWeight="800">Total Columns: {columns.length} • Maximum Span: {maxSpan} mm • Minimum Span: {minSpan} mm • Concrete: {concrete}</text><text x="160" y={summaryY+55} fontSize="8.5" fontWeight="800">Column: {column} • Footing: {footing} • Beam: {beam} • Slab: {slab}</text><text x="160" y={summaryY+73} fontSize="8.5" fontWeight="800">Estimated Steel: {estimatedSteel.toLocaleString("en-IN")} kg conceptual • Footings only below tagged columns</text><text x="160" y={summaryY+91} fontSize="7.5" fill="#475569">Corners → external junctions → major beams → stair/lift core. Beam/slab depth increased before internal columns.</text>{special&&<text x="160" y={summaryY+107} fontSize="8" fontWeight="900" fill="#b91c1c">SPECIAL STRUCTURAL SYSTEM REQUIRED: preliminary span exceeds 6000 mm.</text>}</g></SheetFrame>;
}

function StructuralSheetV2({input}:{input:Inputs}){
  const G={x:205,y:115,w:570,h:420},count=7,gx=Array.from({length:count},(_,i)=>G.x+i*G.w/(count-1)),gy=Array.from({length:count},(_,i)=>G.y+i*G.h/(count-1)),spanX=Math.round(input.plotWidth*304.8/(count-1)/50)*50,spanY=Math.round(input.plotLength*304.8/(count-1)/50)*50,high=input.floors>=4,mid=input.floors>=2,column=high?"300 × 600 mm":mid?"300 × 450 mm":"230 × 300 mm",footing=high?"1800 × 1800 × 500 mm":mid?"1500 × 1500 × 450 mm":"1200 × 1200 × 300 mm",beam=high?"300 × 600 mm":mid?"230 × 450 mm":"230 × 300 mm",slab=high?"150 mm":mid?"125 mm":"120 mm";
  return <SheetFrame title="Structural Grid / Footing Plan" number="01" input={input}><g>{gx.map((x,i)=><g key={`gx${i}`}><line x1={x} y1={G.y-28} x2={x} y2={G.y+G.h+25} stroke="#64748b" strokeDasharray="4 5"/><circle cx={x} cy={G.y-42} r="11" fill="#dbeafe" stroke={blue} strokeWidth="1.5"/><text x={x} y={G.y-38} textAnchor="middle" fontSize="10" fontWeight="900" fill="#153e75">{String.fromCharCode(65+i)}</text>{i<count-1&&<text x={(x+gx[i+1])/2} y={G.y-17} textAnchor="middle" fontSize="9" fontWeight="900" fill="#7f1d1d">{spanX} mm</text>}</g>)}{gy.map((y,i)=><g key={`gy${i}`}><line x1={G.x-28} y1={y} x2={G.x+G.w+25} y2={y} stroke="#64748b" strokeDasharray="4 5"/><circle cx={G.x-42} cy={y} r="11" fill="#dbeafe" stroke={blue} strokeWidth="1.5"/><text x={G.x-42} y={y+4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#153e75">{i+1}</text>{i<count-1&&<text x={G.x-16} y={(y+gy[i+1])/2+3} transform={`rotate(-90 ${G.x-16} ${(y+gy[i+1])/2+3})`} textAnchor="middle" fontSize="8" fontWeight="900" fill="#7f1d1d">{spanY} mm</text>}</g>)}{gx.flatMap((x,i)=>gy.map((y,j)=><g key={`f${i}-${j}`}><rect x={x-13} y={y-13} width="26" height="26" fill="#fef3c7" stroke="#7f1d1d" strokeWidth="1.2"/><rect x={x-5} y={y-7} width="10" height="14" fill="#153e75"/><text x={x} y={y+3} textAnchor="middle" fontSize="2.7" fontWeight="900" fill="white">{column}</text>{(i+j)%3===0&&<text x={x+15} y={y-16} fontSize="5.3" fontWeight="900" fill="#7f1d1d">F{high?3:mid?2:1} {footing}</text>}</g>))}</g><g><rect x="155" y="570" width="670" height="88" fill="#f8fafc" stroke="#94a3b8"/><text x="170" y="590" fontSize="9" fontWeight="900" fill="#153e75">STRUCTURAL BASIS: G+{input.floors} • GRID {spanX} × {spanY} mm • SOIL REPORT REQUIRED</text><text x="170" y="609" fontSize="9" fontWeight="900" fill="#7f1d1d">COLUMN {column} • FOOTING {footing} • BEAM {beam} • SLAB {slab}</text><text x="170" y="628" fontSize="8" fill="#475569">Steel thumb rule: footing 12 mm @ 150 mm c/c; columns 16–20 mm main bars; 8 mm ties @ 150 mm c/c.</text><text x="170" y="646" fontSize="8" fill="#475569">Concept sizing only. Final member sizes and reinforcement require licensed structural design and geotechnical verification.</text></g></SheetFrame>
}

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

function AdaptiveResidentialFloor({input,allocation,level,number}:{input:Inputs;allocation:Allocation;level:number;number:string}){
  const rental=isSharedBuilding(input),rooms:Room[]=[],rentalDoors:React.ReactNode[]=[];let rentalCannotFit=false,rentalAdjusted=false;
  if(rental){
    const builtW=input.plotWidth*.88,builtL=input.plotLength*.88,xPerFt=B.w/builtW,yPerFt=B.h/builtL,stairW=6*xPerFt,stairH=12*yPerFt,liftW=5*xPerFt,liftH=5*yPerFt,roadHorizontal=input.facing==="North"||input.facing==="South",small=input.plotWidth<=35&&input.plotLength<=45;
    rentalCannotFit=builtW<26||builtL<34;rentalAdjusted=small&&(input.bedrooms>2||input.toilets>1);
    if(roadHorizontal){
      const coreH=Math.min(B.h*.42,Math.max(stairH,7*yPerFt)),coreY=input.facing==="North"?B.y:B.y+B.h-coreH,unitY=input.facing==="North"?coreY+coreH:B.y,unitH=B.h-coreH,passageH=3.5*yPerFt,livingH=Math.min(unitH-passageH-10*yPerFt,9*yPerFt),serviceH=unitH-livingH-passageH,livingY=input.facing==="North"?unitY:unitY+serviceH+passageH,passageY=input.facing==="North"?unitY+livingH:unitY+serviceH,serviceY=input.facing==="North"?passageY+passageH:unitY,half=B.w/2,kitchenW=Math.max(7*xPerFt,B.w*.3),toiletW=Math.max(4*xPerFt,B.w-kitchenW-9*xPerFt),bed2W=B.w-kitchenW-toiletW;
      rooms.push({id:"rental-common-stair",label:input.staircaseType==="External"?"ROAD-SIDE EXTERNAL STAIR":"COMMON STAIR",sub:"Minimum 6′ × 12′",x:B.x,y:coreY,w:Math.min(stairW,B.w*.28),h:coreH,kind:"stair"},{id:"rental-common-lobby",label:"COMMON LOBBY",sub:"Passage width ≥ 3.5′",x:B.x+Math.min(stairW,B.w*.28),y:coreY,w:B.w-Math.min(stairW,B.w*.28)-(input.lift?Math.min(liftW,B.w*.22):0),h:coreH});
      if(input.lift)rooms.push({id:"rental-lift",label:"LIFT 5′×5′",x:B.x+B.w-Math.min(liftW,B.w*.22),y:coreY,w:Math.min(liftW,B.w*.22),h:Math.min(liftH,coreH),kind:"lift"});
      if(!rentalCannotFit){rooms.push({id:"rental-living",label:`INDEPENDENT ${rentalAdjusted?"FEASIBLE 2BHK":"RENTAL UNIT"} LIVING`,x:B.x,y:livingY,w:half,h:livingH,kind:"living"},{id:"rental-bed1",label:"BEDROOM 1 • MIN 9′×10′",x:B.x+half,y:livingY,w:half,h:livingH,kind:"bed"},{id:"rental-passage",label:"UNIT PASSAGE",sub:"Minimum width 3.5′",x:B.x,y:passageY,w:B.w,h:passageH},{id:"rental-bed2",label:input.bedrooms>=2?"BEDROOM 2 • MIN 9′×10′":"DINING / UTILITY",x:B.x,y:serviceY,w:bed2W,h:serviceH,kind:input.bedrooms>=2?"bed":"utility"},{id:"rental-kitchen",label:`KITCHEN 7′×8′${input.pantry?" + PANTRY":""}`,x:B.x+bed2W,y:serviceY,w:kitchenW,h:serviceH,kind:"kitchen"},{id:"rental-wc",label:"TOILET • MIN 4′×7′",x:B.x+bed2W+kitchenW,y:serviceY,w:toiletW,h:serviceH,kind:"toilet"});const unitDoorY=input.facing==="North"?unitY:unitY+unitH,roomBoundaryY=input.facing==="North"?passageY:passageY+passageH,serviceBoundaryY=input.facing==="North"?serviceY:serviceY+serviceH;rentalDoors.push(<Door key="unit-entry" x={B.x+half*.55} y={unitDoorY} side={input.facing==="North"?"north":"south"} size={28}/>,<Door key="living-pass" x={B.x+half*.4} y={roomBoundaryY} side={input.facing==="North"?"north":"south"}/>,<Door key="bed1" x={B.x+half*1.55} y={roomBoundaryY} side={input.facing==="North"?"north":"south"}/>,<Door key="bed2" x={B.x+bed2W*.65} y={serviceBoundaryY} side={input.facing==="North"?"north":"south"}/>,<Door key="kitchen" x={B.x+bed2W+kitchenW*.45} y={serviceBoundaryY} side={input.facing==="North"?"north":"south"}/>,<Door key="wc" x={B.x+bed2W+kitchenW+toiletW*.55} y={serviceBoundaryY} side={input.facing==="North"?"north":"south"} out/>);}
    }else{
      const coreW=Math.min(B.w*.3,Math.max(stairW,6*xPerFt)),coreX=input.facing==="West"?B.x:B.x+B.w-coreW,unitX=input.facing==="West"?coreX+coreW:B.x,unitW=B.w-coreW,passageH=3.5*yPerFt,topH=Math.min(10*yPerFt,B.h*.38),serviceY=B.y+topH+passageH,serviceH=B.h-topH-passageH,bedMin=9*xPerFt,kitchenMin=7*xPerFt,toiletMin=4*xPerFt,bed2W=Math.max(bedMin,unitW-kitchenMin-toiletMin),kitchenW=Math.max(kitchenMin,unitW-bed2W-toiletMin),toiletW=unitW-bed2W-kitchenW;
      rooms.push({id:"rental-common-stair",label:input.staircaseType==="External"?"ROAD-SIDE EXTERNAL STAIR":"COMMON STAIR",sub:"Minimum 6′ × 12′",x:coreX,y:B.y,w:coreW,h:Math.min(stairH,B.h*.42),kind:"stair"},{id:"rental-common-lobby",label:"COMMON LOBBY",sub:"Passage width ≥ 3.5′",x:coreX,y:B.y+Math.min(stairH,B.h*.42),w:coreW,h:B.h-Math.min(stairH,B.h*.42)-(input.lift?Math.min(liftH,B.h*.2):0)});
      if(input.lift)rooms.push({id:"rental-lift",label:"LIFT 5′×5′",x:coreX,y:B.y+B.h-Math.min(liftH,B.h*.2),w:Math.min(liftW,coreW),h:Math.min(liftH,B.h*.2),kind:"lift"});
      if(!rentalCannotFit){const livingX=input.facing==="East"?unitX+unitW/2:unitX,bed1X=input.facing==="East"?unitX:unitX+unitW/2;rooms.push({id:"rental-living",label:`INDEPENDENT ${rentalAdjusted?"FEASIBLE 2BHK":"RENTAL UNIT"} LIVING`,x:livingX,y:B.y,w:unitW/2,h:topH,kind:"living"},{id:"rental-bed1",label:"BEDROOM 1 • MIN 9′×10′",x:bed1X,y:B.y,w:unitW/2,h:topH,kind:"bed"},{id:"rental-passage",label:"UNIT PASSAGE",sub:"Minimum width 3.5′",x:unitX,y:B.y+topH,w:unitW,h:passageH},{id:"rental-bed2",label:input.bedrooms>=2?"BEDROOM 2 • MIN 9′×10′":"DINING / UTILITY",x:input.facing==="East"?unitX:unitX+kitchenW+toiletW,y:serviceY,w:bed2W,h:serviceH,kind:input.bedrooms>=2?"bed":"utility"},{id:"rental-kitchen",label:`KITCHEN 7′×8′${input.pantry?" + PANTRY":""}`,x:input.facing==="East"?unitX+bed2W:unitX,y:serviceY,w:kitchenW,h:serviceH,kind:"kitchen"},{id:"rental-wc",label:"TOILET • MIN 4′×7′",x:input.facing==="East"?unitX+bed2W+kitchenW:unitX+kitchenW,y:serviceY,w:toiletW,h:serviceH,kind:"toilet"});const boundaryX=input.facing==="East"?coreX:coreX+coreW,passageY=B.y+topH+passageH/2;rentalDoors.push(<Door key="unit-entry" x={boundaryX} y={passageY} side={input.facing==="East"?"east":"west"} size={28}/>,<Door key="living-pass" x={livingX+unitW*.25} y={B.y+topH} side="north"/>,<Door key="bed1" x={bed1X+unitW*.25} y={B.y+topH} side="north"/>,<Door key="bed2" x={input.facing==="East"?unitX+bed2W*.65:unitX+kitchenW+toiletW+bed2W*.35} y={serviceY} side="north"/>,<Door key="kitchen" x={(input.facing==="East"?unitX+bed2W:unitX)+kitchenW*.45} y={serviceY} side="north"/>,<Door key="wc" x={(input.facing==="East"?unitX+bed2W+kitchenW:unitX+kitchenW)+toiletW*.55} y={serviceY} side="north" out/>);}
    }
  }else{
    const topLiving:Record<Facing,Box>={East:{x:520,y:105,w:190,h:140},North:{x:310,y:105,w:320,h:140},West:{x:150,y:105,w:320,h:140},South:{x:310,y:365,w:320,h:195}},living=topLiving[input.facing],upper=level>1;
    rooms.push({id:"living-facing",label:`${upper?"FAMILY LOUNGE":"LIVING"} • ${input.facing.toUpperCase()}${input.facing==="East"?" / NE":input.facing==="West"?" / NW":input.facing==="South"?" / SE":" / NE"}`, ...living,kind:"living"});
    if(!upper){rooms.push({id:"master",label:"MASTER BEDROOM • SW",x:150,y:365,w:160,h:195,kind:"bed",sub:areaText(allocation,"master")},{id:"kitchen",label:`KITCHEN${input.pantry?" + PANTRY":""} • SE`,x:630,y:365,w:160,h:195,kind:"kitchen",sub:areaText(allocation,"kitchen")},{id:"dining",label:"DINING • CENTRAL",x:310,y:245,w:180,h:120,kind:"dining",sub:areaText(allocation,"dining")});if(input.bedrooms>=2)rooms.push({id:"bed2",label:"BEDROOM 2 • NW/W",x:input.facing==="West"?470:150,y:105,w:input.facing==="West"?240:160,h:140,kind:"bed",sub:areaText(allocation,"guest")});if(input.utility)rooms.push({id:"utility",label:`UTILITY${input.storeRoom?" + STORE":""} • S/SE`,x:310,y:input.facing==="South"?105:365,w:160,h:input.facing==="South"?140:195,kind:"utility",sub:areaText(allocation,"utility")});else if(input.storeRoom)rooms.push({id:"store",label:"STORE ROOM",x:310,y:input.facing==="South"?105:365,w:160,h:input.facing==="South"?140:195});}
    else {const nums=[3,4,5].filter(n=>input.bedrooms>=n),slots:Box[]=input.facing==="West"?[{x:150,y:365,w:160,h:195},{x:630,y:105,w:160,h:140},{x:310,y:365,w:160,h:195}]:input.facing==="South"?[{x:150,y:365,w:160,h:195},{x:150,y:105,w:160,h:140},{x:310,y:105,w:160,h:140}]:[{x:150,y:365,w:160,h:195},{x:150,y:105,w:160,h:140},{x:310,y:365,w:160,h:195}];nums.forEach((n,i)=>rooms.push({id:`bed${n}`,label:`BEDROOM ${n} • ${i===0?"SW/W":i===1?"NW":"SOUTH"}`,...slots[i],kind:"bed",sub:areaText(allocation,`bed${n}`)}));}
    if(input.poojaRoom&&!upper)rooms.push({id:"pooja",label:"POOJA • NE",x:710,y:105,w:80,h:70,sub:areaText(allocation,"pooja")});
    const toiletStart=upper?2:0,toiletCount=Math.max(0,Math.min(upper?3:2,input.toilets-toiletStart)),wcSlots:Box[]=input.facing==="West"?[{x:630,y:245,w:80,h:120},{x:710,y:245,w:80,h:120},{x:310,y:245,w:80,h:120}]:[{x:150,y:245,w:80,h:120},{x:230,y:245,w:80,h:120},{x:630,y:245,w:80,h:120}];Array.from({length:toiletCount},(_,i)=>rooms.push({id:`wc${level}-${i}`,label:i===0&&!upper?"MASTER WC":`TOILET ${toiletStart+i+1}`,...wcSlots[i],kind:"toilet"}));
    if(input.staircaseType!=="External")rooms.push({id:"core-stair",label:`${input.staircaseType.toUpperCase()} STAIR • S/W`,x:490,y:245,w:90,h:120,kind:"stair"});
    if(input.lift)rooms.push({id:"core-lift",label:"LIFT",x:580,y:245,w:50,h:120,kind:"lift"});
    const foyer:Record<Facing,Box|null>={East:{x:630,y:245,w:160,h:120},West:{x:150,y:245,w:160,h:120},North:{x:630,y:105,w:80,h:140},South:null};if(foyer[input.facing])rooms.push({id:"foyer",label:"ENTRY FOYER",...(foyer[input.facing] as Box)});
  }
  const external=input.staircaseType==="External", ext=input.facing==="East"?{x:805,y:260,w:90,h:220}:input.facing==="West"?{x:55,y:260,w:90,h:220}:input.facing==="North"?{x:445,y:20,w:120,h:80}:{x:445,y:575,w:120,h:90};
  const doorFor=(r:Room)=>{if(r.kind==="stair"||r.kind==="lift"||r.id.includes("living")||r.id==="foyer")return null;const cx=r.x+r.w/2,cy=r.y+r.h/2;if(Math.abs(cx-(B.x+B.w/2))>Math.abs(cy-(B.y+B.h/2)))return cx<B.x+B.w/2?<Door x={r.x+r.w} y={cy} side="east" size={Math.min(22,r.h*.3)} out={r.kind==="toilet"}/>:<Door x={r.x} y={cy} side="west" size={Math.min(22,r.h*.3)} out={r.kind==="toilet"}/>;return cy<B.y+B.h/2?<Door x={cx} y={r.y+r.h} side="south" size={Math.min(22,r.w*.3)} out={r.kind==="toilet"}/>:<Door x={cx} y={r.y} side="north" size={Math.min(22,r.w*.3)} out={r.kind==="toilet"}/>};
  return <SheetFrame title={`${floorName(level)} ${rental?"Rental Units":"Vaastu Residential Plan"}`} number={number} input={input}><RoadAndGate input={input}/><rect x={B.x} y={B.y} width={B.w} height={B.h} fill="white" stroke={ink} strokeWidth="4"/>{rooms.map(r=><RoomLayer key={r.id} room={r} input={input}/>) }<g fill="none" stroke={ink} strokeWidth="1.25">{rooms.map(r=><rect key={`wall-${r.id}`} x={r.x} y={r.y} width={r.w} height={r.h}/>)}</g>{rental?rentalDoors:rooms.map(r=><React.Fragment key={`door-${r.id}`}>{doorFor(r)}</React.Fragment>)}{rooms.filter(r=>r.y===B.y).map(r=><Window key={`wn-${r.id}`} x={r.x+r.w/2} y={B.y} length={Math.min(40,r.w*.45)}/>)}{rooms.filter(r=>r.y+r.h===B.y+B.h).map(r=><Window key={`ws-${r.id}`} x={r.x+r.w/2} y={B.y+B.h} length={Math.min(40,r.w*.45)}/>)}{rooms.filter(r=>r.x===B.x).map(r=><Window key={`ww-${r.id}`} x={B.x} y={r.y+r.h/2} length={Math.min(40,r.h*.45)} vertical/>)}{rooms.filter(r=>r.x+r.w===B.x+B.w).map(r=><Window key={`we-${r.id}`} x={B.x+B.w} y={r.y+r.h/2} length={Math.min(40,r.h*.45)} vertical/>)}<FacingEntry input={input}/>{external&&!rental&&<g><rect {...ext} fill="white" stroke={ink} strokeWidth="1.5"/><Stair {...ext}/><text x={ext.x+ext.w/2} y={ext.y+ext.h-8} textAnchor="middle" fontSize="7" fontWeight="900">EXTERNAL STAIR</text></g>}{rentalCannotFit&&<g><rect x="260" y="290" width="460" height="80" rx="8" fill="#fef2f2" stroke="#b91c1c" strokeWidth="2"/><text x="490" y="322" textAnchor="middle" fontSize="11" fontWeight="900" fill="#b91c1c">REQUESTED RENTAL CONFIGURATION CANNOT FIT</text><text x="490" y="344" textAnchor="middle" fontSize="8" fill="#7f1d1d">Reduce bedrooms/toilets or increase plot size.</text></g>}{rentalAdjusted&&<text x="470" y="580" textAnchor="middle" fontSize="8" fontWeight="900" fill="#b45309">REQUEST EXCEEDS SMALL-PLOT CAPACITY • FEASIBLE 2BHK ALTERNATIVE SHOWN</text>}{input.balcony&&<Balcony facing={input.facing} label={rental?"UNIT BALCONY":"LIVING / MASTER BALCONY"}/>}<Dimensions input={input}/>{rental?<g><path d={input.facing==="East"?"M790,330 H705 V205 H610":input.facing==="West"?"M150,330 H235 V205 H330":input.facing==="North"?"M550,105 V190 H330 V285":input.facing==="South"?"M550,560 V475 H330 V380":""} stroke={green} strokeWidth="2" strokeDasharray="5 4" fill="none"/><text x="395" y="95" textAnchor="middle" fontSize="7" fontWeight="900" fill={green}>ROAD → COMMON ENTRY → STAIR/LIFT LOBBY → UNIT DOOR</text></g>:<><path d={input.facing==="East"?"M780,330 H670 L610,305 L490,305":input.facing==="West"?"M160,330 H280 L390,305 L490,305":input.facing==="North"?"M550,115 V190 L470,305":input.facing==="South"?"M550,550 V460 L470,420":""} stroke={green} strokeDasharray="5 4" fill="none"/><text x="390" y="335" fontSize="7" fontWeight="800" fill={green}>ENTRY → FOYER / LIVING → DINING → KITCHEN</text></>}</SheetFrame>;
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
    <g><rect x="180" y="315" width="190" height="95" fill="#eff6ff" stroke={blue}/>{Array.from({length:4}).map((_,i)=><rect key={i} x={190+i*43} y="327" width="36" height="65" fill="#bfdbfe" stroke={blue}/>) }<text x="275" y="425" textAnchor="middle" fontSize="8" fontWeight="900" fill={blue}>SOLAR PANEL AREA</text></g>
    {input.lift&&<g><rect x="665" y="235" width="100" height="75" fill="white" stroke={ink}/><text x="715" y="270" textAnchor="middle" fontSize="8" fontWeight="900">LIFT MACHINE</text><text x="715" y="283" textAnchor="middle" fontSize="7">ROOM</text></g>}
    {input.utility&&<g><rect x="390" y="315" width="105" height="95" fill="#f0fdf4" stroke={green}/><text x="442" y="360" textAnchor="middle" fontSize="8" fontWeight="900">TERRACE</text><text x="442" y="374" textAnchor="middle" fontSize="8" fontWeight="900">UTILITY</text></g>}
    <text x="360" y="405" textAnchor="middle" fontSize="13" fontWeight="800" fill={faint}>OPEN TERRACE AREA</text>
    <path d="M180,430 H500 M480,420 l20,10 l-20,10" stroke={green} fill="none" strokeDasharray="6 5"/><text x="340" y="447" textAnchor="middle" fontSize="7" fill={green}>CLEAR ACCESS TO STAIR HEADROOM</text>
    <Dimensions input={input}/>
  </SheetFrame>;
}

export default function DrgDraftingEngineV3(){
  const router=useRouter();
  const [input,setInput]=useState<Inputs>({
    plotLength:40,plotWidth:30,facing:"East",floors:3,parking:"Full Parking",buildingType:"Own Use",staircaseType:"Internal",
    floorHeight:10,kitchens:1,livingRooms:1,diningRooms:1,northDirection:"North",vaastuPreference:true,setbackPercent:10,staircasePosition:"South / West preferred",
    lift:true,bedrooms:4,toilets:3,poojaRoom:true,storeRoom:true,terraceRoom:false,clayTileRoom:false,
    pantry:false,utility:true,balcony:true,ugTank:true
  });
  const [generated,setGenerated]=useState<Inputs|null>(null);
  const [drawingCode,setDrawingCode]=useState("");
  const [paymentModal,setPaymentModal]=useState(false);
  const [exportPaid,setExportPaid]=useState(false);
  const [outputTab,setOutputTab]=useState<"architectural"|"structural"|"rooms"|"structureSchedule"|"boq">("architectural");
  const normalize=(value:Inputs):Inputs=>{
    const base={...value,plotLength:clamp(value.plotLength,20,150),plotWidth:clamp(value.plotWidth,15,120),floors:clamp(value.floors,1,12),bedrooms:clamp(value.bedrooms,1,30),kitchens:clamp(value.kitchens,1,12),livingRooms:clamp(value.livingRooms,1,12),diningRooms:clamp(value.diningRooms,0,12),floorHeight:10,setbackPercent:10,staircaseType:"Internal" as StaircaseType,staircasePosition:"Auto S/W/SW",balcony:true};
    return{...base,toilets:Math.max(clamp(value.toilets,1,40),minRequiredToilets(base))};
  };
  const safe=generated?normalize(generated):null;
  const model=safe?createLayoutModel(safe):null;
  const plan=safe?allocations(safe):null,warnings:string[]=[...(model?.warnings||[])];
  const areas=safe?calculateAreas(safe):calculateAreas(normalize(input));
  const roomSchedule=model?generateRoomScheduleFromRects(model):[];
  const structuralSchedule=model?model.structural.schedule:[];
  const structuralSpecs=safe?getStructuralSpecs(safe):getStructuralSpecs(normalize(input));
  const drawingQuantities=model?generateBOQDataFromLayout(model,roomSchedule):null;
  if(safe&&plan){
    const rentalBuiltW=safe.plotWidth*.88,rentalBuiltL=safe.plotLength*.88,rentalSmall=safe.plotWidth<=35&&safe.plotLength<=45;
    if(safe.toilets>=minRequiredToilets(safe))warnings.push(`Bathroom rule applied: ${safe.bedrooms} bedroom(s) get attached toilet priority plus 1 general toilet. Effective toilets planned: ${safe.toilets}.`);
    if(safe.kitchens>1)warnings.push(`Multi-house rule applied: ${safe.kitchens} kitchens generate ${safe.kitchens} independent house/unit layouts with common lobby/stair/lift access.`);
    if(isSharedBuilding(safe)&&(rentalBuiltW<26||rentalBuiltL<34||rentalSmall&&(safe.bedrooms>2||safe.toilets>1)))warnings.push("Requested multi-unit / rental configuration cannot fit in this plot. Reduce bedrooms/toilets/units or increase plot size.");
    if(!plan.first.fit||(safe.floors>=2&&!plan.second.fit))warnings.push("Your room requirement cannot fit in available built-up area. Reduce room sizes/rooms or increase plot size.");
    if(calculateAreas(safe).plotArea===0)warnings.push("Plot dimensions must be greater than zero.");
    if(safe.floors>5)warnings.push("More than 5 floors selected: licensed structural engineer review is mandatory.");
    if(getUnitCount(safe)>1&&safe.kitchens>safe.floors*4)warnings.push("Too many kitchens/units for the selected floors. Common access and ventilation need detailed approval planning.");
    if(safe.toilets<safe.bedrooms)warnings.push("Attached toilet cannot be provided for all bedrooms. Master bedroom remains first priority.");
    if(safe.balcony&&!plan.first.fit)warnings.push("Requested living and master balconies cannot both be provided within the available area.");
    if(safe.balcony&&(safe.facing==="South"||safe.facing==="West"))warnings.push("Vaastu compromise: road-side balcony differs from the preferred East/North balcony orientation.");
    if(!safe.vaastuPreference)warnings.push("Vaastu preference is off. Drawing still follows ventilation/access rules, but quadrant placement is advisory only.");
    if(safe.buildingType==="Own Use"&&safe.bedrooms>=4)warnings.push("Vaastu compromise: Bedroom 4 uses the east-side bay; review the exact placement with the project architect.");
    if(safe.staircaseType==="External")warnings.push("External staircase selected: verify setback and fire-access clearance before approval.");
  }
  const update=<K extends keyof Inputs>(key:K,value:Inputs[K])=>setInput(v=>({...v,[key]:value}));
  const saveDrawing=(code:string,normalized:Inputs)=>{
    if(typeof window==="undefined")return;
    const layout=createLayoutModel(normalized),rooms=generateRoomScheduleFromRects(layout),structure=layout.structural.schedule,quantities=generateBOQDataFromLayout(layout,rooms);
    const record={drawingCode:code,createdAt:new Date().toISOString(),inputs:layout.input,areas:layout.areas,footprint:layout.footprint,floors:layout.floors,roomSchedule:rooms,structuralSchedule:structure,structuralSummary:getStructuralSpecs(normalized),quantities:{...quantities,drawingCode:code},paymentUnlocked:localStorage.getItem(`buildmitraDrawingPaid:${code}`)==="true"};
    const existing=JSON.parse(localStorage.getItem("buildmitraDrawings")||"[]");
    localStorage.setItem("buildmitraDrawings",JSON.stringify([record,...existing.filter((d:any)=>d?.drawingCode!==code)].slice(0,50)));
    localStorage.setItem("buildmitraLastDrawing",JSON.stringify(record));
  };
  const generate=()=>{
    const normalized=normalize(input),code=generateDrawingCode();
    setGenerated(normalized);setDrawingCode(code);setExportPaid(typeof window!=="undefined"&&(localStorage.getItem("buildmitraDrgExportPaid")==="true"||localStorage.getItem(`buildmitraDrawingPaid:${code}`)==="true"));
    setOutputTab("architectural");
    saveDrawing(code,normalized);
  };
  const requirePaid=(action:"PDF"|"Image"|"Excel"|"DXF"|"WhatsApp")=>{
    if(!drawingCode)return alert("Generate a drawing first.");
    if(!exportPaid){setPaymentModal(true);return;}
    if(action==="WhatsApp"){
      const text=encodeURIComponent(`BuildMitra DRG ${drawingCode}%0APlot: ${safe?.plotWidth}′ × ${safe?.plotLength}′%0ATotal BUA: ${Math.round(model?.areas.totalBUA||0)} sq.ft%0ABOQ Reference Code: ${drawingCode}`);
      if(typeof window!=="undefined")window.open(`https://wa.me/?text=${text}`,"_blank");
      return;
    }
    alert(`${action} export is unlocked for ${drawingCode}. Use this BOQ Reference Code to generate the respective BOQ.`);
  };
  const markPaid=()=>{
    if(typeof window!=="undefined"){localStorage.setItem("buildmitraDrgExportPaid","true");if(drawingCode)localStorage.setItem(`buildmitraDrawingPaid:${drawingCode}`,"true");}
    setExportPaid(true);setPaymentModal(false);
  };
  const goToBOQ=()=>{
    if(!safe||!model||!drawingCode)return alert("Generate a drawing first.");
    saveDrawing(drawingCode,safe);
    router.push(`/boq-civil?drawingCode=${encodeURIComponent(drawingCode)}`);
  };
  const checks:{key:keyof Inputs;label:string}[]=[
    {key:"lift",label:"Lift"},{key:"poojaRoom",label:"Pooja Room"},{key:"storeRoom",label:"Store Room"},{key:"terraceRoom",label:"Terrace Room"},
    {key:"clayTileRoom",label:"Clay Tile Covered Room"},{key:"pantry",label:"Pantry"},{key:"utility",label:"Utility"},{key:"balcony",label:"Balcony"},{key:"ugTank",label:"UG Tank"}
  ];
  return <main style={styles.page}>
    <header style={styles.header}><button style={styles.back} onClick={()=>router.push("/")}>←</button><div><h1 style={{margin:0,fontSize:21}}>BuildMitra DRG Drafting Engine V3</h1><p style={{margin:"4px 0 0",fontSize:12,opacity:.88}}>BUA-standard room allocation • architect-style fixed drafting • Vaastu-aware planning</p></div></header>
    <section style={styles.controls}>
      <h2 style={{margin:"0 0 13px",fontSize:17}}>User Requirement Input</h2>
      <h3 style={{margin:"6px 0 10px",fontSize:13,color:"#7f1d1d"}}>Plot & Building</h3>
      <div style={styles.grid}>
        <Field label="Plot Length (ft)"><input aria-label="Plot Length" type="number" min="30" max="120" value={input.plotLength} onChange={e=>update("plotLength",Number(e.target.value))} style={styles.input}/></Field>
        <Field label="Plot Width (ft)"><input aria-label="Plot Width" type="number" min="20" max="90" value={input.plotWidth} onChange={e=>update("plotWidth",Number(e.target.value))} style={styles.input}/></Field>
        <Select label="Road Side / Road Direction" value={input.facing} values={["East","West","North","South"]} onChange={v=>update("facing",v as Facing)}/>
        <Select label="North Direction" value={input.northDirection} values={["North","East","South","West"]} onChange={v=>update("northDirection",v as Facing)}/>
        <Field label="Floors"><input aria-label="Floors" type="number" min="1" max="12" value={input.floors} onChange={e=>update("floors",Number(e.target.value))} style={styles.input}/></Field>
        <Select label="Parking Type" value={input.parking} values={["Full Parking","Half Parking","No Parking"]} onChange={v=>update("parking",v as Parking)}/>
        <Select label="Building Type" value={input.buildingType} values={["Own Use","Rental Use","Multi-unit","Commercial mixed"]} onChange={v=>update("buildingType",v as BuildingType)}/>
      </div>
      <h3 style={{margin:"16px 0 10px",fontSize:13,color:"#7f1d1d"}}>Units / Rooms</h3>
      <div style={styles.grid}>
        <Field label="Kitchens / Units"><input aria-label="Kitchens" type="number" min="1" max="12" value={input.kitchens} onChange={e=>update("kitchens",Number(e.target.value))} style={styles.input}/></Field>
        <Field label="Bedrooms"><input aria-label="Bedrooms" type="number" min="1" max="30" value={input.bedrooms} onChange={e=>update("bedrooms",Number(e.target.value))} style={styles.input}/></Field>
        <Field label="Toilets"><input aria-label="Toilets" type="number" min="1" max="40" value={input.toilets} onChange={e=>update("toilets",Number(e.target.value))} style={styles.input}/></Field>
        <Field label="Living Rooms"><input aria-label="Living Rooms" type="number" min="1" max="12" value={input.livingRooms} onChange={e=>update("livingRooms",Number(e.target.value))} style={styles.input}/></Field>
        <Field label="Dining Rooms"><input aria-label="Dining Rooms" type="number" min="0" max="12" value={input.diningRooms} onChange={e=>update("diningRooms",Number(e.target.value))} style={styles.input}/></Field>
      </div>
      <h3 style={{margin:"16px 0 10px",fontSize:13,color:"#7f1d1d"}}>Vaastu & Structural Preferences</h3>
      <div style={{...styles.checkRow,flexWrap:"wrap"}}><label style={{display:"flex",alignItems:"center",gap:5}}><input type="checkbox" checked={input.vaastuPreference} onChange={e=>update("vaastuPreference",e.target.checked)}/>Vaastu Preference</label>{checks.map(item=><label key={String(item.key)} style={{display:"flex",alignItems:"center",gap:5}}><input type="checkbox" checked={Boolean(input[item.key])} onChange={e=>update(item.key,e.target.checked as never)}/>{item.label}</label>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:14}}>
        {[["Plot Area",areas.plotArea],["Footprint Area (after auto 10% setback)",areas.footprintArea],["Total BUA",areas.totalBUA],["Units",areas.unitCount]].map(([label,value])=><div key={String(label)} style={{padding:10,border:"1px solid #e2e8f0",borderRadius:9,background:"#f8fafc"}}><div style={{fontSize:10,color:faint,fontWeight:800}}>{label}</div><div style={{fontSize:16,fontWeight:900}}>{typeof value==="number"?Math.round(value):value} {label==="Units"?"":"sq.ft"}</div></div>)}
      </div>
      <button onClick={generate} style={{marginTop:16,padding:"11px 24px",border:0,borderRadius:8,background:"#7f1d1d",color:"white",fontWeight:800,cursor:"pointer"}}>Generate Drawing</button>
      <div style={styles.warning}>This is a conceptual architectural/structural drawing. Final approval drawing must be verified by licensed architect/structural engineer.</div>
      {!safe&&<div style={{marginTop:12,padding:12,border:"1px dashed #94a3b8",borderRadius:8,color:faint,fontSize:12}}>Enter your requirements and click Generate DRG to create the drawing set.</div>}
      {safe&&model&&plan&&<><div style={styles.checkRow}><span>Drawing Code / BOQ Ref: <b>{drawingCode}</b></span><span>{safe.kitchens} kitchen(s) = {model.areas.unitCount} independent house(s)</span><span>{safe.buildingType} • Auto Vaastu stair/core</span></div>
        <div style={{marginTop:12,padding:12,border:"1px solid #bfdbfe",borderRadius:10,background:"#eff6ff",fontSize:12,fontWeight:800,color:"#153e75"}}>
          Plot Area = {safe.plotWidth}′ × {safe.plotLength}′ = {Math.round(model.areas.plotArea)} sq.ft • Auto Setback 10% = {Math.round(model.areas.setbackArea)} sq.ft • Footprint Area = {Math.round(model.areas.footprintArea)} sq.ft • Total BUA = Footprint × {safe.floors} floor(s) = {Math.round(model.areas.totalBUA)} sq.ft
        </div>
        {warnings.map((warning,i)=><div key={i} style={{...styles.warning,background:warning.includes("exceed")||warning.includes("cannot")?"#fef2f2":"#fff7ed",color:warning.includes("exceed")||warning.includes("cannot")?"#b91c1c":"#9a3412"}}>{warning}</div>)}<AllocationSummary plan={plan}/></>}
    </section>
    {safe&&model&&plan&&<>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"0 0 14px"}}>
        {[
          ["architectural","1. Architectural Plan"],
          ["structural","2. Structural Grid / Footing Plan"],
          ["rooms","3. Room Schedule"],
          ["structureSchedule","4. Structural Schedule"],
          ["boq","5. BOQ Reference"]
        ].map(([key,label])=><button key={key} onClick={()=>setOutputTab(key as typeof outputTab)} style={{padding:"9px 12px",borderRadius:999,background:outputTab===key?"#7f1d1d":"white",color:outputTab===key?"white":ink,border:"1px solid #d7dde5",fontSize:12,fontWeight:900,cursor:"pointer"}}>{label}</button>)}
      </div>
      {outputTab==="architectural"&&<>
      <ModelStructuralSheet model={model}/>
      <ArchitecturalPresentationSheet model={model}/>
      {(safe.parking==="Full Parking"||safe.parking==="Half Parking")&&<GroundParking input={safe}/>}
      {model.floors.map((floor,index)=><ModelFloorPlan key={floor.level} model={model} floor={floor} number={String(index+(safe.parking==="No Parking"?1:3)).padStart(2,"0")}/>)}
      {(safe.terraceRoom||safe.clayTileRoom)&&<RoofTerracePlan input={safe} number={String(safe.floors+(safe.parking==="No Parking"?1:3)).padStart(2,"0")}/>}
      <ModernElevation input={safe} number={String(safe.floors+(safe.parking==="No Parking"?2:4)).padStart(2,"0")}/>
      </>}
      {outputTab==="structural"&&<ModelStructuralSheet model={model}/>}
      <section style={{...styles.sheet,display:outputTab==="architectural"||outputTab==="structural"?"none":"block"}}>
        <div style={styles.sheetHead}><h2 style={{margin:0,fontSize:17}}>{outputTab==="rooms"?"Room Schedule":outputTab==="structureSchedule"?"Structural Schedule":"BOQ Reference"}</h2><span style={{fontSize:10,color:faint}}>Reference: {drawingCode}</span></div>
        {outputTab==="boq"&&<><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:14}}>
          <div style={{padding:12,border:"1px solid #e2e8f0",borderRadius:10,background:"#f8fafc"}}><b>Drawing Code</b><br/><span style={{fontSize:18,color:"#7f1d1d",fontWeight:900}}>{drawingCode}</span></div>
          <div style={{padding:12,border:"1px solid #e2e8f0",borderRadius:10,background:"#f8fafc"}}><b>Footprint / Total BUA</b><br/>{Math.round(areas.footprintArea)} / {Math.round(areas.totalBUA)} sq.ft</div>
          <div style={{padding:12,border:"1px solid #e2e8f0",borderRadius:10,background:"#f8fafc"}}><b>Units / Openings</b><br/>{areas.unitCount} unit(s) • {drawingQuantities?.doorsCount} doors • {drawingQuantities?.windowsCount} windows • {drawingQuantities?.ventilatorsCount} vents</div>
          <div style={{padding:12,border:"1px solid #e2e8f0",borderRadius:10,background:"#f8fafc"}}><b>Structure Thumb Rule</b><br/>{structuralSpecs.columnSize} column • {structuralSpecs.slabThickness} slab • {structuralSpecs.steelThumbRule}</div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
          <button onClick={()=>requirePaid("PDF")} style={{...styles.input,width:"auto",cursor:"pointer",fontWeight:900}}>🔒 Export PDF</button>
          <button onClick={()=>requirePaid("Image")} style={{...styles.input,width:"auto",cursor:"pointer",fontWeight:900}}>🔒 Export Image</button>
          <button onClick={()=>requirePaid("Excel")} style={{...styles.input,width:"auto",cursor:"pointer",fontWeight:900}}>🔒 Export Excel Room Schedule</button>
          <button onClick={()=>requirePaid("DXF")} style={{...styles.input,width:"auto",cursor:"pointer",fontWeight:900}}>🔒 Export DXF</button>
          <button onClick={()=>requirePaid("WhatsApp")} style={{...styles.input,width:"auto",cursor:"pointer",fontWeight:900}}>🔒 WhatsApp Share</button>
          <button onClick={goToBOQ} style={{padding:"10px 14px",border:0,borderRadius:8,background:"#166534",color:"white",fontWeight:900,cursor:"pointer"}}>Generate BOQ from This Drawing</button>
        </div></>}
        {outputTab==="rooms"&&<div style={{overflowX:"auto",marginBottom:16}}>
          <h3 style={{fontSize:14}}>Room Schedule</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr>{["Floor No.","Unit No.","Room Name","Length","Width","Area","Doors","Windows","Ventilators","Notes"].map(h=><th key={h} style={{border:"1px solid #cbd5e1",padding:7,background:"#f1f5f9",textAlign:"left"}}>{h}</th>)}</tr></thead>
            <tbody>{roomSchedule.slice(0,80).map((r,i)=><tr key={i}><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.floorNo}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.unitNo}</td><td style={{border:"1px solid #e2e8f0",padding:6,fontWeight:800}}>{r.roomName}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.length}′</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.width}′</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.area}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.doors}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.windows}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.ventilators}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.notes}</td></tr>)}</tbody>
          </table>
        </div>}
        {outputTab==="structureSchedule"&&<div style={{overflowX:"auto"}}>
          <h3 style={{fontSize:14}}>Structural Schedule</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr>{["Column ID","Grid Position","Column Size","Footing Size","Beam Size","Slab Thickness","Concrete Grade"].map(h=><th key={h} style={{border:"1px solid #cbd5e1",padding:7,background:"#f1f5f9",textAlign:"left"}}>{h}</th>)}</tr></thead>
            <tbody>{structuralSchedule.map(r=><tr key={r.columnId}><td style={{border:"1px solid #e2e8f0",padding:6,fontWeight:800}}>{r.columnId}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.gridPosition}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.columnSize}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.footingSize}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.beamSize}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.slabThickness}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{r.concreteGrade}</td></tr>)}</tbody>
          </table>
        </div>}
        <div style={{...styles.warning,marginTop:14}}>Generated drawing and structural sizes are preliminary planning estimates. Final architectural and structural drawings must be verified and approved by licensed professionals as per local building bye-laws and IS codes.</div>
      </section>
      {paymentModal&&<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20,padding:16}}>
        <div style={{background:"white",borderRadius:14,padding:20,maxWidth:420,width:"100%",boxShadow:"0 20px 60px rgba(15,23,42,.25)"}}>
          <h2 style={{marginTop:0}}>Unlock Drawing Export</h2>
          <p style={{fontSize:13,color:"#475569"}}>Drawing export/share is locked for <b>{drawingCode}</b>. Preview and BOQ handoff remain free.</p>
          <div style={{padding:12,borderRadius:10,background:"#f8fafc",border:"1px solid #e2e8f0",marginBottom:12}}><b>Drawing export fee:</b> ₹199<br/><span style={{fontSize:12,color:faint}}>UPI/payment gateway integration can replace this demo unlock.</span></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button onClick={()=>setPaymentModal(false)} style={{...styles.input,width:"auto",cursor:"pointer"}}>Cancel</button><button onClick={markPaid} style={{padding:"10px 16px",border:0,borderRadius:8,background:"#7f1d1d",color:"white",fontWeight:900,cursor:"pointer"}}>Pay Now / Unlock</button></div>
        </div>
      </div>}
    </>}
  </main>;
}
