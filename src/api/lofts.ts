import api from "./api";
import type { Loft } from "../types";

// GET all lofts
export async function getLofts() {
  return api.get<Loft[]>("/lofts");
}

// CREATE loft
export async function createLoft(loft: Partial<Loft>) {
  return api.post("/lofts", loft);
}

// UPDATE loft
export async function updateLoft(id: number, loft: Partial<Loft>) {
  return api.put(`/lofts/${id}`, loft);
}

// DELETE loft
export async function deleteLoft(id: number) {
  return api.delete(`/lofts/${id}`);
}
