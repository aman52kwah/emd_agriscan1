/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CropDiseaseGuide {
  id: string;
  name: string;
  symptoms: string;
  prevention: string;
  treatment: string;
  organicRemedy: string;
}

export interface RegionInfo {
  id: string;
  name: string;
  country: string;
  climateZone: string;
  soilType: string;
  typicalCrops: string[];
}

export interface WeatherForecast {
  month: string;
  tempRange: string;
  rainfallStatus: "Wet Season" | "Dry Season" | "Harmattan" | "Short Dry Spell";
  advisory: string;
  hazardRisk: "Low" | "Medium" | "High";
  hazardDetail?: string;
}

export interface DiagnosticLog {
  id: string;
  date: string;
  cropName: string;
  notes: string;
  imageUrl?: string;
  isCustomImage?: boolean;
  status: "Synced" | "Pending Sync";
  diagnosis?: {
    diseaseName: string;
    confidence: number;
    description: string;
    remedies: string[];
    preventions: string[];
    organicAlternatives: string;
  };
}

export interface PlantingSchedule {
  cropName: string;
  region: string;
  timeline: {
    phase: string;
    timing: string;
    tasks: string[];
    requirements: string[];
  }[];
  notes: string;
}

export interface LocalizedVoiceSample {
  lang: string;
  nativeName: string;
  transcription: string;
  audioSimulationUrl?: string;
}
