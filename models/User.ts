import mongoose, { Schema, model, models } from "mongoose";

export interface IUser extends Document{
  azureAdId?: string;
  email?: string;
  roles?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}


const UserSchema = new mongoose.Schema<IUser>({
  azureAdId: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  roles: {
    type: [String],
    required: false,
    default: [],
  },
  createdAt: {
    type: Date,
    required: false,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: false,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
