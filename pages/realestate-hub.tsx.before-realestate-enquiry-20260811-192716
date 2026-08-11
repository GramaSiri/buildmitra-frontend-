import React, { useEffect, useMemo, useState } from "react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000"
).replace(/\/$/, "");

type PropertyItem = {
  _id?: string;
  propertyCode?: string;
  title?: string;
  description?: string;
  listingType?: string;
  propertyType?: string;
  price?: number | string;
  area?: number | string;
  areaUnit?: string;
  pricePerSqft?: number | string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  approvalType?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  location?: string;
  landmark?: string;
  roadName?: string;
  roadFacing?: string;
  facing?: string;
  roadWidth?: number | string;
  roadWidthFeet?: number | string;
  totalSqft?: number | string;
  totalArea?: number | string;
  plotArea?: number | string;
  ratePerSqft?: number | string;
  videoUrl?: any;
  documentUrls?: any[];
  amenities?: any[];
  providerName?: string;
  providerPhone?: string;
  approvalStatus?: string | boolean;
  status?: string;
  isActive?: boolean;
  coverImage?: any;
  images?: any[];
  imageUrls?: any[];
  imageUrl?: any;
  image?: any;
  video?: any;
  videos?: any[];
  documents?: any[];
};

function arrayFromResponse(data: any): PropertyItem[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.properties)) return data.properties;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function valueOf(input: any): string {
  if (!input) return "";

  if (typeof input === "string") return input;

  if (typeof input === "object") {
    return (
      input.url ||
      input.imageUrl ||
      input.path ||
      input.src ||
      input.fileUrl ||
      (input.imageId
        ? `/api/realestate/images/${input.imageId}`
        : input._id
        ? `/api/realestate/images/${input._id}`
        : "")
    );
  }

  return "";
}

function fullMediaUrl(input: any): string {
  const raw = valueOf(input).trim();

  if (!raw) return "";

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }

  if (raw.startsWith("/")) return `${API_BASE}${raw}`;

  return `${API_BASE}/${raw}`;
}

function propertyImages(property: PropertyItem): string[] {
  const candidates: any[] = [
    property.coverImage,
    ...(Array.isArray(property.images) ? property.images : []),
    ...(Array.isArray(property.imageUrls) ? property.imageUrls : []),
    property.imageUrl,
    property.image,
  ];

  return Array.from(
    new Set(candidates.map(fullMediaUrl).filter(Boolean))
  );
}

function formatMoney(value: any): string {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return "Price on request";

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2).replace(/\.00$/, "")} L`;
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

function firstValue(...values: any[]): any {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
}

function mediaCount(property: PropertyItem): {
  imageCount: number;
  hasVideo: boolean;
  documentCount: number;
} {
  const imageCount = propertyImages(property).length;

  const hasVideo = Boolean(
    firstValue(
      property.video,
      property.videoUrl,
      Array.isArray(property.videos) && property.videos.length
        ? property.videos[0]
        : ""
    )
  );

  const documentCount = Array.isArray(property.documents)
    ? property.documents.length
    : Array.isArray(property.documentUrls)
    ? property.documentUrls.length
    : 0;

  return { imageCount, hasVideo, documentCount };
}
function text(value: any, fallback = ""): string {
  const result = String(value ?? "").trim();
  return result || fallback;
}

export default function RealEstateHub() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState("");
  const [listingType, setListingType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/realestate`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const rawText = await response.text();

      let data: any = {};

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(
          `Real Estate API returned invalid data. HTTP ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Unable to load properties. HTTP ${response.status}`
        );
      }

      const loaded = arrayFromResponse(data);

      /*
       * Important:
       * The public page displays every record returned by the Real Estate API.
       * It does not remove records because optional fields or images are absent.
       * Backend approval rules may still control which records the API returns.
       */
      setProperties(loaded);
    } catch (err: any) {
      console.error("Real Estate Hub load error:", err);
      setError(err?.message || "Unable to load Real Estate properties.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  const propertyTypes = useMemo(() => {
    return Array.from(
      new Set(
        properties
          .map((property) => text(property.propertyType))
          .filter(Boolean)
      )
    ).sort();
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const query = location.trim().toLowerCase();
    const minimum = Number(minPrice);
    const maximum = Number(maxPrice);

    return properties.filter((property) => {
      const searchableLocation = [
        property.address,
        property.location,
        property.locality,
        property.city,
        property.state,
        property.pincode,
        property.landmark,
        property.roadName,
        property.roadFacing,
        property.facing,
        property.roadWidth,
        property.roadWidthFeet,
        property.title,
        property.propertyCode,
      ]
        .map((value) => text(value).toLowerCase())
        .join(" ");

      const propertyListingType = text(property.listingType).toLowerCase();
      const selectedListingType = listingType.toLowerCase();

      const currentPropertyType = text(property.propertyType).toLowerCase();
      const selectedPropertyType = propertyType.toLowerCase();

      const price = Number(property.price);

      if (query && !searchableLocation.includes(query)) return false;

      if (
        selectedListingType &&
        propertyListingType !== selectedListingType
      ) {
        return false;
      }

      if (
        selectedPropertyType &&
        currentPropertyType !== selectedPropertyType
      ) {
        return false;
      }

      if (minPrice && Number.isFinite(minimum)) {
        if (!Number.isFinite(price) || price < minimum) return false;
      }

      if (maxPrice && Number.isFinite(maximum)) {
        if (!Number.isFinite(price) || price > maximum) return false;
      }

      return true;
    });
  }, [properties, location, listingType, propertyType, minPrice, maxPrice]);

  function resetFilters() {
    setLocation("");
    setListingType("");
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
  }

  function openWhatsApp(property: PropertyItem) {
    const phone = text(property.providerPhone).replace(/\D/g, "");

    if (!phone) {
      alert("Seller phone number is not available.");
      return;
    }

    const message = encodeURIComponent(
      `Hello, I am interested in ${text(
        property.title,
        "this property"
      )} (${text(property.propertyCode, "BuildMitra listing")}) at ${[
        property.locality,
        property.city,
      ]
        .filter(Boolean)
        .join(", ")}. Please share more details.`
    );

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  }

  return (
    <>
      <div className="hubPage">
        <section className="hero">
          <div>
            <p className="eyebrow">BuildMitra Real Estate</p>
            <h1>Find the right property</h1>
            <p className="heroText">
              Search verified plots, homes, apartments, villas and commercial
              properties by location.
            </p>
          </div>

          <div className="databaseCount">
            <strong>{properties.length}</strong>
            <span>Properties available</span>
          </div>
        </section>

        <section className="searchPanel">
          <div className="locationField">
            <label>Location</label>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="City, locality, pincode or landmark"
            />
          </div>

          <div>
            <label>Buy / Rent</label>
            <select
              value={listingType}
              onChange={(event) => setListingType(event.target.value)}
            >
              <option value="">All listings</option>
              <option value="Sale">Buy</option>
              <option value="Rent">Rent</option>
            </select>
          </div>

          <div>
            <label>Property type</label>
            <select
              value={propertyType}
              onChange={(event) => setPropertyType(event.target.value)}
            >
              <option value="">All types</option>

              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Minimum price</label>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="₹ Min"
            />
          </div>

          <div>
            <label>Maximum price</label>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="₹ Max"
            />
          </div>

          <button type="button" className="resetButton" onClick={resetFilters}>
            Reset
          </button>
        </section>

        <div className="resultHeader">
          <div>
            <h2>Available properties</h2>
            <p>
              Showing {filteredProperties.length} of {properties.length}
            </p>
          </div>

          <button type="button" className="refreshButton" onClick={loadProperties}>
            Refresh
          </button>
        </div>

        {loading && <div className="messageBox">Loading properties…</div>}

        {!loading && error && (
          <div className="errorBox">
            <strong>Unable to load Real Estate Hub</strong>
            <span>{error}</span>
            <button type="button" onClick={loadProperties}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredProperties.length === 0 && (
          <div className="messageBox">
            No properties match the selected location or filters.
          </div>
        )}

        {!loading && !error && filteredProperties.length > 0 && (
          <section className="propertyGrid">
            {filteredProperties.map((property, index) => {
              const images = propertyImages(property);
              const cover = images[0];
              const locationText =
                [
                  firstValue(property.address, property.location),
                  property.locality,
                  property.city,
                  property.state,
                  property.pincode,
                ]
                  .filter(Boolean)
                  .join(", ") || "Location not specified";

              const totalArea = firstValue(
                property.totalSqft,
                property.totalArea,
                property.plotArea,
                property.area
              );

              const roadFacing = firstValue(
                property.roadFacing,
                property.facing
              );

              const roadWidth = firstValue(
                property.roadWidth,
                property.roadWidthFeet
              );

              const ratePerSqft = firstValue(
                property.ratePerSqft,
                property.pricePerSqft
              );

              const media = mediaCount(property);


              return (
                <article
                  className="propertyCard"
                  key={property._id || property.propertyCode || index}
                >
                  <div className="imageWrap">
                    {cover ? (
                      <img
                        src={cover}
                        alt={text(property.title, "Property")}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          const fallback =
                            event.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}

                    <div
                      className="imageFallback"
                      style={{ display: cover ? "none" : "flex" }}
                    >
                      <span>🏠</span>
                      <small>Property image unavailable</small>
                    </div>

                    <div className="mediaBadges">
                      {media.imageCount > 0 && (
                        <span>📷 {media.imageCount}</span>
                      )}

                      {media.hasVideo && <span>▶ Video</span>}

                      {media.documentCount > 0 && (
                        <span>📄 {media.documentCount}</span>
                      )}
                    </div>

                    <span className="listingBadge">
                      {text(property.listingType, "Property")}
                    </span>
                  </div>

                  <div className="cardBody">
                    <div className="codeRow">
                      <span>
                        {text(property.propertyCode, "BuildMitra Property")}
                      </span>

                      {property.approvalType && (
                        <span className="approvalBadge">
                          {property.approvalType}
                        </span>
                      )}
                    </div>

                    <h3>{text(property.title, "Property listing")}</h3>

                    <p className="location">📍 {locationText}</p>

                    <div className="priceRow">
                      <strong>{formatMoney(property.price)}</strong>

                      {Number(property.pricePerSqft) > 0 && (
                        <span>
                          ₹{Number(property.pricePerSqft).toLocaleString("en-IN")}
                          /sq.ft
                        </span>
                      )}
                    </div>

                    <div className="specGrid">
                      <div>
                        <span>Total Area</span>
                        <strong>
                          {totalArea
                            ? `${totalArea} ${text(property.areaUnit, "sq.ft")}`
                            : "Not specified"}
                        </strong>
                      </div>

                      <div>
                        <span>Rate / Sq.Ft.</span>
                        <strong>
                          {Number(ratePerSqft) > 0
                            ? `₹${Number(ratePerSqft).toLocaleString("en-IN")}`
                            : "Not specified"}
                        </strong>
                      </div>

                      <div>
                        <span>Road Facing</span>
                        <strong>{text(roadFacing, "Not specified")}</strong>
                      </div>

                      <div>
                        <span>Road Width</span>
                        <strong>
                          {roadWidth ? `${roadWidth} ft` : "Not specified"}
                        </strong>
                      </div>

                      <div>
                        <span>Property Type</span>
                        <strong>
                          {text(property.propertyType, "Not specified")}
                        </strong>
                      </div>

                      <div>
                        <span>Buy / Rent</span>
                        <strong>
                          {text(property.listingType, "Not specified")}
                        </strong>
                      </div>

                      <div>
                        <span>Bedrooms</span>
                        <strong>{property.bedrooms || "—"}</strong>
                      </div>

                      <div>
                        <span>Bathrooms</span>
                        <strong>{property.bathrooms || "—"}</strong>
                      </div>
                    </div>

                    <div className="addressBox">
                      <span>Complete Location</span>
                      <strong>{locationText}</strong>

                      {property.landmark && (
                        <small>Landmark: {property.landmark}</small>
                      )}

                      {property.roadName && (
                        <small>Road: {property.roadName}</small>
                      )}
                    </div>

                    <p className="description">
                      {text(
                        property.description,
                        "Contact the seller for complete property details."
                      )}
                    </p>

                    <div className="sellerRow">
                      <div>
                        <span>Listed by</span>
                        <strong>
                          {text(property.providerName, "Property Seller")}
                        </strong>
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        type="button"
                        className="detailsButton"
                        onClick={() =>
                          alert(
                            [
                              text(property.title, "Property"),
                              `Property Code: ${text(property.propertyCode, "Not available")}`,
                              `Price: ${formatMoney(property.price)}`,
                              `Total Area: ${totalArea ? `${totalArea} ${text(property.areaUnit, "sq.ft")}` : "Not specified"}`,
                              `Rate/Sq.Ft.: ${Number(ratePerSqft) > 0 ? `₹${Number(ratePerSqft).toLocaleString("en-IN")}` : "Not specified"}`,
                              `Road Facing: ${text(roadFacing, "Not specified")}`,
                              `Road Width: ${roadWidth ? `${roadWidth} ft` : "Not specified"}`,
                              `Property Type: ${text(property.propertyType, "Not specified")}`,
                              `Listing Type: ${text(property.listingType, "Not specified")}`,
                              `Bedrooms: ${property.bedrooms || "Not specified"}`,
                              `Bathrooms: ${property.bathrooms || "Not specified"}`,
                              `Approval: ${text(property.approvalType, "Not specified")}`,
                              `Location: ${locationText}`,
                              `Images: ${media.imageCount}`,
                              `Video: ${media.hasVideo ? "Available" : "Not uploaded"}`,
                              `Documents: ${media.documentCount}`,
                              `Seller: ${text(property.providerName, "Property Seller")}`,
                              "",
                              text(
                                property.description,
                                "Complete description is not available."
                              ),
                            ].join("\n")
                          )
                        }
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className="whatsappButton"
                        onClick={() => openWhatsApp(property)}
                      >
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .hubPage {
          min-height: 100vh;
          background: #f5f7fa;
          padding: 26px clamp(16px, 4vw, 58px) 56px;
          color: #172033;
        }

        .hero {
          max-width: 1440px;
          margin: 0 auto 18px;
          padding: 22px 26px;
          min-height: 132px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: linear-gradient(135deg, #11283f, #1d4d64);
          border-radius: 18px;
          color: white;
          box-shadow: 0 12px 34px rgba(17, 40, 63, 0.16);
        }

        .eyebrow {
          margin: 0 0 6px;
          color: #8fe0cf;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(26px, 3vw, 42px);
          line-height: 1.1;
        }

        .heroText {
          margin: 8px 0 0;
          max-width: 680px;
          color: #d9e7ee;
          font-size: 14px;
        }

        .databaseCount {
          min-width: 150px;
          text-align: center;
          padding: 12px 18px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .databaseCount strong {
          display: block;
          font-size: 30px;
        }

        .databaseCount span {
          font-size: 12px;
          color: #d9e7ee;
        }

        .searchPanel {
          max-width: 1440px;
          margin: 0 auto 24px;
          padding: 14px;
          display: grid;
          grid-template-columns: minmax(240px, 2fr) repeat(4, minmax(130px, 1fr)) auto;
          gap: 10px;
          align-items: end;
          background: white;
          border: 1px solid #e3e8ef;
          border-radius: 16px;
          box-shadow: 0 8px 26px rgba(18, 38, 63, 0.07);
        }

        .searchPanel label {
          display: block;
          margin-bottom: 5px;
          font-size: 11px;
          font-weight: 800;
          color: #526173;
          text-transform: uppercase;
        }

        .searchPanel input,
        .searchPanel select {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border: 1px solid #d6dde6;
          border-radius: 10px;
          background: white;
          color: #172033;
          font-size: 14px;
          outline: none;
        }

        .searchPanel input:focus,
        .searchPanel select:focus {
          border-color: #157461;
          box-shadow: 0 0 0 3px rgba(21, 116, 97, 0.1);
        }

        .resetButton,
        .refreshButton {
          height: 42px;
          border: 0;
          border-radius: 10px;
          padding: 0 18px;
          cursor: pointer;
          font-weight: 800;
        }

        .resetButton {
          background: #eef2f6;
          color: #344255;
        }

        .refreshButton {
          background: #172033;
          color: white;
        }

        .resultHeader {
          max-width: 1440px;
          margin: 0 auto 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .resultHeader h2 {
          margin: 0;
          font-size: 22px;
        }

        .resultHeader p {
          margin: 4px 0 0;
          color: #69788b;
          font-size: 13px;
        }

        .propertyGrid {
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .propertyCard {
          overflow: hidden;
          background: white;
          border: 1px solid #e1e7ee;
          border-radius: 11px;
          box-shadow: 0 3px 12px rgba(22, 39, 63, 0.07);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .propertyCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 13px 32px rgba(22, 39, 63, 0.12);
        }

        .imageWrap {
          position: relative;
          width: 100%;
          height: 135px;
          background: #e8edf2;
          overflow: hidden;
        }

        .imageWrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
        }

        .imageFallback {
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          color: #758397;
          background: linear-gradient(135deg, #eef2f5, #dfe7ec);
        }

        .imageFallback span {
          font-size: 42px;
        }

        .listingBadge {
          position: absolute;
          top: 7px;
          left: 7px;
          padding: 3px 6px;
          border-radius: 10px;
          background: rgba(15, 34, 50, 0.88);
          color: white;
          font-size: 8px;
          font-weight: 800;
        }

        .mediaBadges {
          position: absolute;
          right: 10px;
          bottom: 10px;
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .mediaBadges span {
          padding: 3px 5px;
          border-radius: 10px;
          background: rgba(15, 34, 50, 0.85);
          color: white;
          font-size: 8px;
          line-height: 1.1;
          font-weight: 700;
        }

        .cardBody {
          padding: 10px;
        }

        .codeRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 4px;
          color: #708095;
          font-size: 9px;
          line-height: 1.2;
          font-weight: 700;
        }

        .approvalBadge {
          color: #08755f;
          background: #e5f7f2;
          padding: 2px 5px;
          border-radius: 8px;
          font-size: 8px;
        }

        .cardBody h3 {
          margin: 5px 0 4px;
          font-size: 15px;
          line-height: 1.25;
          min-height: 0;
        }

        .location {
          margin: 0 0 5px;
          color: #627186;
          font-size: 11px;
          line-height: 1.3;
          min-height: 0;
        }

        .priceRow {
          margin: 6px 0;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 5px;
        }

        .priceRow strong {
          color: #0a6958;
          font-size: 17px;
          line-height: 1.1;
        }

        .priceRow span {
          color: #78869a;
          font-size: 10px;
        }

        .specGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 4px 7px;
          padding: 7px;
          border-radius: 8px;
          background: #f7f9fb;
        }

        .specGrid div {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }

        .specGrid span,
        .sellerRow span {
          color: #7d8a9b;
          font-size: 8px;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .specGrid strong {
          font-size: 10px;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .addressBox {
          margin-top: 5px;
          padding: 6px 7px;
          display: flex;
          flex-direction: column;
          gap: 1px;
          border: 1px solid #e5eaf0;
          border-radius: 7px;
          background: #fbfcfd;
        }

        .addressBox span {
          color: #7d8a9b;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .addressBox strong {
          color: #273448;
          font-size: 10px;
          line-height: 1.3;
        }

        .addressBox small {
          color: #68778a;
          font-size: 9px;
          line-height: 1.25;
        }
        .description {
          margin: 6px 0;
          max-height: 31px;
          overflow: hidden;
          color: #66758a;
          font-size: 10px;
          line-height: 1.4;
        }

        .sellerRow {
          padding-top: 6px;
          border-top: 1px solid #edf0f4;
        }

        .sellerRow strong {
          display: block;
          margin-top: 1px;
          font-size: 10px;
          line-height: 1.25;
        }

        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          margin-top: 7px;
        }

        .actions button {
          min-height: 34px;
          padding: 5px 7px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
        }

        .detailsButton {
          border: 1px solid #1b5065;
          background: white;
          color: #1b5065;
        }

        .whatsappButton {
          border: 0;
          background: #148b63;
          color: white;
        }

        .messageBox,
        .errorBox {
          max-width: 1440px;
          margin: 30px auto;
          padding: 28px;
          text-align: center;
          background: white;
          border-radius: 14px;
          border: 1px solid #e1e7ee;
        }

        .errorBox {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
          color: #a4262c;
        }

        .errorBox button {
          padding: 9px 18px;
          border: 0;
          border-radius: 9px;
          background: #172033;
          color: white;
          cursor: pointer;
        }

        @media (max-width: 1150px) {
          .searchPanel {
            grid-template-columns: repeat(3, 1fr);
          }

          .locationField {
            grid-column: span 2;
          }

          .propertyGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

                @media (max-width: 850px) and (min-width: 521px) {
          .propertyGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .imageWrap {
            height: 140px;
          }
        }
@media (max-width: 720px) {
          .hubPage {
            padding: 14px 12px 40px;
          }

          .hero {
            min-height: auto;
            padding: 20px;
            align-items: flex-start;
            flex-direction: column;
          }

          .databaseCount {
            width: 100%;
          }

          .searchPanel {
            grid-template-columns: 1fr;
          }

          .locationField {
            grid-column: auto;
          }

          .propertyGrid {
            grid-template-columns: 1fr;
          }

          .resultHeader {
            align-items: flex-end;
          }

          .imageWrap {
            height: 150px;
          }
        }
      `}</style>
    </>
  );
}


