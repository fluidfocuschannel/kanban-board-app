import { Router, Request, Response, RequestHandler } from 'express';
import { Types } from 'mongoose';
import Board, { IBoard } from '../models/Board';
import Lane, { ILane } from '../models/Lane';

interface CreateBoardBody {
  name: string;
  description: string;
}

interface UpdateBoardBody {
  name?: string;
  description?: string;
  lanes?: Types.ObjectId[];
}

interface BoardParams {
  id: string;
}

const router = Router();

// Get all boards
const getAllBoards: RequestHandler = async (_req, res) => {
  try {
    const boards = await Board.find().populate({
      path: 'lanes',
      populate: {
        path: 'tasks',
        model: 'Task'
      }
    });
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Error fetching boards' });
    return;
  }
};

// Create new board
const createBoard: RequestHandler<{}, any, CreateBoardBody> = async (req, res) => {
  try {
    console.log('Creating board with data:', req.body);
    const { name, description } = req.body;
    const board = new Board({ name, description });
    await board.save();
    console.log('Board saved:', board);

    // Create default lanes
    const defaultLanes = [
      { name: 'Backlog', position: 0 },
      { name: 'To Do', position: 1 },
      { name: 'In Progress', position: 2 },
      { name: 'Review', position: 3 },
      { name: 'Done', position: 4 },
    ];    const lanes = await Promise.all(
      defaultLanes.map(async (lane) => {
        const newLane = await new Lane({ ...lane, board: board._id }).save();
        return newLane;
      })
    );

    console.log('Lanes created:', lanes);

    const laneIds = lanes.map(lane => lane._id);
    await Board.findByIdAndUpdate(board._id, { lanes: laneIds });
    await board.save();
    console.log('Board updated with lanes:', board);

    res.status(201).json(board);
    return;
  } catch (error) {
    console.error('Error creating board:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: 'Error creating board', error: error.message });
    } else {
      res.status(400).json({ message: 'Error creating board' });
    }
    return;
  }
};

// Get specific board
const getBoardById: RequestHandler<BoardParams> = async (req, res) => {
  try {    const board = await Board.findById(req.params.id)
      .populate({
        path: 'lanes',
        populate: {
          path: 'tasks',
          model: 'Task'
        }
      });
    
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }
    res.json(board);
    return;
  } catch (error) {
    console.error('Error fetching board:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error fetching board', error: error.message });
    } else {
      res.status(500).json({ message: 'Error fetching board' });
    }
    return;
  }
};

// Update board
const updateBoard: RequestHandler<BoardParams, any, UpdateBoardBody> = async (req, res) => {
  try {
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }
    res.json(board);
    return;
  } catch (error) {
    console.error('Error updating board:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: 'Error updating board', error: error.message });
    } else {
      res.status(400).json({ message: 'Error updating board' });
    }
    return;
  }
};

router.get('/', getAllBoards);
router.post('/', createBoard);
router.get('/:id', getBoardById);
router.put('/:id', updateBoard);

export default router;
