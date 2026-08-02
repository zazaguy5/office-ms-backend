require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');

const domain = process.env.DOMAIN && process.env.PORT? `http://${process.env.DOMAIN}:${process.env.PORT}` : null;
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

if (domain) {
  allowedOrigins.push(domain);
}

const app = express();
app.use(express.json());

// Middleware to enable CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // จำเป็น เพื่อให้ browser ส่ง/รับ cookie ข้าม origin ได้
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// user routes
app.use('/users', userRoutes);

app.use('/auth', authRoutes);

// Error handling middleware
// This should be placed after all other routes
app.use(errorHandler);

app.listen(process.env.PORT, () => console.log(`Server is running on ${domain}`));
