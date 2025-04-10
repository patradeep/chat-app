import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { getMessage, getUsersForChat, sendMessage } from '../controllers/message.controller.js';
const router = express.Router();

router.get('/users',auth,getUsersForChat);

router.get('/:id',auth,getMessage);

router.post('/send/:id',auth,sendMessage);

export default router;