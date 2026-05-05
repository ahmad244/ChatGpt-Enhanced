import api from './apiClient';
import { IModel, IOpenAIModel } from '../types/model';

export const fetchModels = async (): Promise<IModel[]> => {
  try {
    const response = await api.get<IModel[]>('/models');
    return response.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

export const fetchOpenAIModels = async (): Promise<IOpenAIModel[]> => {
  try {
    const response = await api.get<IOpenAIModel[]>('/models/openai');
    return response.data;
  } catch (error) {
    console.error('Error fetching OpenAI models:', error);
    throw error;
  }
};

export const createModel = async (model: Omit<IModel, '_id'>): Promise<IModel> => {
  try {
    const response = await api.post<IModel>('/models', model);
    return response.data;
  } catch (error) {
    console.error('Error creating model:', error);
    throw error;
  }
};

export const updateModel = async (id: string, model: Partial<IModel>): Promise<IModel> => {
  try {
    const response = await api.put<IModel>(`/models/${id}`, model);
    return response.data;
  } catch (error) {
    console.error('Error updating model:', error);
    throw error;
  }
};

export const deleteModel = async (id: string): Promise<void> => {
  try {
    await api.delete(`/models/${id}`);
  } catch (error) {
    console.error('Error deleting model:', error);
    throw error;
  }
};