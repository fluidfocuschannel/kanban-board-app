import mongoose, { Schema, Document } from 'mongoose';
import { ITask } from './Task';

export interface ILane extends Document {
  name: string;
  position: number;
  color: string;
  wipLimit: number;
  board: Schema.Types.ObjectId;
  tasks?: ITask[];
}

const LaneSchema: Schema = new Schema({
  name: { type: String, required: true },
  position: { type: Number, required: true },
  color: { type: String, default: '#FFFFFF' },
  wipLimit: { type: Number, default: 0 }, // 0 means no limit
  board: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
});

LaneSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'lane'
});

// Enable virtuals in toJSON
LaneSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.id;
    return ret;
  }
});

export default mongoose.model<ILane>('Lane', LaneSchema);
