"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Board_1 = __importDefault(require("../models/Board"));
const Lane_1 = __importDefault(require("../models/Lane"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all boards - requires authentication
const getAllBoards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const boards = yield Board_1.default.find()
            .populate({
            path: 'lanes',
            populate: {
                path: 'tasks',
                model: 'Task'
            }
        })
            .populate('createdBy', 'username email role');
        res.json(boards);
    }
    catch (error) {
        console.error('Error fetching boards:', error);
        res.status(500).json({ message: 'Error fetching boards' });
        return;
    }
});
// Create new board - requires admin role
const createBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Creating board with data:', req.body);
        const { name, description, swimlanes } = req.body;
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const board = new Board_1.default({
            name,
            description,
            createdBy: req.user.userId
        });
        yield board.save();
        console.log('Board saved:', board);
        // Create lanes from custom swimlanes or use default
        const laneNames = swimlanes && swimlanes.length > 0
            ? swimlanes
            : ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
        const lanes = yield Promise.all(laneNames.map((laneName, index) => __awaiter(void 0, void 0, void 0, function* () {
            const newLane = yield new Lane_1.default({
                name: laneName,
                position: index,
                board: board._id
            }).save();
            return newLane;
        })));
        console.log('Lanes created:', lanes);
        const laneIds = lanes.map(lane => lane._id);
        yield Board_1.default.findByIdAndUpdate(board._id, { lanes: laneIds });
        yield board.save();
        console.log('Board updated with lanes:', board);
        // Return the board with populated lanes
        const populatedBoard = yield Board_1.default.findById(board._id)
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
    }
    catch (error) {
        console.error('Error creating board:', error);
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error creating board', error: error.message });
        }
        else {
            res.status(400).json({ message: 'Error creating board' });
        }
        return;
    }
});
// Get specific board - requires authentication
const getBoardById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const board = yield Board_1.default.findById(req.params.id)
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
    }
    catch (error) {
        console.error('Error fetching board:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error fetching board', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Error fetching board' });
        }
        return;
    }
});
// Update board - requires admin role
const updateBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const board = yield Board_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        res.json(board);
        return;
    }
    catch (error) {
        console.error('Error updating board:', error);
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error updating board', error: error.message });
        }
        else {
            res.status(400).json({ message: 'Error updating board' });
        }
        return;
    }
});
// Delete board - requires admin role
const deleteBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const board = yield Board_1.default.findByIdAndDelete(req.params.id);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        res.json({ message: 'Board deleted successfully' });
        return;
    }
    catch (error) {
        console.error('Error deleting board:', error);
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error deleting board', error: error.message });
        }
        else {
            res.status(400).json({ message: 'Error deleting board' });
        }
        return;
    }
});
// Apply middleware and routes
router.get('/', auth_1.authenticate, auth_1.requireDeveloperOrAdmin, getAllBoards);
router.post('/', auth_1.authenticate, auth_1.requireAdmin, createBoard);
router.get('/:id', auth_1.authenticate, auth_1.requireDeveloperOrAdmin, getBoardById);
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, updateBoard);
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, deleteBoard);
exports.default = router;
