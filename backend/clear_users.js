require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

async function clearUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await mongoose.connection.collection('users').deleteMany({});
    console.log(`DELETED_COUNT:${result.deletedCount}`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearUsers();
