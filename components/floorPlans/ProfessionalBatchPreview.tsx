import React from "react";

import {
  ProfessionalFloorPlanBatch
} from "../../data/professionalFloorPlanBatches";


type Props = {
  batch: ProfessionalFloorPlanBatch;
};


export const ProfessionalBatchPreview:
  React.FC<Props> = ({ batch }) => {

  return (

    <div
      style={{
        width: "100%",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: 10,
        overflow: "hidden"
      }}
    >

      <div
        style={{
          padding: "8px 10px",
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
          background: "#eff6ff",
          borderBottom: "1px solid #bfdbfe"
        }}
      >

        <strong
          style={{
            fontSize: 13,
            color: "#0f172a"
          }}
        >
          {batch.title}
        </strong>

        <span
          style={{
            fontSize: 11,
            color: "#475569"
          }}
        >
          {batch.houseType}
        </span>

      </div>


      <div
        style={{
          width: "100%",
          overflowX: "auto",
          background: "#fff"
        }}
      >

        <img
          src={batch.sheet}
          alt={batch.title}

          style={{
            display: "block",
            width: "100%",
            minWidth: 850,
            height: "auto"
          }}
        />

      </div>


      <div
        style={{
          padding: "7px 10px",
          borderTop: "1px solid #e2e8f0",
          fontSize: 11,
          color: "#475569"
        }}
      >
        {batch.plotWidth}′ × {batch.plotLength}′
        {" • "}
        {batch.supportedFacings.join(" / ")}
        {" • "}
        {batch.supportedFloorModes.join(" / ")}
      </div>

    </div>
  );
};
