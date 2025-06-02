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
const Task_1 = __importDefault(require("../models/Task"));
const Lane_1 = __importDefault(require("../models/Lane"));
const server_1 = require("../server");
const router = (0, express_1.Router)();
// Get all tasks for a board
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { boardId } = req.query;
        const lanes = yield Lane_1.default.find({ board: boardId });
        const laneIds = lanes.map(lane => lane._id);
        const tasks = yield Task_1.default.find({ lane: { $in: laneIds } })
            .populate('lane');
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tasks' });
    }
}));
// Create new task
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = new Task_1.default(req.body);
        yield task.save();
        server_1.eventEmitter.emit('taskCreate', { task });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating task' });
    }
}));
// Update task
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = yield Task_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        server_1.eventEmitter.emit('taskUpdate', { task });
        res.json(task);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating task' });
    }
}));
// Move task between lanes
router.put('/:id/move', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { laneId, position } = req.body;
        const task = yield Task_1.default.findByIdAndUpdate(req.params.id, { lane: laneId, position }, { new: true });
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        server_1.eventEmitter.emit('taskUpdate', { task, laneId, position });
        res.json(task);
    }
    catch (error) {
        res.status(400).json({ message: 'Error moving task' });
    }
}));
// Delete task
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = yield Task_1.default.findByIdAndDelete(req.params.id);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        server_1.eventEmitter.emit('taskDelete', { task });
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Error deleting task' });
    }
}));
exports.default = router;
