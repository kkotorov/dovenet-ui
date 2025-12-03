import api from "./api";
import type { Competition } from "../types";

export async function getCompetitions(): Promise<Competition[]> {
  const res = await api.get<Competition[]>("/competitions");
  return res.data;
}

export async function createCompetition(comp: Competition): Promise<Competition> {
  const res = await api.post("/competitions", comp);
  return res.data;
}

export async function updateCompetition(comp: Competition): Promise<Competition> {
  if (!comp.id) throw new Error("Competition ID is required for update");
  const res = await api.patch(`/competitions/${comp.id}`, comp);
  return res.data;
}

export async function deleteCompetition(id: number): Promise<void> {
  await api.delete(`/competitions/${id}`);
}
