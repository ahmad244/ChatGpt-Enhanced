export interface IModel {
  _id: string;
  name: string;
  value: string;
  description?: string;
  endpoint: string;
  enabled: boolean;
  order?: number;
}

export interface IOpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}