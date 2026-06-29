import React, { useState } from "react";
import * as XLSX from "xlsx";
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const styles:any = {
  container:{maxWidth:"100%",margin:0,padding:"12px",backgroundColor:"#f5f0e8",minHeight:"100vh",boxSizing:"border-box"},
  header:{backgroundColor:"#1a7f6e",padding:"16px",borderRadius:"8px",marginBottom:"20px",color:"white"},
  headerTitle:{margin:0,fontSize:"20px"}, headerSub:{margin:"5px 0 0",opacity:.9,fontSize:"12px"},
  sectionTitle:{backgroundColor:"#e8f4f8",color:"#1a7f6e",padding:"8px",borderRadius:"6px",marginBottom:"12px",fontSize:"14px",fontWeight:"bold",textAlign:"center",border:"1px solid #cce5ed"},
  row4:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"12px",marginBottom:"12px"},
  label:{display:"block",marginBottom:"4px",fontWeight:"600",fontSize:"11px",color:"#555"},
  input:{width:"100%",padding:"8px",border:"1px solid #ccc",borderRadius:"6px",fontSize:"13px",boxSizing:"border-box",backgroundColor:"#fff"},
  readOnly:{backgroundColor:"#e8f4f8",fontWeight:"bold"}, select:{width:"100%",padding:"8px",border:"1px solid #ccc",borderRadius:"6px",fontSize:"13px",backgroundColor:"#fff"},
  buttonGenerate:{backgroundColor:"#800020",color:"white",padding:"12px 24px",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"14px",fontWeight:"bold",width:"100%",marginTop:"20px"},
  buttonExport:{backgroundColor:"#28a745",color:"white",padding:"8px 20px",border:"none",borderRadius:"6px",cursor:"pointer",fontSize:"13px",marginRight:"10px"},
  buttonWhatsapp:{backgroundColor:"#25D366",color:"white",padding:"8px 20px",border:"none",borderRadius:"6px",cursor:"pointer",fontSize:"13px"},
  buttonContainer:{display:"flex",justifyContent:"center",gap:"15px",margin:"20px 0",flexWrap:"wrap"},
  cardContainer:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px",marginBottom:"20px"},
  card:{padding:"15px",borderRadius:"12px",textAlign:"center",color:"white"}, cardCement:{backgroundColor:"#607d8b"}, cardSteel:{backgroundColor:"#ff9800"}, cardPEH:{backgroundColor:"#4caf50"}, cardLabour:{backgroundColor:"#2196f3"}, cardRate:{backgroundColor:"#9c27b0"}, cardValue:{fontSize:"20px",fontWeight:"bold",marginTop:"8px"},
  tableContainer:{overflowX:"auto",marginTop:"15px",border:"1px solid #ddd",borderRadius:"8px",backgroundColor:"#fff"}, table:{width:"100%",borderCollapse:"collapse",fontSize:"11px"}, th:{backgroundColor:"#1a7f6e",color:"white",padding:"8px",textAlign:"left"}, td:{padding:"6px",borderBottom:"1px solid #eee"}, evenRow:{backgroundColor:"#f9f9f9"}, totalRow:{backgroundColor:"#800020",color:"white",fontWeight:"bold"}, infoBox:{backgroundColor:"#e8f4f8",padding:"10px",borderRadius:"8px",marginBottom:"15px",fontSize:"12px",textAlign:"center"}, checkboxBox:{display:"flex",alignItems:"center",gap:"8px",padding:"8px",background:"#fff",border:"1px solid #ccc",borderRadius:"6px"}
};
const formatNumber=(n:any)=>Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const lakhs=(n:number)=>formatNumber(n/100000)+" L";

export default function CivilBOQPage(){
  const [projectName,setProjectName]=useState("Jai Sri ram"),[clientName,setClientName]=useState("Reddy"),[mobileNo,setMobileNo]=useState("7676942386"),[city,setCity]=useState("Bengaluru");
  const [plotLength,setPlotLength]=useState(30),[plotWidth,setPlotWidth]=useState(40),[floors,setFloors]=useState(3);
  const [constructionType,setConstructionType]=useState("Residential"),[finishProfile,setFinishProfile]=useState("Standard"),[bedrooms,setBedrooms]=useState(3),[toilets,setToilets]=useState(3),[kitchens,setKitchens]=useState(1),[wallType,setWallType]=useState("Concrete Block"),[sbc,setSbc]=useState(180),[lift,setLift]=useState(false),[terraceTruss,setTerraceTruss]=useState(true);
  const [results,setResults]=useState<any>(null),[generated,setGenerated]=useState(false);

  const plotArea=plotLength*plotWidth, setbackArea=plotArea*0.10, footprintArea=Math.max(plotArea-setbackArea,0), totalBUA=footprintArea*floors;
  const foundationType=floors>5?"Raft Foundation":floors>=5?"Combined Footing":"Isolated Footings";
  const floorsRounded=Math.max(Math.ceil(floors),1);
  const structural=floors<=1?{steel:3.0,column:'9"x12"',beam:'9"x12"',slab:"125mm",footing:"4ft x 4ft x 1.5ft",rcc:0.90}:floors<=2?{steel:3.2,column:'9"x15"',beam:'9"x15"',slab:"125mm",footing:"5ft x 5ft x 1.5ft",rcc:0.96}:floors<=3?{steel:3.4,column:'12"x18"',beam:'9"x18"',slab:"125mm",footing:"5ft x 5ft x 2ft",rcc:1.02}:floors<=4?{steel:3.5,column:'12"x18"',beam:'12"x18"',slab:"150mm",footing:"6ft x 6ft x 2ft",rcc:1.08}:floors<=5?{steel:3.6,column:'12"x21"',beam:'12"x18"',slab:"150mm",footing:"Combined Footing",rcc:1.14}:{steel:3.8,column:"Engine designed",beam:"Engine designed",slab:"150-175mm",footing:"Raft Foundation",rcc:1.22};

  const gr=(keys:string[],fallback=0,stores?:string[])=>getMasterRate(keys,fallback,stores).rate||0;
  const rates:any={
    soil:gr(["soil test","soil investigation"]),excMat:gr(["earth excavation","excavation"]),excLab:gr(["excavation labour"],0,["bm_labour_rates","bm_service_rates"]),pcc:gr(["pcc","plain cement concrete"]),pccLab:gr(["pcc labour"],0,["bm_labour_rates","bm_service_rates"]),
    fmat:gr(["foundation masonry","size stone masonry"]),flab:gr(["masonry labour"],0,["bm_labour_rates","bm_service_rates"]),back:gr(["backfilling"]),backLab:gr(["backfilling labour"],0,["bm_labour_rates","bm_service_rates"]),plinth:gr(["plinth protection","pcc flooring"]),plinthLab:gr(["plinth labour","pcc labour"],0,["bm_labour_rates","bm_service_rates"]),
    termite:gr(["anti termite","anti-termite"]),termiteLab:gr(["anti termite labour"],0,["bm_labour_rates","bm_service_rates"]),shut:gr(["shuttering material","shuttering"]),shutLab:gr(["shuttering labour"],0,["bm_labour_rates","bm_service_rates"]),steel:gr(["steel","tmt","rebar"]),steelLab:gr(["bar bending","steel labour"],0,["bm_labour_rates","bm_service_rates"]),
    rcc:gr(["rcc","m20 concrete","concrete"]),rccLab:gr(["rcc labour","concrete labour"],0,["bm_labour_rates","bm_service_rates"]),block6:gr(["6 inch block","concrete block 6","block"]),block4:gr(["4 inch block","concrete block 4"]),blockLab:gr(["block masonry labour","masonry labour"],0,["bm_labour_rates","bm_service_rates"]),
    mainDoor:gr(["main door"]),doorLab:gr(["door fixing labour"],0,["bm_labour_rates","bm_service_rates"]),poojaDoor:gr(["pooja door"]),internalDoor:gr(["internal door","flush door"]),toiletDoor:gr(["toilet door","wpc door"]),window:gr(["window","upvc window","aluminium window"]),
    plaster:gr(["plastering","plaster material"]),plasterLab:gr(["plaster labour"],0,["bm_labour_rates","bm_service_rates"]),floor:gr(["flooring","vitrified tile"]),floorLab:gr(["flooring labour","tile fixing labour"],0,["bm_labour_rates","bm_service_rates"]),dado:gr(["wall dado","dado tile"]),dadoLab:gr(["dado labour","tile fixing labour"],0,["bm_labour_rates","bm_service_rates"]),
    platform:gr(["kitchen platform","granite platform"]),platformLab:gr(["kitchen platform labour"],0,["bm_labour_rates","bm_service_rates"]),electrical:gr(["electrical point","electrical"]),electricalLab:gr(["electrical labour"],0,["bm_labour_rates","bm_service_rates"]),plumbing:gr(["plumbing point","plumbing"]),plumbingLab:gr(["plumbing labour"],0,["bm_labour_rates","bm_service_rates"]),
    parking:gr(["parking flooring","parking"]),parkingLab:gr(["parking labour","flooring labour"],0,["bm_labour_rates","bm_service_rates"]),ug:gr(["ug tank","water tank"]),ugLab:gr(["ug tank labour","water tank labour"],0,["bm_labour_rates","bm_service_rates"]),terrace:gr(["roof truss","terrace clay tile","mangalore tile"]),terraceLab:gr(["roof truss labour","fabrication labour"],0,["bm_labour_rates","bm_service_rates"]),
    railing:gr(["railing","ms railing","ss railing"]),railingLab:gr(["railing labour"],0,["bm_labour_rates","bm_service_rates"]),compound:gr(["compound wall"]),compoundLab:gr(["compound wall labour"],0,["bm_labour_rates","bm_service_rates"]),paint:gr(["painting","paint"]),paintLab:gr(["painting labour"],0,["bm_labour_rates","bm_service_rates"]),lift:gr(["lift","passenger lift"]),liftLab:gr(["lift installation"],0,["bm_labour_rates","bm_service_rates"])
  };
  const add=(sr:any,code:string,desc:string,uom:string,qty:number,matRate:number,labRate:number)=>({sr,code,desc,uom,qty:Number(qty||0),matRate:Number(matRate||0),labRate:Number(labRate||0),amount:Number(qty||0)*(Number(matRate||0)+Number(labRate||0))});

  const calculateBOQ=()=>{
    const finishMult=finishProfile==="Premium"?1.1:finishProfile==="Ultra Premium"?1.25:1;
    const boreholes=plotArea<=6000?1:plotArea<=12000?2:3, columns=Math.max(9,Math.ceil(footprintArea/120));
    const excavationCum=foundationType==="Raft Foundation"?(footprintArea*.75)/35.315:(columns*5*5*5)/35.315, pccCum=foundationType==="Raft Foundation"?(footprintArea*.33)/35.315:(columns*5.5*5.5*.33)/35.315, foundationCum=foundationType==="Raft Foundation"?0:(columns*4*4*1.5)/35.315, backfillCum=Math.max(excavationCum-pccCum-foundationCum,0);
    const plinthCum=setbackArea*.25/35.315, antiTermite=footprintArea/100, shuttering=totalBUA*(2.25+Math.min(floors,6)*.07), steelKg=totalBUA*structural.steel, rccCum=(totalBUA*structural.rcc)/35.315, cementBags=totalBUA*.4, pehCft=pccCum*35.315;
    const internalDoors=Math.max(bedrooms+kitchens+2,1), windows=Math.ceil((bedrooms*2)+kitchens+toilets+floorsRounded), toiletDoors=toilets, elecPts=Math.ceil(totalBUA/60+bedrooms*4+kitchens*8+toilets*4+(lift?5:0)), plumbPts=toilets*10+kitchens*6+(lift?2:0);
    const extWallArea=totalBUA*.90, intWallArea=totalBUA*.45;
    const block6=wallType==="Concrete Block"?extWallArea/.80:0, block4=wallType==="Concrete Block"?intWallArea/.80:0;
    const brickWallSqm=wallType==="Brick"?(extWallArea+intWallArea)/10.764:0;
    const plasterSqm=totalBUA*2.7/10.764, flooring=totalBUA*1.05, dado=toilets*7*4*2.5, platform=kitchens*3.6, parking=Math.max(setbackArea*.55,footprintArea*.25), ug=(toilets*1000+kitchens*500+1000)/28.3168, terrace=terraceTruss?Math.max(250,footprintArea*.35):0, railing=totalBUA*.17, compound=Math.max((2*(plotLength+plotWidth)-12)*6,0), painting=totalBUA*3.5;
    const lintel=((internalDoors+windows+toiletDoors+1)*5*.75*.5)/35.315, staircase=floors>1?floors*1.8:0, sunshade=windows*5*1.25*.33/35.315;
    let items:any[]=[
      add(1,"Soil Test",`Soil investigation as per plot area. 1200–6000 sft = 1 borehole. SBC used: ${sbc} kN/sqm.`,"Nos",boreholes,rates.soil,0),
      add(2,"Earth Excavation",`Excavation in ordinary soil. Foundation engine from SBC ${sbc} kN/sqm: ${foundationType}.`,"Cum",excavationCum,rates.excMat,rates.excLab),
      add(3,"PCC","PCC M10 below foundations — 4 inch leveling bed.","Cum",pccCum,rates.pcc,rates.pccLab),
      add(4,"Foundation Masonry",foundationType==="Raft Foundation"?"Not applicable for raft foundation.":"Size stone masonry / footing masonry in CM 1:6.","Cum",foundationCum,rates.fmat,rates.flab),
      add(5,"Backfilling","Backfilling in foundation/plinth with excavated soil.","Cum",backfillCum,rates.back,rates.backLab),
      add(6,"Plinth Protection","PCC plinth protection over default 10% setback area.","Cum",plinthCum,rates.plinth,rates.plinthLab),
      add(7,"Anti-Termite","Anti-termite chemical treatment below foundation/floor.","Ltr",antiTermite,rates.termite,rates.termiteLab),
      add(8,"Shuttering",`Centering/shuttering. Column ${structural.column}, Beam ${structural.beam}, Slab ${structural.slab}.`,"Sft",shuttering,rates.shut,rates.shutLab),
      add(9,"Steel",`Fe-500 TMT. Engine ratio ${structural.steel} kg/sft based on ${floors} floors.`,"Kgs",steelKg,rates.steel,rates.steelLab),
      add(10,"RCC Total",`RCC total: footing + columns + beams + slabs + lintels + staircase + sunshades. Column ${structural.column}, Beam ${structural.beam}, Slab ${structural.slab}, Footing ${structural.footing}.`,"Cum",rccCum+lintel+staircase+sunshade,rates.rcc,rates.rccLab),
      add(11,"Lintels","Included in RCC Total — reference quantity only.","Cum",lintel,0,0),
      add(12,"Staircase","Included in RCC Total — reference quantity only.","Cum",staircase,0,0),
      add(13,"Sunshades","Included in RCC Total — reference quantity only.","Cum",sunshade,0,0),
      add(14,"Brick Masonry",wallType==="Brick"?"Brick masonry in CM 1:6 selected by user.":"Not selected; wall type is concrete block.","Sqmtr",brickWallSqm,wallType==="Brick"?rates.block6:0,wallType==="Brick"?rates.blockLab:0),
      add(15,'Block Masonry (6")',wallType==="Concrete Block"?"External 6 inch concrete block masonry selected by user.":"Not selected; wall type is brick.","Nos",block6,wallType==="Concrete Block"?rates.block6:0,wallType==="Concrete Block"?rates.blockLab:0),
      add(16,'Block Masonry (4")',wallType==="Concrete Block"?"Internal 4 inch concrete block masonry selected by user.":"Not selected; wall type is brick.","Nos",block4,wallType==="Concrete Block"?rates.block4:0,wallType==="Concrete Block"?rates.blockLab:0),
      add(17,"Doors Total","All doors consolidated: main + pooja + internal + toilet doors.","Nos",1+(bedrooms>=2?1:0)+internalDoors+toiletDoors,(rates.mainDoor+rates.poojaDoor+(internalDoors*rates.internalDoor)+(toiletDoors*rates.toiletDoor))/(1+(bedrooms>=2?1:0)+internalDoors+toiletDoors||1),rates.doorLab),
      add(18,"Pooja Room Door","Included in Doors Total — reference line retained.","Nos",bedrooms>=2?1:0,0,0),
      add(19,"Internal Doors","Included in Doors Total — reference line retained.","Nos",internalDoors,0,0),
      add(20,"Windows","UPVC / aluminium sliding windows with mosquito mesh.","Nos",windows,rates.window,rates.doorLab),
      add(21,"Toilet Doors","Included in Doors Total — reference line retained.","Nos",toiletDoors,0,0),
      add(22,"Plastering","Internal and external plastering.","Sqmtr",plasterSqm,rates.plaster,rates.plasterLab),
      add(23,"Flooring","Vitrified/granite/marble flooring with skirting.","Sft",flooring,rates.floor*finishMult,rates.floorLab),
      add(24,"Wall Dadoing","Toilet/kitchen wall dado.","Sft",dado,rates.dado*finishMult,rates.dadoLab),
      add(25,"Kitchen Platform","RCC/granite kitchen platform.","Rmt",platform,rates.platform*finishMult,rates.platformLab),
      add(26,"Electrical","FRLS wiring, modular switches, DB and MCBs.","Points",elecPts,rates.electrical,rates.electricalLab),
      add(27,"Plumbing","CPVC/UPVC plumbing and sanitary fixture points.","Points",plumbPts,rates.plumbing,rates.plumbingLab),
      add(28,"Parking Area","Parking flooring with PCC / anti-skid finish.","Sft",parking,rates.parking,rates.parkingLab),
      add(29,"UG Tank","RCC underground water tank.","Cft",ug,rates.ug,rates.ugLab),
      add(30,"Terrace",terraceTruss?"MS roof truss with clay/Mangalore tile roofing.":"Terrace truss not selected.","Sft",terrace,rates.terrace,rates.terraceLab),
      add(31,"Railings","MS/SS railings for staircase, balcony and terrace.","Kgs",railing,rates.railing,rates.railingLab),
      add(32,"Compound Wall","Compound wall with columns, masonry infill and plaster.","Sft",compound,rates.compound,rates.compoundLab),
      add(33,"Painting","Wall putty, primer and two coats paint.","Sft",painting,rates.paint*finishMult,rates.paintLab)
    ];
    if(lift) items.splice(30,0,add(30.1,"Lift Provision","Passenger lift supply/installation provision.","Nos",1,rates.lift,rates.liftLab));
    const materialTotal=items.reduce((s,i)=>s+i.qty*i.matRate,0), labourTotal=items.reduce((s,i)=>s+i.qty*i.labRate,0), grandTotal=materialTotal+labourTotal;
    return {items,materialTotal,labourTotal,grandTotal,ratePerSft:totalBUA?grandTotal/totalBUA:0,totalBUA,foundationType,cementQuantity:cementBags,steelQuantity:steelKg,pehQuantity:pehCft,internalDoors,windows,electricalPoints:elecPts,plumbingPoints:plumbPts,structural};
  };

  const handleGenerate=()=>{setResults(calculateBOQ());setGenerated(true);};
  const handleReset=()=>{setProjectName("Jai Sri ram");setClientName("Reddy");setMobileNo("7676942386");setCity("Bengaluru");setPlotLength(30);setPlotWidth(40);setFloors(3);setConstructionType("Residential");setFinishProfile("Standard");setBedrooms(3);setToilets(3);setKitchens(1);setWallType("Concrete Block");setSbc(180);setLift(false);setTerraceTruss(true);setResults(null);setGenerated(false);};
  const handleExportExcel=()=>{if(!results)return; const ws=XLSX.utils.json_to_sheet(results.items.map((i:any)=>({"Sr. No.":i.sr,"Item Code":i.code,Description:i.desc,UOM:i.uom,Quantity:formatNumber(i.qty),"Mat. Rate":formatNumber(i.matRate),"Lab. Rate":formatNumber(i.labRate),"Total (₹)":formatNumber(i.amount)}))); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Civil_BOQ"); XLSX.writeFile(wb,`Civil_BOQ_${new Date().toISOString().split("T")[0]}.xlsx`);};
  const handleWhatsApp=()=>{if(!results)return; const m=`🏗️ CIVIL BOQ\n\nProject: ${projectName}\nClient: ${clientName}\nPlot: ${plotLength} x ${plotWidth} ft\nFloors: ${floors}\nBUA: ${formatNumber(totalBUA)} sft\nFoundation: ${foundationType}\nTotal Cost: ₹${lakhs(results.grandTotal)}\nRate: ₹${formatNumber(results.ratePerSft)}/sft`; window.open(`https://wa.me/?text=${encodeURIComponent(m)}`,"_blank");};
  const rateMsg=rateStatusMessage({steel:getMasterRate(["steel","tmt"],0),rcc:getMasterRate(["rcc","concrete"],0),block:getMasterRate(["block"],0),painting:getMasterRate(["painting"],0)});

  return <div style={styles.container}>
    <div style={styles.header}><h1 style={styles.headerTitle}>🏗️ Civil BOQ Calculator</h1><p style={styles.headerSub}>Dynamic structural BOQ engine — 10% setback default, auto BUA, foundation/steel/RCC sizing and 33-line BOQ.</p></div>
    {rateMsg&&<div style={styles.infoBox}>{rateMsg}</div>}
    <div style={styles.sectionTitle}>📋 Basic Details</div>
    <div style={styles.row4}>
      <div><label style={styles.label}>Project Name</label><input style={styles.input} value={projectName} onChange={e=>setProjectName(e.target.value)}/></div>
      <div><label style={styles.label}>Client Name</label><input style={styles.input} value={clientName} onChange={e=>setClientName(e.target.value)}/></div>
      <div><label style={styles.label}>Mobile No.</label><input style={styles.input} value={mobileNo} onChange={e=>setMobileNo(e.target.value)}/></div>
      <div><label style={styles.label}>City</label><input style={styles.input} value={city} onChange={e=>setCity(e.target.value)}/></div>
    </div>
    <div style={styles.sectionTitle}>📐 Plot & Building Inputs</div>
    <div style={styles.row4}>
      <div><label style={styles.label}>Plot Length (ft)</label><input type="number" style={styles.input} value={plotLength} onChange={e=>setPlotLength(parseFloat(e.target.value)||0)}/></div>
      <div><label style={styles.label}>Plot Width (ft)</label><input type="number" style={styles.input} value={plotWidth} onChange={e=>setPlotWidth(parseFloat(e.target.value)||0)}/></div>
      <div><label style={styles.label}>No. of Floors</label><input type="number" style={styles.input} value={floors} onChange={e=>setFloors(parseFloat(e.target.value)||0)}/></div>
      <div><label style={styles.label}>Plot Area (Sft)</label><input readOnly style={{...styles.input,...styles.readOnly}} value={formatNumber(plotArea)}/></div>
      <div><label style={styles.label}>Total BUA (Sft)</label><input readOnly style={{...styles.input,...styles.readOnly}} value={formatNumber(totalBUA)}/></div>
      <div><label style={styles.label}>SBC (kN/sqm)</label><input type="number" style={styles.input} value={sbc} onChange={e=>setSbc(parseFloat(e.target.value)||0)}/></div>
    </div>
    <div style={styles.sectionTitle}>🏠 Building Inputs</div>
    <div style={styles.row4}>
      <div><label style={styles.label}>Construction Type</label><select style={styles.select} value={constructionType} onChange={e=>setConstructionType(e.target.value)}><option>Residential</option><option>Commercial</option><option>Industrial</option></select></div>
      <div><label style={styles.label}>Finish Profile</label><select style={styles.select} value={finishProfile} onChange={e=>setFinishProfile(e.target.value)}><option>Standard</option><option>Premium</option><option>Ultra Premium</option></select></div>
      <div><label style={styles.label}>Wall Type</label><select style={styles.select} value={wallType} onChange={e=>setWallType(e.target.value)}><option>Concrete Block</option><option>Brick</option></select></div>
      <div><label style={styles.label}>Bedrooms</label><input type="number" style={styles.input} value={bedrooms} onChange={e=>setBedrooms(parseFloat(e.target.value)||0)}/></div>
      <div><label style={styles.label}>Toilets</label><input type="number" style={styles.input} value={toilets} onChange={e=>setToilets(parseFloat(e.target.value)||0)}/></div>
      <div><label style={styles.label}>Kitchens</label><input type="number" style={styles.input} value={kitchens} onChange={e=>setKitchens(parseFloat(e.target.value)||0)}/></div>
      <label style={styles.checkboxBox}><input type="checkbox" checked={lift} onChange={e=>setLift(e.target.checked)}/> Lift Required</label>
      <label style={styles.checkboxBox}><input type="checkbox" checked={terraceTruss} onChange={e=>setTerraceTruss(e.target.checked)}/> Terrace Truss Roof + Clay Tiles</label>
    </div>
    <div style={styles.infoBox}>🚪 Internal Doors: {results?.internalDoors||Math.max(bedrooms+kitchens+2,1)} | 🪟 Windows: {results?.windows||Math.ceil((bedrooms*2)+kitchens+toilets+floorsRounded)} | ⚡ Electrical Points: {Math.ceil(totalBUA/60+bedrooms*4+kitchens*8+toilets*4+(lift?5:0))} | 🚰 Plumbing Points: {toilets*10+kitchens*6+(lift?2:0)}<br/>Structural Engine: SBC {sbc} kN/sqm | Foundation {foundationType} | Column {structural.column} | Beam {structural.beam} | Slab {structural.slab} | Steel {structural.steel} kg/sft</div>
    <div style={styles.buttonContainer}><button onClick={handleReset} style={styles.buttonExport}>🔄 Reset</button><button onClick={handleGenerate} style={styles.buttonGenerate}>🔨 Generate Civil BOQ</button></div>
    {generated&&results&&<div>
      <div style={styles.cardContainer}>
        <div style={{...styles.card,...styles.cardCement}}><div>🪣</div><div>Cement</div><div style={styles.cardValue}>{formatNumber(results.cementQuantity)} bags</div></div>
        <div style={{...styles.card,...styles.cardSteel}}><div>⚙️</div><div>Steel</div><div style={styles.cardValue}>{formatNumber(results.steelQuantity)} kg</div></div>
        <div style={{...styles.card,...styles.cardPEH}}><div>🏗️</div><div>PEH / PCC</div><div style={styles.cardValue}>{formatNumber(results.pehQuantity)} Cft</div></div>
        <div style={{...styles.card,...styles.cardLabour}}><div>👷</div><div>Labour Cost</div><div style={styles.cardValue}>₹{lakhs(results.labourTotal)}</div></div>
        <div style={{...styles.card,...styles.cardRate}}><div>📐</div><div>Rate/sft</div><div style={styles.cardValue}>₹{formatNumber(results.ratePerSft)}</div></div>
      </div>
      <div style={styles.buttonContainer}><button onClick={handleExportExcel} style={styles.buttonExport}>📊 Export Excel</button><button onClick={handleWhatsApp} style={styles.buttonWhatsapp}>💬 WhatsApp Share</button></div>
      <div style={styles.tableContainer}><table style={styles.table}><thead><tr><th style={styles.th}>Sr.</th><th style={styles.th}>Item Code</th><th style={styles.th}>Description</th><th style={styles.th}>UOM</th><th style={styles.th}>Qty</th><th style={styles.th}>Mat. Rate</th><th style={styles.th}>Lab. Rate</th><th style={styles.th}>Total (₹)</th></tr></thead><tbody>
        {results.items.map((item:any,idx:number)=><tr key={idx} style={idx%2===0?{}:styles.evenRow}><td style={styles.td}>{item.sr}</td><td style={styles.td}>{item.code}</td><td style={styles.td}>{item.desc}</td><td style={styles.td}>{item.uom}</td><td style={styles.td}>{formatNumber(item.qty)}</td><td style={styles.td}>{formatNumber(item.matRate)}</td><td style={styles.td}>{formatNumber(item.labRate)}</td><td style={styles.td}>{formatNumber(item.amount)}</td></tr>)}
        <tr style={styles.totalRow}><td colSpan={7} style={{padding:"10px"}}>GRAND TOTAL</td><td style={{padding:"10px"}}>₹{formatNumber(results.grandTotal)}</td></tr>
      </tbody></table></div>
    </div>}
  </div>;
}
