require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. GLOBAL SECURITY & OPTIMIZATION MIDDLEWARE
app.use(compression()); // Compress all responses
app.use(helmet({
  contentSecurityPolicy: false, // Allow external assets like fonts/images
}));
app.use(cors());
app.use(express.json());

// 1.1 RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased for production stability
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// 2. LOGGING (Find the error)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST') console.log('Payload:', JSON.stringify(req.body));
  next();
});

// 3. STATIC FILES (THE UI)
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Specifically serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 4. API ROUTES
const authRoutes = require('./routes/authRoutes');
const engineRoutes = require('./routes/engineRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/engine', engineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/clients', require('./routes/clientRoutes'));

// Root API Welcome
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to HeroAi Master Brain API',
    status: 'online',
    version: 'V3.0.0-PRO',
    costShield: 'Active (₹0 Liability)'
  });
});

// 5. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', database: mongoose.connection.readyState === 1 ? 'connected' : 'offline' });
});

// 6. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 6. CATCH-ALL FOR SPA
app.use((req, res) => {
  const frontendPath = path.join(__dirname, '../frontend');
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});

// 7. DATABASE & START
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/HeroAi';
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log('✅ Master Database Connected');

    // AUTO-INIT LOGIC (Wipe & Seed)
    if (process.env.INIT_DB === 'true') {
      console.log('🧹 [INIT] Wiping old data and seeding current plans...');
      const collections = await mongoose.connection.db.collections();
      for (let collection of collections) {
        await collection.deleteMany({});
        console.log(`[INIT] Cleared: ${collection.collectionName}`);
      }

      const SystemSettings = require('./models/SystemSettings');
      const defaultSettings = new SystemSettings({
        configType: 'GLOBAL',
        niches: ['Technology', 'Finance', 'Lifestyle', 'Gaming', 'Education', 'Business', 'Health & Fitness', 'Travel', 'Food & Cooking', 'Fashion & Beauty', 'Motivation', 'AI News']
      });
      await defaultSettings.save();
      console.log('🌱 [INIT] Default plans seeded successfully.');
    } else {
      // Ensure settings exist even if not initializing
      const SystemSettings = require('./models/SystemSettings');
      const settings = await SystemSettings.findOne({ configType: 'GLOBAL' });
      if (!settings) {
        const defaultSettings = new SystemSettings({
          configType: 'GLOBAL',
          niches: ['Technology', 'Finance', 'Lifestyle', 'Gaming', 'Education', 'Business', 'Health & Fitness', 'Travel', 'Food & Cooking', 'Fashion & Beauty', 'Motivation', 'AI News']
        });
        await defaultSettings.save();
        console.log('🌱 [BOOT] Created default system settings.');
      }
    }

    startServer();
  })
  .catch(err => {
    console.error('❌ Database connection failed. HeroAi requires MongoDB to operate.');
    console.error(err);
    process.exit(1);
  });

function startServer() {
  const nets = require('os').networkInterfaces();
  let ip = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ip = net.address;
        break;
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HeroAi Enterprise Live at: http://${ip}:${PORT}`);
  });
}
