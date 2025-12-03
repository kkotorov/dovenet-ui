import api from "../api/api";
import type { Pigeon } from "../types";


// ----------------------
// PIGEONS
// ----------------------
export async function getUserPigeons() {
  return api.get<Pigeon[]>("/pigeons");
}

export async function createPigeon(pigeon: Pigeon) {
  return api.post<Pigeon>("/pigeons", pigeon);
}