// src/seeds/seedModels.ts

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import mongoose from 'mongoose';
import { ModelDB } from '../models/Model';

// Define the models to seed
const models = [
  {
    name: 'GPT-4o Mini',
    value: 'gpt-4o-mini',
    description: 'A smaller version of GPT-4o.',
    endpoint: '/api/gpt-4o-mini',
    enabled: true,
  },
  {
    name: 'GPT-4o',
    value: 'gpt-4o',
    description: 'The standard GPT-4o model.',
    endpoint: '/api/gpt-4o',
    enabled: true,
  },
  {
    name: 'O1 Preview',
    value: 'o1-preview',
    description: 'Preview of the O1 model.',
    endpoint: '/api/o1-preview',
    enabled: true,
  },
  {
    name: 'O1 Mini',
    value: 'o1-mini',
    description: 'A smaller version of the O1 model.',
    endpoint: '/api/o1-mini',
    enabled: true,
  },
];

// Seed function with detailed logging
const seedModels = async () => {
  // Optional: Add Mongoose connection event listeners for better debugging
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to the database.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from the database.');
  });

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    // Confirm the connected database name
    const db = mongoose.connection.db;
    if (db) {
      const dbName = db.databaseName;
      console.log(`Connected to Database: ${dbName}`);
    } else {
      console.error('Failed to get database name: mongoose.connection.db is undefined');
    }

    console.log('Clearing existing models...');
    const deleteResult = await ModelDB.deleteMany({});
    console.log(`Cleared existing models: ${deleteResult.deletedCount} removed.`);

    console.log('Inserting new models...');
    const insertedModels = await ModelDB.insertMany(models);
    console.log(`Seeded ${insertedModels.length} models successfully:`);
    insertedModels.forEach((model) => {
      console.log(`- ${model.name} (${model.value})`);
    });

    console.log('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error: any) {
    console.error('Error seeding models:', error.message || error);
    // Attempt to disconnect in case of error
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB due to error.');
    } catch (disconnectError) {
      console.error('Error disconnecting from MongoDB:', disconnectError);
    }
    process.exit(1); // Exit the process with failure
  }
};

// Execute the seed function
seedModels();
