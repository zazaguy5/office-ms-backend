require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');

const domain = `http://${process.env.DOMAIN}:${process.env.PORT}`;

const app = express();
app.use(express.json());

// Middleware to enable CORS
app.use(cors({
  origin: domain || 'http://localhost:5173',
  credentials: true, // จำเป็น เพื่อให้ browser ส่ง/รับ cookie ข้าม origin ได้
}));

// user routes
app.use('/users', userRoutes);

app.use('/auth', authRoutes);

// Error handling middleware
// This should be placed after all other routes
app.use(errorHandler);

app.listen(process.env.PORT, () => console.log(`Server is running on ${domain}`));
