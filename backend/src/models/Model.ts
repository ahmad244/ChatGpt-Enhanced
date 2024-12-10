import { Schema, model, Document } from 'mongoose';

interface IModel extends Document {
  name: string;
  value: string;        // Added 'value' field
  description?: string; // Made 'description' optional
  endpoint: string;
  enabled: boolean;
}

const modelSchema = new Schema<IModel>({
  name: { type: String, required: true },
  value: { type: String, required: true, unique: true }, // Ensuring uniqueness
  description: { type: String },
  endpoint: { type: String, required: true },
  enabled: { type: Boolean, default: true }
});

export const ModelDB = model<IModel>('Model', modelSchema);
