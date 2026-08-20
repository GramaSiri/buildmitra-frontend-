import React from "react";
import {
  ProfessionalReferencePlan
} from "../../data/professionalFloorPlanLibrary";


type Props = {
  plan: ProfessionalReferencePlan;
};


export const ProfessionalReferencePlanViewer:
  React.FC<Props> = ({ plan }) => {

  const { crop } = plan;

  const scaleX = 100 / crop.w;
  const scaleY = 100 / crop.h;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: 10,
        overflow: "hidden"
      }}
    >

      <div
        style={{
          padding: "8px 10px",
          background: "#eff6ff",
          borderBottom: "1px solid #bfdbfe",
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
          fontSize: 12
        }}
      >

        <strong>
          Professional Reference Plan
        </strong>

        <span>
          {plan.code}
        </span>

      </div>


      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "0.68",
          overflow: "hidden",
          background: "#ffffff"
        }}
      >

        <img
          src={plan.image}
          alt={plan.code}

          style={{
            position: "absolute",

            width: `${scaleX * 100}%`,
            height: `${scaleY * 100}%`,

            maxWidth: "none",

            left:
              `${-(crop.x / crop.w) * 100}%`,

            top:
              `${-(crop.y / crop.h) * 100}%`,

            objectFit: "fill",

            userSelect: "none",
            pointerEvents: "none"
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
        {plan.plotWidth}′ × {plan.plotLength}′
        {" • "}
        {plan.facing}
        {" • "}
        {plan.floorMode}
      </div>

    </div>
  );
};
