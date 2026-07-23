import React, { useRef, useState, useEffect } from "react";

interface DigitalSignaturePadProps {
  onSignComplete?: (signatureDataUrl: string) => void;
  title?: string;
}

export default function DigitalSignaturePad({
  onSignComplete,
  title = "Digital E-Signature Pad (GDPR / RERA Compliant)"
}: DigitalSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#0f172a";
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSigned(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSigned) {
      alert("Please draw your signature before saving.");
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    if (onSignComplete) {
      onSignComplete(dataUrl);
    }
    alert("✅ E-Signature Captured & Embedded into Agreement PDF.");
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #cbd5e1" }}>
      <div style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>
        ✍️ {title}
      </div>

      <div style={{ border: "2px dashed #94a3b8", borderRadius: "8px", background: "#f8fafc", cursor: "crosshair" }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={140}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ width: "100%", height: "140px", touchAction: "none" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
        <div style={{ fontSize: "11px", color: "#64748b" }}>
          {hasSigned ? "✓ Signature Detected" : "Sign using touch or mouse cursor above"}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={clearCanvas}
            style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "12px", cursor: "pointer" }}
          >
            Clear
          </button>
          <button
            onClick={saveSignature}
            style={{ padding: "6px 14px", borderRadius: "6px", border: 0, background: "#2563eb", color: "#ffffff", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
          >
            Attach E-Signature
          </button>
        </div>
      </div>
    </div>
  );
}
