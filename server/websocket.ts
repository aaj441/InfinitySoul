import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';

export interface ScanProgress {
  scanJobId: string;
  progress: number;
  status: string;
  message: string;
  data?: any;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private lastEmitTime: Map<string, number> = new Map();
  private readonly RATE_LIMIT_MS = 500;

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.FRONTEND_URL || 'https://*.railway.app'
          : '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`✅ WebSocket client connected: ${socket.id}`);

      socket.on('subscribe:scan', (scanJobId: string) => {
        socket.join(`scan:${scanJobId}`);
        console.log(`📡 Client ${socket.id} subscribed to scan:${scanJobId}`);
      });

      socket.on('unsubscribe:scan', (scanJobId: string) => {
        socket.leave(`scan:${scanJobId}`);
        console.log(`📴 Client ${socket.id} unsubscribed from scan:${scanJobId}`);
      });

      socket.on('subscribe:cadence', (cadenceId: string) => {
        socket.join(`cadence:${cadenceId}`);
      });

      socket.on('unsubscribe:cadence', (cadenceId: string) => {
        socket.leave(`cadence:${cadenceId}`);
      });

      socket.on('disconnect', () => {
        console.log(`❌ WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  public emitScanProgress(progress: ScanProgress) {
    const now = Date.now();
    const lastEmit = this.lastEmitTime.get(progress.scanJobId) || 0;

    if (now - lastEmit < this.RATE_LIMIT_MS) {
      return;
    }

    this.lastEmitTime.set(progress.scanJobId, now);
    this.io.to(`scan:${progress.scanJobId}`).emit('scan:progress', progress);
    
    if (progress.progress === 100) {
      setTimeout(() => {
        this.lastEmitTime.delete(progress.scanJobId);
      }, 5000);
    }
  }

  public emitCadenceUpdate(cadenceId: string, event: string, data: any) {
    this.io.to(`cadence:${cadenceId}`).emit(`cadence:${event}`, data);
  }

  public getConnectedClients(): number {
    return this.io.engine.clientsCount;
  }

  public getIO() {
    return this.io;
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(httpServer: HttpServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(httpServer);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}
