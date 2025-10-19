type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;

interface WebSocketMessage {
  type: string;
  channel?: string;
  data?: any;
  timestamp?: string;
  message?: string;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private disconnectionHandlers: Set<ConnectionHandler> = new Set();
  private subscribedChannels: Set<string> = new Set();
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;

          // Resubscribe to channels after reconnect
          this.subscribedChannels.forEach(channel => {
            this.subscribe(channel);
          });

          // Start heartbeat
          this.startHeartbeat();

          // Notify connection handlers
          this.connectionHandlers.forEach(handler => handler());

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          this.isConnecting = false;
          this.stopHeartbeat();

          // Notify disconnection handlers
          this.disconnectionHandlers.forEach(handler => handler());

          // Attempt to reconnect
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    // Handle different message types
    switch (message.type) {
      case 'connected':
        console.log('[WebSocket] Server acknowledged connection');
        break;

      case 'pong':
        // Heartbeat response
        break;

      case 'subscribed':
        console.log('[WebSocket] Subscribed to channel:', message.channel);
        break;

      case 'unsubscribed':
        console.log('[WebSocket] Unsubscribed from channel:', message.channel);
        break;

      case 'error':
        console.error('[WebSocket] Server error:', message.message);
        break;

      default:
        // Broadcast to relevant handlers
        if (message.channel) {
          this.notifyHandlers(message.channel, message);
        }
        this.notifyHandlers(message.type, message);
    }
  }

  private notifyHandlers(event: string, data: any) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('[WebSocket] Handler error:', error);
        }
      });
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[WebSocket] Reconnection failed:', error);
      });
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send message, not connected');
    }
  }

  subscribe(channel: string, handler?: MessageHandler) {
    this.subscribedChannels.add(channel);

    if (handler) {
      this.on(channel, handler);
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'subscribe', channel });
    }
  }

  unsubscribe(channel: string, handler?: MessageHandler) {
    this.subscribedChannels.delete(channel);

    if (handler) {
      this.off(channel, handler);
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'unsubscribe', channel });
    }
  }

  authenticate(walletAddress: string, signature?: string) {
    this.send({
      type: 'auth',
      walletAddress,
      signature,
    });
  }

  on(event: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    this.messageHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: MessageHandler) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(event);
      }
    }
  }

  onConnect(handler: ConnectionHandler) {
    this.connectionHandlers.add(handler);
  }

  onDisconnect(handler: ConnectionHandler) {
    this.disconnectionHandlers.add(handler);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscribedChannels.clear();
    this.messageHandlers.clear();
    this.connectionHandlers.clear();
    this.disconnectionHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';
    wsClient = new WebSocketClient(wsUrl);
  }
  return wsClient;
}

export function disconnectWebSocket() {
  if (wsClient) {
    wsClient.disconnect();
    wsClient = null;
  }
}
