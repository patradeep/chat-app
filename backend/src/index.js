import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import {connectDB} from './lib/db.js';
const app = express();
const port = process.env.PORT || 5001;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://chat-b39egq4i5-patradeeps-projects.vercel.app' 
    : 'http://localhost:5173',
  credentials: true,
}))

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/auth', authRoutes);
app.use('/message', messageRoutes);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  connectDB()
})