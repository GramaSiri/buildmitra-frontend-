// BUILDMITRA DRG ENGINE — PHASE 1 REQUIREMENT INPUT FORM
// FULLY RESPONSIVE SECTIONED INPUT ENGINE COVERING SECTIONS A TO P

import React, { useState } from "react";
import {
  ProjectRequirementModel,
  ProjectType,
  ConstructionType,
  SiteFacing,
  PlotShape,
  PlotUnit,
  SiteSlope,
  StructuralSystemPreference,
  ConstructionQuality,
  WallType,
  VastuLevel,
  ParkingMode,
  StaircaseTypePreference,
  StaircaseLocationPref,
  LiftLocationPref,
  FloorRequirement,
} from "../../utils/drg/projectRequirementModel";

interface Phase1RequirementFormProps {
  model: ProjectRequirementModel;
  onChange: (updatedModel: ProjectRequirementModel) => void;
}

export default function Phase1RequirementForm({ model, onChange }: Phase1RequirementFormProps) {
  const [activeSection, setActiveSection] = useState<string>("section_project");

  // Section Toggle Helper
  const toggleSection = (id: string) => {
    setActiveSection((prev) => (prev === id ? "" : id));
  };

  // Helper to update root properties immutably
  const updateProject = (field: string, value: any) => {
    onChange({ ...model, project: { ...model.project, [field]: value } });
  };

  const updatePlot = (field: string, value: any) => {
    const updatedPlot = { ...model.plot, [field]: value };
    if (field === "plotWidth" || field === "plotLength") {
      updatedPlot.plotAreaSqFt = (updatedPlot.plotWidth || 0) * (updatedPlot.plotLength || 0);
    }
    onChange({ ...model, plot: updatedPlot });
  };

  const updateSiteSoil = (field: string, value: any) => {
    onChange({ ...model, siteSoil: { ...model.siteSoil, [field]: value } });
  };

  const updateSetback = (field: string, value: number) => {
    const newFinal = { ...model.setbacks.finalAcceptedSetback, [field]: value };
    onChange({
      ...model,
      setbacks: {
        ...model.setbacks,
        requestedSetback: newFinal,
        finalAcceptedSetback: newFinal,
      },
    });
  };

  const updateBuildingFloors = (newFloorCount: number) => {
    const floorCount = Math.max(1, Math.min(12, newFloorCount));
    const labels: string[] = [];
    const floors: FloorRequirement[] = [];

    for (let i = 0; i < floorCount; i++) {
      const label = i === 0 ? "Ground Floor" : i === 1 ? "First Floor" : i === 2 ? "Second Floor" : i === 3 ? "Third Floor" : `${i}th Floor`;
      labels.push(label);

      const existing = model.floors[i];
      if (existing) {
        floors.push({ ...existing, floorIndex: i, floorLabel: label });
      } else {
        floors.push({
          floorIndex: i,
          floorLabel: label,
          floorType: i === 0 ? "Full Parking" : "2BHK",
          parking: {
            parkingMode: i === 0 ? "Full Parking" : "No Parking",
            carsCount: i === 0 ? 2 : 0,
            twoWheelersCount: i === 0 ? 4 : 0,
            evChargingRequired: i === 0,
            visitorParkingCount: 0,
          },
          rooms: {
            livingRoomCount: i === 0 ? 0 : 1,
            diningCount: i === 0 ? 0 : 1,
            kitchenCount: i === 0 ? 0 : 1,
            utilityCount: i === 0 ? 0 : 1,
            masterBedrooms: i === 0 ? 0 : 1,
            otherBedrooms: i === 0 ? 0 : 1,
            guestBedrooms: 0,
            childrenBedrooms: 0,
            attachedToilets: i === 0 ? 0 : 2,
            commonToilets: i === 0 ? 1 : 0,
            poojaRoom: i === 1,
            studyRoom: false,
            homeOffice: false,
            familyLounge: false,
            storeRoom: false,
            laundryRoom: false,
            walkInWardrobe: false,
            balconiesCount: i === 0 ? 0 : 1,
            sitOutCount: 0,
            hasTerrace: false,
            servantRoom: false,
            servantToilet: false,
            gym: false,
            homeTheatre: false,
            partyHall: false,
            customRooms: [],
          },
        });
      }
    }

    onChange({
      ...model,
      building: { ...model.building, numberOfFloors: floorCount, floorLabels: labels },
      floors,
    });
  };

  const updateFloorRequirement = (index: number, updatedFloor: FloorRequirement) => {
    const floors = [...model.floors];
    floors[index] = updatedFloor;
    onChange({ ...model, floors });
  };

  const updateDuplex = (field: string, value: any) => {
    onChange({ ...model, duplexTriplex: { ...model.duplexTriplex, [field]: value } });
  };

  const updateCirculation = (category: "staircase" | "lift", field: string, value: any) => {
    onChange({
      ...model,
      verticalCirculation: {
        ...model.verticalCirculation,
        [category]: { ...model.verticalCirculation[category], [field]: value },
      },
    });
  };

  const updateWaterServices = (field: string, value: any) => {
    onChange({ ...model, waterServices: { ...model.waterServices, [field]: value } });
  };

  const updateVastu = (field: string, value: any) => {
    onChange({ ...model, vastu: { ...model.vastu, [field]: value } });
  };

  const updateStructuralInputs = (field: string, value: any) => {
    onChange({ ...model, structuralInputs: { ...model.structuralInputs, [field]: value } });
  };

  const updateConstructionPref = (field: string, value: any) => {
    onChange({ ...model, constructionPreferences: { ...model.constructionPreferences, [field]: value } });
  };

  const updatePriority = (field: string, value: number) => {
    onChange({ ...model, userPriorities: { ...model.userPriorities, [field]: value } });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* SECTION A: PROJECT DETAILS */}
      <FormSection title="A. Project Details" icon="📁" isOpen={activeSection === "section_project"} onToggle={() => toggleSection("section_project")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <InputField label="Project Name" value={model.project.projectName} onChange={(v) => updateProject("projectName", v)} placeholder="e.g. Reddy Residence" />
          <InputField label="Client Name" value={model.project.clientName} onChange={(v) => updateProject("clientName", v)} placeholder="e.g. Srikanth Reddy" />
          <InputField label="Project Location / Area" value={model.project.projectLocation} onChange={(v) => updateProject("projectLocation", v)} placeholder="e.g. Indiranagar" />
          <InputField label="City" value={model.project.city} onChange={(v) => updateProject("city", v)} placeholder="e.g. Bengaluru" />
          <InputField label="State" value={model.project.state} onChange={(v) => updateProject("state", v)} placeholder="e.g. Karnataka" />
          <InputField label="PIN Code" value={model.project.pinCode} onChange={(v) => updateProject("pinCode", v)} placeholder="e.g. 560038" />

          <SelectField label="Project Type" value={model.project.projectType} options={["Residential", "Villa", "Duplex", "Triplex", "Apartment", "Commercial", "Mixed Use", "Other"]} onChange={(v) => updateProject("projectType", v as ProjectType)} />
          <SelectField label="Construction Type" value={model.project.constructionType} options={["New Construction", "Extension", "Renovation"]} onChange={(v) => updateProject("constructionType", v as ConstructionType)} />
        </div>
      </FormSection>

      {/* SECTION B: PLOT DETAILS */}
      <FormSection title="B. Plot Details" icon="🏞️" isOpen={activeSection === "section_plot"} onToggle={() => toggleSection("section_plot")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          <NumberField label="Plot Width" value={model.plot.plotWidth} onChange={(v) => updatePlot("plotWidth", v)} suffix={model.plot.plotUnit} />
          <NumberField label="Plot Length" value={model.plot.plotLength} onChange={(v) => updatePlot("plotLength", v)} suffix={model.plot.plotUnit} />
          <DisplayField label="Plot Area (Calculated)" value={`${model.plot.plotAreaSqFt} sq.ft`} />
          <SelectField label="Plot Unit" value={model.plot.plotUnit} options={["Feet", "Metres"]} onChange={(v) => updatePlot("plotUnit", v as PlotUnit)} />

          <SelectField label="Site Facing" value={model.plot.siteFacing} options={["North", "South", "East", "West", "NE", "NW", "SE", "SW"]} onChange={(v) => updatePlot("siteFacing", v as SiteFacing)} />
          <SelectField label="Road Side" value={model.plot.roadSide} options={["North", "South", "East", "West", "NE", "NW", "SE", "SW"]} onChange={(v) => updatePlot("roadSide", v as SiteFacing)} />
          <NumberField label="Road Width (ft)" value={model.plot.roadWidthFt} onChange={(v) => updatePlot("roadWidthFt", v)} />
          <SelectField label="Plot Shape" value={model.plot.plotShape} options={["Rectangular", "Square", "Irregular"]} onChange={(v) => updatePlot("plotShape", v as PlotShape)} />

          <SelectField label="Is Corner Plot?" value={model.plot.isCornerPlot ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updatePlot("isCornerPlot", v === "Yes")} />
          {model.plot.isCornerPlot && (
            <>
              <SelectField label="Second Road Side" value={model.plot.secondRoadSide || "East"} options={["North", "South", "East", "West", "NE", "NW", "SE", "SW"]} onChange={(v) => updatePlot("secondRoadSide", v as SiteFacing)} />
              <NumberField label="Second Road Width (ft)" value={model.plot.secondRoadWidthFt || 30} onChange={(v) => updatePlot("secondRoadWidthFt", v)} />
            </>
          )}
        </div>
      </FormSection>

      {/* SECTION C: SITE / SOIL INFORMATION */}
      <FormSection title="C. Site & Soil Information" icon="🧪" isOpen={activeSection === "section_soil"} onToggle={() => toggleSection("section_soil")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <SelectField label="Soil Test Available?" value={model.siteSoil.isSoilTestAvailable ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateSiteSoil("isSoilTestAvailable", v === "Yes")} />
          
          {model.siteSoil.isSoilTestAvailable ? (
            <NumberField label="SBC - Safe Bearing Capacity" value={model.siteSoil.sbcKpa || 200} onChange={(v) => updateSiteSoil("sbcKpa", v)} suffix="kN/m²" />
          ) : (
            <div style={{ gridColumn: "span 2", background: "#fff7ed", padding: "10px 14px", borderRadius: "8px", border: "1px solid #fed7aa", fontSize: "12px", color: "#c2410c", fontWeight: "bold" }}>
              ⚠️ SOIL TEST / SBC REQUIRED FOR FINAL FOUNDATION DESIGN
            </div>
          )}

          <InputField label="Soil Type (if known)" value={model.siteSoil.soilType || ""} onChange={(v) => updateSiteSoil("soilType", v)} placeholder="e.g. Medium Clay / Hard Rock" />
          <InputField label="Groundwater Condition" value={model.siteSoil.groundwaterInfo || ""} onChange={(v) => updateSiteSoil("groundwaterInfo", v)} placeholder="e.g. Below 10 ft" />
          <SelectField label="Site Slope" value={model.siteSoil.siteSlope} options={["Flat", "Gentle", "Sloping"]} onChange={(v) => updateSiteSoil("siteSlope", v as SiteSlope)} />
          <SelectField label="Existing Structures?" value={model.siteSoil.hasExistingStructures ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateSiteSoil("hasExistingStructures", v === "Yes")} />
        </div>
      </FormSection>

      {/* SECTION D: SETBACKS */}
      <FormSection title="D. Setbacks (User Provided / Auto Recommend)" icon="📏" isOpen={activeSection === "section_setbacks"} onToggle={() => toggleSection("section_setbacks")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          <SelectField label="Setback Mode" value={model.setbacks.mode} options={["User Provided", "Auto Recommend"]} onChange={(v) => onChange({ ...model, setbacks: { ...model.setbacks, mode: v as any } })} />
          <NumberField label="Front Setback (ft)" value={model.setbacks.finalAcceptedSetback.front} onChange={(v) => updateSetback("front", v)} />
          <NumberField label="Rear Setback (ft)" value={model.setbacks.finalAcceptedSetback.rear} onChange={(v) => updateSetback("rear", v)} />
          <NumberField label="Left Setback (ft)" value={model.setbacks.finalAcceptedSetback.left} onChange={(v) => updateSetback("left", v)} />
          <NumberField label="Right Setback (ft)" value={model.setbacks.finalAcceptedSetback.right} onChange={(v) => updateSetback("right", v)} />
        </div>
      </FormSection>

      {/* SECTION E: BUILDING CONFIGURATION */}
      <FormSection title="E. Building Configuration & Storeys" icon="🏢" isOpen={activeSection === "section_building"} onToggle={() => toggleSection("section_building")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <NumberField label="Number of Floors (Storeys)" value={model.building.numberOfFloors} onChange={updateBuildingFloors} min={1} max={12} />
          <SelectField label="Basement Required?" value={model.building.hasBasement ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => onChange({ ...model, building: { ...model.building, hasBasement: v === "Yes" } })} />
          <SelectField label="Stilt Floor Required?" value={model.building.hasStilt ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => onChange({ ...model, building: { ...model.building, hasStilt: v === "Yes" } })} />
          <InputField label="Terrace Use" value={model.building.terraceUse} onChange={(v) => onChange({ ...model, building: { ...model.building, terraceUse: v } })} placeholder="e.g. Open Terrace & Solar" />
        </div>
      </FormSection>

      {/* SECTIONS F, G, H: FLOOR-WISE REQUIREMENTS BUILDER */}
      <FormSection title="F, G & H. Floor-Wise Requirements & Room Configuration" icon="🛏️" isOpen={activeSection === "section_floors"} onToggle={() => toggleSection("section_floors")}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {model.floors.map((floor, fIdx) => (
            <div key={fIdx} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>
                  📍 {floor.floorLabel} Configuration
                </h4>
                <input
                  type="text"
                  value={floor.floorType}
                  onChange={(e) => updateFloorRequirement(fIdx, { ...floor, floorType: e.target.value })}
                  placeholder="e.g. Full Parking / 2BHK / Duplex"
                  style={{ width: "220px", padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "bold" }}
                />
              </div>

              {/* Parking Sub-section */}
              <div style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#0284c7", marginBottom: "8px" }}>🚗 PARKING REQUIREMENTS FOR {floor.floorLabel.toUpperCase()}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
                  <SelectField
                    label="Parking Mode"
                    value={floor.parking.parkingMode}
                    options={["Full Parking", "Half Parking", "No Parking", "Custom Parking"]}
                    onChange={(v) => updateFloorRequirement(fIdx, { ...floor, parking: { ...floor.parking, parkingMode: v as ParkingMode } })}
                  />
                  <NumberField label="Cars Count" value={floor.parking.carsCount} onChange={(v) => updateFloorRequirement(fIdx, { ...floor, parking: { ...floor.parking, carsCount: v } })} />
                  <NumberField label="Two-Wheelers" value={floor.parking.twoWheelersCount} onChange={(v) => updateFloorRequirement(fIdx, { ...floor, parking: { ...floor.parking, twoWheelersCount: v } })} />
                  <SelectField label="EV Charging?" value={floor.parking.evChargingRequired ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateFloorRequirement(fIdx, { ...floor, parking: { ...floor.parking, evChargingRequired: v === "Yes" } })} />
                </div>
              </div>

              {/* Rooms Sub-section */}
              <div style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#16a34a", marginBottom: "8px" }}>🏡 ROOM & AMENITY COUNTS FOR {floor.floorLabel.toUpperCase()}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                  <NumberField label="Living Room" value={floor.rooms.livingRoomCount} onChange={(v) => updateFloorRequirement(fIdx, { ...floor, rooms: { ...floor.rooms, livingRoomCount: v } })} />
                  <NumberField label="Dining" value={floor.rooms.diningCount} onChange={(v) => updateFloorRequirement(fIdx, { ...floor, rooms: { ...floor.rooms, diningCount: v } })} />
                  <NumberField label="Kitchen" value={floor.rooms.kitchenCount} onChange={(v) => updateFloorRequirement(fIdx, { ...floor, rooms: { ...floor.rooms, kitchenCount: v } })} />
                  <NumberField label="Master Bed" value={floor.rooms.masterBedrooms} onChange={(v) => updateFloorRequirement(fIdx, { ...floor, rooms: { ...floor.rooms, masterBedrooms: v } })} />
                  <NumberField label="Other Bed" value={floor.rooms.otherBedrooms} onChange={(v) => updateFloorRequirement(fIdx, { ...floor, rooms: { ...floor.rooms, otherBedrooms: v } })} />
                  <NumberField label="Attached Bath" value={floor.rooms.attachedToilets} onChange={(v) => updateFloorRequirement(fIdx, { ...floor, rooms: { ...floor.rooms, attachedToilets: v } })} />
                  <NumberField label="Common Bath" value={floor.rooms.commonToilets} onChange={(v) => updateFloorRequirement(fIdx, { ...floor, rooms: { ...floor.rooms, commonToilets: v } })} />
                  <CheckboxField label="Pooja Room" checked={floor.rooms.poojaRoom} onChange={(c) => updateFloorRequirement(fIdx, { ...floor, rooms: { ...floor.rooms, poojaRoom: c } })} />
                  <CheckboxField label="Study / Office" checked={floor.rooms.studyRoom} onChange={(c) => updateFloorRequirement(fIdx, { ...floor, rooms: { ...floor.rooms, studyRoom: c } })} />
                  <CheckboxField label="Family Lounge" checked={floor.rooms.familyLounge} onChange={(c) => updateFloorRequirement(fIdx, { ...floor, rooms: { ...floor.rooms, familyLounge: c } })} />
                </div>
              </div>

            </div>
          ))}
        </div>
      </FormSection>

      {/* SECTION I: DUPLEX / TRIPLEX */}
      <FormSection title="I. Duplex / Triplex Vertical Connection" icon="🪜" isOpen={activeSection === "section_duplex"} onToggle={() => toggleSection("section_duplex")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <SelectField label="Duplex Building?" value={model.duplexTriplex.isDuplex ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateDuplex("isDuplex", v === "Yes")} />
          {model.duplexTriplex.isDuplex && (
            <SelectField label="Internal Cutout Staircase?" value={model.duplexTriplex.internalStaircaseRequired ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateDuplex("internalStaircaseRequired", v === "Yes")} />
          )}
          <SelectField label="Triplex Building?" value={model.duplexTriplex.isTriplex ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateDuplex("isTriplex", v === "Yes")} />
        </div>
      </FormSection>

      {/* SECTION J & K: VERTICAL CIRCULATION (STAIRCASE & LIFT) */}
      <FormSection title="J & K. Vertical Circulation (Staircase & Lift Core)" icon="🛗" isOpen={activeSection === "section_vertical"} onToggle={() => toggleSection("section_vertical")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <SelectField label="Staircase Required?" value={model.verticalCirculation.staircase.required ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateCirculation("staircase", "required", v === "Yes")} />
          <SelectField label="Staircase Type" value={model.verticalCirculation.staircase.typePreference} options={["Dog-legged", "U-shaped", "L-shaped", "Straight", "Open well", "Auto Recommend"]} onChange={(v) => updateCirculation("staircase", "typePreference", v as StaircaseTypePreference)} />
          <SelectField label="Staircase Location" value={model.verticalCirculation.staircase.locationPref} options={["User Selected", "Vastu Recommended", "Auto"]} onChange={(v) => updateCirculation("staircase", "locationPref", v as StaircaseLocationPref)} />

          <SelectField label="Passenger Lift Required?" value={model.verticalCirculation.lift.required ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateCirculation("lift", "required", v === "Yes")} />
          {model.verticalCirculation.lift.required && (
            <SelectField label="Passenger Capacity" value={model.verticalCirculation.lift.passengerCapacity} options={["4 Person", "6 Person", "8 Person", "Custom"]} onChange={(v) => updateCirculation("lift", "passengerCapacity", v)} />
          )}
        </div>
      </FormSection>

      {/* SECTION L: WATER & SITE SERVICES */}
      <FormSection title="L. Water & Site Services" icon="💧" isOpen={activeSection === "section_services"} onToggle={() => toggleSection("section_services")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <SelectField label="UG Water Sump Required?" value={model.waterServices.ugWaterSumpRequired ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateWaterServices("ugWaterSumpRequired", v === "Yes")} />
          <NumberField label="UG Sump Capacity (Liters)" value={model.waterServices.ugWaterSumpCapacityLiters} onChange={(v) => updateWaterServices("ugWaterSumpCapacityLiters", v)} />
          <SelectField label="Rainwater Harvesting?" value={model.waterServices.rainwaterHarvestingRequired ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateWaterServices("rainwaterHarvestingRequired", v === "Yes")} />
          <SelectField label="Borewell Provision?" value={model.waterServices.borewellRequired ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateWaterServices("borewellRequired", v === "Yes")} />
          <SelectField label="Solar Panel Provision?" value={model.waterServices.solarRequirement ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => updateWaterServices("solarRequirement", v === "Yes")} />
        </div>
      </FormSection>

      {/* SECTION M: VASTU PREFERENCE */}
      <FormSection title="M. Vastu Alignment Preference" icon="🧭" isOpen={activeSection === "section_vastu"} onToggle={() => toggleSection("section_vastu")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <SelectField label="Vastu Strictness Level" value={model.vastu.level} options={["Strict", "Preferred", "Balanced", "No Vastu Preference"]} onChange={(v) => updateVastu("level", v as VastuLevel)} />
          <SelectField label="Main Door Direction" value={model.vastu.mainDoorDirection || "East"} options={["North", "South", "East", "West", "NE", "NW", "SE", "SW"]} onChange={(v) => updateVastu("mainDoorDirection", v as SiteFacing)} />
          <SelectField label="Kitchen Zone" value={model.vastu.kitchenDirection || "SE"} options={["SE", "NW", "NE", "SW"]} onChange={(v) => updateVastu("kitchenDirection", v as SiteFacing)} />
          <SelectField label="Master Bedroom Zone" value={model.vastu.masterBedDirection || "SW"} options={["SW", "NW", "SE", "NE"]} onChange={(v) => updateVastu("masterBedDirection", v as SiteFacing)} />
        </div>
      </FormSection>

      {/* SECTION N & O: STRUCTURAL & CONSTRUCTION PREFERENCES */}
      <FormSection title="N & O. Structural & Construction Preferences" icon="🧱" isOpen={activeSection === "section_struct"} onToggle={() => toggleSection("section_struct")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <SelectField label="Structural System" value={model.structuralInputs.structuralSystemPreference} options={["RCC Frame", "Load Bearing", "Steel", "Auto Recommend"]} onChange={(v) => updateStructuralInputs("structuralSystemPreference", v as StructuralSystemPreference)} />
          <SelectField label="Wall Material" value={model.constructionPreferences.wallType} options={["AAC Block", "Solid Block", "Brick", "Other"]} onChange={(v) => updateConstructionPref("wallType", v as WallType)} />
          <SelectField label="Construction Quality Grade" value={model.constructionPreferences.constructionQuality} options={["Economy", "Standard", "Premium", "Luxury", "Custom"]} onChange={(v) => updateConstructionPref("constructionQuality", v as ConstructionQuality)} />
        </div>
      </FormSection>

      {/* SECTION P: USER PRIORITIES */}
      <FormSection title="P. User Priorities & Solver Weights" icon="⚖️" isOpen={activeSection === "section_priorities"} onToggle={() => toggleSection("section_priorities")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
          <SliderField label="Maximum Built-up Area" value={model.userPriorities.maxBuiltUpArea} onChange={(v) => updatePriority("maxBuiltUpArea", v)} />
          <SliderField label="More Open Space" value={model.userPriorities.moreOpenSpace} onChange={(v) => updatePriority("moreOpenSpace", v)} />
          <SliderField label="More Parking" value={model.userPriorities.moreParking} onChange={(v) => updatePriority("moreParking", v)} />
          <SliderField label="Vastu Compliance" value={model.userPriorities.vastuCompliance} onChange={(v) => updatePriority("vastuCompliance", v)} />
          <SliderField label="Natural Light & Ventilation" value={model.userPriorities.naturalLightVentilation} onChange={(v) => updatePriority("naturalLightVentilation", v)} />
        </div>
      </FormSection>

    </div>
  );
}

// SUB-COMPONENTS FOR CLEAN FORM STYLING
function FormSection({ title, icon, isOpen, onToggle, children }: { title: string; icon: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #cbd5e1", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "16px 20px",
          background: isOpen ? "#f8fafc" : "#ffffff",
          border: 0,
          textAlign: "left",
          fontSize: "14px",
          fontWeight: "bold",
          color: "#0f172a",
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <span>{icon} {title}</span>
        <span style={{ fontSize: "16px", color: "#64748b" }}>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && <div style={{ padding: "20px", borderTop: "1px solid #f1f5f9" }}>{children}</div>}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "bold" }} />
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, suffix }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input type="number" min={min} max={max} value={value || ""} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "bold" }} />
        {suffix && <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "bold", background: "#fff" }}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function DisplayField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>{label}</label>
      <div style={{ padding: "7px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "12px", fontWeight: "bold", color: "#0284c7" }}>{value}</div>
    </div>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "bold", color: "#334155", cursor: "pointer", marginTop: "18px" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: "#ff7a00" }} />
      <span>{label}</span>
    </label>
  );
}

function SliderField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
        <span>{label}</span>
        <span style={{ color: "#ff7a00" }}>{value} / 5</span>
      </div>
      <input type="range" min={1} max={5} value={value} onChange={(e) => onChange(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#ff7a00" }} />
    </div>
  );
}
