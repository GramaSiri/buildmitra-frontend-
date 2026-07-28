import React from "react";
import {
  DrawingSheetId,
  DrawingSheetMeta,
  DRGInputs,
  CandidateLayout,
  StructuralColumn,
  Box2D,
} from "./types";
import { generateWallSegments } from "./wallEngine";

export const DRAWING_SHEETS_MASTER: DrawingSheetMeta[] = [
  { id: "A-001", code: "A-001", title: "SITE PLAN & BOUNDARY LAYOUT", category: "architectural", scale: "1:200" },
  { id: "A-101", code: "A-101", title: "GROUND FLOOR ARCHITECTURAL PLAN", category: "architectural", scale: "1:100" },
  { id: "A-102", code: "A-102", title: "FIRST FLOOR ARCHITECTURAL PLAN", category: "architectural", scale: "1:100" },
  { id: "A-103", code: "A-103", title: "SECOND FLOOR ARCHITECTURAL PLAN", category: "architectural", scale: "1:100" },
  { id: "A-104", code: "A-104", title: "THIRD FLOOR ARCHITECTURAL PLAN", category: "architectural", scale: "1:100" },
  { id: "A-105", code: "A-105", title: "TERRACE & ROOF PLAN", category: "architectural", scale: "1:100" },
  { id: "E-201", code: "E-201", title: "FRONT ARCHITECTURAL ELEVATION", category: "elevation", scale: "1:100" },
  { id: "S-301", code: "S-301", title: "BUILDING CROSS SECTION DETAIL", category: "section", scale: "1:100" },
  { id: "ST-401", code: "ST-401", title: "COLUMN CENTRE LINE PLAN (GRID A-B-C-D)", category: "structural", scale: "1:100" },
  { id: "ST-402", code: "ST-402", title: "FOUNDATION & FOOTING LAYOUT PLAN", category: "structural", scale: "1:100" },
  { id: "ST-403", code: "ST-403", title: "PLINTH BEAM LAYOUT PLAN", category: "structural", scale: "1:100" },
  { id: "ST-404", code: "ST-404", title: "GROUND FLOOR BEAM LAYOUT PLAN", category: "structural", scale: "1:100" },
  { id: "ST-405", code: "ST-405", title: "FIRST FLOOR BEAM LAYOUT PLAN", category: "structural", scale: "1:100" },
  { id: "ST-406", code: "ST-406", title: "SLAB PANEL LAYOUT (ONE-WAY & TWO-WAY)", category: "structural", scale: "1:100" },
  { id: "SCH-501", code: "SCH-501", title: "ARCHITECTURAL SCHEDULES & CIVIL BOQ", category: "schedule", scale: "NTS" },
];

/**
 * Returns available drawing sheet list based on inputs (e.g. floor count)
 */
export function getAvailableDrawingSheets(floorsCount: number): DrawingSheetMeta[] {
  return DRAWING_SHEETS_MASTER.filter((s) => {
    if (s.id === "A-102" && floorsCount < 2) return false;
    if (s.id === "A-103" && floorsCount < 3) return false;
    if (s.id === "A-104" && floorsCount < 4) return false;
    if (s.id === "ST-405" && floorsCount < 2) return false;
    return true;
  });
}
