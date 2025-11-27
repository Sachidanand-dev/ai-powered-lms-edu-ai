// index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Basic health route
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// API Routes (keep these BEFORE the static/catch-all)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from client/dist
  const staticPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(staticPath));

  // Any route that is not an API route should serve the React app
  // Use '/*' or a RegExp instead of '*' to avoid path-to-regexp error
  app.get('/*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Fallback root (non-production)
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV})`));














// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');

// dotenv.config();

// connectDB();

// const app = express();

// app.use(express.json());
// app.use(cors());

// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

// // Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/dashboard', require('./routes/dashboardRoutes'));
// app.use('/api/ai', require('./routes/aiRoutes'));
// app.use('/api/quiz', require('./routes/quizRoutes'));

// // Serve static assets in production
// const path = require('path');
// if (process.env.NODE_ENV === 'production') {
//     // Set static folder
//     app.use(express.static(path.join(__dirname, '../client/dist')));

//     // Any route that is not an API route will be handled by the React app
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
//     });
// } else {
//     app.get('/', (req, res) => {
//         res.send('API is running...');
//     });
// }

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
