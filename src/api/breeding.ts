import api from "./api";
import type { BreedingSeasonDTO } from "../types";

// ----------------------
// GET all breeding seasons
// ----------------------
export async function getBreedingSeasons() {
  const res = await api.get<BreedingSeasonDTO[]>("/breeding/seasons");
  return res;
}

// ----------------------
// CREATE breeding season
// ----------------------
export async function createBreedingSeason(season: BreedingSeasonDTO) {
  const res = await api.post("/breeding/seasons", season);
  return res;
}

// ----------------------
// UPDATE breeding season
// ----------------------
export async function updateBreedingSeason(season: BreedingSeasonDTO) {
  if (!season.id) throw new Error("Season ID missing for update");

  const res = await api.patch(`/breeding/seasons/${season.id}`, season);
  return res;
}

// ----------------------
// DELETE breeding season
// ----------------------
export async function deleteBreedingSeason(id: number) {
  const res = await api.delete(`/breeding/seasons/${id}`);
  return res;
}
