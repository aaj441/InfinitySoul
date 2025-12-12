/**
 * Carrier Matrix
 * Load and manage carrier appetite data
 */

import * as fs from "fs";
import * as path from "path";

export interface CarrierAppetite {
  carrier_name: string;
  min_revenue: number;
  max_revenue: number;
  industries: string[];
  weight: number; // Higher weight = better match
  contact_info?: string;
}

/**
 * Load carrier appetite data from JSON file
 * @param filePath Path to carrier matrix JSON file
 * @returns Carrier data organized by industry
 */
export function loadCarrierAppetite(
  filePath: string
): Record<string, CarrierAppetite[]> {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`Carrier matrix file not found: ${absolutePath}`);
      return { generic: [] };
    }

    const data = fs.readFileSync(absolutePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading carrier matrix:", error);
    return { generic: [] };
  }
}
