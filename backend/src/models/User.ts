import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  role: 'Admin' | 'User' | 'Moderator';
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'User' }
});

export const User = model<IUser>('User', userSchema);
