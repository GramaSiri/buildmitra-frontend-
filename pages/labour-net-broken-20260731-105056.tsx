import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Sidebar from "../components/Sidebar";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000";

type LabourRecord = {
  _id?: string;
  labourCode?: string;
  name?: string;
  skill?: string | string[];
  phone?: string;
  uploaderName?: string;
  uploaderPhone?: string;
  location?: string;
  city?: string;
  area?: string;
  pincode?: string;
  experience?: string | number;
  rate?: string | number;
  rateUnit?: string;
  availability?: string;
  teamSize?: string | number;
  description?: string;
  languages?: string | string[];
  image?: string;
  rawDetails?: Record<string, any>;
};

type EnquiryForm = {
  buyerName: string;
  buyerPhone: string;
  location: string;
  requirement: string;
  startDate: string;
  numberOfWorkers: string;
  message: string;
};

const emptyForm: EnquiryForm = {
  buyerName: "",
  buyerPhone: "",
  location: "",
  requirement: "",
  startDate: "",
  numberOfWorkers: "1",
  message: ""
};

function cleanPhone(value?: string) {
  return String(value || "").replace(/[^\d]/g, "");
}

function textValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === true) return "Yes";
  if (value === false) return "No";

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return String(value ?? "");
}

function loadLoggedInUser() {
  if (typeof window === "undefined") return {};

  const keys = [
    "currentUser",
    "loggedInUser",
    "user",
    "buildmitraUser"
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (raw) {
        const parsed = JSON.parse(raw);

        return parsed?.user || parsed;
      }
    } catch {
      // Ignore invalid saved values.
    }
  }

  return {};
}

export default function LabourNet() {
  const [labours, setLabours] = useState<LabourRecord[]>([]);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLabour, setSelectedLabour] =
    useState<LabourRecord | null>(null);
  const [detailsLabour, setDetailsLabour] =
    useState<LabourRecord | null>(null);
  const [form, setForm] = useState<EnquiryForm>(emptyForm);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadLabours();

    const user: any = loadLoggedInUser();

    setForm((current) => ({
      ...current,
      buyerName:
        user.name ||
        user.fullName ||
        user.userName ||
        "",
      buyerPhone:
        user.phone ||
        user.mobile ||
        user.mobileNumber ||
        ""
    }));
  }, []);

  async function loadLabours() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/labour-net`);

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || `Labour API failed: ${response.status}`
        );
      }

      const rows = Array.isArray(result)
        ? result
        : result.labours || result.data || result.items || [];

      const safeRows = rows.map((row: any) => ({
        ...row,
        labourCode: textValue(row.labourCode),
        name: textValue(row.name) || "Labour Provider",
        skill: textValue(row.skill) || "General Labour",
        phone: textValue(row.phone),
        uploaderName: textValue(row.uploaderName),
        uploaderPhone: textValue(row.uploaderPhone),
        location: textValue(row.location) || "Location not provided",
        city: textValue(row.city),
        area: textValue(row.area),
        pincode: textValue(row.pincode),
        experience: textValue(row.experience),
        rate: textValue(row.rate),
        rateUnit: textValue(row.rateUnit),
        availability: textValue(row.availability) || "Available",
        teamSize: textValue(row.teamSize),
        description: textValue(row.description),
        languages: textValue(row.languages),
        image:
          typeof row.image === "string"
            ? row.image
            : ""
      }));

      setLabours(safeRows);
    } catch (err: any) {
      setError(
        err?.message ||
        "Unable to load labour records."
      );
    } finally {
      setLoading(false);
    }
  }

  const skills = useMemo(() => {
    return Array.from(
      new Set(
        labours
          .map((item) => textValue(item.skill))
          .filter(Boolean)
      )
    ).sort();
  }, [labours]);

  const locations = useMemo(() => {
    return Array.from(
      new Set(
        labours
          .map((item) => item.city || item.area || item.location)
          .filter(Boolean) as string[]
      )
    ).sort();
  }, [labours]);

  const filteredLabours = useMemo(() => {
    const query = search.trim().toLowerCase();

    return labours.filter((labour) => {
      const searchable = [
        labour.name,
        labour.labourCode,
        textValue(labour.skill),
        labour.location,
        labour.city,
        labour.area,
        labour.pincode,
        labour.phone,
        labour.uploaderName,
        labour.uploaderPhone,
        labour.description,
        labour.experience,
        labour.teamSize
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesSkill =
        !skillFilter ||
        textValue(labour.skill) === skillFilter;

      const matchesLocation =
        !locationFilter ||
        labour.city === locationFilter ||
        labour.area === locationFilter ||
        labour.location === locationFilter;

      return matchesSearch && matchesSkill && matchesLocation;
    });
  }, [labours, search, skillFilter, locationFilter]);

  function openEnquiry(labour: LabourRecord) {
    setSelectedLabour(labour);
    setNotice("");
  }

  function openWhatsApp(labour: LabourRecord) {
    const phone = cleanPhone(
      labour.uploaderPhone || labour.phone
    );

    if (!phone) {
      alert("Uploader contact number is not available.");
      return;
    }

    const finalPhone =
      phone.length === 10 ? `91${phone}` : phone;

    const message = encodeURIComponent(
      `Hello ${labour.uploaderName || labour.name || "Labour Provider"},\n\n` +
      `I found your labour listing on BuildMitra Labour Net.\n\n` +
      `Labour: ${labour.name || "Labour Provider"}\n` +
      `Skill: ${textValue(labour.skill) || "General Labour"}\n` +
      `Code: ${labour.labourCode || ""}\n\n` +
      `Please share availability, rate and engagement details.`
    );

    window.open(
      `https://wa.me/${finalPhone}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function submitEnquiry(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!selectedLabour) return;

    if (!form.buyerName.trim() || !form.buyerPhone.trim()) {
      setNotice("Buyer name and phone number are required.");
      return;
    }

    try {
      setSending(true);
      setNotice("");

      const user: any = loadLoggedInUser();

      const response = await fetch(
        `${API_BASE}/api/labour-net/enquiry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            labourId: selectedLabour._id,
            labourCode: selectedLabour.labourCode,
            labourName: selectedLabour.name,
            providerUserCode:
              selectedLabour.rawDetails?.providerUserCode ||
              selectedLabour.rawDetails?.userCode ||
              selectedLabour.rawDetails?.labourCode,
            providerName:
              selectedLabour.uploaderName ||
              selectedLabour.name,
            providerPhone:
              selectedLabour.uploaderPhone ||
              selectedLabour.phone,
            buyerUserCode:
              user.userCode ||
              user.buyerUserCode ||
              user.code,
            ...form
          })
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to send enquiry"
        );
      }

      setNotice(
        `Enquiry sent successfully. Code: ${result.enquiryCode}`
      );

      setForm((current) => ({
        ...emptyForm,
        buyerName: current.buyerName,
        buyerPhone: current.buyerPhone
      }));
    } catch (err: any) {
      setNotice(err?.message || "Failed to send enquiry.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Head>
        <title>Labour Net | BuildMitra</title>
      </Head>

      <div className="pageShell">
        <Sidebar />

        <main className="mainContent">
          <section className="hero">
            <div>
              <span className="eyebrow">BUILDMITRA WORKFORCE</span>
              <h1>👷 Labour Net</h1>
              <p>
                Find labourers, skilled workers, teams and labour
                contractors. Check skills, rates, availability and
                contact details before engagement.
              </p>
            </div>

            <button className="refreshButton" onClick={loadLabours}>
              Refresh Listings
            </button>
          </section>

          <section className="filters">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, skill, code, phone, location..."
            />

            <select
              value={skillFilter}
              onChange={(event) =>
                setSkillFilter(event.target.value)
              }
            >
              <option value="">All skills</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(event) =>
                setLocationFilter(event.target.value)
              }
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </section>

          <div className="summary">
            Showing <strong>{filteredLabours.length}</strong> of{" "}
            <strong>{labours.length}</strong> labour listings
          </div>

          {loading && (
            <div className="stateBox">
              Loading labour records...
            </div>
          )}

          {!loading && error && (
            <div className="stateBox error">{error}</div>
          )}

          {!loading &&
            !error &&
            filteredLabours.length === 0 && (
              <div className="stateBox">
                No matching labour records found.
              </div>
            )}

          {!loading &&
            !error &&
            filteredLabours.length > 0 && (
              <section className="grid">
                {filteredLabours.map((labour, index) => {
                  const contact =
                    labour.uploaderPhone || labour.phone;

                  return (
                    <article
                      className="card"
                      key={
                        labour._id ||
                        labour.labourCode ||
                        index
                      }
                    >
                      <div className="imageBox">
                        {labour.image ? (
                          <img
                            src={labour.image}
                            alt={labour.name || "Labour"}
                          />
                        ) : (
                          <div className="placeholder">👷</div>
                        )}

                        <span className="availability">
                          {labour.availability || "Available"}
                        </span>
                      </div>

                      <div className="cardBody">
                        <div className="code">
                          {labour.labourCode || "LABOUR"}
                        </div>

                        <h2>
                          {labour.name || "Labour Provider"}
                        </h2>

                        <div className="skill">
                          {textValue(labour.skill) ||
                            "General Labour"}
                        </div>

                        <div className="details">
                          <div>
                            <span>Location</span>
                            <strong>
                              {labour.location ||
                                "Not provided"}
                            </strong>
                          </div>

                          <div>
                            <span>Experience</span>
                            <strong>
                              {labour.experience
                                ? `${labour.experience} years`
                                : "Not provided"}
                            </strong>
                          </div>

                          <div>
                            <span>Team size</span>
                            <strong>
                              {labour.teamSize || "Individual"}
                            </strong>
                          </div>

                          <div>
                            <span>Rate</span>
                            <strong>
                              {labour.rate
                                ? `₹${labour.rate} / ${
                                    labour.rateUnit || "day"
                                  }`
                                : "Contact for rate"}
                            </strong>
                          </div>
                        </div>

                        {labour.description && (
                          <p className="description">
                            {labour.description}
                          </p>
                        )}

                        <div className="uploader">
                          <span>Uploaded by</span>
                          <strong>
                            {labour.uploaderName ||
                              labour.name ||
                              "Provider"}
                          </strong>
                          <small>
                            {contact ||
                              "Contact number not provided"}
                          </small>
                        </div>

                        <div className="actions">
                          <button
                            className="detailsButton"
                            onClick={() =>
                              setDetailsLabour(labour)
                            }
                          >
                            Full Details
                          </button>

                          {contact && (
                            <a
                              className="callButton"
                              href={`tel:${contact}`}
                            >
                              Call
                            </a>
                          )}

                          <button
                            className="whatsappButton"
                            onClick={() => openWhatsApp(labour)}
                          >
                            WhatsApp
                          </button>

                          <button
                            className="enquiryButton"
                            onClick={() => openEnquiry(labour)}
                          >
                            Send Enquiry
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
        </main>
      </div>

      {detailsLabour && (
        <div
          className="modalOverlay"
          onClick={() => setDetailsLabour(null)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="closeButton"
              onClick={() => setDetailsLabour(null)}
            >
              ×
            </button>

            <h2>{detailsLabour.name}</h2>
            <p className="modalSubtitle">
              Complete uploaded labour information
            </p>

            <div className="fullDetails">
              {Object.entries(
                detailsLabour.rawDetails || detailsLabour
              )
                .filter(
                  ([key, value]) =>
                    ![
                      "__v",
                      "password",
                      "otp",
                      "token",
                      "pin"
                    ].includes(key.toLowerCase()) &&
                    value !== null &&
                    value !== undefined &&
                    textValue(value) !== ""
                )
                .map(([key, value]) => (
                  <div key={key}>
                    <span>
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/_/g, " ")
                        .replace(/^./, (letter) =>
                          letter.toUpperCase()
                        )}
                    </span>
                    <strong>{textValue(value)}</strong>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {selectedLabour && (
        <div
          className="modalOverlay"
          onClick={() => setSelectedLabour(null)}
        >
          <form
            className="modal enquiryModal"
            onSubmit={submitEnquiry}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="closeButton"
              onClick={() => setSelectedLabour(null)}
            >
              ×
            </button>

            <h2>Engage {selectedLabour.name}</h2>
            <p className="modalSubtitle">
              Send your requirement directly to the labour
              provider.
            </p>

            <div className="formGrid">
              <input
                required
                placeholder="Your name"
                value={form.buyerName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    buyerName: event.target.value
                  })
                }
              />

              <input
                required
                placeholder="Mobile number"
                value={form.buyerPhone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    buyerPhone: event.target.value
                  })
                }
              />

              <input
                placeholder="Work location"
                value={form.location}
                onChange={(event) =>
                  setForm({
                    ...form,
                    location: event.target.value
                  })
                }
              />

              <input
                placeholder="Number of workers"
                value={form.numberOfWorkers}
                onChange={(event) =>
                  setForm({
                    ...form,
                    numberOfWorkers: event.target.value
                  })
                }
              />

              <input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm({
                    ...form,
                    startDate: event.target.value
                  })
                }
              />

              <input
                placeholder="Work requirement"
                value={form.requirement}
                onChange={(event) =>
                  setForm({
                    ...form,
                    requirement: event.target.value
                  })
                }
              />

              <textarea
                placeholder="Additional details"
                value={form.message}
                onChange={(event) =>
                  setForm({
                    ...form,
                    message: event.target.value
                  })
                }
              />
            </div>

            {notice && <div className="notice">{notice}</div>}

            <button
              className="submitButton"
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Labour Enquiry"}
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .pageShell {
          min-height: 100vh;
          background: #f3f6fa;
        }

        .mainContent {
          margin-left: 280px;
          padding: 24px;
          min-height: 100vh;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          padding: 28px;
          border-radius: 18px;
          background: linear-gradient(135deg, #17365d, #176b87);
          color: white;
        }

        .hero h1 {
          margin: 5px 0 8px;
          font-size: 32px;
        }

        .hero p {
          max-width: 760px;
          margin: 0;
          line-height: 1.6;
          opacity: 0.92;
        }

        .eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .refreshButton {
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 10px;
          padding: 11px 18px;
          color: white;
          background: rgba(255, 255, 255, 0.14);
          cursor: pointer;
          white-space: nowrap;
        }

        .filters {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 12px;
          padding: 18px;
          margin-top: 18px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 4px 18px rgba(30, 50, 80, 0.08);
        }

        .filters input,
        .filters select,
        .formGrid input,
        .formGrid textarea {
          width: 100%;
          min-width: 0;
          padding: 12px 13px;
          border: 1px solid #d8e0ea;
          border-radius: 9px;
          font: inherit;
          background: white;
          box-sizing: border-box;
        }

        .summary {
          margin: 18px 2px;
          color: #526176;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(310px, 1fr)
          );
          gap: 18px;
        }

        .card {
          overflow: hidden;
          border: 1px solid #e0e7ef;
          border-radius: 16px;
          background: white;
          box-shadow: 0 7px 22px rgba(35, 50, 75, 0.08);
        }

        .imageBox {
          position: relative;
          height: 175px;
          background: #e9f1f6;
        }

        .imageBox img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 70px;
        }

        .availability {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 10px;
          border-radius: 20px;
          color: #08713e;
          background: #e8fff1;
          font-size: 12px;
          font-weight: 700;
        }

        .cardBody {
          padding: 18px;
        }

        .code {
          color: #718096;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.7px;
        }

        .card h2 {
          margin: 5px 0;
          font-size: 21px;
          color: #17263b;
        }

        .skill {
          color: #176b87;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .details div,
        .fullDetails div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .details span,
        .uploader span,
        .fullDetails span {
          color: #758398;
          font-size: 12px;
        }

        .details strong,
        .fullDetails strong {
          overflow-wrap: anywhere;
          color: #26384e;
          font-size: 13px;
        }

        .description {
          color: #526176;
          line-height: 1.5;
        }

        .uploader {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-top: 15px;
          padding: 12px;
          border-radius: 10px;
          background: #f5f8fb;
        }

        .uploader small {
          color: #526176;
        }

        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 15px;
        }

        .actions button,
        .actions a {
          padding: 10px 8px;
          border: 0;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .detailsButton {
          color: #17365d;
          background: #eaf0f7;
        }

        .callButton {
          color: white;
          background: #1769aa;
        }

        .whatsappButton {
          color: white;
          background: #118c4f;
        }

        .enquiryButton,
        .submitButton {
          color: white;
          background: #e66a18;
        }

        .stateBox {
          padding: 28px;
          border-radius: 14px;
          background: white;
          text-align: center;
        }

        .error {
          color: #b42318;
          background: #fff1f0;
        }

        .modalOverlay {
          position: fixed;
          z-index: 9999;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(13, 27, 45, 0.68);
        }

        .modal {
          position: relative;
          width: min(760px, 100%);
          max-height: 88vh;
          overflow-y: auto;
          padding: 26px;
          border-radius: 16px;
          background: white;
        }

        .modal h2 {
          margin: 0;
        }

        .modalSubtitle {
          margin-top: 5px;
          color: #66758a;
        }

        .closeButton {
          position: absolute;
          top: 12px;
          right: 14px;
          border: 0;
          background: transparent;
          font-size: 28px;
          cursor: pointer;
        }

        .fullDetails {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 22px;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 20px;
        }

        .formGrid textarea {
          grid-column: 1 / -1;
          min-height: 100px;
          resize: vertical;
        }

        .notice {
          margin-top: 14px;
          padding: 11px;
          border-radius: 8px;
          background: #eef7ff;
          color: #174d72;
        }

        .submitButton {
          width: 100%;
          margin-top: 16px;
          padding: 13px;
          border: 0;
          border-radius: 9px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .mainContent {
            margin-left: 0;
            padding: 14px;
          }

          .hero {
            align-items: flex-start;
            flex-direction: column;
          }

          .filters {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .hero {
            padding: 20px;
          }

          .hero h1 {
            font-size: 26px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .details,
          .fullDetails,
          .formGrid {
            grid-template-columns: 1fr;
          }

          .formGrid textarea {
            grid-column: auto;
          }
        }
      `}</style>
    </>
  );
}

