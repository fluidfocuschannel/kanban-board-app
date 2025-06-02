import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Board from './models/Board';
import Lane from './models/Lane';
import Task from './models/Task';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board';

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Task.deleteMany({});
    await Lane.deleteMany({});
    await Board.deleteMany({});
    console.log('Cleared existing data');

    // Create a sample board
    const board = new Board({
      name: 'Team Sprint Board',
      description: 'Main development board for the team sprint'
    });
    await board.save();
    console.log('Created board:', board.name);

    // Create lanes
    const lanes = [
      {
        name: 'Backlog',
        position: 0,
        color: '#f8f9fa',
        wipLimit: 0,
        board: board._id
      },
      {
        name: 'To Do',
        position: 1,
        color: '#e3f2fd',
        wipLimit: 5,
        board: board._id
      },
      {
        name: 'In Progress',
        position: 2,
        color: '#fff3e0',
        wipLimit: 3,
        board: board._id
      },
      {
        name: 'Review',
        position: 3,
        color: '#f3e5f5',
        wipLimit: 2,
        board: board._id
      },
      {
        name: 'Done',
        position: 4,
        color: '#e8f5e9',
        wipLimit: 0,
        board: board._id
      }
    ];

    const createdLanes = await Lane.insertMany(lanes);
    console.log('Created lanes:', createdLanes.map(l => l.name));

    // Update board with lane references
    board.lanes = createdLanes.map(lane => lane._id as any);
    await board.save();

    // Create sample tasks
    const tasks = [
      // Backlog tasks
      {
        title: 'Implement user authentication',
        description: 'Add login and registration functionality with JWT tokens',
        priority: 'High',
        assignee: 'John Doe',
        storyPoints: 8,
        labels: ['backend', 'security'],
        lane: createdLanes[0]._id,
        position: 0
      },
      {
        title: 'Design user dashboard',
        description: 'Create wireframes and mockups for the main user dashboard',
        priority: 'Medium',
        assignee: 'Jane Smith',
        storyPoints: 5,
        labels: ['design', 'ui/ux'],
        lane: createdLanes[0]._id,
        position: 1
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment pipeline',
        priority: 'High',
        assignee: 'Mike Johnson',
        storyPoints: 13,
        labels: ['devops', 'automation'],
        lane: createdLanes[0]._id,
        position: 2
      },

      // To Do tasks
      {
        title: 'Create API documentation',
        description: 'Document all REST API endpoints with examples',
        priority: 'Medium',
        assignee: 'Sarah Wilson',
        storyPoints: 3,
        labels: ['documentation', 'api'],
        lane: createdLanes[1]._id,
        position: 0
      },
      {
        title: 'Implement search functionality',
        description: 'Add search feature with filters and sorting options',
        priority: 'Medium',
        assignee: 'Alex Brown',
        storyPoints: 5,
        labels: ['frontend', 'search'],
        lane: createdLanes[1]._id,
        position: 1
      },

      // In Progress tasks
      {
        title: 'Fix responsive layout issues',
        description: 'Resolve mobile and tablet layout problems on the main page',
        priority: 'High',
        assignee: 'Emily Davis',
        storyPoints: 3,
        labels: ['frontend', 'responsive', 'bug'],
        lane: createdLanes[2]._id,
        position: 0
      },
      {
        title: 'Optimize database queries',
        description: 'Improve performance of slow database operations',
        priority: 'Medium',
        assignee: 'David Lee',
        storyPoints: 8,
        labels: ['backend', 'performance', 'database'],
        lane: createdLanes[2]._id,
        position: 1
      },

      // Review tasks
      {
        title: 'Add unit tests for user service',
        description: 'Write comprehensive unit tests for user-related functionality',
        priority: 'Medium',
        assignee: 'Lisa Chen',
        storyPoints: 5,
        labels: ['testing', 'backend'],
        lane: createdLanes[3]._id,
        position: 0
      },

      // Done tasks
      {
        title: 'Setup project structure',
        description: 'Initialize React and Node.js project with basic configuration',
        priority: 'High',
        assignee: 'John Doe',
        storyPoints: 2,
        labels: ['setup', 'infrastructure'],
        lane: createdLanes[4]._id,
        position: 0
      },
      {
        title: 'Create basic components',
        description: 'Implement header, footer, and navigation components',
        priority: 'Medium',
        assignee: 'Jane Smith',
        storyPoints: 3,
        labels: ['frontend', 'components'],
        lane: createdLanes[4]._id,
        position: 1
      }
    ];

    await Task.insertMany(tasks);
    console.log('Created', tasks.length, 'sample tasks');

    console.log('✅ Database seeded successfully!');
    console.log('Board ID:', board._id);
    console.log('You can now start the application and see the sample data.');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
