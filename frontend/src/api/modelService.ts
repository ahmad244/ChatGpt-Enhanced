import api from './apiClient';
import { IModel } from '../types/model';

export const fetchModels = async (): Promise<IModel[]> => {
  try {
    const response = await api.get<IModel[]>('/models');
    return response.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};
