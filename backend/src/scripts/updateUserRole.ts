import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const updateUserRole = async (email: string, newRole: 'Admin' | 'User' | 'Moderator') => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!, { dbName: 'chatapp' });
    console.log('Connected to MongoDB');

    // Get user by email (easier to identify than ID)
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found!`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.email} (ID: ${user._id})`);
    console.log(`Current role: ${user.role}`);
    
    // Update user role
    if (user.role === newRole) {
      console.log(`User already has role: ${newRole}`);
      process.exit(0);
    }
    
    user.role = newRole;
    await user.save();
    
    console.log(`User role updated to ${newRole} successfully`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Get email and role from command line arguments
const email = process.argv[2];
const role = process.argv[3] as 'Admin' | 'User' | 'Moderator';

if (!email || !role) {
  console.error('Please provide both email and role as arguments');
  console.log('Usage: npx ts-node src/scripts/updateUserRole.ts <email> <role>');
  console.log('Allowed roles: Admin, User, Moderator');
  process.exit(1);
}

if (!['Admin', 'User', 'Moderator'].includes(role)) {
  console.error('Invalid role. Allowed roles: Admin, User, Moderator');
  process.exit(1);
}

updateUserRole(email, role);