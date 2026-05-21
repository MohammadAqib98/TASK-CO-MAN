const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seedData = async () => {
  try {
    const mongoURI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/taskmanager';
    console.log('Connecting to database for seeding at:', mongoURI);
    
    await mongoose.connect(mongoURI);
    console.log('Database connected successfully.');

    // Clear existing collections
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Data cleared.');

    // 1. Seed Users (1 Admin, 2 Members)
    console.log('Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@taskmanager.com',
      password: hashedPassword,
      role: 'admin'
    });

    const alice = await User.create({
      name: 'Alice Smith',
      email: 'alice@taskmanager.com',
      password: hashedPassword,
      role: 'member'
    });

    const bob = await User.create({
      name: 'Bob Jones',
      email: 'bob@taskmanager.com',
      password: hashedPassword,
      role: 'member'
    });

    console.log('Seeded users:', {
      admin: admin.email,
      alice: alice.email,
      bob: bob.email
    });

    // 2. Seed Projects (2 Projects)
    console.log('Seeding projects...');
    const websiteProject = await Project.create({
      name: 'Website Redesign',
      description: 'Overhaul the main enterprise landing page and client portal with a modern, glassmorphic layout.',
      createdBy: admin._id,
      members: [admin._id, alice._id], // Admin and Alice
      teamRoles: [
        {
          user: admin._id,
          projectRole: 'Team Leader',
          roleDescription: 'Corporate Project Owner, system designer, and overall lead.'
        },
        {
          user: alice._id,
          projectRole: 'Lead UI/UX Designer',
          roleDescription: 'Responsible for user research, color systems, and page navigation layouts.'
        }
      ]
    });

    const mobileProject = await Project.create({
      name: 'Mobile Application',
      description: 'Build the companion iOS & Android applications using cross-platform responsive frames.',
      createdBy: admin._id,
      members: [admin._id, alice._id, bob._id], // Admin, Alice, and Bob
      teamRoles: [
        {
          user: admin._id,
          projectRole: 'Team Leader',
          roleDescription: 'Corporate Project Owner, system designer, and overall lead.'
        },
        {
          user: alice._id,
          projectRole: 'Lead Designer',
          roleDescription: 'In charge of responsive visual guidelines and styling specs.'
        },
        {
          user: bob._id,
          projectRole: 'Full Stack Engineer',
          roleDescription: 'Coordinates server configurations and builds RESTful routes.'
        }
      ]
    });

    console.log('Seeded projects:', [websiteProject.name, mobileProject.name]);

    // 3. Seed Tasks (6 Tasks)
    console.log('Seeding tasks...');
    
    const today = new Date();
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(today.getDate() - 1);

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(today.getDate() - 5);

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const tasks = [
      // Website Project Tasks
      {
        title: 'Design Notion-style mockups',
        description: 'Create beautiful Figma layouts and outline standard theme custom property tokens.',
        projectId: websiteProject._id,
        assigneeId: alice._id,
        priority: 'High',
        status: 'Done',
        dueDate: fiveDaysAgo
      },
      {
        title: 'Implement Express API endpoints',
        description: 'Set up JWT validation, cascading collection removals, and input sanitize controls.',
        projectId: websiteProject._id,
        assigneeId: alice._id,
        priority: 'High',
        status: 'In Progress',
        dueDate: tomorrow
      },
      {
        title: 'Draft Database schema guidelines',
        description: 'Optimize Mongo indexes, foreign key references, and populate pathways.',
        projectId: websiteProject._id,
        assigneeId: admin._id,
        priority: 'Medium',
        status: 'Done',
        dueDate: oneDayAgo
      },
      // Mobile Project Tasks
      {
        title: 'Create core navigation router',
        description: 'Set up secure protected routes and role-based redirect screens. (This task is past due date and NOT done, representing an OVERDUE state!)',
        projectId: mobileProject._id,
        assigneeId: bob._id,
        priority: 'High',
        status: 'Todo',
        dueDate: fiveDaysAgo // Overdue task
      },
      {
        title: 'Configure Push Notification keys',
        description: 'Integrate APNS and FCM credentials and establish subscription listeners.',
        projectId: mobileProject._id,
        assigneeId: null, // Unassigned
        priority: 'Medium',
        status: 'Review',
        dueDate: nextWeek
      },
      {
        title: 'Refactor global light/dark theme',
        description: 'Fine-tune background contrasts, font readabilities, and subtle transitions.',
        projectId: mobileProject._id,
        assigneeId: alice._id,
        priority: 'Low',
        status: 'Todo',
        dueDate: tomorrow
      }
    ];

    await Task.insertMany(tasks);
    console.log('Seeded 6 sample tasks with varied deadlines, assignments, and statuses.');

    console.log('Database seeding process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
