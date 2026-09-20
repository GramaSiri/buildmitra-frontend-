import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Sidebar from "../components/Sidebar";
import { getApiBase } from "../utils/apiConfig";

const API_BASE = getApiBase();

type Worker = {
  _id?: string;
  workerCode?: string;
  name?: string;
  skill?: string;
  dailyWage?: string;
  rateUnit?: string;
  mobile?: string;
  status?: string;
  location?: string;
  pincode?: string;
  experience?: string;
  teamSize?: string;
  description?: string;
  photo?: string;
  uploaderName?: string;
  uploaderMobile?: string;
  stayingAvailable?: boolean | string;
  stayingCost?: string;
  foodAvailable?: boolean | string;
  foodCost?: string;
  conveyanceAvailable?: boolean | string;
  conveyanceCost?: string;
  pickupDropAvailable?: boolean | string;
  pickupDropDetails?: string;
  pickupDropCost?: string;
  workingHours?: string;
  overtimeRate?: string;
  availableFrom?: string;
  listingType?: "supplier" | "individual";
};

function text(value: unknown, fallback = "Not provided") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.join(", ") || fallback;
  }

  if (typeof value === "object") {
    return fallback;
  }

  return String(value);
}

function yes(value: unknown) {
  return (
    value === true ||
    String(value).toLowerCase() === "true" ||
    String(value).toLowerCase() === "yes" ||
    String(value).toLowerCase() === "available"
  );
}

function digits(value?: string) {
  return String(value || "").replace(/\D/g, "");
}



export default function LabourNet() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [listingType, setListingType] = useState("");
  const [tradeCategory, setTradeCategory] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Worker | null>(null);

  async function loadWorkers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/labour-net`);
      if (!response.ok) {
        throw new Error(`API status ${response.status}`);
      }
      const body = await response.json();

      const rows = Array.isArray(body.labours)
        ? body.labours
        : Array.isArray(body.workers)
        ? body.workers
        : [];

      const validRows = rows.filter((r: any) => r.name && r.name !== "Worker A");
      setWorkers(validRows);
    } catch (err: any) {
      console.log("Labour Net built-in directory active:", err?.message);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkers();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workers.filter((worker) => {
      const combined = [
        worker.name,
        worker.workerCode,
        worker.skill,
        worker.mobile,
        worker.location,
        worker.pincode,
        worker.status,
        worker.uploaderName,
        worker.teamSize,
        worker.description,
      ]
        .map((item) => String(item || ""))
        .join(" ")
        .toLowerCase();

      const searchMatch = !query || combined.includes(query);

      const statusMatch =
        !status ||
        String(worker.status || "").toLowerCase().includes(status.toLowerCase());

      const workerPin = String(worker.pincode || "")
        .replace(/\D/g, "")
        .slice(-6);

      const pinMatch = !pincode || workerPin.includes(pincode);

      const isSupplierItem =
        worker.listingType === "supplier" ||
        (worker.teamSize &&
          worker.teamSize !== "Individual" &&
          !worker.teamSize.includes("1 worker"));

      const typeMatch =
        !listingType ||
        (listingType === "supplier" && isSupplierItem) ||
        (listingType === "individual" && !isSupplierItem);

      const tradeMatch =
        !tradeCategory ||
        String(worker.skill || "").toLowerCase().includes(tradeCategory.toLowerCase());

      return searchMatch && statusMatch && pinMatch && typeMatch && tradeMatch;
    });
  }, [workers, search, status, pincode, listingType, tradeCategory]);

  async function openWhatsApp(worker: Worker) {
    let phone = digits(worker.mobile || worker.uploaderMobile);

    if (!phone) {
      alert("Contact number is not available for this record.");
      return;
    }

    if (phone.length === 10) phone = `91${phone}`;

    try {
      let currentUser: any = {};
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("currentUser") || localStorage.getItem("user");
        if (stored) {
          try {
            currentUser = JSON.parse(stored);
          } catch {}
        }
      }

      const buyerName = currentUser.name || currentUser.fullName || "";
      const buyerPhone = currentUser.phone || currentUser.mobile || "";

      if (buyerName && digits(buyerPhone).length >= 10) {
        await fetch(`${API_BASE}/api/enquiry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enquiryCategory: "general",
            buyerName,
            buyerPhone,
            providerName: worker.name || "Labour Provider",
            itemType: "labour",
            itemName: worker.skill || worker.name || "Labour Requirement",
            listingCode: worker.workerCode || String(worker._id || ""),
            unit: worker.rateUnit || "day",
            location: worker.location || "",
            message: "Enquiry created from BuildMitra Labour Net",
          }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error("Labour enquiry logging notice:", e);
    }

    const message = encodeURIComponent(
      `Hello ${text(worker.name, "Labour Provider")},\n\n` +
        `I found your profile on BuildMitra Labour Net.\n\n` +
        `Skill / Category: ${text(worker.skill)}\n` +
        `Rate: ${worker.dailyWage ? `₹${worker.dailyWage}/${worker.rateUnit || "day"}` : "Please share"}\n` +
        `Team Size: ${text(worker.teamSize, "Individual")}\n` +
        `Location: ${text(worker.location)}\n\n` +
        `Please let me know availability for our construction project.`
    );

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  }

  return (
    <>
      <Head>
        <title>Labour Net | BuildMitra</title>
        <meta
          name="description"
          content="Find skilled construction workers, labour teams and verified labour contractors with transparent rates across Karnataka."
        />
      </Head>

      <>
        <main className="page">
          {/* HERO BANNER */}
          <section className="hero">
            <div>
              <span className="badge">BUILDMITRA WORKFORCE PLATFORM</span>
              <h1>👷 Labour Net Directory</h1>
              <p>
                Browse verified construction labour suppliers, specialized trade contractors, and skilled / semi-skilled individual workers across Bengaluru & Karnataka.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => (window.location.href = "/labour-attendance")}
                style={{
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  border: 0,
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                📍 50m Geofence Attendance
              </button>
              <button type="button" onClick={loadWorkers} disabled={loading}>
                {loading ? "Refreshing..." : "🔄 Refresh Directory"}
              </button>
            </div>
          </section>

          {/* FILTER TOOLBAR */}
          <section className="filters">
            <input
              type="text"
              placeholder="🔍 Search name, skill, location, pincode..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={listingType}
              onChange={(event) => setListingType(event.target.value)}
            >
              <option value="">All Listing Types</option>
              <option value="supplier">🏢 Labour Suppliers / Contractors</option>
              <option value="individual">👷 Individual Workers</option>
            </select>

            <select
              value={tradeCategory}
              onChange={(event) => setTradeCategory(event.target.value)}
            >
              <option value="">All Trade Categories</option>
              <option value="Mason">🧱 Masons (Civil / Brick / Block)</option>
              <option value="Helper">🔨 Helpers & Site General Labour</option>
              <option value="Bar Bender">🔩 Bar Benders & Steel Fixers</option>
              <option value="Shuttering">🏗️ Shuttering & Formwork Carpenters</option>
              <option value="Electrician">⚡ Electricians & Conduit Wiring</option>
              <option value="Plumber">🔧 Plumbers & Sanitary Installers</option>
              <option value="Painter">🎨 Painters & Wall Finishing</option>
              <option value="Tile">📐 Tile Masons & Flooring Layers</option>
              <option value="Granite">🪨 Granite & Marble Specialists</option>
              <option value="Ceiling">🏠 False Ceiling & Gypsum POP</option>
              <option value="Waterproofing">💧 Waterproofing Technicians</option>
              <option value="Welder">🔥 Welders & Structural Fabricators</option>
              <option value="Aluminium">🪟 Aluminium & Glass Fitters</option>
              <option value="Earthwork">🚜 Earthwork & Excavation Labour</option>
              <option value="Scaffolding">🪜 Scaffolding & Rigging Crews</option>
              <option value="Solar">☀️ HVAC / Solar / CCTV / Fire Techs</option>
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available Today</option>
              <option value="Week">Available This Week</option>
              <option value="Deployed">Deployed / Busy</option>
            </select>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="PIN code (e.g. 560064)"
              value={pincode}
              onChange={(event) =>
                setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </section>

          {/* COUNTER BADGE BAR */}
          <div className="countBar">
            <span>
              Showing <strong>{filtered.length}</strong> of <strong>{workers.length}</strong> verified labour listings
            </span>
            <div className="stats">
              <span style={{ color: "#ea580c" }}>🏢 10 Suppliers</span>
              <span style={{ color: "#0284c7" }}>👷 30 Individual Workers</span>
            </div>
          </div>

          {error && <div className="message error">{error}</div>}

          {loading ? (
            <div className="message">Loading BuildMitra Labour Directory...</div>
          ) : filtered.length === 0 ? (
            <div className="message">
              No labour records match your selected filter criteria. Try clearing search or filter options.
            </div>
          ) : (
            <section className="grid">
              {filtered.map((worker, index) => {
                const contact = worker.mobile || worker.uploaderMobile;
                const isSupplier =
                  worker.listingType === "supplier" ||
                  (worker.teamSize &&
                    worker.teamSize !== "Individual" &&
                    !worker.teamSize.includes("1 worker"));

                return (
                  <article key={worker._id || worker.workerCode || index} className="card">
                    {/* CARD TYPE TAG */}
                    <div className={isSupplier ? "supplierTag" : "workerTag"}>
                      {isSupplier ? "🏢 LABOUR CONTRACTOR / SUPPLIER" : "👷 INDIVIDUAL WORKER"}
                    </div>

                    <div className="cardTop">
                      <div>
                        <small>{text(worker.workerCode, `LAB-${index + 1}`)}</small>
                        <h2>{text(worker.name)}</h2>
                        <strong className="skill">{text(worker.skill, "General Labour")}</strong>
                      </div>

                      <div className="photo">{isSupplier ? "🏢" : "👷"}</div>
                    </div>

                    <div className="status">{text(worker.status, "Available Today")}</div>

                    <div className="costBox">
                      <span>Rate / Pricing</span>
                      <strong>
                        {worker.dailyWage
                          ? `₹${worker.dailyWage}/${worker.rateUnit || "day"}`
                          : "Contact for Rate"}
                      </strong>
                    </div>

                    <div className="details">
                      <div>
                        <label>Location</label>
                        <strong>{text(worker.location)}</strong>
                      </div>

                      <div>
                        <label>Experience</label>
                        <strong>{text(worker.experience)}</strong>
                      </div>

                      <div>
                        <label>Team Size</label>
                        <strong style={{ color: isSupplier ? "#ea580c" : "#0f172a" }}>
                          {text(worker.teamSize, "Individual")}
                        </strong>
                      </div>

                      <div>
                        <label>Working Hours</label>
                        <strong>{text(worker.workingHours, "8 hrs/day")}</strong>
                      </div>
                    </div>

                    <h3>Facilities & Support</h3>

                    <div className="facilityGrid">
                      <div>
                        <span>Staying</span>
                        <strong>
                          {yes(worker.stayingAvailable)
                            ? worker.stayingCost
                              ? `₹${worker.stayingCost}`
                              : "Available"
                            : "Not Available"}
                        </strong>
                      </div>

                      <div>
                        <span>Food</span>
                        <strong>
                          {yes(worker.foodAvailable)
                            ? worker.foodCost
                              ? `₹${worker.foodCost}`
                              : "Available"
                            : "Not Available"}
                        </strong>
                      </div>

                      <div>
                        <span>Conveyance</span>
                        <strong>
                          {yes(worker.conveyanceAvailable)
                            ? worker.conveyanceCost
                              ? `₹${worker.conveyanceCost}`
                              : "Included"
                            : "Not Available"}
                        </strong>
                      </div>

                      <div>
                        <span>Pickup/Drop</span>
                        <strong>
                          {yes(worker.pickupDropAvailable)
                            ? text(worker.pickupDropDetails, "Available")
                            : "Not Available"}
                        </strong>
                      </div>
                    </div>

                    <div className="provider">
                      <span>Uploaded By</span>
                      <strong>{text(worker.uploaderName, worker.name || "Provider")}</strong>
                      <small>{text(contact, "Contact not provided")}</small>
                    </div>

                    <div className="actions">
                      <button type="button" onClick={() => setSelected(worker)}>
                        Details
                      </button>

                      {contact ? (
                        <a href={`tel:${contact}`}>Call</a>
                      ) : (
                        <button type="button" disabled>
                          Call
                        </button>
                      )}

                      <button type="button" onClick={() => openWhatsApp(worker)}>
                        WhatsApp
                      </button>

                      <button type="button" onClick={() => openWhatsApp(worker)}>
                        Enquiry
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </main>
      </>

      {/* DETAILS MODAL */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="close" onClick={() => setSelected(null)}>
              ×
            </button>

            <h2>{text(selected.name)}</h2>
            <p style={{ color: "#0284c7", fontWeight: 700 }}>{text(selected.skill)}</p>

            <div className="modalGrid">
              <div>
                <span>Rate / Pricing</span>
                <strong>
                  {selected.dailyWage
                    ? `₹${selected.dailyWage}/${selected.rateUnit || "day"}`
                    : "Not provided"}
                </strong>
              </div>
              <div>
                <span>Availability Status</span>
                <strong>{text(selected.status)}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{text(selected.location)}</strong>
              </div>
              <div>
                <span>PIN Code</span>
                <strong>{text(selected.pincode)}</strong>
              </div>
              <div>
                <span>Experience</span>
                <strong>{text(selected.experience)}</strong>
              </div>
              <div>
                <span>Team / Crew Size</span>
                <strong>{text(selected.teamSize)}</strong>
              </div>
              <div>
                <span>Mobile Contact</span>
                <strong>{text(selected.mobile)}</strong>
              </div>
              <div>
                <span>Working Hours</span>
                <strong>{text(selected.workingHours)}</strong>
              </div>
              <div>
                <span>Overtime Rate</span>
                <strong>{text(selected.overtimeRate)}</strong>
              </div>
              <div>
                <span>Staying Support</span>
                <strong>
                  {yes(selected.stayingAvailable)
                    ? selected.stayingCost || "Available"
                    : "Not Available"}
                </strong>
              </div>
              <div>
                <span>Food Support</span>
                <strong>
                  {yes(selected.foodAvailable)
                    ? selected.foodCost || "Available"
                    : "Not Available"}
                </strong>
              </div>
              <div>
                <span>Conveyance Support</span>
                <strong>
                  {yes(selected.conveyanceAvailable)
                    ? selected.conveyanceCost || "Included"
                    : "Not Available"}
                </strong>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span>Workforce Overview & Description</span>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#334155" }}>
                  {text(selected.description, "No additional description available.")}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => openWhatsApp(selected)}
                style={{
                  flex: 1,
                  background: "#16a34a",
                  color: "#fff",
                  border: 0,
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                💬 Contact on WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  background: "#e2e8f0",
                  color: "#0f172a",
                  border: 0,
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 24px;
          background: #f8fafc;
          color: #0f172a;
          font-family: inherit;
        }

        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 24px;
          border-radius: 16px;
          color: white;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
        }

        .badge {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.2px;
          color: #ff7a00;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 4px 0;
          font-size: 26px;
          font-weight: 900;
        }

        .hero p {
          max-width: 760px;
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: #94a3b8;
        }

        .hero button {
          padding: 10px 16px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.2s;
        }

        .hero button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .filters {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr 120px;
          gap: 10px;
          margin-top: 16px;
          padding: 14px;
          border-radius: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .filters input,
        .filters select {
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font: inherit;
          font-size: 13px;
          color: #0f172a;
          background: #ffffff;
        }

        .countBar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 14px 2px;
          color: #64748b;
          font-size: 13px;
        }

        .stats {
          display: flex;
          gap: 16px;
          font-weight: 800;
          font-size: 12px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 16px;
        }

        .card {
          position: relative;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }

        .supplierTag {
          font-size: 10px;
          font-weight: 900;
          color: #ea580c;
          background: #fff7ed;
          border: 1px solid #ffedd5;
          padding: 3px 8px;
          border-radius: 6px;
          margin-bottom: 8px;
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .workerTag {
          font-size: 10px;
          font-weight: 900;
          color: #0284c7;
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
          padding: 3px 8px;
          border-radius: 6px;
          margin-bottom: 8px;
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .cardTop small {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
        }

        .cardTop h2 {
          margin: 2px 0;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .skill {
          color: #0284c7;
          font-size: 12px;
          font-weight: 700;
        }

        .photo {
          flex: 0 0 45px;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #f1f5f9;
          font-size: 22px;
        }

        .status {
          display: inline-block;
          align-self: flex-start;
          margin: 8px 0;
          padding: 3px 10px;
          border-radius: 12px;
          background: #f0fdf4;
          color: #166534;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid #bbf7d0;
        }

        .costBox {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 12px;
        }

        .costBox span {
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }

        .costBox strong {
          color: #166534;
          font-size: 14px;
          font-weight: 900;
        }

        .details,
        .facilityGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }

        .details div,
        .facilityGrid div,
        .modalGrid div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        label,
        .facilityGrid span,
        .provider span,
        .modalGrid span {
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .details strong,
        .facilityGrid strong {
          font-size: 12px;
          color: #1e293b;
        }

        h3 {
          margin: 10px 0 2px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .provider {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          font-size: 11px;
        }

        .actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-top: 12px;
        }

        .actions button,
        .actions a {
          padding: 8px 4px;
          border: 0;
          border-radius: 8px;
          background: #0f172a;
          color: white;
          text-align: center;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s;
        }

        .actions button:hover,
        .actions a:hover {
          opacity: 0.9;
        }

        .actions button:nth-child(3) {
          background: #16a34a;
        }

        .actions button:nth-child(4) {
          background: #ea580c;
        }

        .actions button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .message {
          padding: 24px;
          border-radius: 12px;
          background: white;
          text-align: center;
          font-size: 14px;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .error {
          color: #b42318;
          background: #fff0ef;
        }

        .overlay {
          position: fixed;
          z-index: 9999;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
        }

        .modal {
          position: relative;
          width: min(650px, 100%);
          max-height: 85vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 16px;
          background: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .close {
          position: absolute;
          top: 12px;
          right: 16px;
          border: 0;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
        }

        .modalGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        @media (max-width: 900px) {
          .filters {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 12px;
          }

          .hero {
            align-items: flex-start;
            flex-direction: column;
          }

          .filters,
          .details,
          .facilityGrid,
          .modalGrid {
            grid-template-columns: 1fr;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .countBar {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>
    </>
  );
}



