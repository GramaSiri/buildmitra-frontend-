// IS 456:2000 Compliant Calculations
export const IS456Standards = {
  concrete: {
    minGrade: 'M20',
    maxWCRatio: 0.45,
    minCementContent: 300, // kg/m³
    maxCementContent: 450, // kg/m³
    workability: {
      slump: {
        min: 50, // mm
        max: 100 // mm
      }
    }
  },
  steel: {
    grade: 'Fe500',
    minCover: {
      slab: 20, // mm
      beam: 25,
      column: 40,
      footing: 50
    },
    developmentLength: {
      tension: 47, // times diameter
      compression: 38
    }
  },
  staircase: {
    minTread: 250, // mm
    maxRiser: 190, // mm
    minWidth: 850, // mm
    maxRisePerFlight: 3000, // mm
    minHeadRoom: 2100 // mm
  }
};

// Material rates (₹ per unit)
export const MaterialRates = {
  cement: { standard: 380, luxury: 456, ultra: 532 }, // per bag
  steel: { standard: 65, luxury: 78, ultra: 91 }, // per kg
  sand: { standard: 55, luxury: 66, ultra: 77 }, // per CFT
  aggregate: { standard: 45, luxury: 54, ultra: 63 }, // per CFT
  concrete: { standard: 5400, luxury: 6480, ultra: 7560 }, // per m³
  bindingWire: 85, // per kg
  coverBlock: 12, // per piece
  formwork: 45, // per m²
  labour: 1200, // per m³
  finishing: { tiles: 45, granite: 180, marble: 250, wooden: 300 }
};

// Quality factors
export const QualityFactors = {
  standard: 1.0,
  luxury: 1.2,
  ultra: 1.4
};

// Staircase calculation (IS 456 compliant)
export const calculateStaircase = (inputs) => {
  // Validate inputs as per IS 456
  const treadMM = inputs.tread * 25.4;
  const riserMM = inputs.riser * 25.4;
  
  if (treadMM < IS456Standards.staircase.minTread) {
    throw new Error(`Tread must be at least ${IS456Standards.staircase.minTread}mm`);
  }
  if (riserMM > IS456Standards.staircase.maxRiser) {
    throw new Error(`Riser must not exceed ${IS456Standards.staircase.maxRiser}mm`);
  }
  
  // 2T + R = 600mm (IS 456 formula)
  const comfortCheck = (2 * treadMM) + riserMM;
  if (comfortCheck < 540 || comfortCheck > 660) {
    console.warn('Warning: Staircase may not be comfortable as per IS 456 standards');
  }
  
  const qualityFactor = QualityFactors[inputs.quality];
  
  // Conversions
  const widthM = inputs.width * 0.3048;
  const treadM = inputs.tread * 0.0254;
  const riserM = inputs.riser * 0.0254;
  const numRisers = inputs.numSteps;
  const goingM = treadM * (numRisers - 1);
  const riseM = riserM * numRisers;
  const flightLengthM = Math.hypot(riseM, goingM);
  
  // Waist slab thickness (min 150mm as per IS 456)
  const waistThickness = Math.max(inputs.waistSlabThickness || 150, 150) / 1000;
  
  // Concrete volume
  const concreteVolume = flightLengthM * widthM * waistThickness * inputs.numFlights;
  
  // Steel reinforcement (as per IS 456: 0.12% to 0.15% of concrete area)
  const steelRatio = 0.0012; // 0.12% minimum reinforcement
  const steelVolume = concreteVolume * steelRatio;
  const steelWeight = steelVolume * 7850; // Steel density 7850 kg/m³
  
  // Main bar calculation (12mm diameter typical)
  const mainBarDia = inputs.mainBarDia || 12;
  const mainBarArea = Math.PI * Math.pow(mainBarDia / 1000, 2) / 4;
  const mainBarLength = flightLengthM * (widthM / 0.15) * inputs.numFlights;
  const mainBarWeight = mainBarLength * mainBarArea * 7850;
  
  // Distribution bar (8mm diameter typical)
  const distBarDia = inputs.distributionBarDia || 8;
  const distBarArea = Math.PI * Math.pow(distBarDia / 1000, 2) / 4;
  const distBarLength = widthM * (flightLengthM / 0.2) * inputs.numFlights;
  const distBarWeight = distBarLength * distBarArea * 7850;
  
  const totalSteel = mainBarWeight + distBarWeight;
  
  // Binding wire (8-10% of steel weight)
  const bindingWire = totalSteel * 0.09;
  
  // Cover blocks (as per IS 456: min 20mm cover)
  const coverBlocks = Math.ceil(concreteVolume * 10);
  
  // Formwork area
  const formwork = flightLengthM * widthM * 2 * inputs.numFlights;
  
  // Finishing area
  const finishingArea = (treadM + riserM) * widthM * numRisers;
  
  // Railing length
  const railingLength = flightLengthM * 2;
  
  // Material rates based on quality
  const rates = {
    concrete: MaterialRates.concrete[inputs.quality],
    steel: MaterialRates.steel[inputs.quality],
    bindingWire: MaterialRates.bindingWire,
    coverBlock: MaterialRates.coverBlock,
    formwork: MaterialRates.formwork,
    finishing: MaterialRates.finishing[inputs.finishMaterial] || MaterialRates.finishing.granite,
    railing: inputs.railingType === 'ss' ? 600 : (inputs.railingType === 'wooden' ? 500 : 350),
    labour: MaterialRates.labour
  };
  
  // Calculate BOQ items
  const boqItems = [
    { id: 1, desc: 'RCC Concrete M20 (IS 456 Compliant)', qty: concreteVolume.toFixed(3), unit: 'm³', rate: rates.concrete, amount: concreteVolume * rates.concrete * qualityFactor },
    { id: 2, desc: `Main Reinforcement ${mainBarDia}mm Ø @ 150mm c/c`, qty: mainBarWeight.toFixed(0), unit: 'kg', rate: rates.steel, amount: mainBarWeight * rates.steel * qualityFactor },
    { id: 3, desc: `Distribution Reinforcement ${distBarDia}mm Ø @ 200mm c/c`, qty: distBarWeight.toFixed(0), unit: 'kg', rate: rates.steel, amount: distBarWeight * rates.steel * qualityFactor },
    { id: 4, desc: 'Binding Wire (9% of Steel)', qty: bindingWire.toFixed(0), unit: 'kg', rate: rates.bindingWire, amount: bindingWire * rates.bindingWire },
    { id: 5, desc: 'Concrete Cover Blocks (Min 20mm)', qty: coverBlocks, unit: 'nos', rate: rates.coverBlock, amount: coverBlocks * rates.coverBlock },
    { id: 6, desc: 'Formwork (Shuttering)', qty: formwork.toFixed(1), unit: 'm²', rate: rates.formwork, amount: formwork * rates.formwork },
    { id: 7, desc: `Floor Finishing - ${inputs.finishMaterial.toUpperCase()}`, qty: finishingArea.toFixed(1), unit: 'm²', rate: rates.finishing, amount: finishingArea * rates.finishing * qualityFactor },
    { id: 8, desc: `Railing - ${inputs.railingType.toUpperCase()}`, qty: railingLength.toFixed(1), unit: 'm', rate: rates.railing, amount: railingLength * rates.railing },
    { id: 9, desc: 'Skilled Labour (Mason, Carpenter, etc.)', qty: concreteVolume.toFixed(2), unit: 'm³', rate: rates.labour, amount: concreteVolume * rates.labour * qualityFactor }
  ];
  
  const subtotal = boqItems.reduce((sum, item) => sum + item.amount, 0);
  const misc = subtotal * 0.05;
  const total = subtotal + misc;
  
  boqItems.push({ id: 10, desc: 'Miscellaneous (5%)', qty: '', unit: '', rate: 0, amount: misc });
  
  return {
    success: true,
    summary: {
      concreteVolume: concreteVolume.toFixed(3),
      steelWeight: totalSteel.toFixed(0),
      bindingWire: bindingWire.toFixed(0),
      formwork: formwork.toFixed(1),
      finishingArea: finishingArea.toFixed(1),
      railingLength: railingLength.toFixed(1),
      comfortCheck: `${Math.round(comfortCheck)}mm (Ideal: 600mm)`
    },
    boqItems: boqItems.map(item => ({ ...item, amount: Math.round(item.amount) })),
    total: Math.round(total)
  };
};
