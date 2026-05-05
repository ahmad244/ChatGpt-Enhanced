import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const makeUserAdmin = async (userId: string) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!, { dbName: 'chatapp' });
    console.log('Connected to MongoDB');

    // Get user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('User not found!');
      process.exit(1);
    }
    
    console.log(`Found user: ${user.email}`);
    console.log(`Current role: ${user.role}`);
    
    // Update user role to Admin
    user.role = 'Admin';
    await user.save();
    
    console.log('User role updated to Admin successfully');
    
    // Alternative update method
    // const result = await User.updateOne(
    //   { _id: userId },
    //   { $set: { role: 'Admin' } }
    // );
    // console.log(`Updated ${result.modifiedCount} user`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('Please provide a user ID as an argument');
  console.log('Usage: npx ts-node src/scripts/makeAdmin.ts <userId>');
  process.exit(1);
}

makeUserAdmin(userId);