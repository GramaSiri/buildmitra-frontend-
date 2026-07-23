// BuildMitra Technical Input Sanitizer & Validation Rules
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePlotInputs(length: number, width: number, floors: number): ValidationResult {
  const errors: string[] = [];

  if (isNaN(length) || length <= 0) {
    errors.push("Plot Length must be a positive number.");
  } else if (length > 500) {
    errors.push("Plot Length exceeds maximum allowed single plot size (500 ft).");
  }

  if (isNaN(width) || width <= 0) {
    errors.push("Plot Width must be a positive number.");
  } else if (width > 500) {
    errors.push("Plot Width exceeds maximum allowed single plot size (500 ft).");
  }

  if (isNaN(floors) || floors < 1 || floors > 20) {
    errors.push("Floors must be between 1 (Ground Floor) and 20 floors.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCalculatorInputs(volumeOrArea: number, mixRatio?: string): ValidationResult {
  const errors: string[] = [];

  if (isNaN(volumeOrArea) || volumeOrArea <= 0) {
    errors.push("Volume / Area input must be greater than zero.");
  }

  if (mixRatio && !["1:1.5:3", "1:2:4", "1:3:6", "M15", "M20", "M25", "M30"].includes(mixRatio)) {
    errors.push("Selected mix ratio is invalid. Please select standard IS-456 grade.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
