"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const events_1 = require("events");
const board_routes_1 = __importDefault(require("./routes/board.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board';
// Event emitter for SSE
const eventEmitter = new events_1.EventEmitter();
exports.eventEmitter = eventEmitter;
// SSE endpoint
app.get('/api/updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const sendEvent = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    const taskUpdateHandler = (data) => sendEvent('taskUpdate', data);
    const taskCreateHandler = (data) => sendEvent('taskCreate', data);
    const taskDeleteHandler = (data) => sendEvent('taskDelete', data);
    eventEmitter.on('taskUpdate', taskUpdateHandler);
    eventEmitter.on('taskCreate', taskCreateHandler);
    eventEmitter.on('taskDelete', taskDeleteHandler);
    req.on('close', () => {
        eventEmitter.off('taskUpdate', taskUpdateHandler);
        eventEmitter.off('taskCreate', taskCreateHandler);
        eventEmitter.off('taskDelete', taskDeleteHandler);
    });
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/boards', board_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
// MongoDB Connection
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
