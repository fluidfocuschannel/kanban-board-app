import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document {
  name: string;
  description: string;
  lanes: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  lanes: [{ type: Schema.Types.ObjectId, ref: 'Lane' }],
}, {
  timestamps: true,
});

export default mongoose.model<IBoard>('Board', BoardSchema);
