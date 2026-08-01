import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import PreFloorPlanSvg from "../components/PreFloorPlanSvg";
import {
  BuildingType,
  Facing,
  FloorPlanRequirement,
  Parking,
  findBestTemplates,
} from "../data/preFloorPlanLibrary";

const defaultRequirement: FloorPlanRequirement = {
  plotWidth: 30,
  plotLength: 40,
  facing: "East",
  floors: 2,
  bedrooms: 3,
  toilets: 3,
  buildingType: "Own Use",
  parking: "No Parking",
  lift: false,
  vaastu: true,
  pooja: true,
  utility: true,
  balcony: true,
};

const controlStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 38,
  padding: "8px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  background: "#ffffff",
  color: "#111827",
  fontWeight: 700,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 5,
  fontSize: 11,
  fontWeight: 900,
  color: "#1f2937",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function CheckRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11,
        fontWeight: 800,
        color: "#172033",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

export default function PreFloorPlanDrgPage() {
  const router = useRouter();

  const [draft, setDraft] =
    useState<FloorPlanRequirement>(defaultRequirement);

  const [requirement, setRequirement] =
    useState<FloorPlanRequirement>(defaultRequirement);

  const [generated, setGenerated] = useState(true);
  const [floor, setFloor] = useState(0);

  const selected = useMemo(() => {
    return findBestTemplates(requirement, 1)[0];
  }, [requirement]);

  const updateDraft = <K extends keyof FloorPlanRequirement>(
    key: K,
    value: FloorPlanRequirement[K]
  ) => {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const generatePlan = () => {
    setRequirement({ ...draft });
    setFloor(0);
    setGenerated(true);

    setTimeout(() => {
      document
        .getElementById("generated-drawing")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const resetPlan = () => {
    setDraft(defaultRequirement);
    setRequirement(defaultRequirement);
    setFloor(0);
    setGenerated(true);
  };

  const downloadSvg = () => {
    const svg = document.querySelector(
      "#selected-plan svg"
    ) as SVGElement | null;

    if (!svg || !selected) return;

    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const source = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `BuildMitra-${requirement.plotWidth}x${requirement.plotLength}-${requirement.facing}-floor-${floor}.svg`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const floorNames = Array.from(
    { length: Math.max(1, requirement.floors) },
    (_, index) => {
      if (index === 0) return "Ground Floor";
      if (index === 1) return "First Floor";
      if (index === 2) return "Second Floor";
      return `Floor ${index}`;
    }
  );

  const plotArea = requirement.plotWidth * requirement.plotLength;
  const estimatedCoverage =
    requirement.parking === "Full Parking"
      ? 0.68
      : requirement.parking === "Half Parking"
      ? 0.76
      : 0.83;

  const floorBuiltUp = Math.round(plotArea * estimatedCoverage);
  const totalBuiltUp = floorBuiltUp * Math.max(1, requirement.floors);
  const parkingArea =
    requirement.parking === "No Parking"
      ? 0
      : requirement.parking === "Half Parking"
      ? Math.round(plotArea * 0.12)
      : Math.round(plotArea * 0.2);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#eef1f5",
        color: "#111827",
        padding: 8,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <header className="topHeader">
        <button
          onClick={() => router.back()}
          className="backButton"
          aria-label="Go back"
        >
          ←
        </button>

        <div className="brandBlock">
          <div className="brandTitle">BUILDMITRA DRG ENGINE V2.2</div>
        </div>

        <div className="featureStrip">
          <span>✓ VAASTU COMPLIANT</span>
          <span>✓ INDIAN STYLE PLAN</span>
          <span>✓ REALISTIC LAYOUT</span>
          <span>✓ SPACE OPTIMIZED</span>
        </div>

        <div className="plotBadge">
          PLOT: {requirement.plotWidth}' × {requirement.plotLength}' (
          {requirement.facing.toUpperCase()} FACING)
        </div>
      </header>

      <div className="engineGrid">
        <aside className="inputPanel">
          <h2 className="panelTitle">INPUT PARAMETERS</h2>

          {/* QUICK PRESETS ROW */}
          <div style={{ marginBottom: "14px", padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#334155", display: "block", marginBottom: "6px" }}>⚡ Quick Plot Presets:</span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  setDraft(p => ({ ...p, plotWidth: 30, plotLength: 40, facing: "East", floors: 2, bedrooms: 3 }));
                  setRequirement({ ...defaultRequirement, plotWidth: 30, plotLength: 40, facing: "East", floors: 2, bedrooms: 3 });
                  setGenerated(true);
                }}
                style={{ padding: "5px 10px", background: "#0f172a", color: "#fff", border: 0, borderRadius: "6px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                📍 30×40 East (3 BHK)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(p => ({ ...p, plotWidth: 30, plotLength: 50, facing: "North", floors: 3, bedrooms: 4 }));
                  setRequirement({ ...defaultRequirement, plotWidth: 30, plotLength: 50, facing: "North", floors: 3, bedrooms: 4 });
                  setGenerated(true);
                }}
                style={{ padding: "5px 10px", background: "#0f172a", color: "#fff", border: 0, borderRadius: "6px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                📍 30×50 North (4 BHK)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(p => ({ ...p, plotWidth: 40, plotLength: 60, facing: "West", floors: 2, bedrooms: 4 }));
                  setRequirement({ ...defaultRequirement, plotWidth: 40, plotLength: 60, facing: "West", floors: 2, bedrooms: 4 });
                  setGenerated(true);
                }}
                style={{ padding: "5px 10px", background: "#0f172a", color: "#fff", border: 0, borderRadius: "6px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                📍 40×60 West (Villa)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(p => ({ ...p, plotWidth: 20, plotLength: 30, facing: "South", floors: 2, bedrooms: 2 }));
                  setRequirement({ ...defaultRequirement, plotWidth: 20, plotLength: 30, facing: "South", floors: 2, bedrooms: 2 });
                  setGenerated(true);
                }}
                style={{ padding: "5px 10px", background: "#0f172a", color: "#fff", border: 0, borderRadius: "6px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                📍 20×30 South (2 BHK)
              </button>
            </div>
          </div>

          <div className="twoColumnFields">
            <Field label="Plot Width (ft)">
              <input
                type="number"
                min={15}
                max={100}
                value={draft.plotWidth}
                onChange={(event) =>
                  updateDraft("plotWidth", Number(event.target.value))
                }
                style={controlStyle}
              />
            </Field>

            <Field label="Plot Length (ft)">
              <input
                type="number"
                min={20}
                max={150}
                value={draft.plotLength}
                onChange={(event) =>
                  updateDraft("plotLength", Number(event.target.value))
                }
                style={controlStyle}
              />
            </Field>
          </div>

          <div className="fieldStack">
            <Field label="Facing">
              <select
                value={draft.facing}
                onChange={(event) =>
                  updateDraft("facing", event.target.value as Facing)
                }
                style={controlStyle}
              >
                {["North", "South", "East", "West"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>

            <Field label="Floors">
              <select
                value={draft.floors}
                onChange={(event) =>
                  updateDraft("floors", Number(event.target.value))
                }
                style={controlStyle}
              >
                {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Building Type">
              <select
                value={draft.buildingType}
                onChange={(event) =>
                  updateDraft(
                    "buildingType",
                    event.target.value as BuildingType
                  )
                }
                style={controlStyle}
              >
                <option value="Own Use">Independent House</option>
                <option value="Rental Use">Rental House</option>
                <option value="Duplex">Duplex House</option>
                <option value="Multi-unit">Multi-unit House</option>
              </select>
            </Field>
          </div>

          <div className="twoColumnFields">
            <Field label="Bedrooms">
              <select
                value={draft.bedrooms}
                onChange={(event) =>
                  updateDraft("bedrooms", Number(event.target.value))
                }
                style={controlStyle}
              >
                {[1, 2, 3, 4, 5, 6].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>

            <Field label="Toilets">
              <select
                value={draft.toilets}
                onChange={(event) =>
                  updateDraft("toilets", Number(event.target.value))
                }
                style={controlStyle}
              >
                {[1, 2, 3, 4, 5, 6].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="twoColumnFields">
            <Field label="Living / Dining">
              <select style={controlStyle} defaultValue="Yes">
                <option>Yes</option>
              </select>
            </Field>

            <Field label="Kitchen">
              <select style={controlStyle} defaultValue="Yes">
                <option>Yes</option>
              </select>
            </Field>

            <Field label="Pooja Room">
              <select
                value={draft.pooja ? "Yes" : "No"}
                onChange={(event) =>
                  updateDraft("pooja", event.target.value === "Yes")
                }
                style={controlStyle}
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </Field>

            <Field label="Utility">
              <select
                value={draft.utility ? "Yes" : "No"}
                onChange={(event) =>
                  updateDraft("utility", event.target.value === "Yes")
                }
                style={controlStyle}
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </Field>
          </div>

          <div className="fieldStack">
            <Field label="Parking">
              <select
                value={draft.parking}
                onChange={(event) =>
                  updateDraft("parking", event.target.value as Parking)
                }
                style={controlStyle}
              >
                <option>Full Parking</option>
                <option>Half Parking</option>
                <option>No Parking</option>
              </select>
            </Field>
          </div>

          <div className="twoColumnFields">
            <Field label="Staircase">
              <select style={controlStyle} defaultValue="Yes">
                <option>Yes</option>
              </select>
            </Field>

            <Field label="Lift">
              <select
                value={draft.lift ? "Yes" : "No"}
                onChange={(event) =>
                  updateDraft("lift", event.target.value === "Yes")
                }
                style={controlStyle}
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </Field>
          </div>

          <div className="vaastuBox">
            <h3>VAASTU PREFERENCE</h3>

            <CheckRow
              checked={draft.vaastu}
              label="Vaastu Optimized Plan"
              onChange={(value) => updateDraft("vaastu", value)}
            />

            <CheckRow
              checked={draft.pooja}
              label="Pooja in North East"
              onChange={(value) => updateDraft("pooja", value)}
            />

            <CheckRow
              checked={draft.utility}
              label="Kitchen / Utility in South East"
              onChange={(value) => updateDraft("utility", value)}
            />

            <CheckRow
              checked={draft.balcony}
              label="Balcony / Open Space"
              onChange={(value) => updateDraft("balcony", value)}
            />

            <CheckRow
              checked={true}
              label="Master Bed in South West"
              onChange={() => undefined}
            />

            <CheckRow
              checked={true}
              label="Toilets in West / North West"
              onChange={() => undefined}
            />
          </div>

          <button className="generateButton" onClick={generatePlan}>
            GENERATE PLAN
          </button>

          <button className="resetButton" onClick={resetPlan}>
            RESET
          </button>

          <div className="legendBox">
            <h3>LEGEND</h3>
            <div className="legendItems">
              <span>
                <b>D</b> Door
              </span>
              <span>
                <b>W</b> Window
              </span>
              <span>
                <b>V</b> Ventilator
              </span>
            </div>
          </div>

          <div className="scaleBox">
            <strong>SCALE</strong>
            <div className="scaleLine">
              <span />
              <span />
              <span />
            </div>
            <div className="scaleNumbers">
              <span>0</span>
              <span>5'</span>
              <span>10'</span>
              <span>15'</span>
            </div>
          </div>
        </aside>

        <section id="generated-drawing" className="drawingArea">
          {generated && selected ? (
            <>
              <div className="drawingHeader">
                <div>
                  <h1>
                    {floor === 0 ? "GROUND FLOOR PLAN" : floorNames[floor]}
                  </h1>
                  <p>
                    {requirement.plotWidth}'-0" × {requirement.plotLength}'-0"
                  </p>
                </div>

                <div className="northMark">
                  <strong>N</strong>
                  <div>↑</div>
                  <small>
                    W&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;E
                  </small>
                  <strong>S</strong>
                </div>
              </div>

              <div className="floorTabs">
                {floorNames.map((name, index) => (
                  <button
                    key={`${name}-${index}`}
                    onClick={() => setFloor(index)}
                    className={floor === index ? "activeFloor" : ""}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div id="selected-plan" className="planCanvas">
                <PreFloorPlanSvg
                  template={selected.template}
                  requirement={requirement}
                  floor={floor}
                />
              </div>

              <div className="roadLabel">
                {requirement.facing.toUpperCase()} ROAD
              </div>

              <div className="informationGrid">
                <div className="infoCard">
                  <h3>VAASTU ZONE PLACEMENT</h3>

                  <div className="vaastuMatrix">
                    <div>
                      <b>NORTH WEST</b>
                      <span>Toilet / Guest</span>
                    </div>
                    <div>
                      <b>NORTH</b>
                      <span>Living / Open</span>
                    </div>
                    <div>
                      <b>NORTH EAST</b>
                      <span>Pooja / Open</span>
                    </div>

                    <div>
                      <b>WEST</b>
                      <span>Bedroom</span>
                    </div>
                    <div>
                      <b>CENTER</b>
                      <span>Brahmasthan</span>
                    </div>
                    <div>
                      <b>EAST</b>
                      <span>Entry / Open</span>
                    </div>

                    <div>
                      <b>SOUTH WEST</b>
                      <span>Master Bed</span>
                    </div>
                    <div>
                      <b>SOUTH</b>
                      <span>Kitchen / Store</span>
                    </div>
                    <div>
                      <b>SOUTH EAST</b>
                      <span>Kitchen / Utility</span>
                    </div>
                  </div>
                </div>

                <div className="infoCard">
                  <h3>STAIRCASE & CONSTRUCTION DETAILS</h3>
                  <div className="detailRows">
                    <p>
                      <span>Staircase Width</span>
                      <b>3'-0"</b>
                    </p>
                    <p>
                      <span>Tread</span>
                      <b>10"</b>
                    </p>
                    <p>
                      <span>Riser</span>
                      <b>6"</b>
                    </p>
                    <p>
                      <span>Floor Height</span>
                      <b>10'-0"</b>
                    </p>
                    <p>
                      <span>Internal Walls</span>
                      <b>4.5"</b>
                    </p>
                    <p>
                      <span>External Walls</span>
                      <b>9"</b>
                    </p>
                    <p>
                      <span>Door Height</span>
                      <b>7'-0"</b>
                    </p>
                    <p>
                      <span>Window Sill</span>
                      <b>3'-0"</b>
                    </p>
                  </div>
                </div>

                <div className="infoCard">
                  <h3>VAASTU HIGHLIGHTS</h3>
                  <div className="highlightList">
                    <p>✓ Main entry aligned to {requirement.facing}</p>
                    <p>✓ Pooja room in North East zone</p>
                    <p>✓ Kitchen planned toward South East</p>
                    <p>✓ Master bedroom in South West</p>
                    <p>✓ Staircase in South / West zone</p>
                    <p>✓ Open space prioritized in North / East</p>
                    <p>✓ Toilets positioned away from North East</p>
                    <p>✓ Heavy areas retained in South / West</p>
                  </div>
                </div>

                <div className="infoCard">
                  <h3>AREA STATEMENT</h3>
                  <div className="detailRows areaRows">
                    <p>
                      <span>Plot Area</span>
                      <b>{plotArea.toLocaleString("en-IN")} Sq.ft</b>
                    </p>
                    <p>
                      <span>Floor Built-up</span>
                      <b>{floorBuiltUp.toLocaleString("en-IN")} Sq.ft</b>
                    </p>
                    <p>
                      <span>Total Built-up</span>
                      <b>{totalBuiltUp.toLocaleString("en-IN")} Sq.ft</b>
                    </p>
                    <p>
                      <span>Parking Area</span>
                      <b>{parkingArea.toLocaleString("en-IN")} Sq.ft</b>
                    </p>
                    <p>
                      <span>Bedrooms</span>
                      <b>{requirement.bedrooms}</b>
                    </p>
                    <p>
                      <span>Toilets</span>
                      <b>{requirement.toilets}</b>
                    </p>
                  </div>
                </div>
              </div>

              <div className="actionBar">
                <button onClick={downloadSvg}>DOWNLOAD SVG</button>
                <button onClick={() => window.print()}>
                  PRINT / SAVE PDF
                </button>
              </div>

              <div className="technicalNote">
                Closest suitable plan selected automatically from the hidden
                BuildMitra plan library. Preliminary reference drawing only.
                Final setbacks, structural design and authority approval must
                be verified by licensed professionals.
              </div>
            </>
          ) : (
            <div className="emptyState">
              Enter your requirements and click Generate Plan.
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .topHeader {
          max-width: 1600px;
          margin: 0 auto 8px;
          min-height: 48px;
          display: grid;
          grid-template-columns: auto auto 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 5px 8px;
          color: white;
          border-radius: 5px;
          background: linear-gradient(90deg, #101827, #07152c);
        }

        .backButton {
          width: 34px;
          height: 34px;
          border: 1px solid #64748b;
          border-radius: 5px;
          color: white;
          background: #172033;
          cursor: pointer;
          font-size: 18px;
        }

        .brandTitle {
          padding: 8px 12px;
          border-radius: 5px;
          background: #111827;
          font-size: 18px;
          font-weight: 900;
          white-space: nowrap;
        }

        .featureStrip {
          display: flex;
          justify-content: center;
          gap: 18px;
          color: #6ee76e;
          font-size: 12px;
          font-weight: 900;
        }

        .plotBadge {
          padding: 8px 14px;
          border: 1px solid #94a3b8;
          border-radius: 5px;
          font-weight: 900;
          white-space: nowrap;
        }

        .engineGrid {
          max-width: 1600px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 8px;
          align-items: start;
        }

        .inputPanel {
          padding: 11px;
          border: 1px solid #9ca3af;
          border-radius: 5px;
          background: white;
        }

        .panelTitle {
          margin: 0 0 14px;
          text-align: center;
          font-size: 15px;
        }

        .twoColumnFields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-bottom: 10px;
        }

        .fieldStack {
          display: grid;
          gap: 10px;
          margin-bottom: 10px;
        }

        .vaastuBox {
          display: grid;
          gap: 7px;
          margin-top: 10px;
          padding: 10px 8px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
        }

        .vaastuBox h3,
        .legendBox h3 {
          margin: 0 0 4px;
          text-align: center;
          font-size: 11px;
        }

        .generateButton,
        .resetButton {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          border-radius: 5px;
          font-weight: 900;
          cursor: pointer;
        }

        .generateButton {
          border: 0;
          color: white;
          background: linear-gradient(#119223, #057514);
        }

        .resetButton {
          border: 1px solid #94a3b8;
          background: white;
        }

        .legendBox {
          margin-top: 12px;
          padding: 10px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
        }

        .legendItems {
          display: flex;
          justify-content: space-between;
          gap: 5px;
          font-size: 9px;
        }

        .legendItems b {
          display: inline-flex;
          width: 18px;
          height: 18px;
          align-items: center;
          justify-content: center;
          margin-right: 3px;
          border: 1px solid #9ca3af;
          background: #fffdf0;
        }

        .scaleBox {
          margin-top: 14px;
          font-size: 10px;
        }

        .scaleLine {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          height: 8px;
          margin-top: 8px;
          border: 1px solid #111827;
        }

        .scaleLine span:nth-child(odd) {
          background: #111827;
        }

        .scaleNumbers {
          display: flex;
          justify-content: space-between;
          margin-top: 3px;
          font-size: 9px;
        }

        .drawingArea {
          min-width: 0;
          padding: 12px;
          border: 1px solid #9ca3af;
          border-radius: 5px;
          background: white;
        }

        .drawingHeader {
          display: flex;
          justify-content: center;
          position: relative;
          margin-bottom: 5px;
          text-align: center;
        }

        .drawingHeader h1 {
          margin: 0;
          font-size: 18px;
        }

        .drawingHeader p {
          margin: 3px 0 0;
          font-weight: 900;
        }

        .northMark {
          position: absolute;
          left: 5px;
          top: -5px;
          text-align: center;
          font-size: 10px;
        }

        .northMark div {
          font-size: 28px;
          line-height: 22px;
        }

        .floorTabs {
          display: flex;
          justify-content: center;
          gap: 7px;
          margin: 10px 0;
        }

        .floorTabs button {
          padding: 7px 12px;
          border: 1px solid #94a3b8;
          border-radius: 5px;
          background: white;
          font-weight: 800;
          cursor: pointer;
        }

        .floorTabs .activeFloor {
          border-color: #166534;
          color: white;
          background: #15803d;
        }

        .planCanvas {
          max-width: 1050px;
          margin: 0 auto;
          overflow: auto;
          border: 1px solid #cbd5e1;
          background: white;
        }

        .roadLabel {
          max-width: 1050px;
          margin: 6px auto 12px;
          padding: 4px;
          text-align: center;
          border-top: 2px solid #111827;
          font-size: 11px;
          font-weight: 900;
        }

        .informationGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .infoCard {
          min-height: 210px;
          padding: 9px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
        }

        .infoCard h3 {
          margin: 0 0 9px;
          text-align: center;
          font-size: 11px;
        }

        .vaastuMatrix {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          min-height: 170px;
          border-left: 1px solid #94a3b8;
          border-top: 1px solid #94a3b8;
        }

        .vaastuMatrix div {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 5px;
          text-align: center;
          border-right: 1px solid #94a3b8;
          border-bottom: 1px solid #94a3b8;
          background: #f8fafc;
          font-size: 8px;
        }

        .vaastuMatrix div:nth-child(3n) {
          background: #fff4bf;
        }

        .vaastuMatrix div:nth-child(3n + 1) {
          background: #fee2e2;
        }

        .vaastuMatrix b {
          font-size: 8px;
        }

        .detailRows p {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin: 0;
          padding: 5px 0;
          border-bottom: 1px dotted #cbd5e1;
          font-size: 9px;
        }

        .highlightList p {
          margin: 0;
          padding: 5px 0;
          color: #166534;
          font-size: 9px;
          font-weight: 700;
        }

        .areaRows p {
          padding: 7px 0;
        }

        .actionBar {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 12px;
        }

        .actionBar button {
          padding: 10px 16px;
          border: 0;
          border-radius: 5px;
          color: white;
          background: #172033;
          font-weight: 900;
          cursor: pointer;
        }

        .technicalNote {
          margin-top: 10px;
          padding: 8px;
          text-align: center;
          color: #7c2d12;
          background: #fff7ed;
          border: 1px solid #fdba74;
          border-radius: 5px;
          font-size: 10px;
        }

        .emptyState {
          display: grid;
          min-height: 500px;
          place-items: center;
          color: #64748b;
          font-weight: 800;
        }

        @media (max-width: 1100px) {
          .topHeader {
            grid-template-columns: auto 1fr auto;
          }

          .featureStrip {
            display: none;
          }

          .informationGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .topHeader {
            grid-template-columns: auto 1fr;
          }

          .plotBadge {
            grid-column: 1 / -1;
            text-align: center;
          }

          .brandTitle {
            font-size: 14px;
          }

          .engineGrid {
            grid-template-columns: 1fr;
          }

          .inputPanel {
            position: static;
          }

          .informationGrid {
            grid-template-columns: 1fr;
          }

          .drawingArea {
            padding: 7px;
          }

          .floorTabs {
            overflow-x: auto;
            justify-content: flex-start;
          }

          .floorTabs button {
            white-space: nowrap;
          }
        }

        @media print {
          .topHeader,
          .inputPanel,
          .floorTabs,
          .actionBar,
          .technicalNote {
            display: none !important;
          }

          .engineGrid {
            display: block;
          }

          .drawingArea {
            border: 0;
            padding: 0;
          }

          main {
            padding: 0;
            background: white;
          }
        }
      `}</style>
    </main>
  );
}

