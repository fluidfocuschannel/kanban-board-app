import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user (scrum master)
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'scrummaster',
      email: 'scrummaster@company.com',
      password: adminPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user (Scrum Master) created successfully');
    console.log('Email: scrummaster@company.com');
    console.log('Password: admin123');

    // Create a sample developer user
    const devPassword = await bcrypt.hash('dev123', 10);
    const devUser = new User({
      username: 'developer1',
      email: 'developer1@company.com',
      password: devPassword,
      role: 'developer'
    });

    await devUser.save();
    console.log('Developer user created successfully');
    console.log('Email: developer1@company.com');
    console.log('Password: dev123');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedUsers();
