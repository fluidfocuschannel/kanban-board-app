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
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("./models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board';
const seedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        // Check if admin user already exists
        const existingAdmin = yield User_1.default.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }
        // Create admin user (scrum master)
        const adminPassword = yield bcryptjs_1.default.hash('admin123', 10);
        const adminUser = new User_1.default({
            username: 'scrummaster',
            email: 'scrummaster@company.com',
            password: adminPassword,
            role: 'admin'
        });
        yield adminUser.save();
        console.log('Admin user (Scrum Master) created successfully');
        console.log('Email: scrummaster@company.com');
        console.log('Password: admin123');
        // Create a sample developer user
        const devPassword = yield bcryptjs_1.default.hash('dev123', 10);
        const devUser = new User_1.default({
            username: 'developer1',
            email: 'developer1@company.com',
            password: devPassword,
            role: 'developer'
        });
        yield devUser.save();
        console.log('Developer user created successfully');
        console.log('Email: developer1@company.com');
        console.log('Password: dev123');
    }
    catch (error) {
        console.error('Error seeding users:', error);
    }
    finally {
        yield mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
});
seedUsers();
