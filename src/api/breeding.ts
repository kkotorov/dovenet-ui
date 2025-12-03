import api from "../api/api";
import type { BreedingPairDTO, BreedingSeasonDTO } from "../types";

// ----------------------
// SEASON
// ----------------------
export async function getBreedingSeason(id: string | number) {
  return api.get<BreedingSeasonDTO>(`/breeding/seasons/${id}`);
}

export async function getBreedingSeasons() {
  return api.get<BreedingSeasonDTO[]>("/breeding/seasons");
}

export async function createBreedingSeason(season: BreedingSeasonDTO) {
  return api.post("/breeding/seasons", season);
}

export async function updateBreedingSeason(season: BreedingSeasonDTO) {
  return api.patch(`/breeding/seasons/${season.id}`, season);
}

export async function deleteBreedingSeason(id: number) {
  return api.delete(`/breeding/seasons/${id}`);
}

// ----------------------
// PAIRS
// ----------------------
export async function getPairsForSeason(id: string | number) {
  return api.get<BreedingPairDTO[]>(`/breeding/seasons/${id}/pairs`);
}

export async function createPair(seasonId: string | number, dto: BreedingPairDTO) {
  return api.post(`/breeding/seasons/${seasonId}/pairs`, dto);
}

export async function updatePair(dto: BreedingPairDTO) {
  return api.patch(`/breeding/pairs/${dto.id}`, dto);
}

export async function deletePair(pairId: number) {
  return api.delete(`/breeding/pairs/${pairId}`);
}

// ----------------------
// OFFSPRING
// ----------------------
export async function addOffspring(pairId: number, pigeonId: number) {
  return api.post(`/breeding/pairs/${pairId}/offspring/${pigeonId}`);
}

export async function removeOffspring(pairId: number, offspringId: number) {
  return api.delete(`/breeding/pairs/${pairId}/offspring/${offspringId}`);
}
