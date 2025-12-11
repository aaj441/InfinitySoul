import { useEffect, useState, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

export interface ScanProgress {
  scanJobId: string;
  progress: number;
  status: string;
  message: string;
  data?: any;
}

export interface UseWebSocketReturn {
  progress: number;
  status: string;
  message: string;
  data: any;
  isConnected: boolean;
  error: string | null;
}

export function useWebSocket(scanJobId: string | null): UseWebSocketReturn {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!scanJobId) return;

    const socketUrl = import.meta.env.VITE_WS_URL || window.location.origin;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setError(null);
      socket.emit('subscribe:scan', scanJobId);
    });

    socket.on('scan:progress', (progressData: ScanProgress) => {
      console.log('📊 Progress update:', progressData);
      setProgress(progressData.progress);
      setStatus(progressData.status);
      setMessage(progressData.message);
      if (progressData.data) {
        setData(progressData.data);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError('Connection failed. Retrying...');
    });

    return () => {
      if (socket.connected) {
        socket.emit('unsubscribe:scan', scanJobId);
      }
      socket.close();
    };
  }, [scanJobId]);

  return {
    progress,
    status,
    message,
    data,
    isConnected,
    error
  };
}
