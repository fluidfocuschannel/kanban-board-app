import { Router, Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import Lane from '../models/Lane';
import { eventEmitter } from '../server';

const router = Router();

// Get all tasks for a board
router.get('/', async (req: Request, res: Response) => {
  try {
    const { boardId } = req.query;
    const lanes = await Lane.find({ board: boardId });
    const laneIds = lanes.map(lane => lane._id);
    const tasks = await Task.find({ lane: { $in: laneIds } })
      .populate('lane');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Create new task
router.post('/', async (req: Request, res: Response) => {
  try {
    const task = new Task(req.body);
    await task.save();
    eventEmitter.emit('taskCreate', { task });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error creating task' });
  }
});

// Update task
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    eventEmitter.emit('taskUpdate', { task });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task' });
  }
});

// Move task between lanes
router.put('/:id/move', async (req: Request, res: Response) => {
  try {
    const { laneId, position } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { lane: laneId, position },
      { new: true }
    );
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    eventEmitter.emit('taskUpdate', { task, laneId, position });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error moving task' });
  }
});

// Delete task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    eventEmitter.emit('taskDelete', { task });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting task' });
  }
});

export default router;
