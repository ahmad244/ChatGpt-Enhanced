import { Schema, model, Document } from "mongoose";

interface IModel extends Document {
  name: string;
  value: string;
  description?: string;
  endpoint: string;
  enabled: boolean;
  order?: number;
}

const modelSchema = new Schema<IModel>({
  name: { type: String, required: true },
  value: { type: String, required: true, unique: true }, // Ensuring uniqueness
  description: { type: String },
  endpoint: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  order: { type: Number },
});

export const ModelDB = model<IModel>("Model", modelSchema);
