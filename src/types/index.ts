export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Pigeon {
  id?: number;
  ringNumber: string;
  name: string;
  color: string;
  gender: string;
  status: string;
  birthDate: string;
  fatherRingNumber?: string;
  motherRingNumber?: string;
  owner?: { id: number };
  loftId?: number;
}

export type LoftType = "racing" | "training" | "breeding" | "parent" | "young" | "show" | "quarantine" | "general";

export interface Loft {
  id: number;
  name: string;
  type: string;
  description?: string;
  address?: string;
  capacity?: number;
  loftSize?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  pigeonCount: number;
  owner?: { id: number; username: string };
}

export interface Competition {
  id?: number;
  name: string;
  date: string;
  startLatitude?: number | null;
  startLongitude?: number | null;
  distanceKm?: number | null;
  notes?: string;
  temperatureC?: number | null;
  windSpeedKmH?: number | null;
  windDirection?: string;
  rain?: boolean | null;
  conditionsNotes?: string;
}

export interface CompetitionEntry {
  id?: number;
  competition: Competition;
  pigeon: Pigeon;
  place?: number;
  score?: number;
  actualDistanceKm?: number;
  flightTimeHours?: number;
  notes?: string;
}