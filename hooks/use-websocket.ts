import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/notifications';
import {
  WebSocketMessage,
  WebSocketMessageSchema,
  NotificationEventSchema,
  ConnectionEventSchema,
  ErrorEventSchema,
} from '@/types/notification';

const RECONNECT_INTERVAL = 2000; // 2 seconds
const MAX_RECONNECT_ATTEMPTS = 5;
const BACKOFF_MULTIPLIER = 1.5;

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current) return;

    try {
      const WS_URL = String(process.env.NEXT_PUBLIC_SERVER_URL) || location.origin;
      const socket = io(WS_URL, {
        transports: ['websocket'],
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: RECONNECT_INTERVAL,
        reconnectionDelayMax: RECONNECT_INTERVAL * BACKOFF_MULTIPLIER ** MAX_RECONNECT_ATTEMPTS,
        path: '/socket-city',
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket.IO connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        setIsConnected(false);
        handleReconnect(reason);
      });

      socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
        toast({
          title: 'Connection Error',
          description: 'WebSocket encountered an error.',
          variant: 'destructive',
        });
      });

      socket.on('message', (data) => {
        try {
          const message = WebSocketMessageSchema.parse(data);

          switch (message.type) {
            case 'notification': {
              const notificationEvent = NotificationEventSchema.parse(data);
              dispatch(addNotification(notificationEvent.payload as any));
              break;
            }
            case 'connection': {
              const connectionEvent = ConnectionEventSchema.parse(data);
              if (connectionEvent.payload.status === 'disconnected') {
                handleReconnect('Server initiated disconnect');
              }
              break;
            }
            case 'error': {
              const errorEvent = ErrorEventSchema.parse(data);
              toast({
                title: 'Server Error',
                description: errorEvent.payload.message,
                variant: 'destructive',
              });
              break;
            }
          }
        } catch (error) {
          console.error('Failed to process message:', error);
        }
      });
    } catch (error) {
      console.error('Failed to initialize Socket.IO:', error);
    }
  }, [dispatch, toast]);

  const handleReconnect = useCallback((reason: string) => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      toast({
        title: 'Connection Failed',
        description: 'Max reconnection attempts reached. Please refresh.',
        variant: 'destructive',
      });
      return;
    }

    reconnectAttemptsRef.current++;
    const backoffTime = RECONNECT_INTERVAL * BACKOFF_MULTIPLIER ** reconnectAttemptsRef.current;
    console.info(`Attempting reconnect in ${backoffTime}ms (Attempt ${reconnectAttemptsRef.current})`);

    setTimeout(() => {
      connect();
    }, backoffTime);
  }, [connect, toast]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', message);
    } else {
      console.error('Socket.IO is not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sendMessage,
    disconnect,
    reconnect: connect,
    isConnected,
  };
}