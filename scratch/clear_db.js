require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

async function clearUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const User = mongoose.model('User', new mongoose.Schema({}));
    
    console.log('Deleting all users...');
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users.`);

    await mongoose.connection.close();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing users:', err);
    process.exit(1);
  }
}

clearUsers();

