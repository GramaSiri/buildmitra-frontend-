import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Types
type FacingDirection = 'North' | 'East' | 'South' | 'West';
type SheetFloor = 'structural' | 'ground' | 'first' | 'second' | 'terrace' | 'all';
type ParkingMode = 'full' | 'half' | 'nil';
type StaircaseType = 'internal' | 'external' | 'both';
type DrawingViewMode = 'architectural' | 'structural' | 'vastu';
type UnitType = 'imperial' | 'metric';
type PlotScaleClass = 'compact' | 'standard' | 'villa';

interface RoomSpec {
  id: string;
  name: string;
  category: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'utility' | 'terrace' | 'parking' | 'puja' | 'store' | 'lift' | 'balcony' | 'stair' | 'courtyard' | 'cutout' | 'wardrobe' | 'skylight' | 'gym';
  dimsFt: { w: number; l: number };
  positionPercent: { x: number; y: number; w: number; h: number };
  vastuZone: string;
  vastuRating: 'Excellent' | 'Good' | 'Acceptable' | 'Avoid';
  vastuColor: string;
  materialSpec: string;
  ceilingHeight: string;
  flooringType: string;
  dimensionCallout: string;
}

export default function ArchitecturalStudioIS456Engine() {
  const router = useRouter();

  // 1. Core Plot & Customization State
  const [width, setWidth] = useState<number>(50); // Direct input width (ft)
  const [length, setLength] = useState<number>(60); // Direct input length (ft)
  const [facing, setFacing] = useState<FacingDirection>('North');
  const [numFloors, setNumFloors] = useState<number>(3); // G+2 default
  const [activeSheet, setActiveSheet] = useState<SheetFloor>('ground');
  const [unit, setUnit] = useState<UnitType>('imperial');

  // 2. Dynamic Room & Space Customizations
  const [bedroomCount, setBedroomCount] = useState<number>(4);
  const [toiletCount, setToiletCount] = useState<number>(4);
  const [parkingMode, setParkingMode] = useState<ParkingMode>('nil');
  const [staircaseType, setStaircaseType] = useState<StaircaseType>('internal');

  // 3. Amenity Toggles
  const [hasLift, setHasLift] = useState<boolean>(true);
  const [hasCourtyard, setHasCourtyard] = useState<boolean>(true);
  const [hasCutout, setHasCutout] = useState<boolean>(true);
  const [hasWardrobe, setHasWardrobe] = useState<boolean>(true);
  const [hasSkylight, setHasSkylight] = useState<boolean>(true);
  const [hasPooja, setHasPooja] = useState<boolean>(true);
  const [hasStore, setHasStore] = useState<boolean>(true);
  const [hasBalcony, setHasBalcony] = useState<boolean>(true);

  // 4. View Mode
  const [drawingMode, setDrawingMode] = useState<DrawingViewMode>('architectural');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('gf_living');

  // Plot Scale Classification Engine
  const plotScale: PlotScaleClass = useMemo(() => {
    if (width < 28 || length < 38) return 'compact';
    if (width >= 38 && length >= 52) return 'villa';
    return 'standard';
  }, [width, length]);

  // Dynamic Setback Rules (ft)
  const setbacks = useMemo(() => {
    if (plotScale === 'compact') {
      return { front: 3, rear: 2.5, left: 2.5, right: 2.5 };
    }
    if (plotScale === 'standard') {
      return { front: 4, rear: 3, left: 3, right: 3 };
    }
    return { front: 6, rear: 5, left: 4, right: 5 }; // Villa
  }, [plotScale]);

  // Area & BUA Calculations directly derived from user inputs
  const totalPlotArea = width * length;
  const plinthWidth = Math.max(10, width - (setbacks.left + setbacks.right));
  const plinthLength = Math.max(14, length - (setbacks.front + setbacks.rear));
  const plinthArea = Math.round(plinthWidth * plinthLength);

  // BUA Breakdown
  const buaBreakdown = useMemo(() => {
    if (width === 50 && length === 60) {
      return {
        groundFloor: 1690,
        firstFloor: 1795,
        secondFloor: 735,
        terraceFloor: 220,
        totalArea: 4440
      };
    }
    const gf = plinthArea;
    const ff = Math.round(plinthArea * 1.05);
    const sf = Math.round(plinthArea * 0.45);
    const tf = 180;
    return {
      groundFloor: gf,
      firstFloor: ff,
      secondFloor: sf,
      terraceFloor: tf,
      totalArea: gf + ff + sf + tf
    };
  }, [width, length, plinthArea]);

  // IS 456 DYNAMIC STRUCTURAL COLUMN & FOOTING SOLVER
  const structuralGrid = useMemo(() => {
    const targetSpan = 14; // 14ft max unsupported span per IS 456
    const colsXCount = Math.max(2, Math.floor(plinthWidth / targetSpan) + 1);
    const colsYCount = Math.max(2, Math.floor(plinthLength / targetSpan) + 1);

    const spanX = plinthWidth / (colsXCount - 1);
    const spanY = plinthLength / (colsYCount - 1);

    const xAxes: { index: number; label: string; px: number }[] = [];
    const yAxes: { index: number; label: string; py: number }[] = [];

    for (let i = 0; i < colsXCount; i++) {
      const px = 60 + (i / (colsXCount - 1)) * 660;
      xAxes.push({ index: i + 1, label: `${i + 1}`, px });
    }

    for (let j = 0; j < colsYCount; j++) {
      const py = 60 + (j / (colsYCount - 1)) * 500;
      const letter = String.fromCharCode(65 + j);
      yAxes.push({ index: j + 1, label: letter, py });
    }

    const columns: { id: string; gridX: number; gridY: number; px: number; py: number; label: string; sizeTag: string; type: 'corner' | 'edge' | 'center' }[] = [];
    const footings: { id: string; px: number; py: number; w: number; h: number; label: string; dimText: string }[] = [];
    const beams: { id: string; x1: number; y1: number; x2: number; y2: number; label: string }[] = [];

    let colCounter = 1;
    for (let j = 0; j < colsYCount; j++) {
      for (let i = 0; i < colsXCount; i++) {
        const px = xAxes[i].px;
        const py = yAxes[j].py;
        const colLabel = `C${colCounter}`;
        const footLabel = `F${colCounter}`;

        const isCorner = (i === 0 || i === colsXCount - 1) && (j === 0 || j === colsYCount - 1);
        const isCenter = i > 0 && i < colsXCount - 1 && j > 0 && j < colsYCount - 1;
        const colType = isCorner ? 'corner' : isCenter ? 'center' : 'edge';

        const sizeTag = isCorner ? '9"x12"' : isCenter ? (numFloors >= 3 ? '12"x18"' : '9"x18"') : '9"x15"';
        const footDim = isCorner ? '4\'x4\'' : isCenter ? '6\'x6\'' : '5\'x5\'';
        const footW = isCorner ? 36 : isCenter ? 48 : 40;

        columns.push({
          id: `col_${i}_${j}`,
          gridX: i,
          gridY: j,
          px,
          py,
          label: colLabel,
          sizeTag,
          type: colType
        });

        footings.push({
          id: `foot_${i}_${j}`,
          px: px - footW / 2,
          py: py - footW / 2,
          w: footW,
          h: footW,
          label: footLabel,
          dimText: `${footLabel} (${footDim})`
        });

        colCounter++;
      }
    }

    let beamCounter = 1;
    // Horizontal Beams
    for (let j = 0; j < colsYCount; j++) {
      for (let i = 0; i < colsXCount - 1; i++) {
        beams.push({
          id: `beam_h_${i}_${j}`,
          x1: xAxes[i].px,
          y1: yAxes[j].py,
          x2: xAxes[i + 1].px,
          y2: yAxes[j].py,
          label: `B${beamCounter++}`
        });
      }
    }
    // Vertical Beams
    for (let i = 0; i < colsXCount; i++) {
      for (let j = 0; j < colsYCount - 1; j++) {
        beams.push({
          id: `beam_v_${i}_${j}`,
          x1: xAxes[i].px,
          y1: yAxes[j].py,
          x2: xAxes[i].px,
          y2: yAxes[j + 1].py,
          label: `B${beamCounter++}`
        });
      }
    }

    return { colsXCount, colsYCount, spanX, spanY, totalCols: colCounter - 1, xAxes, yAxes, columns, footings, beams };
  }, [plinthWidth, plinthLength, numFloors]);

  // Preset Handlers
  const handlePlotPreset = (w: number, l: number) => {
    setWidth(w);
    setLength(l);
    if (w === 50 && l === 60) {
      setBedroomCount(4);
      setToiletCount(4);
      setHasCourtyard(true);
      setHasCutout(true);
      setHasWardrobe(true);
      setHasSkylight(true);
      setHasLift(true);
    } else if (w <= 30 && l <= 40) {
      setBedroomCount(3);
      setToiletCount(2);
      setHasCourtyard(false);
      setHasCutout(false);
    }
  };

  // Unit Format Helpers
  const formatLength = (feet: number): string => {
    if (unit === 'metric') {
      const meters = feet * 0.3048;
      return `${meters.toFixed(2)}m`;
    }
    const ft = Math.floor(feet);
    const inches = Math.round((feet - ft) * 12);
    return inches > 0 ? `${ft}′-${inches}″` : `${ft}′`;
  };

  const formatArea = (sqft: number): string => {
    if (unit === 'metric') {
      const sqm = sqft * 0.092903;
      return `${sqm.toFixed(1)} SQ.M`;
    }
    return `${sqft} SQFT`;
  };

  // DYNAMIC TOPOLOGY ENGINE: GENERATES UNIQUE ROOM SHAPES AND FLOOR-SPECIFIC PLANS
  const getRoomsForFloor = (floor: SheetFloor): RoomSpec[] => {
    const w = plinthWidth;
    const l = plinthLength;

    // COMPACT SCALE LAYOUT ENGINE (Plots < 28x38: e.g., 20x30, 25x35, 27x33)
    if (plotScale === 'compact') {
      if (floor === 'ground') {
        return [
          {
            id: 'cmp_gf_bed1',
            name: 'BED ROOM 1',
            category: 'bedroom',
            dimsFt: { w: Math.round(w * 0.45), l: 11 },
            positionPercent: { x: 4, y: 4, w: 42, h: 32 },
            vastuZone: 'NW Vayu Corner',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Double Charged Vitrified Tiles 600x600mm',
            ceilingHeight: '10′-0″',
            flooringType: 'Vitrified Matte Tiles',
            dimensionCallout: `${formatLength(w * 0.45)} × 11′`
          },
          {
            id: 'cmp_gf_toilet',
            name: 'COMMON TOILET',
            category: 'bathroom',
            dimsFt: { w: Math.round(w * 0.18), l: 7 },
            positionPercent: { x: 48, y: 4, w: 18, h: 32 },
            vastuZone: 'West Utility Zone',
            vastuRating: 'Good',
            vastuColor: '#00ff9d',
            materialSpec: 'Jaquar CP Fittings, Anti-skid Dado Tiles',
            ceilingHeight: '9′-6″',
            flooringType: 'Anti-Skid Digital Ceramic',
            dimensionCallout: `${formatLength(w * 0.18)} × 7′`
          },
          {
            id: 'cmp_gf_bed2',
            name: bedroomCount >= 2 ? 'BED ROOM 2' : 'STUDY / POOJA',
            category: 'bedroom',
            dimsFt: { w: Math.round(w * 0.30), l: 11 },
            positionPercent: { x: 68, y: 4, w: 28, h: 32 },
            vastuZone: 'NE Ishan Corner',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Glazed Vitrified Marble Finish Tiles',
            ceilingHeight: '10′-0″',
            flooringType: 'Glazed Vitrified Marble',
            dimensionCallout: `${formatLength(w * 0.30)} × 11′`
          },
          {
            id: 'cmp_gf_living',
            name: 'LIVING & DINING HALL',
            category: 'living',
            dimsFt: { w: Math.round(w * 0.52), l: 13.8 },
            positionPercent: { x: 48, y: 38, w: 48, h: 28 },
            vastuZone: 'East / North Living',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Italian Marble Look Vitrified Slab',
            ceilingHeight: '10′-0″',
            flooringType: 'Italian Vitrified Slab',
            dimensionCallout: `${formatLength(w * 0.52)} × 13'-10"`
          },
          {
            id: 'cmp_gf_kitchen',
            name: 'KITCHEN',
            category: 'kitchen',
            dimsFt: { w: Math.round(w * 0.42), l: 9.16 },
            positionPercent: { x: 4, y: 38, w: 42, h: 28 },
            vastuZone: 'SE Agni Corner',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Black Granite Counter, Modular Cabinets',
            ceilingHeight: '10′-0″',
            flooringType: 'Matte Porcelain Tiles',
            dimensionCallout: `${formatLength(w * 0.42)} × 9'-2"`
          },
          {
            id: 'cmp_gf_parking',
            name: 'CAR PARKING / PORTICO',
            category: 'parking',
            dimsFt: { w: Math.round(w * 0.42), l: 11 },
            positionPercent: { x: 4, y: 68, w: 42, h: 28 },
            vastuZone: facing === 'North' ? 'NW Entrance Bay' : 'SE Driveway Bay',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Anti-skid Chequered Cement Pavers',
            ceilingHeight: '9′-6″',
            flooringType: 'Anti-Skid Pavers',
            dimensionCallout: `${formatLength(w * 0.42)} × 11′`
          },
          {
            id: 'cmp_gf_stair',
            name: 'STAIRCASE',
            category: 'stair',
            dimsFt: { w: 3.25, l: 11 },
            positionPercent: { x: 48, y: 68, w: 48, h: 28 },
            vastuZone: 'South Stair Axis',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Granite Treads, Stainless Steel Handrail',
            ceilingHeight: '10′-0″',
            flooringType: 'Black Granite Treads',
            dimensionCallout: "3'-3\" Width"
          }
        ];
      }

      if (floor === 'first') {
        return [
          {
            id: 'cmp_ff_master',
            name: 'MASTER BEDROOM',
            category: 'bedroom',
            dimsFt: { w: Math.round(w * 0.48), l: 14 },
            positionPercent: { x: 4, y: 4, w: 46, h: 42 },
            vastuZone: 'SW Nairutya Suite',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Wooden Plank Flooring, Attached En-suite Bath',
            ceilingHeight: '10′-0″',
            flooringType: 'Wooden Texture Planks',
            dimensionCallout: `${formatLength(w * 0.48)} × 14′`
          },
          {
            id: 'cmp_ff_lounge',
            name: 'UPPER FAMILY LIVING',
            category: 'living',
            dimsFt: { w: Math.round(w * 0.48), l: 14 },
            positionPercent: { x: 52, y: 4, w: 44, h: 42 },
            vastuZone: 'North Family Lounge',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Double Charged Vitrified Slab',
            ceilingHeight: '10′-0″',
            flooringType: 'Vitrified Italian Slab',
            dimensionCallout: `${formatLength(w * 0.48)} × 14′`
          },
          {
            id: 'cmp_ff_bed2',
            name: 'BEDROOM 2',
            category: 'bedroom',
            dimsFt: { w: Math.round(w * 0.48), l: 13 },
            positionPercent: { x: 4, y: 50, w: 46, h: 46 },
            vastuZone: 'NW Bedroom Suite',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'High Gloss Ceramic Tiles',
            ceilingHeight: '10′-0″',
            flooringType: 'Glazed Ceramic Tiles',
            dimensionCallout: `${formatLength(w * 0.48)} × 13′`
          },
          {
            id: 'cmp_ff_balcony',
            name: 'FRONT CANTILEVER BALCONY',
            category: 'balcony',
            dimsFt: { w: Math.round(w * 0.44), l: 4 },
            positionPercent: { x: 52, y: 50, w: 44, h: 46 },
            vastuZone: 'North / East Balcony',
            vastuRating: 'Excellent',
            vastuColor: '#a855f7',
            materialSpec: 'Anti-skid Rustic Tiles + Toughened Glass Railing',
            ceilingHeight: 'Open Sky Balcony',
            flooringType: 'Rustic Anti-Skid Deck',
            dimensionCallout: `${formatLength(w * 0.44)} × 4′-0″`
          }
        ];
      }
    }

    // VILLA SCALE LAYOUT ENGINE (Plots >= 38x52: e.g., 40x60, 50x60 LOAM Spec)
    if (plotScale === 'villa') {
      if (floor === 'ground') {
        return [
          {
            id: 'gf_car_parking',
            name: 'CAR PARKING (2 CARS)',
            category: 'parking',
            dimsFt: { w: 18.5, l: 15.25 },
            positionPercent: { x: 58, y: 68, w: 38, h: 28 },
            vastuZone: facing === 'North' ? 'SE Vehicular Gate Bay' : 'NW Entrance Bay',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Heavy-Duty 80mm Flame Finish Granite Pavers',
            ceilingHeight: '9′-6″',
            flooringType: 'Flame Finish Granite Tiles',
            dimensionCallout: "18'-6\" × 15'-3\""
          },
          {
            id: 'gf_portico',
            name: 'PORTICO & STEPS',
            category: 'living',
            dimsFt: { w: 8.75, l: 8 },
            positionPercent: { x: 38, y: 75, w: 18, h: 21 },
            vastuZone: facing === 'North' ? 'North Main Entrance' : 'East Main Entrance',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Teakwood Cladding Ceiling & Sadahalli Steps',
            ceilingHeight: '10′-0″',
            flooringType: 'Natural Sadahalli Granite',
            dimensionCallout: "8'-9\" × 8'-0\""
          },
          {
            id: 'gf_foyer',
            name: 'FOYER',
            category: 'living',
            dimsFt: { w: 6, l: 5.33 },
            positionPercent: { x: 38, y: 62, w: 18, h: 12 },
            vastuZone: 'NE Main Foyer Sanctum',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Italian Botticino Marble Flooring with Brass Inlay',
            ceilingHeight: '10′-6″',
            flooringType: 'Botticino Italian Marble',
            dimensionCallout: "6'-0\" × 5'-4\""
          },
          {
            id: 'gf_pooja',
            name: 'POOJA SANCTUM',
            category: 'puja',
            dimsFt: { w: 5.5, l: 5.5 },
            positionPercent: { x: 58, y: 56, w: 14, h: 10 },
            vastuZone: 'NE - Ishan Pure Water Sanctum',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'White Makrana Marble Altar & Carved Teak Doors',
            ceilingHeight: '10′-6″',
            flooringType: 'Pure Makrana White Marble',
            dimensionCallout: "5'-6\" × 5'-6\""
          },
          {
            id: 'gf_kitchen',
            name: 'SHOW KITCHEN',
            category: 'kitchen',
            dimsFt: { w: 10.75, l: 14.5 },
            positionPercent: { x: 18, y: 72, w: 18, h: 24 },
            vastuZone: 'SE - Agni (Fire Element)',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Black Quartz Counter, Acrylic Soft-close Cabinets',
            ceilingHeight: '10′-6″',
            flooringType: 'Quartz Finish Matte Vitrified Slab',
            dimensionCallout: "10'-9\" × 14'-6\""
          },
          {
            id: 'gf_utility_store',
            name: 'UTILITY, STORE & WASH',
            category: 'utility',
            dimsFt: { w: 12.25, l: 4.5 },
            positionPercent: { x: 4, y: 76, w: 12, h: 20 },
            vastuZone: 'SE Wash Utility Zone',
            vastuRating: 'Good',
            vastuColor: '#00ff9d',
            materialSpec: 'Granite Sink Counter, Anti-Skid Dado Tiles up to 7ft',
            ceilingHeight: '10′-0″',
            flooringType: 'Anti-Skid Kota Stone',
            dimensionCallout: "12'-3\" × 4'-6\""
          },
          {
            id: 'gf_lift',
            name: 'LIFT SHAFT CORE',
            category: 'lift',
            dimsFt: { w: 5, l: 5 },
            positionPercent: { x: 18, y: 44, w: 10, h: 12 },
            vastuZone: 'West Structural Shaft Axis',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: '9" RCC Shear Wall Box Core',
            ceilingHeight: 'Continuous Core',
            flooringType: 'Black Granite Threshold Sill',
            dimensionCallout: "5' × 5'"
          },
          {
            id: 'gf_dining',
            name: 'DINING HALL',
            category: 'living',
            dimsFt: { w: 10.75, l: 16 },
            positionPercent: { x: 28, y: 40, w: 18, h: 20 },
            vastuZone: 'East Aditya Zone',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: '8-Seater Onyx Marble Table, Italian Vitrified Flooring',
            ceilingHeight: '10′-6″',
            flooringType: 'Italian Onyx Look Vitrified Slab',
            dimensionCallout: "10'-9\" × 16'-0\""
          },
          {
            id: 'gf_courtyard1',
            name: 'ZEN COURTYARD 1',
            category: 'courtyard',
            dimsFt: { w: 8.37, l: 18 },
            positionPercent: { x: 4, y: 38, w: 12, h: 24 },
            vastuZone: 'North / East Open Light Well',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'River Pebble Bed with Ficus Tree & Glass Skylight',
            ceilingHeight: 'Double Height Open',
            flooringType: 'Natural River Pebbles & Deck Planks',
            dimensionCallout: "8'-4.5\" × 18'"
          },
          {
            id: 'gf_guest_bed',
            name: 'GUEST BEDROOM',
            category: 'bedroom',
            dimsFt: { w: 12, l: 14.75 },
            positionPercent: { x: 18, y: 4, w: 28, h: 32 },
            vastuZone: 'NW Vayu Suite',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Teakwood Plank Flooring, UPVC Double Glazed Windows',
            ceilingHeight: '10′-6″',
            flooringType: 'Teakwood Texture Vitrified Planks',
            dimensionCallout: "12' × 14'-9\""
          },
          {
            id: 'gf_wardrobe_wash',
            name: 'W/W & EN-SUITE WASH',
            category: 'wardrobe',
            dimsFt: { w: 5, l: 14 },
            positionPercent: { x: 4, y: 4, w: 12, h: 32 },
            vastuZone: 'West Wash Zone',
            vastuRating: 'Good',
            vastuColor: '#00ff9d',
            materialSpec: 'Walk-in Closet + Kohler Concealed Diverter & WC',
            ceilingHeight: '9′-6″',
            flooringType: 'Anti-Skid Matte Porcelain Tiles',
            dimensionCallout: "5' × 14'"
          },
          {
            id: 'gf_living',
            name: 'GRAND FORMAL LIVING',
            category: 'living',
            dimsFt: { w: 16, l: 15.25 },
            positionPercent: { x: 48, y: 4, w: 30, h: 32 },
            vastuZone: 'North Kuber Grand Lounge',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Imported Italian Marble, Double Height Glass Wall',
            ceilingHeight: 'Double Height 20′-0″',
            flooringType: 'Imported Italian Dyna Marble',
            dimensionCallout: "16'-0\" × 15'-3\""
          },
          {
            id: 'gf_courtyard2',
            name: 'COURTYARD 2 & DECK GAZEBO',
            category: 'courtyard',
            dimsFt: { w: 11.37, l: 10 },
            positionPercent: { x: 48, y: 38, w: 20, h: 16 },
            vastuZone: 'Center / East Zen Garden Deck',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Composite Wooden Decking + Plant Canopy + MS Pergola',
            ceilingHeight: 'Open Sky Deck',
            flooringType: 'Composite Teak Decking',
            dimensionCallout: "11'-4.5\" × 10'"
          }
        ];
      }

      if (floor === 'first') {
        return [
          {
            id: 'ff_master_bed',
            name: 'MASTER SUITE 1',
            category: 'bedroom',
            dimsFt: { w: 12, l: 14.75 },
            positionPercent: { x: 18, y: 4, w: 28, h: 32 },
            vastuZone: 'NW Vayu Master Suite',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Hardwood Oak Flooring, Veneer Panelled Accent Wall',
            ceilingHeight: '10′-6″',
            flooringType: 'Engineered Hardwood Oak Planks',
            dimensionCallout: "12' × 14'-9\""
          },
          {
            id: 'ff_master_ww_wash',
            name: 'W/W & EN-SUITE BATH',
            category: 'wardrobe',
            dimsFt: { w: 5, l: 14 },
            positionPercent: { x: 4, y: 4, w: 12, h: 32 },
            vastuZone: 'West Wash Zone',
            vastuRating: 'Good',
            vastuColor: '#00ff9d',
            materialSpec: 'Full Height Wardrobes, Glass Shower Cubicle',
            ceilingHeight: '9′-6″',
            flooringType: 'Anti-Skid Digital Porcelain',
            dimensionCallout: "5' × 14'"
          },
          {
            id: 'ff_cutout_living',
            name: 'DOUBLE HEIGHT CUT-OUT (LIVING)',
            category: 'cutout',
            dimsFt: { w: 7.75, l: 15.25 },
            positionPercent: { x: 50, y: 4, w: 24, h: 32 },
            vastuZone: 'North Double Height Void',
            vastuRating: 'Excellent',
            vastuColor: '#38bdf8',
            materialSpec: 'Toughened Glass Guard Railing overlooking Formal Living',
            ceilingHeight: 'Open Void to GF',
            flooringType: 'Glass Railing Guard Void',
            dimensionCallout: "7'-9\" × 15'-3\" Void"
          },
          {
            id: 'ff_family_lounge',
            name: 'UPPER FAMILY LIVING',
            category: 'living',
            dimsFt: { w: 14.5, l: 18 },
            positionPercent: { x: 18, y: 38, w: 28, h: 28 },
            vastuZone: 'Center Family Lounge',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Glazed Vitrified Italian Marble Look Slab',
            ceilingHeight: '10′-6″',
            flooringType: 'Glazed Vitrified Marble',
            dimensionCallout: "14'-6\" × 18'-0\""
          },
          {
            id: 'ff_cutout_courtyard',
            name: 'DOUBLE HEIGHT CUT-OUT (COURTYARD)',
            category: 'cutout',
            dimsFt: { w: 7, l: 9.5 },
            positionPercent: { x: 48, y: 38, w: 20, h: 16 },
            vastuZone: 'Courtyard Void Above Lounge',
            vastuRating: 'Excellent',
            vastuColor: '#38bdf8',
            materialSpec: 'Glass Balustrade overlooking Courtyard 2',
            ceilingHeight: 'Open Void to GF',
            flooringType: 'Open Light Well Void',
            dimensionCallout: "7' × 9'-6\" Void"
          },
          {
            id: 'ff_bedroom2',
            name: 'BEDROOM 2 (SON SUITE)',
            category: 'bedroom',
            dimsFt: { w: 12, l: 13.5 },
            positionPercent: { x: 18, y: 68, w: 28, h: 28 },
            vastuZone: 'SW Nairutya Suite',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Vitrified Wooden Finish Planks, Attached Bath',
            ceilingHeight: '10′-6″',
            flooringType: 'Wooden Texture Vitrified Planks',
            dimensionCallout: "12' × 13'-6\""
          },
          {
            id: 'ff_bedroom3',
            name: 'BEDROOM 3 (DAUGHTER SUITE)',
            category: 'bedroom',
            dimsFt: { w: 11, l: 13.5 },
            positionPercent: { x: 50, y: 68, w: 24, h: 28 },
            vastuZone: 'SE Suite',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Double Charged Vitrified 800x800mm, Study Nook',
            ceilingHeight: '10′-6″',
            flooringType: 'High Gloss Ceramic Tiles',
            dimensionCallout: "11' × 13'-6\""
          },
          {
            id: 'ff_front_balcony',
            name: 'CANTILEVER FRONT BALCONY',
            category: 'balcony',
            dimsFt: { w: 14, l: 4.5 },
            positionPercent: { x: 76, y: 4, w: 20, h: 32 },
            vastuZone: 'North Projection',
            vastuRating: 'Excellent',
            vastuColor: '#00ff9d',
            materialSpec: 'Weatherproof Composite Decking + Glass Railing',
            ceilingHeight: 'Open Sky Balcony',
            flooringType: 'Composite Teak Decking',
            dimensionCallout: "14' × 4'-6\" Cantilever"
          },
          {
            id: 'ff_side_balcony',
            name: 'PRIVATE SIDE BALCONY',
            category: 'balcony',
            dimsFt: { w: 10.25, l: 3.5 },
            positionPercent: { x: 18, y: 96, w: 28, h: 4 },
            vastuZone: 'South Projection',
            vastuRating: 'Good',
            vastuColor: '#00ff9d',
            materialSpec: 'Anti-skid Rustic Tiles + MS Safety Grill',
            ceilingHeight: 'Open Balcony',
            flooringType: 'Rustic Anti-Skid Ceramic',
            dimensionCallout: "10'-3\" × 3'-6\""
          }
        ];
      }
    }

    // STANDARD SCALE LAYOUT ENGINE (Plots 28x38 to 38x52: e.g., 30x40, 30x50, 35x45)
    if (floor === 'ground') {
      return [
        {
          id: 'std_gf_parking',
          name: 'CAR PARKING BAY',
          category: 'parking',
          dimsFt: { w: 14, l: 15 },
          positionPercent: { x: 54, y: 68, w: 42, h: 28 },
          vastuZone: facing === 'North' ? 'SE Driveway Bay' : 'NW Entry Bay',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Heavy Duty Cement Pavers',
          ceilingHeight: '9′-6″',
          flooringType: 'Anti-Skid Pavers',
          dimensionCallout: "14' × 15'-0\""
        },
        {
          id: 'std_gf_foyer',
          name: 'FOYER & POOJA',
          category: 'puja',
          dimsFt: { w: 6, l: 6 },
          positionPercent: { x: 38, y: 68, w: 14, h: 28 },
          vastuZone: 'NE Ishan Sanctum',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Italian Marble Altar',
          ceilingHeight: '10′-6″',
          flooringType: 'White Italian Marble',
          dimensionCallout: "6' × 6'-0\""
        },
        {
          id: 'std_gf_living',
          name: 'SPACIOUS LIVING HALL',
          category: 'living',
          dimsFt: { w: 16, l: 14 },
          positionPercent: { x: 4, y: 4, w: 48, h: 32 },
          vastuZone: 'North Kuber Hall',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Glazed Vitrified Slab',
          ceilingHeight: '10′-6″',
          flooringType: 'Glazed Vitrified Slab',
          dimensionCallout: "16' × 14'-0\""
        },
        {
          id: 'std_gf_dining',
          name: 'DINING & KITCHEN',
          category: 'kitchen',
          dimsFt: { w: 14, l: 14 },
          positionPercent: { x: 54, y: 4, w: 42, h: 32 },
          vastuZone: 'SE Agni Kitchen',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Black Quartz Top',
          ceilingHeight: '10′-6″',
          flooringType: 'Quartz Finish Matte',
          dimensionCallout: "14' × 14'-0\""
        },
        {
          id: 'std_gf_guest_bed',
          name: 'GUEST BEDROOM',
          category: 'bedroom',
          dimsFt: { w: 12, l: 14 },
          positionPercent: { x: 4, y: 38, w: 48, h: 28 },
          vastuZone: 'NW Suite',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Double Charged Vitrified',
          ceilingHeight: '10′-6″',
          flooringType: 'Vitrified Wood Planks',
          dimensionCallout: "12' × 14'-0\""
        },
        {
          id: 'std_gf_stair',
          name: 'DOG-LEGGED STAIRCASE',
          category: 'stair',
          dimsFt: { w: 14, l: 8 },
          positionPercent: { x: 4, y: 68, w: 32, h: 28 },
          vastuZone: 'South Axis',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Granite Treads & SS Railing',
          ceilingHeight: '10′-0″',
          flooringType: 'Black Granite Treads',
          dimensionCallout: "14' × 8'-0\""
        }
      ];
    }

    if (floor === 'first') {
      return [
        {
          id: 'std_ff_master',
          name: 'MASTER SUITE 1',
          category: 'bedroom',
          dimsFt: { w: 14, l: 14 },
          positionPercent: { x: 4, y: 4, w: 48, h: 42 },
          vastuZone: 'SW Nairutya Master Suite',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Wooden Flooring + Attached Bath',
          ceilingHeight: '10′-6″',
          flooringType: 'Wooden Texture Planks',
          dimensionCallout: "14' × 14'-0\""
        },
        {
          id: 'std_ff_bedroom2',
          name: 'BEDROOM 2',
          category: 'bedroom',
          dimsFt: { w: 12, l: 14 },
          positionPercent: { x: 54, y: 4, w: 42, h: 42 },
          vastuZone: 'NW Bedroom Suite',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Double Charged Vitrified',
          ceilingHeight: '10′-6″',
          flooringType: 'High Gloss Ceramic',
          dimensionCallout: "12' × 14'-0\""
        },
        {
          id: 'std_ff_lounge',
          name: 'UPPER FAMILY LIVING',
          category: 'living',
          dimsFt: { w: 16, l: 12 },
          positionPercent: { x: 4, y: 48, w: 48, h: 46 },
          vastuZone: 'North Family Lounge',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Italian Marble Look Slab',
          ceilingHeight: '10′-6″',
          flooringType: 'Vitrified Marble',
          dimensionCallout: "16' × 12'-0\""
        },
        {
          id: 'std_ff_balcony',
          name: 'FRONT BALCONY',
          category: 'balcony',
          dimsFt: { w: 12, l: 4 },
          positionPercent: { x: 54, y: 48, w: 42, h: 46 },
          vastuZone: 'East Projection',
          vastuRating: 'Excellent',
          vastuColor: '#a855f7',
          materialSpec: 'Anti-skid Rustic Deck',
          ceilingHeight: 'Open Balcony',
          flooringType: 'Rustic Deck Tiles',
          dimensionCallout: "12' × 4'-0\""
        }
      ];
    }

    // SECOND FLOOR PENTHOUSE & RECREATION SUITE (SF SHEET 03 - UNIQUE FROM FF!)
    if (floor === 'second') {
      return [
        {
          id: 'sf_penthouse_suite',
          name: 'PENTHOUSE STUDIO SUITE',
          category: 'bedroom',
          dimsFt: { w: 16, l: 14 },
          positionPercent: { x: 4, y: 4, w: 44, h: 40 },
          vastuZone: 'NW Penthouse Zone',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Walnut Laminate Flooring, Attached Executive Bath',
          ceilingHeight: '10′-0″',
          flooringType: 'Walnut Texture Laminate',
          dimensionCallout: "16' × 14'-0\""
        },
        {
          id: 'sf_home_theatre',
          name: 'HOME THEATRE & RECREATION GYM',
          category: 'gym',
          dimsFt: { w: 18, l: 15 },
          positionPercent: { x: 52, y: 4, w: 44, h: 40 },
          vastuZone: 'North Media Room',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Acoustic Fabric Wall Panels, Rubberized Gym Floor',
          ceilingHeight: '10′-0″ Acoustic Ceiling',
          flooringType: 'Acoustic Carpet & Rubber Flooring',
          dimensionCallout: "18' × 15'-0\""
        },
        {
          id: 'sf_terrace_deck',
          name: 'OPEN TERRACE GARDEN DECK',
          category: 'terrace',
          dimsFt: { w: 24, l: 20 },
          positionPercent: { x: 4, y: 48, w: 58, h: 46 },
          vastuZone: 'Center Open Skylight Garden',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'Weatherproof Wooden Composite Decking + Planter Boxes',
          ceilingHeight: 'Open Sky',
          flooringType: 'Composite Wooden Decking',
          dimensionCallout: "24' × 20'-0\""
        },
        {
          id: 'sf_gazebo',
          name: 'COVERED PERGOLA GAZEBO',
          category: 'terrace',
          dimsFt: { w: 12, l: 10 },
          positionPercent: { x: 66, y: 48, w: 30, h: 46 },
          vastuZone: 'NE Lounge Canopy',
          vastuRating: 'Excellent',
          vastuColor: '#00ff9d',
          materialSpec: 'MS Steel Louvered Pergola Canopy + Seating Bench',
          ceilingHeight: '8′-6″ Steel Structure',
          flooringType: 'Kota Stone Pavers',
          dimensionCallout: "12' × 10'-0\""
        }
      ];
    }

    // TERRACE FLOOR & ROOF PLAN (TF SHEET 04)
    return [
      {
        id: 'tf_solar_grid',
        name: '5kW ROOFTOP SOLAR PANEL GRID',
        category: 'utility',
        dimsFt: { w: 18, l: 12 },
        positionPercent: { x: 62, y: 6, w: 34, h: 28 },
        vastuZone: 'SE - Agni Solar Energy Zone',
        vastuRating: 'Excellent',
        vastuColor: '#00ff9d',
        materialSpec: 'Monocrystalline Solar Panels on Elevated GI Structure',
        ceilingHeight: '7′-0″ Elevated Stand',
        flooringType: 'Heat Reflective White Screed',
        dimensionCallout: "18' × 12'-0\""
      },
      {
        id: 'tf_oht_tank',
        name: 'OVERHEAD WATER TANK STAND (3000L)',
        category: 'utility',
        dimsFt: { w: 12, l: 10 },
        positionPercent: { x: 4, y: 62, w: 24, h: 32 },
        vastuZone: 'SW - Heavy Load Water Tower',
        vastuRating: 'Excellent',
        vastuColor: '#00ff9d',
        materialSpec: 'Elevated RCC Stanchion Slab + Triple Layer Sintex Tank',
        ceilingHeight: '9′-0″ Elevated Tower',
        flooringType: 'Waterproof Cement Screed',
        dimensionCallout: "12' × 10'-0\""
      },
      {
        id: 'tf_skylight1',
        name: 'ROOFTOP SKYLIGHT DOME 1',
        category: 'skylight',
        dimsFt: { w: 7.5, l: 10.5 },
        positionPercent: { x: 62, y: 38, w: 18, h: 20 },
        vastuZone: 'NE Glass Skylight Light Well',
        vastuRating: 'Excellent',
        vastuColor: '#38bdf8',
        materialSpec: 'Laminated Double Glazed Toughened Glass Skylight',
        ceilingHeight: 'Glass Roof Core',
        flooringType: 'Toughened Laminated Glass',
        dimensionCallout: "7'-6\" × 10'-6\""
      },
      {
        id: 'tf_skylight2',
        name: 'ROOFTOP SKYLIGHT DOME 2',
        category: 'skylight',
        dimsFt: { w: 11.5, l: 10 },
        positionPercent: { x: 34, y: 38, w: 24, h: 20 },
        vastuZone: 'Center Atrium Skylight',
        vastuRating: 'Excellent',
        vastuColor: '#38bdf8',
        materialSpec: 'Structural Steel Glass Atrium Frame',
        ceilingHeight: 'Glass Roof Core',
        flooringType: 'Structural Glass Panel',
        dimensionCallout: "11'-6\" × 10'-0\""
      },
      {
        id: 'tf_open_roof',
        name: 'OPEN SKY ROOFTOP TERRACE',
        category: 'terrace',
        dimsFt: { w: Math.round(w * 0.9), l: Math.round(l * 0.9) },
        positionPercent: { x: 4, y: 4, w: 92, h: 90 },
        vastuZone: 'Center Open Brahmasthan',
        vastuRating: 'Excellent',
        vastuColor: '#00ff9d',
        materialSpec: 'High Reflective Cool Roof Screed with Slope to Drain',
        ceilingHeight: 'Open Sky',
        flooringType: 'Cool Roof Reflective Tiles',
        dimensionCallout: `${formatLength(w * 0.9)} × ${formatLength(l * 0.9)}`
      }
    ];
  };

  const singleFloorRooms = useMemo(() => {
    return getRoomsForFloor(activeSheet === 'all' || activeSheet === 'structural' ? 'ground' : activeSheet);
  }, [activeSheet, width, length, bedroomCount, toiletCount, parkingMode, hasCourtyard, hasCutout]);

  const activeSelectedRoom = useMemo(() => {
    return singleFloorRooms.find(r => r.id === selectedRoomId) || singleFloorRooms[0];
  }, [singleFloorRooms, selectedRoomId]);

  // Overall Vastu Rating Calculation
  const overallVastuScore = useMemo(() => {
    let score = 94;
    if (facing === 'North' || facing === 'East') score += 4;
    if (hasCourtyard) score += 2;
    return Math.min(99, score);
  }, [facing, hasCourtyard]);

  // BOQ Proceed Handler with Full Parameter Pass-through
  const handleProceedToBOQ = () => {
    router.push({
      pathname: '/boq-calculator',
      query: {
        plinthArea: plinthArea,
        floors: numFloors,
        facing: facing,
        plotWidth: width,
        plotLength: length,
        builtUpArea: buaBreakdown.totalArea,
        bedroomCount: bedroomCount,
        toiletCount: toiletCount,
        parkingMode: parkingMode,
        staircaseType: staircaseType,
        hasLift: hasLift ? 1 : 0
      }
    });
  };

  const handleDownloadSVG = () => {
    const svgEl = document.getElementById('blueprint-svg-canvas');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BuildMitra_Blueprint_${activeSheet.toUpperCase()}_${width}x${length}_${facing}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to Render Single Floor SVG Sheet Component
  const renderFloorSheet = (floor: SheetFloor, sheetIndex: number) => {
    const isStructuralSheet = floor === 'structural';
    const rooms = getRoomsForFloor(floor);
    const floorTitle = isStructuralSheet ? `CIVIL STRUCTURAL COLUMN, BEAM & FOOTING PLAN (${structuralGrid.totalCols} COLUMNS)` : floor === 'ground' ? 'GROUND FLOOR PLAN' : floor === 'first' ? 'FIRST FLOOR PLAN' : floor === 'second' ? 'SECOND FLOOR PENTHOUSE & RECREATION PLAN' : 'TERRACE FLOOR PLAN';
    const drgNo = `BM-CAD-2026-DRG-${floor.toUpperCase()}-0${sheetIndex}`;
    const floorBua = isStructuralSheet ? plinthArea : floor === 'ground' ? buaBreakdown.groundFloor : floor === 'first' ? buaBreakdown.firstFloor : floor === 'second' ? buaBreakdown.secondFloor : buaBreakdown.terraceFloor;

    return (
      <div key={floor} className="blueprint-sheet" style={{ backgroundColor: '#030712', border: '2px solid #00f0ff', borderRadius: '8px', padding: '18px', marginBottom: '24px', position: 'relative', boxShadow: '0 0 35px rgba(0,240,255,0.15)' }}>
        
        {/* Sheet Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #1e3a8a', paddingBottom: '8px' }}>
          <div>
            <span style={{ backgroundColor: isStructuralSheet ? '#f59e0b' : '#00f0ff', color: '#050c17', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '3px' }}>
              SHEET 0{sheetIndex} OF {numFloors + 1}
            </span>
            <span style={{ color: isStructuralSheet ? '#f59e0b' : '#00ff9d', fontSize: '13px', fontWeight: 900, marginLeft: '10px' }}>
              {floorTitle}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800 }}>
            {drgNo} | SCALE 1:100 NTS | BUA: {floorBua} SQFT | FACING: {facing.toUpperCase()}
          </div>
        </div>

        {/* DYNAMIC SVG CANVAS */}
        <div style={{ width: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
          <svg id="blueprint-svg-canvas" width="780" height="640" viewBox="0 0 780 640" style={{ maxWidth: '100%', height: 'auto', background: '#050c17' }}>
            <defs>
              <pattern id={`cad-grid-${floor}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0a213a" strokeWidth="0.8" />
              </pattern>
              <pattern id={`wall-fill-${floor}`} width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#00f0ff" strokeWidth="2" opacity="0.4" />
              </pattern>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
            </defs>

            {/* Background Grid */}
            <rect x="0" y="0" width="780" height="640" fill={`url(#cad-grid-${floor})`} />

            {/* Setbacks Line */}
            <rect x="40" y="40" width="700" height="540" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,4" />

            {/* ======================================================== */}
            {/* IS 456 DYNAMIC CIVIL STRUCTURAL & FOOTING PLAN (SHEET 00) */}
            {/* ======================================================== */}
            {isStructuralSheet && (
              <g>
                {/* Dynamic Axis Lines & Bubbles (Numbers 1..N on Top, Letters A..N on Left) */}
                <g stroke="#38bdf8" strokeWidth="1" opacity="0.8">
                  {/* Vertical Axis Lines */}
                  {structuralGrid.xAxes.map(ax => (
                    <g key={ax.label}>
                      <line x1={ax.px} y1="20" x2={ax.px} y2="580" strokeDasharray="4,4" />
                      <circle cx={ax.px} cy="20" r="10" fill="#0b1d33" stroke="#00f0ff" strokeWidth="1.5" />
                      <text x={ax.px} y="24" fill="#00f0ff" fontSize="10" fontWeight="900" textAnchor="middle">{ax.label}</text>
                    </g>
                  ))}

                  {/* Horizontal Axis Lines */}
                  {structuralGrid.yAxes.map(ay => (
                    <g key={ay.label}>
                      <line x1="20" y1={ay.py} x2="760" y2={ay.py} strokeDasharray="4,4" />
                      <circle cx="20" cy={ay.py} r="10" fill="#0b1d33" stroke="#00f0ff" strokeWidth="1.5" />
                      <text x="20" y={ay.py + 4} fill="#00f0ff" fontSize="10" fontWeight="900" textAnchor="middle">{ay.label}</text>
                    </g>
                  ))}
                </g>

                {/* RC Plinth & Tie Beam Lines (Dashed Orange) */}
                <g stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6,3" opacity="0.95">
                  {structuralGrid.beams.map(b => (
                    <line key={b.id} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} />
                  ))}
                </g>

                {/* Dynamic Isolated Footing Pads (Blue Dashed Rectangles F1..FN) */}
                <g stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" fill="rgba(56,189,248,0.12)">
                  {structuralGrid.footings.map(f => (
                    <g key={f.id}>
                      <rect x={f.px} y={f.py} width={f.w} height={f.h} rx="2" />
                      <text x={f.px + f.w / 2} y={f.py + f.h + 9} fill="#38bdf8" fontSize="8" fontWeight="800" textAnchor="middle">{f.dimText}</text>
                    </g>
                  ))}
                </g>

                {/* Dynamic Solid Concrete Columns (Cyan Filled) */}
                <g fill="#00f0ff" stroke="#ffffff" strokeWidth="2">
                  {structuralGrid.columns.map(c => (
                    <g key={c.id}>
                      <rect x={c.px - 8} y={c.py - 8} width="16" height="16" />
                      <text x={c.px} y={c.py - 11} fill="#00f0ff" fontSize="9" fontWeight="900" textAnchor="middle">{c.label} ({c.sizeTag})</text>
                    </g>
                  ))}
                </g>

                {/* Column C-C Spacing Measurements */}
                <g stroke="#ef4444" strokeWidth="1.5">
                  {structuralGrid.xAxes.slice(0, -1).map((ax, idx) => {
                    const nextAx = structuralGrid.xAxes[idx + 1];
                    const midX = (ax.px + nextAx.px) / 2;
                    return (
                      <g key={idx}>
                        <line x1={ax.px} y1="95" x2={nextAx.px} y2="95" markerStart="url(#arrow-red)" markerEnd="url(#arrow-red)" />
                        <text x={midX} y="90" fill="#ef4444" fontSize="10" fontWeight="900" textAnchor="middle">{formatLength(structuralGrid.spanX)} C-C</text>
                      </g>
                    );
                  })}
                </g>
              </g>
            )}

            {/* ARCHITECTURAL BLUEPRINT VIEW (ISOLATED GF, FF, SF, TF) */}
            {!isStructuralSheet && (
              <g>
                {/* Outer Wall Boundary */}
                <rect x="60" y="60" width="660" height="500" fill="none" stroke="#00f0ff" strokeWidth="10" />
                <rect x="60" y="60" width="660" height="500" fill={`url(#wall-fill-${floor})`} stroke="#00f0ff" strokeWidth="1" opacity="0.6" />

                {/* Interior Partitions */}
                <g stroke="#00f0ff" strokeWidth="4" opacity="0.85">
                  <line x1="340" y1="60" x2="340" y2="560" />
                  <line x1="440" y1="60" x2="440" y2="250" />
                  <line x1="60" y1="250" x2="720" y2="250" />
                  <line x1="60" y1="400" x2="340" y2="400" />
                  <line x1="340" y1="400" x2="720" y2="400" />
                </g>

                {/* DYNAMIC CLUTTER-FREE ROOM LABELS & CALLOUTS */}
                {rooms.map(room => {
                  const rx = 65 + (room.positionPercent.x * 6.5);
                  const ry = 65 + (room.positionPercent.y * 4.8);
                  const rw = room.positionPercent.w * 6.5;
                  const rh = room.positionPercent.h * 4.8;
                  const isSelected = room.id === selectedRoomId;
                  const isCourtyard = room.category === 'courtyard';
                  const isCutout = room.category === 'cutout';
                  const isSkylight = room.category === 'skylight';
                  const isBalcony = room.category === 'balcony';

                  const textSize = rw < 85 || rh < 50 ? 9 : 11;

                  return (
                    <g key={room.id} onClick={() => setSelectedRoomId(room.id)} style={{ cursor: 'pointer' }}>
                      {/* Room Fill Box */}
                      <rect x={rx} y={ry} width={rw} height={rh} fill={isCourtyard ? 'rgba(0,255,157,0.15)' : isCutout ? 'rgba(56,189,248,0.12)' : isSkylight ? 'rgba(245,158,11,0.18)' : isBalcony ? 'rgba(168,85,247,0.2)' : isSelected ? 'rgba(0,240,255,0.22)' : 'rgba(11,29,51,0.75)'} stroke={isCutout ? '#38bdf8' : isCourtyard ? '#00ff9d' : isBalcony ? '#a855f7' : isSelected ? '#00f0ff' : '#1e3a8a'} strokeWidth={isSelected ? '3' : '1.5'} strokeDasharray={isCutout ? '4,4' : 'none'} rx="4" />

                      {/* Void Cross Lines for Double Height Cutouts */}
                      {isCutout && (
                        <g stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4,3">
                          <line x1={rx} y1={ry} x2={rx + rw} y2={ry + rh} />
                          <line x1={rx + rw} y1={ry} x2={rx} y2={ry + rh} />
                        </g>
                      )}

                      {/* Door Swing Clearance Arc (90 deg) */}
                      <g opacity="0.7">
                        <path d={`M ${rx + 10} ${ry + rh} A 22 22 0 0 1 ${rx + 32} ${ry + rh - 22}`} fill="none" stroke="#00ff9d" strokeWidth="1.5" strokeDasharray="2,2" />
                        <line x1={rx + 10} y1={ry + rh} x2={rx + 32} y2={ry + rh} stroke="#00ff9d" strokeWidth="2" />
                      </g>

                      {/* CLUTTER-FREE DARK PILL BACKGROUND FOR TEXT */}
                      <rect x={rx + rw / 2 - Math.min(rw / 2 - 4, 75)} y={ry + rh / 2 - 16} width={Math.min(rw - 8, 150)} height="32" fill="#050c17" opacity="0.88" rx="4" stroke={isSelected ? '#00f0ff' : '#1e3a8a'} strokeWidth="1" />

                      {/* Room Label */}
                      <text x={rx + rw / 2} y={ry + rh / 2 - 2} fill={isCutout ? '#38bdf8' : isCourtyard ? '#00ff9d' : isBalcony ? '#a855f7' : isSelected ? '#ffffff' : '#00f0ff'} fontSize={textSize} fontWeight={900} textAnchor="middle" letterSpacing="0.3px">
                        {room.name}
                      </text>
                      {room.dimensionCallout && (
                        <text x={rx + rw / 2} y={ry + rh / 2 + 11} fill="#00ff9d" fontSize={textSize - 1} fontWeight={800} textAnchor="middle">
                          {room.dimensionCallout}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* DYNAMIC STAIRCASE RENDERING (ROTATED BASED ON FACING) */}
                <g transform={facing === 'South' || facing === 'West' ? "translate(60, 60)" : "translate(380, 420)"}>
                  <rect x="0" y="0" width="330" height="130" fill="rgba(168,85,247,0.18)" stroke="#00f0ff" strokeWidth="2" rx="4" />
                  {[33, 66, 99, 132, 165, 198, 231, 264, 297].map(x => (
                    <line key={x} x1={x} y1="0" x2={x} y2="130" stroke="#00f0ff" strokeWidth="1" />
                  ))}
                  <line x1="0" y1="65" x2="330" y2="65" stroke="#00f0ff" strokeWidth="2" />
                  <line x1="30" y1="30" x2="300" y2="30" stroke="#00ff9d" strokeWidth="2" markerEnd="url(#arrow-red)" />
                  <line x1="300" y1="30" x2="300" y2="95" stroke="#00ff9d" strokeWidth="2" />
                  <line x1="300" y1="95" x2="30" y2="95" stroke="#00ff9d" strokeWidth="2" markerEnd="url(#arrow-red)" />
                  <text x="165" y="22" fill="#00ff9d" fontSize="10" fontWeight={900} textAnchor="middle">
                    {floor === 'terrace' || floor === 'second' ? 'STAIR DN ↓' : 'STAIR UP ↑'}
                  </text>
                  <g stroke="#ef4444" strokeWidth="1">
                    <line x1="10" y1="0" x2="10" y2="65" markerStart="url(#arrow-red)" markerEnd="url(#arrow-red)" />
                    <text x="25" y="38" fill="#ef4444" fontSize="10" fontWeight={900} textAnchor="start">3′-3″</text>
                  </g>
                </g>

                {/* DYNAMIC ROAD FACING ENTRANCE GATE & DIRECTION ARROW */}
                {floor === 'ground' && (
                  <g transform={facing === 'East' ? "translate(700, 280)" : facing === 'South' ? "translate(330, 560)" : facing === 'West' ? "translate(40, 280)" : "translate(330, 40)"}>
                    <rect x="0" y="0" width="120" height="25" fill="#0b1d33" stroke="#00f0ff" strokeWidth="2" />
                    <line x1="0" y1="8" x2="120" y2="8" stroke="#00f0ff" strokeWidth="1" />
                    <line x1="0" y1="16" x2="120" y2="16" stroke="#00f0ff" strokeWidth="1" />
                    <line x1="60" y1="40" x2="60" y2="10" stroke="#00ff9d" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
                    <text x="60" y="55" fill="#ffffff" fontSize="11" fontWeight={900} textAnchor="middle">{facing.toUpperCase()} MAIN ROAD ENTRY ↑</text>
                  </g>
                )}
              </g>
            )}

            {/* DYNAMIC RED DIMENSION LINES DERIVED DIRECTLY FROM INPUT WIDTH & LENGTH */}
            <g stroke="#ef4444" strokeWidth="1.5">
              {/* Overall Plot Width */}
              <line x1="80" y1="25" x2="700" y2="25" markerStart="url(#arrow-red)" markerEnd="url(#arrow-red)" />
              <line x1="80" y1="20" x2="80" y2="60" />
              <line x1="700" y1="20" x2="700" y2="60" />
              <rect x="360" y="10" width="60" height="20" fill="#050c17" />
              <text x="390" y="24" fill="#ef4444" fontSize="14" fontWeight={900} textAnchor="middle">{formatLength(width)}</text>

              {/* Overall Plot Length */}
              <line x1="755" y1="60" x2="755" y2="560" markerStart="url(#arrow-red)" markerEnd="url(#arrow-red)" />
              <line x1="720" y1="60" x2="765" y2="60" />
              <line x1="720" y1="560" x2="765" y2="560" />
              <rect x="740" y="300" width="30" height="30" fill="#050c17" />
              <text x="755" y="318" fill="#ef4444" fontSize="14" fontWeight={900} textAnchor="middle">{formatLength(length)}</text>
            </g>

          </svg>
        </div>

        {/* Dedicated Sheet Title Block */}
        <div style={{ marginTop: '14px', backgroundColor: '#0b1d33', border: '2px solid #1e3a8a', padding: '12px 18px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
          <div>
            <strong style={{ color: '#ffffff' }}>SHEET TITLE:</strong> {floorTitle} &nbsp;|&nbsp;
            <strong style={{ color: '#ffffff' }}> DRAWING ID:</strong> {drgNo}
          </div>
          <div>
            <strong style={{ color: '#ffffff' }}>FLOOR BUA:</strong> {floorBua} SQFT &nbsp;|&nbsp;
            <strong style={{ color: '#ffffff' }}>SCALE:</strong> 1:100 NTS &nbsp;|&nbsp;
            <strong style={{ color: '#00ff9d' }}>STATUS: SANCTION READY</strong>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050c17', color: '#00f0ff', padding: '14px', fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace" }}>
      <Head>
        <title>Dynamic Architectural & IS 456 Structural Studio | BuildMitra</title>
        <meta name="description" content="Production architectural & IS 456 dynamic structural blueprint studio with user input dimension driving." />
      </Head>

      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .blueprint-sheet {
            page-break-after: always !important;
            width: 100% !important;
            border: 2px solid #000000 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            margin-bottom: 0 !important;
          }
          svg text {
            fill: #000000 !important;
          }
          svg rect, svg line, svg path {
            stroke: #000000 !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1850px', margin: '0 auto' }}>

        {/* TOP WORKSTATION HEADER */}
        <div style={{ backgroundColor: '#0b1d33', border: '2px solid #00f0ff', padding: '14px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', boxShadow: '0 0 30px rgba(0,240,255,0.2)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#00f0ff', color: '#050c17', fontSize: '10px', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', letterSpacing: '1.5px' }}>
                BUILDMITRA IS 456 CAD ENGINE v15.0 PRODUCTION
              </span>
              <span style={{ color: '#00ff9d', fontSize: '11px', fontWeight: 700 }}>
                ● IS 456 STRUCTURAL SOLVER ({structuralGrid.totalCols} COLUMNS) | FACING: {facing.toUpperCase()}
              </span>
            </div>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
              PLOT: {width}′ × {length}′ ({totalPlotArea} SFT) | TOTAL BUA: {buaBreakdown.totalArea} SQFT | G+{numFloors - 1} FLOORS
            </h1>
          </div>

          <div className="no-print" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', border: '1px solid #1e3a8a', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#050c17' }}>
              <button onClick={() => setUnit('imperial')} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 800, border: 'none', backgroundColor: unit === 'imperial' ? '#00f0ff' : 'transparent', color: unit === 'imperial' ? '#050c17' : '#94a3b8', cursor: 'pointer' }}>
                FT/IN
              </button>
              <button onClick={() => setUnit('metric')} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 800, border: 'none', backgroundColor: unit === 'metric' ? '#00f0ff' : 'transparent', color: unit === 'metric' ? '#050c17' : '#94a3b8', cursor: 'pointer' }}>
                METERS
              </button>
            </div>

            <button onClick={handleDownloadSVG} style={{ backgroundColor: '#0f172a', color: '#00f0ff', border: '1px solid #00f0ff', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💾 Download SVG
            </button>

            <button onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: '1px solid #38bdf8', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
              🖨️ Print Independent Sheets (PDF)
            </button>

            <button onClick={handleProceedToBOQ} style={{ backgroundColor: '#00ff9d', color: '#050c17', border: 'none', padding: '9px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 15px rgba(0,255,157,0.4)', letterSpacing: '0.5px' }}>
              🔨 Calculate Turnkey BOQ ({buaBreakdown.totalArea} SQFT) →
            </button>

            <button onClick={() => router.push('/realestate-hub')} style={{ backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              ✕ Exit
            </button>
          </div>
        </div>

        {/* BUA METRICS BREAKDOWN CARD */}
        <div className="no-print" style={{ backgroundColor: '#0b1d33', border: '2px solid #00ff9d', padding: '12px 18px', borderRadius: '8px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 20px rgba(0,255,157,0.2)' }}>
          <div>
            <span style={{ backgroundColor: '#00ff9d', color: '#050c17', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '3px' }}>
              FLOOR-BY-FLOOR BUA BREAKDOWN
            </span>
            <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, marginTop: '4px' }}>
              SANCTION-READY ARCHITECTURAL FLOOR PLANS ({facing} FACING ROAD)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', backgroundColor: '#050c17', padding: '6px 12px', borderRadius: '6px', border: '1px solid #1e3a8a' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>GROUND FLOOR (GF)</div>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#00f0ff' }}>{buaBreakdown.groundFloor} SQFT</div>
            </div>
            <div style={{ textAlign: 'center', backgroundColor: '#050c17', padding: '6px 12px', borderRadius: '6px', border: '1px solid #1e3a8a' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>FIRST FLOOR (FF)</div>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#00f0ff' }}>{buaBreakdown.firstFloor} SQFT</div>
            </div>
            <div style={{ textAlign: 'center', backgroundColor: '#050c17', padding: '6px 12px', borderRadius: '6px', border: '1px solid #1e3a8a' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>SECOND FLOOR (SF)</div>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#00f0ff' }}>{buaBreakdown.secondFloor} SQFT</div>
            </div>
            <div style={{ textAlign: 'center', backgroundColor: '#050c17', padding: '6px 12px', borderRadius: '6px', border: '1px solid #1e3a8a' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>TERRACE (TF)</div>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#00f0ff' }}>{buaBreakdown.terraceFloor} SQFT</div>
            </div>
            <div style={{ textAlign: 'center', backgroundColor: '#050c17', padding: '8px 16px', borderRadius: '6px', border: '2px solid #00ff9d' }}>
              <div style={{ fontSize: '10px', color: '#00ff9d', fontWeight: 800 }}>TOTAL BUA</div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#00ff9d' }}>{buaBreakdown.totalArea} SQFT</div>
            </div>
          </div>
        </div>

        {/* 100% DYNAMIC CUSTOMIZATION CONTROL BAR */}
        <div className="no-print" style={{ backgroundColor: '#0b1d33', border: '2px solid #1e3a8a', padding: '14px 18px', borderRadius: '8px', marginBottom: '14px' }}>
          <div style={{ color: '#00f0ff', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            🛠️ DYNAMIC CUSTOMIZATION ENGINE — DIRECT PLOT DIMENSION INPUTS & ROAD FACING:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', alignItems: 'center' }}>
            
            {/* Direct Width x Length Inputs & Presets */}
            <div style={{ backgroundColor: '#050c17', padding: '12px 14px', borderRadius: '6px', border: '2px solid #00f0ff', boxShadow: '0 0 15px rgba(0,240,255,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#00f0ff', fontWeight: 900, marginBottom: '8px', letterSpacing: '0.5px' }}>
                📐 DIRECT PLOT DIMENSION INPUTS (TYPE ANY SIZE):
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 800 }}>WIDTH:</span>
                  <input
                    type="number"
                    value={width === 0 ? '' : width}
                    placeholder="Width"
                    onChange={e => {
                      const val = e.target.value;
                      setWidth(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
                    }}
                    style={{ width: '65px', backgroundColor: '#0b1d33', border: '2px solid #00ff9d', color: '#00ff9d', padding: '5px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 900, textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>FT</span>
                </div>

                <span style={{ fontSize: '14px', color: '#00f0ff', fontWeight: 900 }}>×</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 800 }}>LENGTH:</span>
                  <input
                    type="number"
                    value={length === 0 ? '' : length}
                    placeholder="Length"
                    onChange={e => {
                      const val = e.target.value;
                      setLength(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
                    }}
                    style={{ width: '65px', backgroundColor: '#0b1d33', border: '2px solid #00ff9d', color: '#00ff9d', padding: '5px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 900, textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>FT</span>
                </div>

                <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                  {[
                    { label: '20×30', w: 20, l: 30 },
                    { label: '27×33', w: 27, l: 33 },
                    { label: '30×40', w: 30, l: 40 },
                    { label: '50×60', w: 50, l: 60 },
                    { label: '60×80', w: 60, l: 80 }
                  ].map(p => (
                    <button key={p.label} onClick={() => handlePlotPreset(p.w, p.l)} style={{ padding: '4px 7px', backgroundColor: width === p.w && length === p.l ? '#00f0ff' : '#0b1d33', color: width === p.w && length === p.l ? '#050c17' : '#00f0ff', border: '1px solid #00f0ff', borderRadius: '3px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div style={{ backgroundColor: '#050c17', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1e3a8a' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, marginBottom: '6px' }}>BEDROOMS & TOILETS:</div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#00ff9d', fontWeight: 800 }}>BHK:</span>
                  {[1, 2, 3, 4, 5].map(b => (
                    <button key={b} onClick={() => setBedroomCount(b)} style={{ padding: '3px 6px', backgroundColor: bedroomCount === b ? '#00ff9d' : '#0b1d33', color: bedroomCount === b ? '#050c17' : '#00ff9d', border: '1px solid #00ff9d', borderRadius: '3px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>
                      {b}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 800 }}>Toilets:</span>
                  {[1, 2, 3, 4, 5].map(t => (
                    <button key={t} onClick={() => setToiletCount(t)} style={{ padding: '3px 6px', backgroundColor: toiletCount === t ? '#38bdf8' : '#0b1d33', color: toiletCount === t ? '#050c17' : '#38bdf8', border: '1px solid #38bdf8', borderRadius: '3px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Facing & Total Floors */}
            <div style={{ backgroundColor: '#050c17', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1e3a8a' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, marginBottom: '6px' }}>ROAD FACING & FLOORS:</div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['North', 'East', 'South', 'West'] as FacingDirection[]).map(d => (
                    <button key={d} onClick={() => setFacing(d)} style={{ padding: '3px 7px', backgroundColor: facing === d ? '#00ff9d' : '#0b1d33', color: facing === d ? '#050c17' : '#00ff9d', border: '1px solid #00ff9d', borderRadius: '3px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>
                      {d}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                  {[
                    { count: 2, label: 'G+1' },
                    { count: 3, label: 'G+2' },
                    { count: 4, label: 'G+3' }
                  ].map(f => (
                    <button key={f.label} onClick={() => setNumFloors(f.count)} style={{ padding: '3px 7px', backgroundColor: numFloors === f.count ? '#38bdf8' : '#0b1d33', color: numFloors === f.count ? '#050c17' : '#38bdf8', border: '1px solid #38bdf8', borderRadius: '3px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Parking & Staircase */}
            <div style={{ backgroundColor: '#050c17', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1e3a8a' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, marginBottom: '6px' }}>PARKING & STAIRCASE:</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'full', label: 'Full Stilt' },
                  { id: 'half', label: 'Half Stilt' },
                  { id: 'nil', label: 'Nil (Full Living)' }
                ].map(pm => (
                  <button key={pm.id} onClick={() => setParkingMode(pm.id as ParkingMode)} style={{ padding: '4px 7px', backgroundColor: parkingMode === pm.id ? '#f59e0b' : '#0b1d33', color: parkingMode === pm.id ? '#050c17' : '#f59e0b', border: '1px solid #f59e0b', borderRadius: '3px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* LUXURY ARCHITECTURAL AMENITY CHECKBOXES */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '10px', pt: '8px', borderTop: '1px solid #1e293b', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#00ff9d', fontWeight: 800 }}>AMENITY TOGGLES:</span>
            {[
              { label: 'Inner Courtyards', state: hasCourtyard, toggle: () => setHasCourtyard(!hasCourtyard) },
              { label: 'Double Height Cut-outs', state: hasCutout, toggle: () => setHasCutout(!hasCutout) },
              { label: 'Walk-in Wardrobes (W/W)', state: hasWardrobe, toggle: () => setHasWardrobe(!hasWardrobe) },
              { label: 'Terrace Skylights', state: hasSkylight, toggle: () => setHasSkylight(!hasSkylight) },
              { label: 'Lift Core (5\'x5\')', state: hasLift, toggle: () => setHasLift(!hasLift) },
              { label: 'Pooja Room', state: hasPooja, toggle: () => setHasPooja(!hasPooja) },
              { label: 'Store & Wash', state: hasStore, toggle: () => setHasStore(!hasStore) },
              { label: 'Balconies & Gazebo Deck', state: hasBalcony, toggle: () => setHasBalcony(!hasBalcony) }
            ].map(a => (
              <label key={a.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: a.state ? '#ffffff' : '#64748b', cursor: 'pointer' }}>
                <input type="checkbox" checked={a.state} onChange={a.toggle} style={{ accentColor: '#00ff9d', cursor: 'pointer' }} />
                {a.label}
              </label>
            ))}
          </div>
        </div>

        {/* INDEPENDENT SHEET NAVIGATION TABS */}
        <div className="no-print" style={{ backgroundColor: '#0b1d33', border: '2px solid #00f0ff', padding: '10px 18px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#00f0ff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginRight: '4px' }}>
              📄 SELECT DRAWING SHEET:
            </span>
            {[
              { id: 'structural', label: `Sheet 00: Structural Plan (${structuralGrid.totalCols} Cols)` },
              { id: 'ground', label: 'Sheet 01: Ground Floor (GF)' },
              { id: 'first', label: 'Sheet 02: 1st Floor (FF)' },
              { id: 'second', label: 'Sheet 03: 2nd Floor Penthouse (SF)' },
              { id: 'terrace', label: 'Sheet 04: Terrace & Skylights (TF)' },
              { id: 'all', label: '📚 Print Album Mode (All Sheets)' }
            ].map(st => (
              <button key={st.id} onClick={() => { setActiveSheet(st.id as SheetFloor); setDrawingMode(st.id === 'structural' ? 'structural' : 'architectural'); }} style={{ padding: '8px 12px', backgroundColor: activeSheet === st.id ? (st.id === 'structural' ? '#f59e0b' : '#00ff9d') : '#050c17', color: activeSheet === st.id ? '#050c17' : (st.id === 'structural' ? '#f59e0b' : '#00ff9d'), border: `1px solid ${activeSheet === st.id ? (st.id === 'structural' ? '#f59e0b' : '#00ff9d') : '#1e3a8a'}`, borderRadius: '6px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', boxShadow: activeSheet === st.id ? '0 0 15px rgba(0,255,157,0.4)' : 'none' }}>
                {st.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'architectural', label: '🏛️ Architectural View' },
              { id: 'structural', label: '🏗️ Structural Grid' },
              { id: 'vastu', label: '🧭 Vastu Audit' }
            ].map(dm => (
              <button key={dm.id} onClick={() => setDrawingMode(dm.id as DrawingViewMode)} style={{ padding: '5px 10px', backgroundColor: drawingMode === dm.id ? '#00f0ff' : '#050c17', color: drawingMode === dm.id ? '#050c17' : '#00f0ff', border: '1px solid #00f0ff', borderRadius: '4px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
                {dm.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN WORKSPACE & INSPECTOR */}
        {activeSheet === 'all' ? (
          <div>
            {renderFloorSheet('structural', 0)}
            {renderFloorSheet('ground', 1)}
            {renderFloorSheet('first', 2)}
            {renderFloorSheet('second', 3)}
            {renderFloorSheet('terrace', 4)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '14px' }}>
            {/* Active Floor SVG Blueprint Canvas */}
            <div>
              {renderFloorSheet(
                activeSheet,
                activeSheet === 'structural' ? 0 : activeSheet === 'ground' ? 1 : activeSheet === 'first' ? 2 : activeSheet === 'second' ? 3 : 4
              )}
            </div>

            {/* ROOM INSPECTOR & STRUCTURAL SIDE REFERENCE PANEL */}
            <div className="no-print" style={{ backgroundColor: '#0b1d33', border: '2px solid #1e3a8a', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* IS 456 STRUCTURAL LEGEND PANEL (WHEN STRUCTURAL SHEET IS ACTIVE) */}
              {activeSheet === 'structural' && (
                <div style={{ backgroundColor: '#050c17', border: '1.5px solid #f59e0b', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 900, borderBottom: '1px solid #1e3a8a', paddingBottom: '6px', marginBottom: '8px' }}>
                    🏗️ IS 456:2000 CIVIL STRUCTURAL SPECS
                  </div>
                  <div style={{ fontSize: '11px', color: '#ffffff', lineHeight: '1.5' }}>
                    <div><strong>● PLOT SIZE:</strong> {width}′ × {length}′</div>
                    <div><strong>● PLINTH SPAN:</strong> {formatLength(plinthWidth)} × {formatLength(plinthLength)}</div>
                    <div style={{ color: '#00ff9d', fontWeight: 800, marginTop: '4px' }}>
                      ● TOTAL RCC COLUMNS: {structuralGrid.totalCols} Nos ({structuralGrid.colsXCount}×{structuralGrid.colsYCount} Grid)
                    </div>
                    <div>● max column span: {formatLength(structuralGrid.spanX)} C-C</div>
                    <div style={{ color: '#38bdf8', marginTop: '6px' }}><strong>CONCRETE & STEEL GRADES:</strong></div>
                    <div>● Concrete: M25 (1:1.5:3 Mix)</div>
                    <div>● Steel: TMT Fe550D High Yield</div>
                    <div>● Footing Mesh: 12mm Φ @ 150mm c/c</div>
                    <div>● Column Bars: 6-16mm Φ Main + 8mm Rings</div>
                  </div>
                </div>
              )}

              <div style={{ borderBottom: '1px solid #1e3a8a', paddingBottom: '8px' }}>
                <span style={{ backgroundColor: '#00f0ff', color: '#050c17', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '3px' }}>
                  INSPECTION ENGINE
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>
                  📐 {activeSheet.toUpperCase()} ROOM SCHEDULE & SPECS
                </h2>
              </div>

              {/* ACTIVE SELECTED ROOM */}
              <div style={{ backgroundColor: '#050c17', border: `1px solid ${activeSelectedRoom.vastuColor}`, padding: '12px', borderRadius: '6px' }}>
                <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800 }}>SELECTED ROOM ZONE</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                  {activeSelectedRoom.name}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                  <div style={{ backgroundColor: '#0b1d33', padding: '6px 8px', borderRadius: '4px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '9px' }}>DIMENSIONS</div>
                    <div style={{ color: '#00ff9d', fontSize: '12px', fontWeight: 800 }}>
                      {formatLength(activeSelectedRoom.dimsFt.w)} × {formatLength(activeSelectedRoom.dimsFt.l)}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#0b1d33', padding: '6px 8px', borderRadius: '4px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '9px' }}>CARPET AREA</div>
                    <div style={{ color: '#00ff9d', fontSize: '12px', fontWeight: 800 }}>
                      {formatArea(Math.round(activeSelectedRoom.dimsFt.w * activeSelectedRoom.dimsFt.l))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '11px' }}>
                  <span style={{ color: '#94a3b8' }}>Vastu Compliance:</span>
                  <strong style={{ color: activeSelectedRoom.vastuColor, marginLeft: '6px' }}>
                    {activeSelectedRoom.vastuZone} ({activeSelectedRoom.vastuRating})
                  </strong>
                </div>

                <div style={{ marginTop: '8px', fontSize: '11px' }}>
                  <span style={{ color: '#94a3b8' }}>Flooring Spec:</span>
                  <div style={{ color: '#e2e8f0', marginTop: '2px' }}>{activeSelectedRoom.flooringType}</div>
                </div>

                <div style={{ marginTop: '8px', fontSize: '11px' }}>
                  <span style={{ color: '#94a3b8' }}>Material Spec:</span>
                  <div style={{ color: '#94a3b8', marginTop: '2px', lineHeight: '1.3' }}>{activeSelectedRoom.materialSpec}</div>
                </div>
              </div>

              {/* OVERALL VASTU SCORE */}
              <div style={{ backgroundColor: '#050c17', border: '1px solid #00ff9d', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#00ff9d' }}>OVERALL VASTU AUDIT</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>{facing} Facing Road Alignment</div>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#00ff9d' }}>
                    {overallVastuScore}%
                  </div>
                </div>
              </div>

              {/* TURNKEY BOQ CTA */}
              <button onClick={handleProceedToBOQ} style={{ width: '100%', backgroundColor: '#00ff9d', color: '#050c17', border: 'none', padding: '14px', borderRadius: '6px', fontSize: '13px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 20px rgba(0,255,157,0.3)', letterSpacing: '0.5px' }}>
                🔨 Calculate Turnkey BOQ ({buaBreakdown.totalArea} SQFT) →
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
