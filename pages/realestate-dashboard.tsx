import React, { useState, useEffect, useMemo } from "react";
import { getBuildMitraUser, logoutToLogin } from "../utils/session";
import MarketRateTrend from "../components/ui/MarketRateTrend";
import { themeTokens, Card, LoadingSpinner, EmptyState } from "../components/ui/DesignSystem";

import { getApiBase } from "../utils/apiConfig";
export default function RealEstateDashboard() {
  const API_BASE = getApiBase();

  const [activeTab, setActiveTab] = useState("overview");
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  const [uploading, setUploading] = useState(false);
  const [selectedFileObjects, setSelectedFileObjects] = useState<File[]>([]);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedDocFiles, setSelectedDocFiles] = useState<File[]>([]);

  const [propertyPhotos, setPropertyPhotos] = useState<string[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<string>("");
  const [propertyVideo, setPropertyVideo] = useState<string>("");
  const [propertyDocs, setPropertyDocs] = useState<any[]>([]);

  const [userName, setUserName] = useState("Real Estate Provider");
  const [providerUserCode, setProviderUserCode] = useState("REA-000002");
  const [providerPhone, setProviderPhone] = useState("9986553549");
  const [isClient, setIsClient] = useState(false);
  const [propertyType, setPropertyType] = useState("plot");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [calculatedArea, setCalculatedArea] = useState(0);

  const [liveEnquiries, setLiveEnquiries] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterListingType, setFilterListingType] = useState("all");
  const [filterPropertyType, setFilterPropertyType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const absoluteUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80";
    if (/^https?:\/\//i.test(url) || url.startsWith("data:image")) return url;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${API_BASE}${cleanUrl}`;
  };

  const formatPrice = (price: number) => {
    if (!price) return "₹0";
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const loadProperties = async (userCode: string) => {
    setLoading(true);
    try {
      const code = userCode || "REA-000002";
      const res = await fetch(`${API_BASE}/api/realestate/mine/${encodeURIComponent(code)}`);
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (data.success && Array.isArray(data.properties)) {
            setProperties(data.properties);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch seller properties from MongoDB:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEnquiries = async (userCode: string) => {
    try {
      const code = userCode || "REA-000002";
      const res = await fetch(`${API_BASE}/api/enquiry/provider/my`, {
        headers: { "x-user-code": code },
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (data.success && Array.isArray(data.enquiries)) {
            setLiveEnquiries(data.enquiries);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load seller enquiries:", err);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const user = getBuildMitraUser() || {};
    const name = user.name || user.companyName || user.agencyName || (user.userCode === "REA-000002" ? "Garden Greens Consultants" : "Real Estate Provider");
    const code = user.userCode || user.uniqueCode || user.userId || "REA-000002";
    const phone = user.phone || user.mobile || "9986553549";

    setUserName(name);
    setProviderUserCode(code);
    setProviderPhone(phone);

    loadProperties(code);
    loadEnquiries(code);
  }, []);

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = () => resolve("");
      };
      reader.onerror = () => resolve("");
    });
  };

  // Handle Image File Selection (Max 3)
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 3 - selectedFileObjects.length);
    setSelectedFileObjects((prev) => [...prev, ...fileList].slice(0, 3));

    const localPreviews = await Promise.all(fileList.map((f) => compressImageFile(f)));
    const validPreviews = localPreviews.filter(Boolean);

    setPropertyPhotos((prev) => [...validPreviews, ...prev].slice(0, 3));
    if (!coverPhoto && validPreviews.length > 0) {
      setCoverPhoto(validPreviews[0]);
    }
  };

  // Handle Video File Selection (Max 1 MP4)
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const videoFile = files[0];
    setSelectedVideoFile(videoFile);
    setPropertyVideo(URL.createObjectURL(videoFile));
  };

  // Handle Document File Selection (Max 5 PDF/DOC)
  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 5 - selectedDocFiles.length);
    setSelectedDocFiles((prev) => [...prev, ...fileList].slice(0, 5));

    const docPreviews = fileList.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      fileType: f.name.endsWith(".pdf") ? "pdf" : "doc",
    }));
    setPropertyDocs((prev) => [...docPreviews, ...prev].slice(0, 5));
  };

  const handleRemovePhoto = (photoUrl: string, idx: number) => {
    const updatedPhotos = propertyPhotos.filter((_, i) => i !== idx);
    setPropertyPhotos(updatedPhotos);
    setSelectedFileObjects((prev) => prev.filter((_, i) => i !== idx));
    if (coverPhoto === photoUrl) {
      setCoverPhoto(updatedPhotos[0] || "");
    }
  };

  // Upload Photo, Video, and Document Files to Backend
  const uploadMediaToBackend = async () => {
    if (selectedFileObjects.length === 0 && !selectedVideoFile && selectedDocFiles.length === 0) {
      return {
        images: propertyPhotos,
        coverImage: coverPhoto || propertyPhotos[0] || "",
        videoUrl: propertyVideo,
        documents: propertyDocs,
      };
    }

    setUploading(true);

    try {
      const formData = new FormData();
      selectedFileObjects.forEach((file) => formData.append("images", file));
      if (selectedVideoFile) formData.append("video", selectedVideoFile);
      selectedDocFiles.forEach((file) => formData.append("documents", file));

      const endpoints = [
        `${API_BASE}/api/realestate/upload-media`,
        `${API_BASE}/api/realestate/upload-images`,
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.media) {
              setUploading(false);
              return {
                images: Array.isArray(data.media.images) && data.media.images.length > 0 ? data.media.images : propertyPhotos,
                coverImage: data.media.coverImage || propertyPhotos[0] || "",
                videoUrl: data.media.videoUrl || propertyVideo || "",
                documents: Array.isArray(data.media.documents) && data.media.documents.length > 0 ? data.media.documents : propertyDocs,
              };
            }
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Backend media upload failed, using local media references:", err);
    } finally {
      setUploading(false);
    }

    return {
      images: propertyPhotos,
      coverImage: coverPhoto || propertyPhotos[0] || "",
      videoUrl: propertyVideo,
      documents: propertyDocs,
    };
  };

  // Dynamic Property Form Fields Definition
  const getPropertyFields = (type: string) => {
    switch (type) {
      case "plot":
        return {
          fields: [
            { key: "eastWest", label: "East to West (ft)", type: "number", required: true },
            { key: "northSouth", label: "North to South (ft)", type: "number", required: true },
            { key: "roadFacing", label: "Road Facing", type: "select", options: ["East", "West", "North", "South", "Corner"], required: true },
            { key: "roadWidth", label: "Road Width (ft)", type: "number", required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
          ]
        };
      case "agriculture":
        return {
          fields: [
            { key: "surveyNumber", label: "Survey Number", type: "text", required: true },
            { key: "totalAcres", label: "Total Area (Acres)", type: "number", required: true },
            { key: "guntas", label: "Guntas", type: "number", required: false },
            { key: "soilType", label: "Soil Type", type: "select", options: ["Black", "Red", "Sandy", "Clay", "Loam", "Mixed"], required: true },
            { key: "waterSource", label: "Water Source", type: "select", options: ["Borewell", "Open Well", "River", "Canal", "Rainfed"], required: true },
            { key: "roadAccess", label: "Road Access", type: "select", options: ["Metalled Road", "Kutcha Road", "No Road"], required: true },
            { key: "ratePerAcre", label: "Rate per sq.ft (₹)", type: "number", required: true },
          ]
        };
      case "farmland":
        return {
          fields: [
            { key: "syNo", label: "Survey Number", type: "text", required: true },
            { key: "extentAcres", label: "Extent (Acres)", type: "number", required: true },
            { key: "cropType", label: "Crop Type", type: "select", options: ["Coconut", "Arecanut", "Rubber", "Tea", "Coffee", "Mixed Crops", "Dry Land"], required: true },
            { key: "irrigation", label: "Irrigation Facility", type: "select", options: ["Drip", "Sprinkler", "Flood", "Rainfed", "Well"], required: true },
            { key: "fencing", label: "Fencing", type: "select", options: ["Barbed Wire", "Stone Wall", "Live Hedge", "No Fencing"], required: true },
            { key: "ratePerAcre", label: "Rate per sq.ft (₹)", type: "number", required: true },
          ]
        };
      case "revenue":
        return {
          fields: [
            { key: "siteNumber", label: "Site Number", type: "text", required: true },
            { key: "surveyNumber", label: "Survey Number", type: "text", required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
            { key: "roadFacing", label: "Road Facing", type: "select", options: ["East", "West", "North", "South", "Corner"], required: true },
            { key: "roadWidth", label: "Road Width (ft)", type: "number", required: true },
            { key: "status", label: "Status", type: "select", options: ["Approved", "Pending Approval", "Ready for Registration"], required: true }
          ]
        };
      case "bmrda":
        return {
          fields: [
            { key: "siteNumber", label: "Site Number", type: "text", required: true },
            { key: "layoutName", label: "Layout Name", type: "text", required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
            { key: "roadFacing", label: "Road Facing", type: "select", options: ["East", "West", "North", "South", "Corner"], required: true },
            { key: "roadWidth", label: "Road Width (ft)", type: "number", required: true },
            { key: "approvalStatus", label: "Approval Status", type: "select", options: ["BMRDA Approved", "Approval Pending", "Final Layout Ready"], required: true }
          ]
        };
      case "industrial":
        return {
          fields: [
            { key: "eastWest", label: "East to West (ft)", type: "number", required: true },
            { key: "northSouth", label: "North to South (ft)", type: "number", required: true },
            { key: "powerAvailability", label: "Power Availability", type: "select", options: ["Yes - 3 Phase", "Yes - Single Phase", "No"], required: true },
            { key: "waterSupply", label: "Water Supply", type: "select", options: ["Borewell", "Municipal", "River", "Rainfed"], required: true },
            { key: "roadAccess", label: "Road Access", type: "select", options: ["NH/SH", "District Road", "Village Road", "No Road"], required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
          ]
        };
      case "apartment":
        return {
          fields: [
            { key: "flatNumber", label: "Flat Number", type: "text", required: true },
            { key: "buildingName", label: "Building Name", type: "text", required: true },
            { key: "bhk", label: "BHK Type", type: "select", options: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Penthouse"], required: true },
            { key: "floor", label: "Floor Number", type: "number", required: true },
            { key: "furnishing", label: "Furnishing", type: "select", options: ["Unfurnished", "Semi-furnished", "Fully Furnished"], required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
          ]
        };
      case "villa":
        return {
          fields: [
            { key: "villaNumber", label: "Villa Number", type: "text", required: true },
            { key: "bhk", label: "BHK Type", type: "select", options: ["2 BHK", "3 BHK", "4 BHK", "5+ BHK"], required: true },
            { key: "floors", label: "Floors", type: "number", required: true },
            { key: "furnishing", label: "Furnishing", type: "select", options: ["Unfurnished", "Semi-furnished", "Fully Furnished"], required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
          ]
        };
      case "commercial":
        return {
          fields: [
            { key: "unitNumber", label: "Shop / Unit No", type: "text", required: true },
            { key: "buildingName", label: "Commercial Complex", type: "text", required: true },
            { key: "officeType", label: "Office Type", type: "select", options: ["Retail", "Office Space", "Showroom", "Warehouse", "Factory"], required: true },
            { key: "parking", label: "Parking Available", type: "select", options: ["Yes", "No"], required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
          ]
        };
      default:
        return { fields: [] };
    }
  };

  const handleInputChange = () => {
    const form = document.getElementById("propertyForm") as HTMLFormElement;
    if (!form) return;
    const formData = new FormData(form);

    let area = 0;
    let total = 0;

    const ew = Number(formData.get("eastWest")) || 0;
    const ns = Number(formData.get("northSouth")) || 0;
    const rateSft = Number(formData.get("ratePerSft")) || Number(formData.get("ratePerSqft")) || 0;
    const rateAcre = Number(formData.get("ratePerAcre")) || 0;
    const acres = Number(formData.get("totalAcres")) || Number(formData.get("extentAcres")) || 0;
    const totalAreaInput = Number(formData.get("totalArea")) || 0;

    if (ew > 0 && ns > 0) {
      area = ew * ns;
      total = area * (rateSft || rateAcre);
    } else if (acres > 0) {
      area = acres * 43560;
      total = area * (rateSft || rateAcre);
    } else if (totalAreaInput > 0) {
      area = totalAreaInput;
      total = area * (rateSft || rateAcre);
    }

    setCalculatedArea(area);
    setCalculatedTotal(total);
  };

  // Submit Property JSON to Backend & Confirm MongoDB Save
  const handleSaveProperty = async (e: React.FormEvent<HTMLFormElement>, isEdit = false) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") || "").trim();
    const location = String(formData.get("location") || formData.get("city") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const listingType = String(formData.get("listingType") || "Sale");

    if (!title || !location) {
      setSubmitting(false);
      setSubmitError("Title and Location are required!");
      return;
    }

    try {
      // Step 1: Upload media files (Images, Video, Documents)
      const uploadedMedia = await uploadMediaToBackend();

      // Step 2: Extract dynamic property type fields
      const fieldDefs = getPropertyFields(propertyType).fields;
      const customData: any = {};
      fieldDefs.forEach((f) => {
        customData[f.key] = formData.get(f.key) || "";
      });

      const ew = Number(formData.get("eastWest")) || 0;
      const ns = Number(formData.get("northSouth")) || 0;
      const rate = Number(formData.get("ratePerSft")) || Number(formData.get("ratePerAcre")) || 0;
      const totalAreaInput = Number(formData.get("totalArea")) || 0;

      let areaVal = totalAreaInput;
      if (ew > 0 && ns > 0) areaVal = ew * ns;
      if (!areaVal && calculatedArea > 0) areaVal = calculatedArea;

      let priceVal = areaVal * rate;
      if (!priceVal && calculatedTotal > 0) priceVal = calculatedTotal;
      if (!priceVal) priceVal = Number(formData.get("price") || formData.get("askingPrice") || 0);

      // Step 3: Construct Payload for Backend API
      const payload = {
        ...customData,
        providerUserCode: providerUserCode || "REA-000002",
        providerName: userName,
        providerPhone: providerPhone,
        providerRole: "realestate",
        title,
        description,
        city: location,
        locality: String(formData.get("locality") || location),
        location,
        propertyType: propertyType.toLowerCase(),
        listingType,
        transactionType: listingType === "Rent" ? "rent" : "sale",

        price: priceVal,
        askingPrice: priceVal,
        totalAmount: priceVal,

        area: areaVal,
        plotArea: areaVal,
        totalArea: areaVal,

        pricePerSqft: rate || (areaVal > 0 ? Math.round(priceVal / areaVal) : 0),
        ratePerSqft: rate,

        images: uploadedMedia.images.slice(0, 3),
        imageUrls: uploadedMedia.images.slice(0, 3),
        coverImage: uploadedMedia.coverImage || uploadedMedia.images[0] || "",
        imageUrl: uploadedMedia.coverImage || uploadedMedia.images[0] || "",

        videoUrl: uploadedMedia.videoUrl,
        videoUrls: uploadedMedia.videoUrl ? [uploadedMedia.videoUrl] : [],

        documents: uploadedMedia.documents.slice(0, 5),
        documentUrls: uploadedMedia.documents.map((d: any) => (typeof d === "object" ? d.url : d)).slice(0, 5),

        status: "Available",
        approvalStatus: "Approved",
      };

      let url = `${API_BASE}/api/realestate`;
      let method = "POST";

      if (isEdit && editingProperty) {
        url = `${API_BASE}/api/realestate/code/${editingProperty.propertyCode || editingProperty.id || editingProperty._id}`;
        method = "PUT";
      }

      // Step 4: POST JSON to Backend API
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if ((res.status === 201 || res.status === 200) && data.success && data.property) {
        alert(isEdit ? "Property updated successfully!" : `Property published to Real Estate Hub! (Code: ${data.property.propertyCode})`);
        
        // Reset state and close modal ONLY on confirmed HTTP 201 / HTTP 200 backend success
        setShowPropertyModal(false);
        setShowEditModal(false);
        setEditingProperty(null);
        setSelectedFileObjects([]);
        setSelectedVideoFile(null);
        setSelectedDocFiles([]);
        setPropertyPhotos([]);
        setCoverPhoto("");
        setPropertyVideo("");
        setPropertyDocs([]);

        // Step 5: Reload properties from MongoDB
        await loadProperties(providerUserCode);
        return;
      } else {
        throw new Error(data.message || `Server returned status ${res.status}`);
      }
    } catch (err: any) {
      console.error("Property Save Failure:", err);
      setSubmitError(err.message || "Failed to save property to database.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (propertyCode: string, newStatus: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.propertyCode === propertyCode ? { ...p, status: newStatus } : p))
    );

    try {
      await fetch(`${API_BASE}/api/realestate/code/${propertyCode}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {}
  };

  const openEditModal = (property: any) => {
    setEditingProperty(property);
    setPropertyType(property.propertyType || "plot");
    setSelectedFileObjects([]);
    setSelectedVideoFile(null);
    setSelectedDocFiles([]);

    const rawImgs = Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : Array.isArray(property.imageUrls) && property.imageUrls.length > 0
      ? property.imageUrls
      : [property.coverImage || property.imageUrl].filter(Boolean);

    setPropertyPhotos(rawImgs);
    setCoverPhoto(property.coverImage || rawImgs[0] || "");
    setPropertyVideo(property.videoUrl || "");
    setPropertyDocs(Array.isArray(property.documents) ? property.documents : []);
    setShowEditModal(true);
  };

  // Filtered Properties for Seller Dashboard
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        [p.title, p.city, p.locality, p.location, p.propertyCode, p.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesListing =
        filterListingType === "all" ||
        String(p.listingType || p.transactionType).toLowerCase() === filterListingType.toLowerCase();

      const matchesType =
        filterPropertyType === "all" ||
        String(p.propertyType).toLowerCase() === filterPropertyType.toLowerCase();

      const matchesStatus =
        filterStatus === "all" ||
        String(p.status).toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesListing && matchesType && matchesStatus;
    });
  }, [properties, searchQuery, filterListingType, filterPropertyType, filterStatus]);

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(start, start + itemsPerPage);
  }, [filteredProperties, currentPage]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;

  const metrics = useMemo(() => {
    const total = properties.length;
    const available = properties.filter((p) => String(p.status).toLowerCase() === "available").length;
    const pending = properties.filter((p) => String(p.approvalStatus).toLowerCase() === "pending").length;
    const approved = properties.filter((p) => String(p.approvalStatus).toLowerCase() === "approved").length;
    const forSale = properties.filter((p) => String(p.listingType || p.transactionType).toLowerCase() === "sale").length;
    const forRent = properties.filter((p) => String(p.listingType || p.transactionType).toLowerCase() === "rent").length;
    const totalEnquiriesCount = liveEnquiries.length;

    return { total, available, pending, approved, forSale, forRent, totalEnquiriesCount };
  }, [properties, liveEnquiries]);

  if (!isClient) return <LoadingSpinner label="Loading Real Estate Workspace..." />;

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "20px", fontFamily: "Inter, Roboto, sans-serif" }}>
      {/* Top Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          padding: "24px 28px",
          borderRadius: "16px",
          marginBottom: "24px",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>🏢</span>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              Real Estate Seller Dashboard
            </h1>
          </div>
          <p style={{ margin: "6px 0 0 38px", fontSize: "14px", color: "#94a3b8", fontWeight: "500" }}>
            Welcome back, <strong style={{ color: "#38bdf8" }}>{userName}</strong> (Code: {providerUserCode})
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setSelectedFileObjects([]);
              setSelectedVideoFile(null);
              setSelectedDocFiles([]);
              setPropertyPhotos([]);
              setCoverPhoto("");
              setPropertyVideo("");
              setPropertyDocs([]);
              setEditingProperty(null);
              setSubmitError("");
              setShowPropertyModal(true);
            }}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: 0,
              padding: "12px 20px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ➕ Add New Property
          </button>
          <button
            onClick={() => window.open("/realestate-hub", "_blank")}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "12px 18px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            🌐 Public Hub View
          </button>
          <button
            onClick={logoutToLogin}
            style={{
              background: "rgba(239,68,68,0.2)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.3)",
              padding: "12px 18px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Metrics Banner */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <div style={{ background: "white", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
            Total Properties
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", marginTop: "4px" }}>
            {metrics.total}
          </div>
        </div>
        <div style={{ background: "#f0fdf4", padding: "18px", borderRadius: "14px", border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: "12px", color: "#166534", fontWeight: "700", textTransform: "uppercase" }}>
            Approved & Active
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#15803d", marginTop: "4px" }}>
            {metrics.approved}
          </div>
        </div>
        <div style={{ background: "#fefce8", padding: "18px", borderRadius: "14px", border: "1px solid #fef08a" }}>
          <div style={{ fontSize: "12px", color: "#854d0e", fontWeight: "700", textTransform: "uppercase" }}>
            Pending Approval
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#ca8a04", marginTop: "4px" }}>
            {metrics.pending}
          </div>
        </div>
        <div style={{ background: "#eff6ff", padding: "18px", borderRadius: "14px", border: "1px solid #bfdbfe" }}>
          <div style={{ fontSize: "12px", color: "#1e40af", fontWeight: "700", textTransform: "uppercase" }}>
            For Sale
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#1d4ed8", marginTop: "4px" }}>
            {metrics.forSale}
          </div>
        </div>
        <div style={{ background: "#faf5ff", padding: "18px", borderRadius: "14px", border: "1px solid #e9d5ff" }}>
          <div style={{ fontSize: "12px", color: "#6b21a8", fontWeight: "700", textTransform: "uppercase" }}>
            For Rent
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#7e22ce", marginTop: "4px" }}>
            {metrics.forRent}
          </div>
        </div>
        <div style={{ background: "#fff7ed", padding: "18px", borderRadius: "14px", border: "1px solid #fed7aa" }}>
          <div style={{ fontSize: "12px", color: "#9a3412", fontWeight: "700", textTransform: "uppercase" }}>
            Buyer Enquiries
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#c2410c", marginTop: "4px" }}>
            {metrics.totalEnquiriesCount}
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          background: "white",
          padding: "8px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          overflowX: "auto",
        }}
      >
        {[
          ["overview", "📊 Overview"],
          ["properties", "🏠 My Properties"],
          ["enquiries", "💬 Buyer Leads"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: 0,
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              background: activeTab === id ? "#0f766e" : "transparent",
              color: activeTab === id ? "white" : "#64748b",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <Card style={{ padding: "20px" }}>
              <h3 style={{ marginTop: 0, color: "#0f172a" }}>🚀 Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => {
                    setSelectedFileObjects([]);
                    setSelectedVideoFile(null);
                    setSelectedDocFiles([]);
                    setPropertyPhotos([]);
                    setCoverPhoto("");
                    setPropertyVideo("");
                    setPropertyDocs([]);
                    setEditingProperty(null);
                    setSubmitError("");
                    setShowPropertyModal(true);
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#0f766e",
                    color: "white",
                    border: 0,
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  ➕ Create New Property Listing
                </button>
                <button
                  onClick={() => setActiveTab("properties")}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  📁 Manage Existing Properties ({properties.length})
                </button>
                <button
                  onClick={() => setActiveTab("enquiries")}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  📬 View Buyer Enquiries ({liveEnquiries.length})
                </button>
              </div>
            </Card>

            <Card style={{ padding: "20px" }}>
              <h3 style={{ marginTop: 0, color: "#0f172a" }}>📊 Portfolio Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Total Portfolio Value:</span>
                  <strong>
                    {formatPrice(properties.reduce((sum, p) => sum + (p.price || p.askingPrice || 0), 0))}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Approved Properties:</span>
                  <strong style={{ color: "#16a34a" }}>{metrics.approved}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Pending Admin Approval:</span>
                  <strong style={{ color: "#ca8a04" }}>{metrics.pending}</strong>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Properties Tab */}
      {activeTab === "properties" && (
        <section>
          {/* Search & Filter Bar */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              marginBottom: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <input
              placeholder="Search by title, location, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
              }}
            />
            <select
              value={filterListingType}
              onChange={(e) => setFilterListingType(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
              }}
            >
              <option value="all">All Transactions</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
            <select
              value={filterPropertyType}
              onChange={(e) => setFilterPropertyType(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
              }}
            >
              <option value="all">All Property Types</option>
              <option value="plot">Plot / Layout</option>
              <option value="bmrda">BMRDA Approved</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
              <option value="farmland">Farm Land</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {loading ? (
            <LoadingSpinner label="Fetching seller properties from MongoDB..." />
          ) : paginatedProperties.length === 0 ? (
            <EmptyState
              title="No properties found"
              description="Add a property or adjust search filters."
              actionLabel="Add Property"
              onAction={() => setShowPropertyModal(true)}
            />
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {paginatedProperties.map((p) => {
                  const cover = p.coverImage || (Array.isArray(p.images) ? p.images[0] : "") || p.imageUrl;
                  const photoCount = Array.isArray(p.images) ? p.images.length : p.imageUrls?.length || 0;
                  const hasVideo = Boolean(p.videoUrl);
                  const docCount = Array.isArray(p.documents) ? p.documents.length : 0;
                  const isPending = String(p.approvalStatus).toLowerCase() === "pending";

                  return (
                    <Card
                      key={p.id || p.propertyCode || p._id}
                      style={{
                        padding: 0,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ position: "relative", height: "180px", background: "#cbd5e1" }}>
                        <img
                          src={absoluteUrl(cover)}
                          alt={p.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            background: "rgba(15, 23, 42, 0.85)",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          {p.propertyCode}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: isPending ? "#eab308" : (p.status === "Available" ? "#10b981" : "#f59e0b"),
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          {isPending ? "Pending Approval" : p.status}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            display: "flex",
                            gap: "6px",
                          }}
                        >
                          <span style={{ background: "rgba(0,0,0,0.6)", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>
                            📷 {photoCount} Photos
                          </span>
                          {hasVideo && (
                            <span style={{ background: "#3b82f6", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>
                              🎥 Video
                            </span>
                          )}
                          {docCount > 0 && (
                            <span style={{ background: "#8b5cf6", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>
                              📄 {docCount} Docs
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{p.title}</h3>
                          <span style={{ fontSize: "12px", color: "#0f766e", fontWeight: "700", textTransform: "uppercase" }}>
                            {p.listingType || "Sale"}
                          </span>
                        </div>

                        <p style={{ margin: "4px 0 12px", fontSize: "13px", color: "#64748b" }}>
                          📍 {p.locality || p.city || p.location}, {p.city || p.location}
                        </p>

                        <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f766e", marginBottom: "8px" }}>
                          {formatPrice(p.price || p.askingPrice || p.totalAmount || 0)}
                        </div>

                        <div style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>
                          📐 <strong>{p.area || p.plotArea || p.totalArea || 0}</strong> sq.ft | ₹{p.pricePerSqft || p.ratePerSqft || p.ratePerSft || 0}/sqft
                        </div>

                        <div style={{ marginTop: "auto", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => openEditModal(p)}
                            style={{
                              flex: 1,
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #0f766e",
                              background: "white",
                              color: "#0f766e",
                              fontWeight: "700",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            ✏️ Edit Media & Details
                          </button>
                          <select
                            value={p.status}
                            onChange={(e) => handleStatusChange(p.propertyCode, e.target.value)}
                            style={{
                              padding: "6px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12px",
                            }}
                          >
                            <option value="Available">Available</option>
                            <option value="Sold">Sold</option>
                            <option value="Rented">Rented</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    Previous
                  </button>
                  <span style={{ alignSelf: "center", fontSize: "14px" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Enquiries Tab */}
      {activeTab === "enquiries" && (
        <section>
          <Card style={{ padding: "20px" }}>
            <h3 style={{ marginTop: 0, color: "#0f172a" }}>💬 Buyer Enquiries & Leads</h3>
            {liveEnquiries.length === 0 ? (
              <p style={{ color: "#64748b" }}>No buyer enquiries received yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                      <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Date / Code</th>
                      <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Buyer Info</th>
                      <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Property</th>
                      <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Requirement</th>
                      <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveEnquiries.map((e) => (
                      <tr key={e._id || e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px" }}>
                          {e.createdAt?.split("T")[0] || "Recent"}
                          <br />
                          <strong>{e.enquiryCode}</strong>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <strong>{e.buyerName}</strong>
                          <br />
                          <span style={{ color: "#0f766e" }}>{e.buyerPhone || "Contact in Admin queue"}</span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <strong>{e.itemName || e.propertyCode}</strong>
                          <br />
                          <small>{e.location}</small>
                        </td>
                        <td style={{ padding: "12px" }}>{e.specification || e.message}</td>
                        <td style={{ padding: "12px" }}>
                          <button
                            onClick={() => {
                              const phone = String(e.buyerPhone || "").replace(/\D/g, "");
                              const msg = `Hello ${e.buyerName}, regarding your enquiry for ${e.itemName} (${e.propertyCode}) on BuildMitra Real Estate.`;
                              window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              background: "#25d366",
                              color: "white",
                              border: 0,
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Add / Edit Property Modal */}
      {(showPropertyModal || showEditModal) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, color: "#0f172a" }}>
                {showEditModal ? `Edit Property (${editingProperty?.propertyCode})` : "Add New Property Listing"}
              </h2>
              <button
                onClick={() => {
                  if (!submitting) {
                    setShowPropertyModal(false);
                    setShowEditModal(false);
                  }
                }}
                disabled={submitting}
                style={{ border: 0, background: "none", fontSize: "20px", cursor: "pointer" }}
              >
                ✖
              </button>
            </div>

            {submitError && (
              <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
                ⚠️ {submitError}
              </div>
            )}

            <form id="propertyForm" onChange={handleInputChange} onSubmit={(e) => handleSaveProperty(e, showEditModal)}>
              {/* Basic Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    Property Category *
                  </label>
                  <select
                    name="propertyType"
                    value={propertyType}
                    onChange={(e) => {
                      setPropertyType(e.target.value);
                      setTimeout(handleInputChange, 50);
                    }}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option value="plot">Plot / Layout</option>
                    <option value="bmrda">BMRDA Approved Layout</option>
                    <option value="revenue">Revenue Land / Site</option>
                    <option value="agriculture">Agriculture Land</option>
                    <option value="farmland">Farm Land</option>
                    <option value="industrial">Industrial Land</option>
                    <option value="apartment">Apartment / Flat</option>
                    <option value="villa">Villa / House</option>
                    <option value="commercial">Commercial Space</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    Listing Purpose *
                  </label>
                  <select
                    name="listingType"
                    defaultValue={editingProperty?.listingType || "Sale"}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    Property Title *
                  </label>
                  <input
                    name="title"
                    required
                    defaultValue={editingProperty?.title || ""}
                    placeholder="e.g. Premium Devanahalli Plot"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    City / Location *
                  </label>
                  <input
                    name="location"
                    required
                    defaultValue={editingProperty?.location || editingProperty?.city || ""}
                    placeholder="e.g. Bengaluru, Devanahalli"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    Locality / Area Name
                  </label>
                  <input
                    name="locality"
                    defaultValue={editingProperty?.locality || editingProperty?.area || ""}
                    placeholder="e.g. Near Airport Road"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Dynamic Property Fields according to selected Property Type */}
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "14px" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0f766e" }}>
                  📋 Details for {propertyType.toUpperCase()}
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                  {getPropertyFields(propertyType).fields.map((field) => (
                    <div key={field.key}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", marginBottom: "3px" }}>
                        {field.label} {field.required && "*"}
                      </label>
                      {field.type === "select" ? (
                        <select
                          name={field.key}
                          required={field.required}
                          defaultValue={editingProperty?.[field.key] || field.options[0]}
                          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                        >
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.key}
                          required={field.required}
                          defaultValue={editingProperty?.[field.key] || ""}
                          placeholder={field.label}
                          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculated Area & Price Summary Box */}
              <div
                style={{
                  background: "#e6fffa",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #99f6e4",
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: "#0f766e",
                  fontWeight: "700",
                }}
              >
                <div>📐 Total Area: {calculatedArea.toLocaleString()} sq.ft</div>
                <div>💰 Calculated Amount: ₹{calculatedTotal.toLocaleString()}</div>
              </div>

              {/* Multi-Media Manager Section: Images (Max 3), Video (Max 1), Documents (Max 5) */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", marginBottom: "16px", border: "1px dashed #cbd5e1" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "14px", color: "#0f172a" }}>
                  📁 Property Media Uploads (Permanent Storage)
                </h4>

                {/* 1. Images (Max 3) */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    📷 Property Photos (Max 3: JPG, PNG, WEBP)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    disabled={uploading || submitting || propertyPhotos.length >= 3}
                    style={{ marginBottom: "8px" }}
                  />
                  {propertyPhotos.length > 0 && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {propertyPhotos.slice(0, 3).map((url, idx) => (
                        <div key={idx} style={{ position: "relative", width: "90px", height: "70px", borderRadius: "6px", overflow: "hidden", border: coverPhoto === url ? "2px solid #0f766e" : "1px solid #cbd5e1" }}>
                          <img src={absoluteUrl(url)} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(url, idx)}
                            disabled={submitting}
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              background: "rgba(239, 68, 68, 0.8)",
                              color: "white",
                              border: 0,
                              borderRadius: "50%",
                              width: "18px",
                              height: "18px",
                              fontSize: "10px",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Video (Max 1 MP4) */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    🎥 Walkthrough Video (Max 1 MP4)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/*"
                    onChange={handleVideoSelect}
                    disabled={uploading || submitting}
                    style={{ marginBottom: "6px" }}
                  />
                  {propertyVideo && (
                    <div style={{ fontSize: "12px", color: "#0f766e", fontWeight: "700" }}>
                      ✅ Video selected / attached
                    </div>
                  )}
                </div>

                {/* 3. Documents (Max 5 PDF/DOC) */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    📄 Legal & Layout Documents (Max 5: PDF, DOC, DOCX)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,application/pdf,application/msword"
                    onChange={handleDocSelect}
                    disabled={uploading || submitting || propertyDocs.length >= 5}
                    style={{ marginBottom: "6px" }}
                  />
                  {propertyDocs.length > 0 && (
                    <ul style={{ margin: "4px 0 0", paddingLeft: "20px", fontSize: "12px", color: "#475569" }}>
                      {propertyDocs.slice(0, 5).map((doc, i) => (
                        <li key={i}>{typeof doc === "object" ? doc.name || doc.url : doc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                  Description / Key Features
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingProperty?.description || ""}
                  placeholder="Describe road access, connectivity, nearby landmarks..."
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    background: submitting ? "#94a3b8" : "#0f766e",
                    color: "white",
                    border: 0,
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Saving to Database..." : showEditModal ? "Save Property Changes" : "Publish Property to Real Estate Hub"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowPropertyModal(false);
                    setShowEditModal(false);
                  }}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "8px",
                    background: "#cbd5e1",
                    color: "#334155",
                    border: 0,
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

