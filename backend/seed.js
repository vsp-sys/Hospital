import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: 'prasad@gmail.com', role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create super admin
    const superAdmin = new User({
      name: 'Prasad Super Admin',
      email: 'prasad@gmail.com',
      password: hashedPassword,
      role: 'super_admin'
    });

    await superAdmin.save();
    console.log('✅ Super admin created: prasad@gmail.com / 123456');

    // Also create the fallback super admin
    const existingFallback = await User.findOne({ email: 'supmin20@gmail.com' });
    if (!existingFallback) {
      const fallbackAdmin = new User({
        name: 'System Super Admin',
        email: 'supmin20@gmail.com',
        password: await bcrypt.hash('supmin@hms20', 10),
        role: 'super_admin'
      });
      await fallbackAdmin.save();
      console.log('✅ Fallback super admin created: supmin20@gmail.com / supmin@hms20');
    }

    // Create sample users for other roles
    const sampleUsers = [
      { name: 'Dr. Smith', email: 'doctor@gmail.com', password: 'doctor123', role: 'doctor' },
      { name: 'Nurse Sarah', email: 'staff@gmail.com', password: 'staff123', role: 'staff' },
      { name: 'John Patient', email: 'patient@gmail.com', password: 'patient123', role: 'patient' },
      { name: 'Branch Admin', email: 'branch@gmail.com', password: 'branch123', role: 'branch_admin' },
      { name: 'Staff Admin', email: 'staffadmin@gmail.com', password: 'staffadmin123', role: 'staff_admin' }
    ];

    for (const userData of sampleUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        const user = new User({
          ...userData,
          password: await bcrypt.hash(userData.password, 10)
        });
        await user.save();
        console.log(`✅ User created: ${userData.email} / ${userData.password}`);
      }
    }

    console.log('\n✨ Database seeding completed!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
