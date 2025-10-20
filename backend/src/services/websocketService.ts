import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from '../utils/logger';

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  walletAddress?: string;
  subscribedChannels: Set<string>;
}

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'auth' | 'ping';
  channel?: string;
  channels?: string[];
  walletAddress?: string;
  signature?: string;
}

interface BroadcastMessage {
  type: string;
  channel: string;
  data: any;
  timestamp: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, WebSocketClient> = new Map();
  private channels: Map<string, Set<WebSocketClient>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat();

    logger.info('WEBSOCKET', '🔌 WebSocket server initialized');
  }

  private handleConnection(ws: WebSocket) {
    const client = ws as WebSocketClient;
    client.isAlive = true;
    client.subscribedChannels = new Set();

    this.clients.set(ws, client);

    logger.info('WEBSOCKET', '👤 Client connected', { totalClients: this.clients.size });

    // Send welcome message
    this.sendToClient(client, {
      type: 'connected',
      message: 'Connected to AGENT.FUN WebSocket server',
      timestamp: new Date().toISOString(),
    });

    // Handle pong responses for heartbeat
    client.on('pong', () => {
      client.isAlive = true;
    });

    // Handle incoming messages
    client.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(client, message);
      } catch (error) {
        logger.error('WEBSOCKET', 'Failed to parse message', { error });
        this.sendError(client, 'Invalid message format');
      }
    });

    // Handle client disconnect
    client.on('close', () => {
      this.handleDisconnect(client);
    });

    // Handle errors
    client.on('error', (error) => {
      logger.error('WEBSOCKET', 'Client error', { error: error.message });
    });
  }

  private handleMessage(client: WebSocketClient, message: WebSocketMessage) {
    switch (message.type) {
      case 'auth':
        this.handleAuth(client, message);
        break;

      case 'subscribe':
        if (message.channel) {
          this.subscribe(client, message.channel);
        } else if (message.channels) {
          message.channels.forEach(channel => this.subscribe(client, channel));
        }
        break;

      case 'unsubscribe':
        if (message.channel) {
          this.unsubscribe(client, message.channel);
        } else if (message.channels) {
          message.channels.forEach(channel => this.unsubscribe(client, channel));
        }
        break;

      case 'ping':
        this.sendToClient(client, { type: 'pong', timestamp: new Date().toISOString() });
        break;

      default:
        this.sendError(client, 'Unknown message type');
    }
  }

  private handleAuth(client: WebSocketClient, message: WebSocketMessage) {
    // Simple authentication - in production, verify signature
    if (message.walletAddress) {
      client.walletAddress = message.walletAddress;
      this.sendToClient(client, {
        type: 'auth_success',
        walletAddress: message.walletAddress,
        timestamp: new Date().toISOString(),
      });
      logger.info('WEBSOCKET', '🔐 Client authenticated', { wallet: message.walletAddress });
    } else {
      this.sendError(client, 'Authentication failed');
    }
  }

  private subscribe(client: WebSocketClient, channel: string) {
    // Validate channel name
    const validChannels = [
      'trades',
      'prices',
      'kings',
      'activities',
      'graduations',
      'olympics',
      'staking',
      'vaults',
    ];

    // Also allow agent-specific channels
    const isValidChannel = validChannels.includes(channel) ||
                          channel.startsWith('agent:') ||
                          channel.startsWith('vault:');

    if (!isValidChannel) {
      this.sendError(client, `Invalid channel: ${channel}`);
      return;
    }

    // Add client to channel
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }

    this.channels.get(channel)!.add(client);
    client.subscribedChannels.add(channel);

    this.sendToClient(client, {
      type: 'subscribed',
      channel,
      timestamp: new Date().toISOString(),
    });

    logger.info('WEBSOCKET', '📡 Client subscribed to channel', { channel, totalSubscribers: this.channels.get(channel)!.size });
  }

  private unsubscribe(client: WebSocketClient, channel: string) {
    if (this.channels.has(channel)) {
      this.channels.get(channel)!.delete(client);
      client.subscribedChannels.delete(channel);

      this.sendToClient(client, {
        type: 'unsubscribed',
        channel,
        timestamp: new Date().toISOString(),
      });

      logger.info('WEBSOCKET', '📡 Client unsubscribed from channel', { channel });

      // Clean up empty channels
      if (this.channels.get(channel)!.size === 0) {
        this.channels.delete(channel);
      }
    }
  }

  private handleDisconnect(client: WebSocketClient) {
    // Remove from all channels
    client.subscribedChannels.forEach(channel => {
      if (this.channels.has(channel)) {
        this.channels.get(channel)!.delete(client);
        if (this.channels.get(channel)!.size === 0) {
          this.channels.delete(channel);
        }
      }
    });

    this.clients.delete(client);

    logger.info('WEBSOCKET', '👋 Client disconnected', {
      totalClients: this.clients.size,
      wallet: client.walletAddress
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, ws) => {
        if (client.isAlive === false) {
          logger.warn('WEBSOCKET', '💀 Terminating inactive client');
          client.terminate();
          return;
        }

        client.isAlive = false;
        client.ping();
      });
    }, 30000); // Check every 30 seconds
  }

  private sendToClient(client: WebSocketClient, data: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  private sendError(client: WebSocketClient, message: string) {
    this.sendToClient(client, {
      type: 'error',
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Public methods for broadcasting events

  broadcast(channel: string, type: string, data: any) {
    if (!this.channels.has(channel)) {
      return; // No subscribers
    }

    const message: BroadcastMessage = {
      type,
      channel,
      data,
      timestamp: new Date().toISOString(),
    };

    const subscribers = this.channels.get(channel)!;
    let successCount = 0;

    subscribers.forEach(client => {
      try {
        this.sendToClient(client, message);
        successCount++;
      } catch (error) {
        logger.error('WEBSOCKET', 'Failed to send to client', { error });
      }
    });

    logger.info('WEBSOCKET', '📤 Broadcasted message', {
      channel,
      type,
      subscribers: successCount
    });
  }

  // Specific event emitters

  emitTradeExecuted(agentId: string, trade: any) {
    this.broadcast('trades', 'trade_executed', trade);
    this.broadcast(`agent:${agentId}`, 'trade_executed', trade);
  }

  emitPriceUpdate(agentId: string, priceData: any) {
    this.broadcast('prices', 'price_update', priceData);
    this.broadcast(`agent:${agentId}`, 'price_update', priceData);
  }

  emitNewAgent(agent: any) {
    this.broadcast('activities', 'new_agent', agent);
  }

  emitGraduation(agentId: string, graduationData: any) {
    this.broadcast('graduations', 'graduation', graduationData);
    this.broadcast('activities', 'graduation', graduationData);
    this.broadcast(`agent:${agentId}`, 'graduation', graduationData);
  }

  emitKingChange(newKing: any) {
    this.broadcast('kings', 'king_change', newKing);
    this.broadcast('activities', 'king_change', newKing);
  }

  emitSubagentActivity(activity: any) {
    this.broadcast('subagents', 'subagent_activity', activity);
    if (activity.agentId) {
      this.broadcast(`agent:${activity.agentId}`, 'subagent_activity', activity);
    }
  }

  emitOlympicsUpdate(data: any) {
    this.broadcast('olympics', 'olympics_update', data);
  }

  emitStakingUpdate(agentId: string, data: any) {
    this.broadcast('staking', 'staking_update', data);
    this.broadcast(`agent:${agentId}`, 'staking_update', data);
  }

  emitVaultUpdate(vaultId: string, data: any) {
    this.broadcast('vaults', 'vault_update', data);
    this.broadcast(`vault:${vaultId}`, 'vault_update', data);
  }

  emitActivity(activity: any) {
    this.broadcast('activities', 'new_activity', activity);
  }

  // Get statistics
  getStats() {
    return {
      totalClients: this.clients.size,
      totalChannels: this.channels.size,
      channels: Array.from(this.channels.entries()).map(([name, clients]) => ({
        name,
        subscribers: clients.size,
      })),
    };
  }

  // Shutdown
  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach((client) => {
      client.close(1000, 'Server shutting down');
    });

    if (this.wss) {
      this.wss.close(() => {
        logger.info('WEBSOCKET', '🔌 WebSocket server closed');
      });
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
