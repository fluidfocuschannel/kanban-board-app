import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { EventEmitter } from 'events';
import boardRoutes from './routes/board.routes';
import taskRoutes from './routes/task.routes';
import { ITask } from './models/Task';

dotenv.config();

interface TaskEvent {
  task: ITask;
  laneId?: string;
  position?: number;
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board';

// Event emitter for SSE
const eventEmitter = new EventEmitter();

// SSE endpoint
app.get('/api/updates', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (event: string, data: TaskEvent) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const taskUpdateHandler = (data: TaskEvent) => sendEvent('taskUpdate', data);
  const taskCreateHandler = (data: TaskEvent) => sendEvent('taskCreate', data);
  const taskDeleteHandler = (data: TaskEvent) => sendEvent('taskDelete', data);

  eventEmitter.on('taskUpdate', taskUpdateHandler);
  eventEmitter.on('taskCreate', taskCreateHandler);
  eventEmitter.on('taskDelete', taskDeleteHandler);

  req.on('close', () => {
    eventEmitter.off('taskUpdate', taskUpdateHandler);
    eventEmitter.off('taskCreate', taskCreateHandler);
    eventEmitter.off('taskDelete', taskDeleteHandler);
  });
});

// Export eventEmitter for use in routes
export { eventEmitter };

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
