import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const userSockets = new Map();
let ioInstance = null;

function getTokenFromHandshake(socket) {
	if (socket.handshake?.auth?.token) {
		return socket.handshake.auth.token;
	}

	const cookieHeader = socket.handshake?.headers?.cookie;
	if (!cookieHeader) {
		return null;
	}

	const cookies = cookieHeader.split(';').reduce((accumulator, cookie) => {
		const [rawKey, ...rawValue] = cookie.trim().split('=');
		if (!rawKey) {
			return accumulator;
		}

		accumulator[rawKey] = decodeURIComponent(rawValue.join('='));
		return accumulator;
	}, {});

	return cookies.token || null;
}

async function authenticateSocket(socket, next) {
	try {
		const token = getTokenFromHandshake(socket);

		if (!token) {
			return next(new Error('Unauthorized'));
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select('-password');

		if (!user) {
			return next(new Error('Unauthorized'));
		}

		socket.user = user;
		next();
	} catch (error) {
		next(new Error('Unauthorized'));
	}
}

function getRoomName(userId) {
	return `user:${userId}`;
}

function getOnlineUserIds() {
	return [...userSockets.keys()];
}

function broadcastOnlineUsers() {
	if (!ioInstance) {
		return;
	}

	ioInstance.emit('online-users', getOnlineUserIds());
}

function trackSocketJoin(socket) {
	const userId = socket.user._id.toString();
	const roomName = getRoomName(userId);

	socket.join(roomName);

	if (!userSockets.has(userId)) {
		userSockets.set(userId, new Set());
	}

	userSockets.get(userId).add(socket.id);
	broadcastOnlineUsers();
}

function trackSocketLeave(socket) {
	const userId = socket.user?._id?.toString();
	if (!userId) {
		return;
	}

	const socketIds = userSockets.get(userId);
	if (socketIds) {
		socketIds.delete(socket.id);
		if (socketIds.size === 0) {
			userSockets.delete(userId);
		}
	}

	broadcastOnlineUsers();
}

export function emitToUser(userId, eventName, payload) {
	if (!ioInstance || !userId) {
		return;
	}

	ioInstance.to(getRoomName(userId)).emit(eventName, payload);
}

function relaySignal(socket, eventName, payload) {
	const targetUserId = payload?.targetUserId || payload?.receiverId || payload?.to;

	if (!targetUserId) {
		return;
	}

	emitToUser(targetUserId, eventName, {
		...payload,
		fromUserId: socket.user._id.toString(),
		fromUser: {
			_id: socket.user._id,
			fullname: socket.user.fullname,
			avatar: socket.user.avatar,
		},
	});
}

export function initSocketIo(server, options = {}) {
	ioInstance = new Server(server, options);

	ioInstance.use(authenticateSocket);

	ioInstance.on('connection', (socket) => {
		trackSocketJoin(socket);

		socket.on('typing', (payload = {}) => {
			relaySignal(socket, 'typing', payload);
		});

		socket.on('stopTyping', (payload = {}) => {
			relaySignal(socket, 'stopTyping', payload);
		});

		socket.on('call:offer', (payload = {}) => {
			relaySignal(socket, 'call:offer', payload);
		});

		socket.on('call:answer', (payload = {}) => {
			relaySignal(socket, 'call:answer', payload);
		});

		socket.on('call:iceCandidate', (payload = {}) => {
			relaySignal(socket, 'call:iceCandidate', payload);
		});

		socket.on('call:reject', (payload = {}) => {
			relaySignal(socket, 'call:reject', payload);
		});

		socket.on('call:end', (payload = {}) => {
			relaySignal(socket, 'call:end', payload);
		});

		socket.on('disconnect', () => {
			trackSocketLeave(socket);
		});
	});

	return ioInstance;
}
