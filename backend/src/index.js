import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
dotenv.config();
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import {connectDB} from './lib/db.js';
import { initSocketIo } from './controllers/socket.js';
const app = express();
const port = process.env.PORT || 5001;
const allowedOrigins = [
  'http://localhost:5173',
  'https://chat-1u7aq1ylt-patradeeps-projects.vercel.app',
  'https://chat-app-two-jade-56.vercel.app',
  'https://chat-app-frontent.onrender.com',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowedOrigin =
      allowedOrigins.includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin) ||
      /^http:\/\/localhost:\d+$/i.test(origin);

    if (isAllowedOrigin) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/auth', authRoutes);
app.use('/message', messageRoutes);
const server = createServer(app);
initSocketIo(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
  },
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  connectDB()
})