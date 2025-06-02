import { Router, Response } from 'express';
import { Types } from 'mongoose';
import Board, { IBoard } from '../models/Board';
import Lane, { ILane } from '../models/Lane';
import { authenticate, requireAdmin, requireDeveloperOrAdmin, AuthRequest } from '../middleware/auth';

interface CreateBoardBody {
  name: string;
  description: string;
  swimlanes?: string[];
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

// Get all boards - requires authentication
const getAllBoards = async (req: AuthRequest, res: Response) => {
  try {
    const boards = await Board.find()
      .populate({
        path: 'lanes',
        populate: {
          path: 'tasks',
          model: 'Task'
        }
      })
      .populate('createdBy', 'username email role');
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Error fetching boards' });
    return;
  }
};

// Create new board - requires admin role
const createBoard = async (req: AuthRequest<{}, any, CreateBoardBody>, res: Response) => {
  try {
    console.log('Creating board with data:', req.body);
    const { name, description, swimlanes } = req.body;
    
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const board = new Board({ 
      name, 
      description, 
      createdBy: req.user.userId 
    });
    await board.save();
    console.log('Board saved:', board);

    // Create lanes from custom swimlanes or use default
    const laneNames = swimlanes && swimlanes.length > 0 
      ? swimlanes 
      : ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

    const lanes = await Promise.all(
      laneNames.map(async (laneName, index) => {
        const newLane = await new Lane({ 
          name: laneName, 
          position: index, 
          board: board._id 
        }).save();
        return newLane;
      })
    );

    console.log('Lanes created:', lanes);

    const laneIds = lanes.map(lane => lane._id);
    await Board.findByIdAndUpdate(board._id, { lanes: laneIds });
    await board.save();
    console.log('Board updated with lanes:', board);

    // Return the board with populated lanes
    const populatedBoard = await Board.findById(board._id)
      .populate({
        path: 'lanes',
        populate: {
          path: 'tasks',
          model: 'Task'
        }
      })
      .populate('createdBy', 'username email role');

    res.status(201).json(populatedBoard);
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

// Get specific board - requires authentication
const getBoardById = async (req: AuthRequest<BoardParams>, res: Response) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate({
        path: 'lanes',
        populate: {
          path: 'tasks',
          model: 'Task'
        }
      })
      .populate('createdBy', 'username email role');
    
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

// Update board - requires admin role
const updateBoard = async (req: AuthRequest<BoardParams, any, UpdateBoardBody>, res: Response) => {
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

// Delete board - requires admin role
const deleteBoard = async (req: AuthRequest<BoardParams>, res: Response) => {
  try {
    const board = await Board.findByIdAndDelete(req.params.id);
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }
    res.json({ message: 'Board deleted successfully' });
    return;
  } catch (error) {
    console.error('Error deleting board:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: 'Error deleting board', error: error.message });
    } else {
      res.status(400).json({ message: 'Error deleting board' });
    }
    return;
  }
};

// Apply middleware and routes
router.get('/', authenticate, requireDeveloperOrAdmin, getAllBoards);
router.post('/', authenticate, requireAdmin, createBoard);
router.get('/:id', authenticate, requireDeveloperOrAdmin, getBoardById);
router.put('/:id', authenticate, requireAdmin, updateBoard);
router.delete('/:id', authenticate, requireAdmin, deleteBoard);

export default router;
