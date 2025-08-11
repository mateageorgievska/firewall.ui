import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IRequest extends Document {
  firewallId: string;
  name: string;
  labels: Record<string, string>;
  created: Date;
  publicIp: string;
  duration: string;
  requestedBy: string; 
}

const RequestSchema = new Schema<IRequest>({
  firewallId: { type: String, required: true },
  name: { type: String, required: true },
  labels: { type: Map, of: String },
  created: { type: Date, required: true },
  publicIp: { type: String, required: true },
  duration: { type: String, required: true },
  requestedBy: { type: String, required: true },
});

export const Request =
  models.Request || model<IRequest>("Request", RequestSchema);
