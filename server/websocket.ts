import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { z } from 'zod';
import { parse } from 'cookie'
import {
  WebSocketMessage,
  WebSocketMessageSchema,
} from '../types/notification';
import { verifyToken } from '../lib/auth/jwt-utils';

const globalSock = global as unknown as { IO: SocketIOServer | null, Clients: Map<string, string> };

export default function initializeWebSocketServer(server: HttpServer) {
  const io = new SocketIOServer(server, {
    path: '/socket-city',
    cors: {
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket: Socket, next: (err?: any) => void) => {
    try {
      const cookies = parse(socket.handshake.headers.cookie || ""); // Extract cookies from handshake
      const token = cookies['token']; // Extract token from cookies
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = await verifyToken(token);
      if (!decoded) {
        return next(new Error("Invalid or expired token"));
      }

      socket.data.user = decoded; // Attach user info to socket instance
      next();
    } catch (error) {
      console.error("Socket Auth Error:", error);
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user

    if (user && user.userId) {
      globalSock.Clients.set(user.userId, socket.id)
    }

    console.info(`User ${user?.userId} connected with socket ID: ${socket.id}`)

    // Send connection confirmation
    socket.emit('connection', {
      type: 'connection',
      payload: {
        status: 'connected',
        message: 'Successfully connected to WebSocket server',
      },
    });

    socket.on('ping', (timestamp: number) => {
      socket.emit('pong', timestamp);
    });

    socket.on('message', (data: any) => {
      try {
        const message = WebSocketMessageSchema.parse(data);
        broadcastMessage(message);
      } catch (error) {
        console.error('Failed to process message:', error);

        if (error instanceof z.ZodError) {
          socket.emit('error', {
            type: 'error',
            payload: {
              code: 'INVALID_MESSAGE',
              message: 'Invalid message format',
            },
          });
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.info(`Client disconnected: ${user.userId} (Socket Id: ${socket.id}), Reason: ${reason}`);
      globalSock.Clients.delete(user.userId);
    });
  });

  // Handle server shutdown
  process.on('SIGTERM', () => {
    console.warn('SIGTERM received, closing WebSocket server');
    io.close(() => {
      console.log('WebSocket server closed');
      process.exit(0);
    });
  });

  globalSock.IO = io
  globalSock.Clients = new Map<string, string>()
}

export function broadcastMessage(message: WebSocketMessage) {
  if (!globalSock.IO) return;

  globalSock.IO.emit('message', message);
}

export function sendMessageToUser(userId: string, event: string, payload: any) {
  if (!globalSock.IO) return;

  const socketId = String(globalSock.Clients.get(userId))

  globalSock.IO.to(socketId).emit(event, {
    type: event,
    payload: payload,
  });
}