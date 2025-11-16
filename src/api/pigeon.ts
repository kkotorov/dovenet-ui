import api from './api';
import type { Pigeon } from '../types/index';

export const getPigeons = async (): Promise<Pigeon[]> => {
  const res = await api.get('/pigeons');
  return res.data;
};

export const getPigeonById = async (id: string): Promise<Pigeon> => {
  const res = await api.get(`/pigeons/${id}`);
  return res.data;
};

export const createPigeon = async (data: Partial<Pigeon>): Promise<Pigeon> => {
  const res = await api.post('/pigeons', data);
  return res.data;
};

export const updatePigeon = async (id: string, data: Partial<Pigeon>): Promise<Pigeon> => {
  const res = await api.patch(`/pigeons/${id}`, data);
  return res.data;
};

export const deletePigeon = async (id: string): Promise<void> => {
  await api.delete(`/pigeons/${id}`);
};
