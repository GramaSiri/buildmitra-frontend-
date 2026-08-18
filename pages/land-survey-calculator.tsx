import React from "react";
import Head from "next/head";
import Sidebar from "../components/Sidebar";
import SurveyCalculator from "../components/calculators/SurveyCalculator";

export default function LandSurveyCalculatorPage() {
  return (
    <>
      <Head>
        <title>Land Survey Calculator & GPS Area Converter | BuildMitra</title>
        <meta
          name="description"
          content="Land survey calculator for 20x30 ft plots up to 200+ Acres. Calculate area in Acres, Cents, Sq.Ft, Sq.Meters, Sq.Yards using boundary segments, bearing traverse and live GPS satellite pins."
        />
      </Head>
      <Sidebar currentPath="/land-survey-calculator">
        <div style={{ padding: "16px" }}>
          <SurveyCalculator />
        </div>
      </Sidebar>
    </>
  );
}
