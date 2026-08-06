import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000";

type Labour = {
  _id: string;
  labourCode: string;
  name: string;
  skill: string;
  phone: string;
  uploaderName: string;
  uploaderPhone: string;
  location: string;
  experience: string;
  rate: string;
  rateUnit: string;
  availability: string;
  teamSize: string;
  description: string;
  image: string;
};

function safeText(value: any): string {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    return value.map(safeText).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return Object.values(value)
      .map(safeText)
      .filter(Boolean)
      .join(", ");
  }

  return String(value);
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export default function LabourNetPage() {
  const [records, setRecords] = useState<Labour[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchLabours() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/labour-net`);

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          safeText(body?.message) ||
          `Labour API failed: ${response.status}`
        );
      }

      const source = Array.isArray(body)
        ? body
        : Array.isArray(body?.labours)
        ? body.labours
        : Array.isArray(body?.data)
        ? body.data
        : [];

      const normalized: Labour[] = source.map(
        (item: any, index: number) => ({
          _id:
            safeText(item?._id) ||
            safeText(item?.id) ||
            String(index),

          labourCode:
            safeText(item?.labourCode) ||
            safeText(item?.workerCode) ||
            safeText(item?.userCode) ||
            `LAB-${index + 1}`,

          name:
            safeText(item?.name) ||
            safeText(item?.fullName) ||
            safeText(item?.labourName) ||
            safeText(item?.workerName) ||
            "Labour Provider",

          skill:
            safeText(item?.skill) ||
            safeText(item?.skills) ||
            safeText(item?.trade) ||
            safeText(item?.category) ||
            safeText(item?.labourType) ||
            "General Labour",

          phone:
            safeText(item?.phone) ||
            safeText(item?.mobile) ||
            safeText(item?.mobileNumber) ||
            safeText(item?.contactNumber),

          uploaderName:
            safeText(item?.uploaderName) ||
            safeText(item?.providerName) ||
            safeText(item?.contractorName) ||
            safeText(item?.name) ||
            "Labour Provider",

          uploaderPhone:
            safeText(item?.uploaderPhone) ||
            safeText(item?.providerPhone) ||
            safeText(item?.contractorPhone) ||
            safeText(item?.phone) ||
            safeText(item?.mobile) ||
            safeText(item?.mobileNumber) ||
            safeText(item?.contactNumber),

          location:
            safeText(item?.location) ||
            [
              safeText(item?.area),
              safeText(item?.city),
              safeText(item?.pincode || item?.pinCode)
            ]
              .filter(Boolean)
              .join(", ") ||
            "Location not provided",

          experience:
            safeText(item?.experience) ||
            safeText(item?.experienceYears) ||
            safeText(item?.yearsOfExperience),

          rate:
            safeText(item?.rate) ||
            safeText(item?.dailyRate) ||
            safeText(item?.wage) ||
            safeText(item?.price),

          rateUnit:
            safeText(item?.rateUnit) ||
            safeText(item?.unit) ||
            "day",

          availability:
            safeText(item?.availability) ||
            safeText(item?.status) ||
            "Available",

          teamSize:
            safeText(item?.teamSize) ||
            safeText(item?.workerCount) ||
            safeText(item?.numberOfWorkers),

          description:
            safeText(item?.description) ||
            safeText(item?.details) ||
            safeText(item?.remarks),

          image:
            typeof item?.image === "string"
              ? item.image
              : typeof item?.imageUrl === "string"
              ? item.imageUrl
              : typeof item?.photoUrl === "string"
              ? item.photoUrl
              : ""
        })
      );

      setRecords(normalized);
    } catch (err: any) {
      console.error("Labour Net error:", err);
      setError(err?.message || "Unable to load labour records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLabours();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((item) =>
      [
        item.name,
        item.labourCode,
        item.skill,
        item.location,
        item.phone,
        item.uploaderName,
        item.uploaderPhone
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [records, search]);

  function openWhatsApp(item: Labour) {
    let phone = phoneDigits(item.uploaderPhone || item.phone);

    if (!phone) {
      alert("Contact number is not available.");
      return;
    }

    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    const message = encodeURIComponent(
      `Hello ${item.uploaderName || item.name},\n\n` +
      `I found your listing on BuildMitra Labour Net.\n\n` +
      `Labour: ${item.name}\n` +
      `Skill: ${item.skill}\n` +
      `Location: ${item.location}\n\n` +
      `Please share your availability and rate.`
    );

    window.open(
      `https://wa.me/${phone}?text=${message}`,
      "_blank"
    );
  }

  function sendEnquiry(item: Labour) {
    const requirement = window.prompt(
      `Enter your labour requirement for ${item.name}:`
    );

    if (!requirement) return;

    const phone = item.uploaderPhone || item.phone;

    if (phone) {
      openWhatsApp(item);
      return;
    }

    alert(
      `Requirement recorded: ${requirement}\nProvider contact is not available.`
    );
  }

  return (
    <>
      <Head>
        <title>Labour Net | BuildMitra</title>
      </Head>

      <div className="page">
        <header className="topbar">
          <Link href="/" className="brand">
            BuildMitra
          </Link>

          <nav>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/realestate-hub">Real Estate</Link>
            <Link href="/labour-net">Labour Net</Link>
          </nav>
        </header>

        <main>
          <section className="hero">
            <div>
              <div className="label">BUILDMITRA WORKFORCE</div>
              <h1>👷 Labour Net</h1>
              <p>
                Search labourers, skilled workers, labour teams and
                contractors. View contact details, availability,
                experience and rates.
              </p>
            </div>

            <button onClick={fetchLabours}>Refresh</button>
          </section>

          <section className="searchBox">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search labour, skill, trade, location, phone or PIN code"
            />

            <div>
              Showing <strong>{filtered.length}</strong> of{" "}
              <strong>{records.length}</strong> listings
            </div>
          </section>

          {loading && (
            <div className="message">Loading labour records...</div>
          )}

          {!loading && error && (
            <div className="message error">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="message">
              No labour records found.
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <section className="grid">
              {filtered.map((item) => {
                const contact =
                  item.uploaderPhone || item.phone;

                return (
                  <article className="card" key={item._id}>
                    <div className="photo">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span>👷</span>
                      )}

                      <div className="status">
                        {item.availability}
                      </div>
                    </div>

                    <div className="content">
                      <small>{item.labourCode}</small>

                      <h2>{item.name}</h2>

                      <div className="skill">
                        {item.skill}
                      </div>

                      <div className="details">
                        <div>
                          <label>Location</label>
                          <strong>{item.location}</strong>
                        </div>

                        <div>
                          <label>Experience</label>
                          <strong>
                            {item.experience
                              ? `${item.experience} years`
                              : "Not provided"}
                          </strong>
                        </div>

                        <div>
                          <label>Team size</label>
                          <strong>
                            {item.teamSize || "Individual"}
                          </strong>
                        </div>

                        <div>
                          <label>Rate</label>
                          <strong>
                            {item.rate
                              ? `₹${item.rate} / ${item.rateUnit}`
                              : "Contact for rate"}
                          </strong>
                        </div>
                      </div>

                      {item.description && (
                        <p className="description">
                          {item.description}
                        </p>
                      )}

                      <div className="uploader">
                        <label>Uploaded by</label>
                        <strong>
                          {item.uploaderName || item.name}
                        </strong>
                        <span>
                          {contact ||
                            "Contact number not provided"}
                        </span>
                      </div>

                      <div className="actions">
                        {contact ? (
                          <a href={`tel:${contact}`}>Call</a>
                        ) : (
                          <button disabled>Call</button>
                        )}

                        <button
                          onClick={() => openWhatsApp(item)}
                        >
                          WhatsApp
                        </button>

                        <button
                          className="enquiry"
                          onClick={() => sendEnquiry(item)}
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

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f4f7fa;
          color: #17263b;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 64px;
          padding: 0 32px;
          background: #17365d;
          color: white;
        }

        .topbar a {
          color: white;
          text-decoration: none;
        }

        .brand {
          font-size: 22px;
          font-weight: 800;
        }

        nav {
          display: flex;
          gap: 22px;
        }

        main {
          width: min(1400px, calc(100% - 32px));
          margin: auto;
          padding: 24px 0 50px;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 25px;
          padding: 30px;
          border-radius: 18px;
          background: linear-gradient(
            135deg,
            #17365d,
            #176b87
          );
          color: white;
        }

        .hero h1 {
          margin: 5px 0 9px;
          font-size: 34px;
        }

        .hero p {
          max-width: 750px;
          margin: 0;
          line-height: 1.6;
        }

        .label {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .hero button {
          padding: 11px 20px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          cursor: pointer;
        }

        .searchBox {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 18px;
          margin: 18px 0;
          padding: 16px;
          border-radius: 13px;
          background: white;
          box-shadow: 0 5px 20px rgba(30, 50, 70, 0.08);
        }

        .searchBox input {
          width: 100%;
          padding: 13px;
          border: 1px solid #d7e0e9;
          border-radius: 9px;
          font-size: 15px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(300px, 1fr)
          );
          gap: 20px;
        }

        .card {
          overflow: hidden;
          border: 1px solid #dee6ee;
          border-radius: 15px;
          background: white;
          box-shadow: 0 6px 22px rgba(30, 50, 70, 0.08);
        }

        .photo {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 170px;
          background: #e9f1f5;
          font-size: 70px;
        }

        .photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .status {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 10px;
          border-radius: 20px;
          background: #e7fff0;
          color: #08713e;
          font-size: 12px;
          font-weight: 800;
        }

        .content {
          padding: 18px;
        }

        .content small {
          color: #738096;
        }

        .content h2 {
          margin: 5px 0;
          font-size: 21px;
        }

        .skill {
          margin-bottom: 15px;
          color: #176b87;
          font-weight: 800;
        }

        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .details div,
        .uploader {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        label {
          color: #758398;
          font-size: 12px;
        }

        .details strong {
          font-size: 13px;
        }

        .description {
          color: #526176;
          line-height: 1.5;
        }

        .uploader {
          margin-top: 15px;
          padding: 12px;
          border-radius: 9px;
          background: #f4f7fa;
        }

        .uploader span {
          color: #526176;
          font-size: 13px;
        }

        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 15px;
        }

        .actions a,
        .actions button {
          padding: 10px;
          border: 0;
          border-radius: 8px;
          background: #1769aa;
          color: white;
          text-align: center;
          text-decoration: none;
          font-weight: 700;
          cursor: pointer;
        }

        .actions button:nth-child(2) {
          background: #118c4f;
        }

        .actions .enquiry {
          grid-column: 1 / -1;
          background: #e66a18;
        }

        .actions button:disabled {
          background: #aab4c0;
          cursor: not-allowed;
        }

        .message {
          padding: 30px;
          border-radius: 13px;
          background: white;
          text-align: center;
        }

        .error {
          color: #b42318;
          background: #fff0ef;
        }

        @media (max-width: 700px) {
          .topbar {
            padding: 0 15px;
          }

          nav {
            display: none;
          }

          .hero {
            align-items: flex-start;
            flex-direction: column;
          }

          .searchBox {
            grid-template-columns: 1fr;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
