# WebSocket Real-Time System Implementation

## Overview

This document describes the real-time WebSocket system implemented for the Agent.fun platform. The system enables live updates across the platform for trades, prices, graduations, and other events.

## Architecture

### Backend (WebSocket Server)

#### Location: `backend/src/services/websocketService.ts`

The WebSocket server is built using the `ws` library and provides:

**Features:**
- Room/channel-based subscriptions
- Heartbeat mechanism for connection health
- Authentication support (wallet-based)
- Auto-reconnection handling
- Graceful shutdown

**Supported Channels:**
- `trades` - Global trade events
- `prices` - Price updates across all agents
- `kings` - King of the Hill changes
- `activities` - Platform-wide activities
- `graduations` - Token graduations to Raydium
- `olympics` - Olympics updates
- `staking` - Staking events
- `vaults` - Vault updates
- `agent:{agentId}` - Agent-specific events
- `vault:{vaultId}` - Vault-specific events

**Message Types:**
- `subscribe` - Subscribe to a channel
- `unsubscribe` - Unsubscribe from a channel
- `auth` - Authenticate with wallet address
- `ping` - Client heartbeat

**Server Events:**
- `connected` - Connection established
- `subscribed` - Subscription confirmed
- `unsubscribed` - Unsubscription confirmed
- `error` - Error occurred
- `pong` - Heartbeat response

#### Server Integration

The WebSocket server is initialized in `backend/src/index.ts`:

```typescript
import { websocketService } from './services/websocketService';

const server = http.createServer(app);
websocketService.initialize(server);
```

The service is exported for use in controllers:

```typescript
export { websocketService };
```

#### Event Emitters

The service provides methods to emit events:

```typescript
// Trade executed
websocketService.emitTradeExecuted(agentId, tradeData);

// Price update
websocketService.emitPriceUpdate(agentId, priceData);

// New agent created
websocketService.emitNewAgent(agentData);

// Graduation to Raydium
websocketService.emitGraduation(agentId, graduationData);

// King change
websocketService.emitKingChange(newKingData);

// Staking update
websocketService.emitStakingUpdate(agentId, stakingData);

// Vault update
websocketService.emitVaultUpdate(vaultId, vaultData);

// Generic activity
websocketService.emitActivity(activityData);
```

#### Integration Examples

**In `bondingCurveController.ts`:**

```typescript
import { websocketService } from '../index';

// After recording a trade
websocketService.emitTradeExecuted(agentId, {
  id: trade.id,
  agentId,
  type: 'buy',
  trader: buyerWallet,
  tokenAmount: amount.toString(),
  solAmount: quote.cost.toString(),
  pricePerToken: quote.pricePerToken.toString(),
  createdAt: trade.createdAt,
});

// After price update
websocketService.emitPriceUpdate(agentId, {
  agentId,
  currentPrice: quote.newPrice,
  tokensSold: newTokensSold,
  totalValueLocked: newTVL,
  marketCap: stats.currentPrice * BONDING_CURVE_CONFIG.TOTAL_SUPPLY,
  timestamp: new Date().toISOString(),
});

// After graduation
websocketService.emitGraduation(agentId, {
  agentId,
  poolId: graduationResult.data.poolId,
  timestamp: new Date().toISOString(),
});
```

**In `agentController.ts`:**

```typescript
import { websocketService } from '../index';

// After creating a new agent
websocketService.emitNewAgent({
  id: agent.id,
  name: agent.name,
  symbol: symbol,
  purpose: agent.purpose,
  tokenMint: result.tokenMint,
  creatorWallet: creatorWallet,
  timestamp: new Date().toISOString(),
});
```

### Frontend (WebSocket Client)

#### Location: `frontend/lib/websocket.ts`

The WebSocket client provides:

**Features:**
- Auto-reconnection with exponential backoff
- Event-based message handling
- Channel subscription management
- Connection state tracking
- Heartbeat/ping mechanism

**Client API:**

```typescript
import { getWebSocketClient } from '../lib/websocket';

const client = getWebSocketClient();

// Connect
await client.connect();

// Subscribe to channel
client.subscribe('trades', (message) => {
  console.log('Trade event:', message);
});

// Unsubscribe from channel
client.unsubscribe('trades', handler);

// Listen to specific event types
client.on('trade_executed', (message) => {
  console.log('Trade executed:', message.data);
});

// Authentication
client.authenticate(walletAddress, signature);

// Check connection status
if (client.isConnected()) {
  // ...
}

// Disconnect
client.disconnect();
```

#### React Hooks: `frontend/hooks/useWebSocket.ts`

**Base Hook:**

```typescript
import { useWebSocket } from '../hooks/useWebSocket';

function MyComponent() {
  const { isConnected, subscribe, unsubscribe, on, off } = useWebSocket({
    channels: ['trades', 'prices'],
    autoConnect: true,
    onConnect: () => console.log('Connected!'),
    onDisconnect: () => console.log('Disconnected!'),
  });

  useEffect(() => {
    const handler = (message) => {
      console.log('Received:', message);
    };

    subscribe('trades', handler);

    return () => {
      unsubscribe('trades', handler);
    };
  }, [subscribe, unsubscribe]);

  return <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>;
}
```

**Specialized Hooks:**

```typescript
// Agent-specific events
const { isConnected, priceData, trades, graduation } = useAgentWebSocket(agentId);

// Global prices
const { isConnected, prices } = usePricesWebSocket();

// Global trades
const { isConnected, recentTrades } = useTradesWebSocket();

// Activities feed
const { isConnected, activities } = useActivitiesWebSocket();
```

### Components

#### LiveIndicator Component

Location: `frontend/components/LiveIndicator.tsx`

Shows real-time connection status with a pulsing animation:

```tsx
import LiveIndicator from './LiveIndicator';

<LiveIndicator size="sm" showText={true} />
```

Props:
- `size`: 'sm' | 'md' | 'lg' - Size of the indicator
- `showText`: boolean - Show "LIVE" text
- `className`: string - Additional CSS classes

#### Integration in PriceChart

The PriceChart component now uses WebSocket for real-time price updates:

```tsx
import { useAgentWebSocket } from '../hooks/useWebSocket';

const { isConnected, priceData } = useAgentWebSocket(agentId);

// Update stats from WebSocket
useEffect(() => {
  if (priceData && priceData.currentPrice !== undefined) {
    setStats(prev => prev ? {
      ...prev,
      currentPrice: priceData.currentPrice,
      marketCap: priceData.marketCap || prev.marketCap,
    } : null);
  }
}, [priceData]);
```

#### Integration in BondingCurveTrading

The trading component shows live trades and graduation events:

```tsx
import { useAgentWebSocket } from '../hooks/useWebSocket';

const { isConnected, trades, priceData, graduation } = useAgentWebSocket(agentId);

// Update recent trades
useEffect(() => {
  if (trades.length > 0) {
    setRecentTrades(prev => {
      const newTrades = [...trades, ...prev];
      const uniqueTrades = Array.from(new Map(newTrades.map(t => [t.id, t])).values());
      return uniqueTrades.slice(0, 10);
    });
  }
}, [trades]);

// Handle graduation
useEffect(() => {
  if (graduation) {
    alert(`🎉 GRADUATION! Pool Created: ${graduation.poolId}`);
    fetchBondingCurve();
  }
}, [graduation]);
```

## Connection Flow

1. **Client connects** to `ws://localhost:3001/ws`
2. **Server sends** `connected` message
3. **Client subscribes** to channels (e.g., `agent:123`)
4. **Server confirms** with `subscribed` message
5. **Server broadcasts** events to subscribed clients
6. **Client receives** events and updates UI
7. **Heartbeat** every 30 seconds to keep connection alive
8. **Auto-reconnect** on connection loss with exponential backoff

## Message Format

### Client → Server

```json
{
  "type": "subscribe",
  "channel": "agent:123"
}
```

```json
{
  "type": "auth",
  "walletAddress": "...",
  "signature": "..."
}
```

### Server → Client

```json
{
  "type": "trade_executed",
  "channel": "agent:123",
  "data": {
    "id": "trade-id",
    "agentId": "123",
    "type": "buy",
    "trader": "wallet-address",
    "tokenAmount": "1000000",
    "solAmount": "0.5",
    "pricePerToken": "0.0000005",
    "createdAt": "2025-01-20T10:00:00Z"
  },
  "timestamp": "2025-01-20T10:00:00Z"
}
```

## Environment Variables

### Backend

```env
PORT=3001
```

### Frontend

```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

For production:
```env
NEXT_PUBLIC_WS_URL=wss://api.agent.fun/ws
```

## Security Considerations

1. **Authentication**: Wallet signature verification (currently simplified)
2. **Rate Limiting**: Implemented in heartbeat and connection management
3. **Channel Validation**: Only allowed channels can be subscribed to
4. **CORS**: Handled by the main Express server
5. **WSS**: Use secure WebSocket (wss://) in production

## Performance

- **Heartbeat Interval**: 30 seconds
- **Reconnection Attempts**: 5 maximum
- **Reconnection Delay**: Exponential backoff (1s, 2s, 4s, 8s, 16s)
- **Max Clients**: Unlimited (adjust based on server capacity)
- **Message Queue**: In-memory (consider Redis for scaling)

## Monitoring

Get WebSocket statistics:

```typescript
const stats = websocketService.getStats();
console.log(stats);
// {
//   totalClients: 42,
//   totalChannels: 8,
//   channels: [
//     { name: 'trades', subscribers: 15 },
//     { name: 'agent:123', subscribers: 5 },
//     ...
//   ]
// }
```

## Future Enhancements

1. **Redis Pub/Sub**: For horizontal scaling across multiple servers
2. **Message Persistence**: Store messages for clients that reconnect
3. **Binary Protocol**: Use MessagePack for smaller message sizes
4. **Compression**: Enable WebSocket compression
5. **Advanced Authentication**: JWT tokens with expiration
6. **Rate Limiting**: Per-client message rate limits
7. **Analytics**: Track message delivery and latency
8. **Admin Dashboard**: Real-time monitoring of WebSocket connections

## Troubleshooting

### Client Not Connecting

1. Check WebSocket URL is correct
2. Verify backend server is running
3. Check CORS settings
4. Look for firewall issues

### Events Not Received

1. Verify client is subscribed to correct channel
2. Check server is emitting events
3. Inspect browser console for errors
4. Verify message handler is registered

### Connection Drops

1. Check network stability
2. Verify heartbeat mechanism is working
3. Look for server resource issues
4. Check for proxy/load balancer timeouts

## Testing

### Manual Testing

1. Open browser console
2. Connect to WebSocket:
```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
ws.send(JSON.stringify({ type: 'subscribe', channel: 'trades' }));
```

3. Trigger events (create trades, agents, etc.)
4. Verify messages are received

### Component Testing

Use the LiveIndicator component to verify connection status throughout the app.

## Summary

The WebSocket system provides a robust, real-time communication layer for the Agent.fun platform. It enables instant updates for trades, prices, graduations, and other events, creating a dynamic and engaging user experience.

All integration points are complete and ready for use. The system handles reconnection, heartbeat, and error scenarios gracefully.
