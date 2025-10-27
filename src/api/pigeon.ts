import api from './axios';
import type { Pigeon } from '../types/index';

export const getPigeons = async (): Promise<Pigeon[]> => {
  const response = await api.get('/pigeons');
  return response.data;
};

export const getPigeonById = async (id: string): Promise<Pigeon> => {
  const response = await api.get(`/pigeons/${id}`);
  return response.data;
};

export const createPigeon = async (data: Partial<Pigeon>): Promise<Pigeon> => {
  const response = await api.post('/pigeons', data);
  return response.data;
};

export const updatePigeon = async (id: string, data: Partial<Pigeon>): Promise<Pigeon> => {
  const response = await api.put(`/pigeons/${id}`, data);
  return response.data;
};

export const deletePigeon = async (id: string): Promise<void> => {
  await api.delete(`/pigeons/${id}`);
};
