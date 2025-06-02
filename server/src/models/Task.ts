import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
  storyPoints: number;
  labels: string[];
  lane: Schema.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  assignee: { type: String, required: true },
  storyPoints: { type: Number, default: 0 },
  labels: [{ type: String }],
  lane: { type: Schema.Types.ObjectId, ref: 'Lane', required: true },
  position: { type: Number, required: true },
}, {
  timestamps: true,
});

export default mongoose.model<ITask>('Task', TaskSchema);
