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
exports.requireDeveloperOrAdmin = exports.requireAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Authentication middleware
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        // Verify user still exists
        const user = yield User_1.default.findById(decoded.userId);
        if (!user) {
            res.status(401).json({ message: 'Invalid token. User not found.' });
            return;
        }
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
});
exports.authenticate = authenticate;
// Admin role middleware
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
// Developer or Admin role middleware
const requireDeveloperOrAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
    }
    if (req.user.role !== 'admin' && req.user.role !== 'developer') {
        res.status(403).json({ message: 'Access denied. Developer or Admin role required.' });
        return;
    }
    next();
};
exports.requireDeveloperOrAdmin = requireDeveloperOrAdmin;
