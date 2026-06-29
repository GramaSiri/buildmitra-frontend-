import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";

// ==========================================
// 1. EXPANDED QUESTION POOL (40+ Questions)
// ==========================================
const MASTER_QUESTIONS_POOL = [
  // RCC & Structural (8 questions)
  { id: "q1", cat: "RCC & Structural", q: "What is the primary technical purpose of introducing TMT steel rebar reinforcement in concrete beams?", o: ["Increase compressive limits", "Provide high tensile strength capacity", "Prevent chemical efflorescence", "Reduce total curing timeline buffers"], c: 1 },
  { id: "q2", cat: "RCC & Structural", q: "What is the minimum grade of concrete recommended for RCC foundation in seismic zones?", o: ["M15", "M20", "M25", "M30"], c: 2 },
  { id: "q3", cat: "RCC & Structural", q: "What is the standard cover thickness for RCC columns in aggressive environment?", o: ["25mm", "30mm", "40mm", "50mm"], c: 2 },
  { id: "q4", cat: "RCC & Structural", q: "What is the maximum allowable deflection for RCC beams as per IS 456?", o: ["L/250", "L/300", "L/350", "L/500"], c: 2 },
  { id: "q5", cat: "RCC & Structural", q: "What is the purpose of shear reinforcement in RCC beams?", o: ["Prevent bending failure", "Prevent shear failure", "Increase moment capacity", "Reduce cracking"], c: 1 },
  { id: "q6", cat: "RCC & Structural", q: "What is the minimum number of bars required for RCC column reinforcement?", o: ["4 bars", "6 bars", "8 bars", "10 bars"], c: 0 },
  { id: "q7", cat: "RCC & Structural", q: "What is the purpose of providing cranked bars in RCC slabs?", o: ["Increase aesthetic appeal", "Reduce structural weight", "Prevent cracking at corners", "Increase shear resistance"], c: 2 },
  { id: "q8", cat: "RCC & Structural", q: "What is the standard lap length for reinforcement bars in tension?", o: ["40d", "45d", "50d", "60d"], c: 2 },
  
  // Vaastu Architecture (8 questions)
  { id: "q9", cat: "Vaastu Architecture", q: "According to scientific Vaastu Shastra orientation layout principles, where should the Master Bedroom ideally be located?", o: ["North-East (Eshanya)", "South-West (Nairrutya)", "North-West (Vayu)", "South-East (Agni)"], c: 1 },
  { id: "q10", cat: "Vaastu Architecture", q: "Which direction is considered best for the main entrance according to Vaastu?", o: ["East", "West", "North", "South"], c: 0 },
  { id: "q11", cat: "Vaastu Architecture", q: "Where should the kitchen be ideally placed in a Vaastu-compliant home?", o: ["North-East", "South-East", "North-West", "South-West"], c: 1 },
  { id: "q12", cat: "Vaastu Architecture", q: "What is the significance of 'Brahmasthan' in Vaastu Shastra?", o: ["Center of the building", "North-East corner", "South-West corner", "Entrance area"], c: 0 },
  { id: "q13", cat: "Vaastu Architecture", q: "Which zone is considered ideal for placement of water elements?", o: ["North-East", "South-East", "North-West", "Center"], c: 0 },
  { id: "q14", cat: "Vaastu Architecture", q: "What is the recommended placement for the main staircase?", o: ["North-East", "South-West", "North-West", "Center"], c: 2 },
  { id: "q15", cat: "Vaastu Architecture", q: "Which direction is best for study room placement?", o: ["East", "West", "North", "South"], c: 0 },
  { id: "q16", cat: "Vaastu Architecture", q: "Where should the pooja room be ideally placed?", o: ["North-East", "South-East", "North-West", "South-West"], c: 0 },
  
  // Project Management (8 questions)
  { id: "q17", cat: "Project Management", q: "What does a 'Critical Path' represent in structural scheduling software?", o: ["Cheapest delivery pipeline", "Longest continuous sequence of activities", "Shortest task duration", "Safest mobilization route"], c: 1 },
  { id: "q18", cat: "Project Management", q: "What is the purpose of a Gantt chart in construction project management?", o: ["Visualize schedule", "Calculate costs", "Design structures", "Manage safety"], c: 0 },
  { id: "q19", cat: "Project Management", q: "What is Earned Value Management (EVM) used for?", o: ["Track project cost & schedule", "Design floor plans", "Calculate steel quantity", "Manage labour"], c: 0 },
  { id: "q20", cat: "Project Management", q: "What is the typical contingency percentage for construction projects?", o: ["1-3%", "3-5%", "5-10%", "10-15%"], c: 2 },
  { id: "q21", cat: "Project Management", q: "What is RACI matrix used for?", o: ["Responsibility assignment", "Cost calculation", "Design review", "Safety planning"], c: 0 },
  { id: "q22", cat: "Project Management", q: "What is the purpose of regular progress review meetings?", o: ["Track status & decisions", "Increase costs", "Delay project", "Reduce quality"], c: 0 },
  { id: "q23", cat: "Project Management", q: "What is the role of Project Management Software like Primavera?", o: ["Schedule & resource planning", "Design buildings", "Calculate materials", "Manage safety"], c: 0 },
  { id: "q24", cat: "Project Management", q: "What is the significance of project baseline?", o: ["Reference for performance", "Design standard", "Cost estimate", "Safety benchmark"], c: 0 },
  
  // Quantity Surveying (8 questions)
  { id: "q25", cat: "Quantity Surveying", q: "What standard volumetric factor converts compacted concrete to dry aggregate?", o: ["1.15", "1.33", "1.54", "1.25"], c: 2 },
  { id: "q26", cat: "Quantity Surveying", q: "What is the unit of measurement for steel reinforcement?", o: ["kg", "meter", "feet", "ton"], c: 3 },
  { id: "q27", cat: "Quantity Surveying", q: "What is the standard thickness of a modular brick?", o: ["4 inch", "4.5 inch", "5 inch", "6 inch"], c: 0 },
  { id: "q28", cat: "Quantity Surveying", q: "What is the formula for calculating number of bricks per sqft?", o: ["9", "10", "12", "13.5"], c: 3 },
  { id: "q29", cat: "Quantity Surveying", q: "What is the standard coverage area of 1 bag of cement?", o: ["1.25 sqm", "1.5 sqm", "2 sqm", "2.5 sqm"], c: 0 },
  { id: "q30", cat: "Quantity Surveying", q: "What is the ratio of cement:sand:aggregate for M20 concrete?", o: ["1:1.5:3", "1:2:4", "1:3:6", "1:1:2"], c: 0 },
  { id: "q31", cat: "Quantity Surveying", q: "What is the standard height of a brick (in inches)?", o: ["2.5", "3", "3.5", "4"], c: 1 },
  { id: "q32", cat: "Quantity Surveying", q: "What is the formula for calculating steel weight per meter?", o: ["d²/162", "d²/180", "d²/200", "d²/250"], c: 0 },
  
  // Plumbing & PHE (8 questions)
  { id: "q33", cat: "Plumbing & PHE", q: "Which piping trap configuration is mandatory directly below kitchen sinks?", o: ["Bottle Trap", "Gully Trap", "Siphonic Nahni Trap", "Intercepting Chamber"], c: 0 },
  { id: "q34", cat: "Plumbing & PHE", q: "What is the standard size of PVC pipe used for residential plumbing?", o: ["1 inch", "1.5 inch", "2 inch", "3 inch"], c: 1 },
  { id: "q35", cat: "Plumbing & PHE", q: "What is the minimum slope for sewage drain lines?", o: ["1:50", "1:100", "1:200", "1:300"], c: 0 },
  { id: "q36", cat: "Plumbing & PHE", q: "What is the purpose of a water hammer arrestor?", o: ["Prevent pipe noise", "Increase water pressure", "Filter water", "Heating water"], c: 0 },
  { id: "q37", cat: "Plumbing & PHE", q: "What is the standard height for toilet connections from floor level?", o: ["4 inch", "6 inch", "8 inch", "10 inch"], c: 2 },
  { id: "q38", cat: "Plumbing & PHE", q: "What is the recommended pipe material for hot water supply?", o: ["PVC", "CPVC", "UPVC", "PPR"], c: 1 },
  { id: "q39", cat: "Plumbing & PHE", q: "What is the standard diameter of a bathroom vent pipe?", o: ["1 inch", "1.5 inch", "2 inch", "2.5 inch"], c: 2 },
  { id: "q40", cat: "Plumbing & PHE", q: "What is the purpose of a floor trap in bathroom drainage?", o: ["Prevent odor", "Filter water", "Regulate flow", "Reduce noise"], c: 0 }
];

// ==========================================
// 2. EXPANDED DATA POOLS
// ==========================================
const EXPERT_TALKS = [
  { id: "et1", title: "Optimizing High-Rise Foundations in Bengaluru Soil Profiles", speaker: "Dr. L. N. Murthy (Structural Director)", duration: "45 mins", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id: "et2", title: "Maximizing Saleable Area Efficiency in 30x40 Corner Layout Formations", speaker: "Ar. Theja C. Reddy (Principal Architect)", duration: "30 mins", type: "article", url: "#" },
  { id: "et3", title: "Green Building Materials: Future of Sustainable Construction", speaker: "Dr. Priya Sharma (Sustainability Expert)", duration: "35 mins", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id: "et4", title: "Smart City Infrastructure: The Role of IoT in Construction", speaker: "Prof. Rajesh Kumar (Urban Planner)", duration: "40 mins", type: "article", url: "#" },
  { id: "et5", title: "Cost Optimization Strategies for Residential Projects", speaker: "CA. Anand Patel (Cost Consultant)", duration: "25 mins", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
];

const NEW_TECHNOLOGIES = [
  { id: "nt1", title: "Modular 3D Concrete Printing", desc: "Monolithic load-bearing villa structures cast sequentially within 48 hours directly on-site using automated gantry arms.", image: "🏗️" },
  { id: "nt2", title: "Drone GPR Soil Mapping", desc: "Ground Penetrating Radar arrays mounted on UAVs to map subterranean rock and water tables prior to excavation works.", image: "🛸" },
  { id: "nt3", title: "AI-Powered Construction Management", desc: "Machine learning algorithms optimize resource allocation, predict delays, and reduce wastage by up to 30%.", image: "🤖" },
  { id: "nt4", title: "Self-Healing Concrete", desc: "Embedded bacterial spores activate upon moisture contact to calcify micro-cracks automatically over a 30-year lifecycle.", image: "🧪" },
  { id: "nt5", title: "Carbon Capture Bricks", desc: "Bricks manufactured using captured CO2 emissions, reducing carbon footprint by 40% compared to traditional bricks.", image: "🟩" }
];

const NEW_MATERIALS = [
  { id: "nm1", name: "Self-Healing Bioconcrete", features: "Embedded bacterial spores that activate upon moisture contact to calcify micro-cracks automatically over a 30-year lifecycle.", supplier: "BioCon Solutions", price: "₹12,500/ton", promotion: "10% off on first order" },
  { id: "nm2", name: "Fe550D Carbon-Coated Reinforcement", features: "High-ductility steel rebar with molecular carbon layers providing 3x greater corrosion resistance in damp coastal soils.", supplier: "SteelCorp Advanced", price: "₹85,000/ton", promotion: "Free delivery within 50km" },
  { id: "nm3", name: "Aerogel Insulation Panels", features: "Ultra-lightweight silica aerogel panels providing 2x better thermal insulation than traditional foam boards.", supplier: "GreenInsul Tech", price: "₹4,500/sqm", promotion: "Buy 100sqm get 10sqm free" },
  { id: "nm4", name: "Recycled Plastic Bricks", features: "Bricks manufactured from 100% recycled plastic waste, 50% lighter than traditional clay bricks with superior insulation.", supplier: "EcoBrick India", price: "₹18/piece", promotion: "Sample kit on request" },
  { id: "nm5", name: "Smart Glass Windows", features: "Electrochromic glass that adjusts transparency based on sunlight, reducing HVAC load by 25%.", supplier: "SmartGlass Technologies", price: "₹6,500/sqm", promotion: "Free installation" }
];

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function LearnEarnPremiumEcosystem() {
  const router = useRouter();

  // ----- STATE CONTROLLERS -----
  const [isRegistered, setIsRegistered] = useState(false);
  const [regName, setRegName] = useState("");
  const [regMobile, setRegMobile] = useState("");

  const [userPoints, setUserPoints] = useState(1450);
  const [quizActive, setQuizActive] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizPercentage, setQuizPercentage] = useState<number | null>(null);
  const [timerCount, setTimerCount] = useState(300);
  const [leaderTab, setLeaderTab] = useState("daily");
  const [activeSubTab, setActiveSubTab] = useState("quiz");
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  // Puzzle states
  const [puzzleType, setPuzzleType] = useState("Vaastu Plan");
  const [puzzlePositions, setPuzzlePositions] = useState<Record<string, string>>({ Kitchen: "Unassigned", MasterBed: "Unassigned", PujaRoom: "Unassigned" });
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);
  const [buildingBlocks, setBuildingBlocks] = useState<{ id: string; name: string; placed: boolean; x: number; y: number }[]>([
    { id: "b1", name: "Foundation", placed: false, x: 0, y: 0 },
    { id: "b2", name: "Walls", placed: false, x: 0, y: 0 },
    { id: "b3", name: "Roof", placed: false, x: 0, y: 0 },
    { id: "b4", name: "Windows", placed: false, x: 0, y: 0 },
    { id: "b5", name: "Doors", placed: false, x: 0, y: 0 },
  ]);
  const [elevationComplete, setElevationComplete] = useState(false);

  // Quiz shuffle
  const shuffledQuestions = useMemo(() => {
    const shuffled = [...MASTER_QUESTIONS_POOL];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 20);
  }, []);

  useEffect(() => {
    if (!quizActive) return;
    if (timerCount <= 0) {
      handleCompleteQuiz();
      return;
    }
    const internalTicker = setInterval(() => setTimerCount((prev) => prev - 1), 1000);
    return () => clearInterval(internalTicker);
  }, [quizActive, timerCount]);

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (regName.trim() && regMobile.trim().length >= 10) {
      setIsRegistered(true);
    }
  };

  const handleStartExam = () => {
    setTimerCount(300);
    setCurrentIdx(0);
    setSelectedAns(null);
    setQuizPercentage(null);
    setAnsweredQuestions([]);
    setQuizActive(true);
  };

  const handleNextStep = () => {
    if (selectedAns === shuffledQuestions[currentIdx].c) {
      setUserPoints((prev) => prev + 25);
    }
    setAnsweredQuestions([...answeredQuestions, currentIdx]);
    if (currentIdx + 1 < shuffledQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAns(null);
    } else {
      handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = () => {
    setQuizActive(false);
    const score = Math.round((answeredQuestions.length / shuffledQuestions.length) * 100);
    setQuizPercentage(score);
  };

  const triggerWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🏗️ I passed the BuildMitra Daily Civil Quiz!\n🎯 Score: ${quizPercentage}%\n🏆 Reg Name: ${regName}\nJoin BuildMitra and master site calculations today!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // ----- PUZZLE GAME LOGIC -----
  const handlePlaceElement = (zone: string, coordinate: string) => {
    const updated = { ...puzzlePositions, [zone]: coordinate };
    setPuzzlePositions(updated);

    if (zone === "Kitchen" && coordinate === "South-East (Agni)") {
      setGameFeedback("🎉 CONGRATULATIONS! Perfect placement under Vastu bylaws rules.");
    } else if (zone === "Kitchen") {
      setGameFeedback("⚠️ BETTER LUCK NEXT TIME! Kitchen must sit exclusively inside South-East (Agni) boundaries.");
    } else if (zone === "PujaRoom" && coordinate === "North-East (Eshanya)") {
      setGameFeedback("🕉️ EXCELLENT! Pooja room placed perfectly in North-East corner.");
    } else if (zone === "MasterBed" && coordinate === "South-West (Nairrutya)") {
      setGameFeedback("🏠 PERFECT! Master bedroom correctly placed in South-West zone.");
    } else {
      setGameFeedback("🔄 Try again! Refer to Vaastu guide for correct placement.");
    }
  };

  // ----- ELEVATION BUILDER -----
  const handlePlaceBlock = (blockId: string) => {
    setBuildingBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, placed: true } : block
    ));
    
    const allPlaced = buildingBlocks.every(b => b.id === blockId ? true : b.placed);
    if (allPlaced) {
      setElevationComplete(true);
      setGameFeedback("🏛️ AMAZING! Your building elevation is complete!");
    }
  };

  const resetBuilding = () => {
    setBuildingBlocks(prev => prev.map(block => ({ ...block, placed: false })));
    setElevationComplete(false);
    setGameFeedback(null);
  };

  // ==========================================
  // 4. RENDER FUNCTIONS
  // ==========================================
  const renderQuiz = () => (
    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", color: "#0f172a" }}>📝 Daily Civil Construction Quiz (20 Questions)</h3>
        {quizActive && <span style={{ color: "#dc2626", fontWeight: "bold", background: "#fee2e2", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>⏱️ {Math.floor(timerCount / 60)}:{(timerCount % 60).toString().padStart(2, "0")}</span>}
      </div>

      {!quizActive && quizPercentage === null && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ margin: "0 0 16px 0", fontSize: "13.5px", color: "#475569" }}>Test your site engineering acumen under strict 5-minute auto-submit constraints.</p>
          <button onClick={handleStartExam} style={{ background: "#2563eb", color: "#ffffff", padding: "12px 24px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>🚀 Start Examination</button>
        </div>
      )}

      {quizActive && (
        <div>
          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#2563eb", textTransform: "uppercase" }}>Category: {shuffledQuestions[currentIdx].cat}</span>
          <h4 style={{ margin: "6px 0 16px 0", fontSize: "15px" }}>Q{currentIdx + 1}/{shuffledQuestions.length}: {shuffledQuestions[currentIdx].q}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {shuffledQuestions[currentIdx].o.map((option, idx) => (
              <button key={idx} onClick={() => setSelectedAns(idx)} style={{ textAlign: "left", padding: "12px", borderRadius: "8px", border: selectedAns === idx ? "2px solid #2563eb" : "1px solid #cbd5e1", background: selectedAns === idx ? "#eff6ff" : "#ffffff", cursor: "pointer", transition: "all 0.2s" }}>
                {String.fromCharCode(65 + idx)}. {option}
              </button>
            ))}
          </div>
          <button onClick={handleNextStep} disabled={selectedAns === null} style={{ background: selectedAns === null ? "#94a3b8" : "#16a34a", color: "#ffffff", border: "none", padding: "10px 24px", borderRadius: "6px", fontWeight: "bold", cursor: selectedAns === null ? "not-allowed" : "pointer" }}>
            {currentIdx + 1 === shuffledQuestions.length ? "Submit Quiz" : "Next Question →"}
          </button>
        </div>
      )}

      {quizPercentage !== null && !quizActive && (
        <div style={{ textAlign: "center", background: "#f0fdf4", padding: "24px", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
          <h3 style={{ margin: "0 0 6px 0", color: "#16a34a" }}>✅ Quiz Completed Successfully!</h3>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px" }}>Score: <b>{quizPercentage}%</b> | Points Earned: <b>{Math.round(quizPercentage * 2)}</b></p>
          <button onClick={triggerWhatsAppShare} style={{ background: "#25d366", color: "#ffffff", padding: "10px 20px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>💬 Share on WhatsApp</button>
        </div>
      )}
    </div>
  );

  const renderPuzzle = () => (
    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", color: "#0f172a" }}>🧩 Interactive Vaastu Spatial Puzzle</h3>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["Vaastu Plan", "Furniture Alignment", "Elevation Cladding"].map(p => (
          <button key={p} onClick={() => { setPuzzleType(p); setGameFeedback(null); }} style={{ padding: "6px 12px", background: puzzleType === p ? "#1a5f7a" : "#f1f5f9", color: puzzleType === p ? "#ffffff" : "#475569", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
        <p style={{ margin: "0 0 12px 0", fontSize: "13px" }}><b>Active Task:</b> Assign rooms to their Vaastu positions</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <div><b>Kitchen</b><br/>
            <button onClick={() => handlePlaceElement("Kitchen", "North-West")} style={{ padding: "4px 8px", fontSize: "10px", background: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer", margin: "2px" }}>NW</button>
            <button onClick={() => handlePlaceElement("Kitchen", "South-East (Agni)")} style={{ padding: "4px 8px", fontSize: "10px", background: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer", margin: "2px" }}>SE</button>
          </div>
          <div><b>Master Bed</b><br/>
            <button onClick={() => handlePlaceElement("MasterBed", "North-West")} style={{ padding: "4px 8px", fontSize: "10px", background: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer", margin: "2px" }}>NW</button>
            <button onClick={() => handlePlaceElement("MasterBed", "South-West (Nairrutya)")} style={{ padding: "4px 8px", fontSize: "10px", background: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer", margin: "2px" }}>SW</button>
          </div>
          <div><b>Puja Room</b><br/>
            <button onClick={() => handlePlaceElement("PujaRoom", "North-East (Eshanya)")} style={{ padding: "4px 8px", fontSize: "10px", background: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer", margin: "2px" }}>NE</button>
            <button onClick={() => handlePlaceElement("PujaRoom", "South-West")} style={{ padding: "4px 8px", fontSize: "10px", background: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer", margin: "2px" }}>SW</button>
          </div>
        </div>
        {gameFeedback && <div style={{ marginTop: "16px", fontWeight: "bold", fontSize: "13px", color: gameFeedback.includes("CONGRATULATIONS") || gameFeedback.includes("EXCELLENT") || gameFeedback.includes("PERFECT") ? "#16a34a" : "#dc2626" }}>{gameFeedback}</div>}
        <div style={{ marginTop: "12px", fontSize: "12px", color: "#64748b" }}>
          <b>Current Placements:</b> Kitchen: {puzzlePositions.Kitchen}, MasterBed: {puzzlePositions.MasterBed}, PujaRoom: {puzzlePositions.PujaRoom}
        </div>
      </div>
    </div>
  );

  const renderElevationBuilder = () => (
    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", color: "#0f172a" }}>🏗️ Building Elevation Constructor</h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <p style={{ fontSize: "13px", color: "#475569" }}>Drag & place building blocks in correct order:</p>
          {buildingBlocks.map(block => (
            <div key={block.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", border: block.placed ? "2px solid #16a34a" : "1px solid #cbd5e1", borderRadius: "6px", marginBottom: "6px", background: block.placed ? "#f0fdf4" : "#ffffff" }}>
              <span style={{ fontWeight: "bold" }}>{block.name}</span>
              <button onClick={() => handlePlaceBlock(block.id)} disabled={block.placed} style={{ padding: "4px 12px", background: block.placed ? "#94a3b8" : "#2563eb", color: "#ffffff", border: "none", borderRadius: "4px", cursor: block.placed ? "not-allowed" : "pointer", fontSize: "11px" }}>
                {block.placed ? "✅ Placed" : "Place"}
              </button>
            </div>
          ))}
          <button onClick={resetBuilding} style={{ marginTop: "12px", padding: "8px 16px", background: "#ef4444", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>🔄 Reset Building</button>
        </div>
        
        <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "2px solid #cbd5e1", minHeight: "250px", position: "relative" }}>
          <div style={{ position: "absolute", bottom: "20px", left: "20px", right: "20px", height: "10px", background: "#10b981", borderRadius: "2px" }}></div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "200px" }}>
            {buildingBlocks.filter(b => b.placed).map((b, i) => (
              <div key={b.id} style={{ 
                width: `${80 - i * 10}%`, 
                height: `${30 + i * 10}px`, 
                background: `hsl(${200 + i * 20}, 70%, ${60 + i * 5}%)`, 
                border: "1px solid #1a5f7a",
                borderRadius: "2px",
                marginTop: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: "white",
                fontWeight: "bold"
              }}>
                {b.name}
              </div>
            ))}
            {!elevationComplete && <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "20px" }}>Place blocks to build your elevation</div>}
            {elevationComplete && (
              <div style={{ marginTop: "10px", padding: "8px 16px", background: "#16a34a", color: "#ffffff", borderRadius: "6px", fontWeight: "bold", fontSize: "14px" }}>
                🏛️ BUILDING COMPLETE! +50 Points
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderExpertTalks = () => (
    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#1a5f7a" }}>🎙️ Expert Talks & Publications</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {EXPERT_TALKS.map(talk => (
          <div key={talk.id} style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "24px" }}>{talk.type === "video" ? "🎥" : "📄"}</div>
            <h4 style={{ margin: "8px 0 4px 0", fontSize: "14px", color: "#0f172a" }}>{talk.title}</h4>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b" }}>{talk.speaker}</p>
            <span style={{ fontSize: "11px", background: "#e2e8f0", padding: "2px 8px", borderRadius: "12px" }}>{talk.duration}</span>
            <button style={{ marginTop: "10px", padding: "6px 14px", background: "#1a5f7a", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
              {talk.type === "video" ? "▶ Watch" : "📖 Read"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewTechnologies = () => (
    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#2563eb" }}>⚡ Emerging Construction Technologies</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        {NEW_TECHNOLOGIES.map(tech => (
          <div key={tech.id} style={{ background: "#f0f9ff", padding: "16px", borderRadius: "10px", border: "1px solid #bae6fd" }}>
            <div style={{ fontSize: "32px" }}>{tech.image}</div>
            <h4 style={{ margin: "8px 0 4px 0", fontSize: "14px", color: "#0f172a" }}>{tech.title}</h4>
            <p style={{ margin: "0", fontSize: "12px", color: "#475569" }}>{tech.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewMaterials = () => (
    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#16a34a" }}>🧱 New Materials in Market</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {NEW_MATERIALS.map(mat => (
          <div key={mat.id} style={{ background: "#f0fdf4", padding: "16px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#0f172a" }}>{mat.name}</h4>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#475569" }}>{mat.features}</p>
            <div style={{ fontSize: "12px", color: "#2563eb" }}>📦 Supplier: {mat.supplier}</div>
            <div style={{ fontSize: "12px", color: "#dc2626" }}>💰 {mat.price}</div>
            <div style={{ fontSize: "11px", background: "#fef3c7", padding: "2px 8px", borderRadius: "4px", marginTop: "6px", display: "inline-block" }}>🎯 {mat.promotion}</div>
            <button style={{ marginTop: "8px", padding: "6px 14px", background: "#16a34a", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>📞 Enquire Now</button>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isRegistered) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f1f5f9", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
        <form onSubmit={handleRegisterUser} style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", maxWidth: "420px", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2 style={{ margin: 0, color: "#1a5f7a", fontSize: "22px" }}>🏗️ BuildMitra Academy</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>Register to access premium learning modules</p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold", color: "#475569" }}>Full Name</label>
            <input type="text" required style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", marginTop: "4px" }} value={regName} onChange={e => setRegName(e.target.value)} placeholder="Enter your full name" />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold", color: "#475569" }}>Mobile Number</label>
            <input type="tel" required style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", marginTop: "4px" }} value={regMobile} onChange={e => setRegMobile(e.target.value)} placeholder="Enter 10-digit mobile number" />
          </div>
          <button type="submit" style={{ width: "100%", background: "#1a5f7a", color: "#ffffff", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>🚀 Unlock Academy</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", backgroundColor: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif", color: "#1e293b" }}>
      
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a5f7a 0%, #10465c 100%)", padding: "24px", borderRadius: "16px", color: "#ffffff", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>🚀 BuildMitra Academy</h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#cbd5e1" }}>Welcome, <b style={{ color: "#ffffff" }}>{regName}</b> | Mobile: {regMobile}</p>
        </div>
        <div style={{ display: "flex", gap: "12px", background: "rgba(255,255,255,0.15)", padding: "10px 16px", borderRadius: "10px" }}>
          <div>⭐ <b>{userPoints}</b> Pts</div>
          <div>🔥 <b>14 Days</b> Streak</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { id: "quiz", label: "📝 Quiz" },
          { id: "puzzle", label: "🧩 Puzzle" },
          { id: "elevation", label: "🏗️ Elevation" },
          { id: "expert", label: "🎙️ Expert Talks" },
          { id: "technology", label: "⚡ Technology" },
          { id: "materials", label: "🧱 Materials" }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} style={{ padding: "10px 20px", background: activeSubTab === tab.id ? "#1a5f7a" : "#ffffff", color: activeSubTab === tab.id ? "#ffffff" : "#1a5f7a", border: activeSubTab === tab.id ? "none" : "1px solid #1a5f7a", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      <div>
        {activeSubTab === "quiz" && renderQuiz()}
        {activeSubTab === "puzzle" && renderPuzzle()}
        {activeSubTab === "elevation" && renderElevationBuilder()}
        {activeSubTab === "expert" && renderExpertTalks()}
        {activeSubTab === "technology" && renderNewTechnologies()}
        {activeSubTab === "materials" && renderNewMaterials()}
      </div>
    </div>
  );
}