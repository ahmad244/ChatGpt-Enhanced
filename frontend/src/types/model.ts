export interface IModel {
  _id: string;
  name: string;
  value: string;
  description?: string;
  endpoint: string;
  enabled: boolean;
}
