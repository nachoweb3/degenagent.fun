# WebSocket Usage Examples

## Backend Examples

### Example 1: Emit Trade Event

```typescript
// In any controller after recording a trade
import { websocketService } from '../index';

const trade = await BondingCurveTrade.create({
  bondingCurveId: bondingCurve.id,
  agentId,
  trader: buyerWallet,
  type: 'buy',
  tokenAmount: amount.toString(),
  solAmount: cost.toString(),
  pricePerToken: price.toString(),
});

// Broadcast to all subscribers
websocketService.emitTradeExecuted(agentId, {
  id: trade.id,
  agentId,
  type: 'buy',
  trader: buyerWallet,
  tokenAmount: amount.toString(),
  solAmount: cost.toString(),
  pricePerToken: price.toString(),
  createdAt: trade.createdAt,
});
```

### Example 2: Emit Price Update

```typescript
// After price changes
websocketService.emitPriceUpdate(agentId, {
  agentId,
  currentPrice: newPrice,
  priceChange24h: priceChange,
  priceChangePercent24h: percentChange,
  marketCap: marketCap,
  volume24h: volume,
  timestamp: new Date().toISOString(),
});
```

### Example 3: Emit King Change

```typescript
// When a new King of the Hill is crowned
import { websocketService } from '../index';

const newKing = await Agent.findByPk(kingId);

websocketService.emitKingChange({
  agentId: newKing.id,
  name: newKing.name,
  marketCap: newKing.marketCap,
  previousKingId: previousKing?.id,
  timestamp: new Date().toISOString(),
});
```

### Example 4: Emit Vault Update

```typescript
// When vault metrics change
websocketService.emitVaultUpdate(vaultId, {
  vaultId,
  totalValueLocked: newTVL,
  currentAPY: newAPY,
  totalDepositors: depositorCount,
  timestamp: new Date().toISOString(),
});
```

## Frontend Examples

### Example 1: Basic Component with WebSocket

```tsx
'use client';

import { useWebSocket } from '../hooks/useWebSocket';
import LiveIndicator from '../components/LiveIndicator';

export default function TradeFeed() {
  const [trades, setTrades] = useState([]);

  const { isConnected, subscribe } = useWebSocket({
    channels: ['trades'],
    autoConnect: true,
  });

  useEffect(() => {
    const handleTrade = (message) => {
      if (message.type === 'trade_executed') {
        setTrades(prev => [message.data, ...prev].slice(0, 20));
      }
    };

    subscribe('trades', handleTrade);
  }, [subscribe]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Live Trades</h2>
        <LiveIndicator size="sm" />
      </div>

      {trades.map(trade => (
        <div key={trade.id} className="trade-item">
          {trade.type === 'buy' ? '🟢' : '🔴'} {trade.tokenAmount} tokens
          for {trade.solAmount} SOL
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Agent Dashboard with Live Updates

```tsx
'use client';

import { useAgentWebSocket } from '../hooks/useWebSocket';
import LiveIndicator from '../components/LiveIndicator';

export default function AgentDashboard({ agentId }: { agentId: string }) {
  const [agent, setAgent] = useState(null);

  const { isConnected, priceData, trades, graduation } = useAgentWebSocket(agentId);

  // Load initial data
  useEffect(() => {
    fetchAgentData();
  }, [agentId]);

  // Update from WebSocket
  useEffect(() => {
    if (priceData) {
      setAgent(prev => ({
        ...prev,
        currentPrice: priceData.currentPrice,
        marketCap: priceData.marketCap,
      }));
    }
  }, [priceData]);

  // Handle graduation
  useEffect(() => {
    if (graduation) {
      toast.success('🎓 Agent graduated to Raydium!');
      setAgent(prev => ({
        ...prev,
        graduated: true,
        poolId: graduation.poolId,
      }));
    }
  }, [graduation]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>{agent?.name}</h1>
        <LiveIndicator />
      </div>

      <div className="stats">
        <div>Price: {agent?.currentPrice} SOL</div>
        <div>Market Cap: ${agent?.marketCap}</div>
      </div>

      <div className="recent-trades">
        <h3>Recent Trades</h3>
        {trades.slice(0, 5).map(trade => (
          <TradeItem key={trade.id} trade={trade} />
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Global Price Ticker

```tsx
'use client';

import { usePricesWebSocket } from '../hooks/useWebSocket';

export default function PriceTicker() {
  const { isConnected, prices } = usePricesWebSocket();

  return (
    <div className="ticker">
      {Array.from(prices.entries()).map(([agentId, priceData]) => (
        <div key={agentId} className="ticker-item">
          {priceData.symbol}: {priceData.currentPrice} SOL
          <span className={priceData.priceChangePercent24h >= 0 ? 'green' : 'red'}>
            {priceData.priceChangePercent24h >= 0 ? '▲' : '▼'}
            {Math.abs(priceData.priceChangePercent24h).toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Live Activity Feed

```tsx
'use client';

import { useActivitiesWebSocket } from '../hooks/useWebSocket';
import LiveIndicator from '../components/LiveIndicator';

export default function ActivityFeed() {
  const { isConnected, activities } = useActivitiesWebSocket();

  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'new_agent': return '🤖';
      case 'trade_executed': return activity.data.type === 'buy' ? '🟢' : '🔴';
      case 'graduation': return '🎓';
      case 'king_change': return '👑';
      default: return '📢';
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'new_agent':
        return `New agent "${activity.data.name}" created!`;
      case 'trade_executed':
        return `${activity.data.trader.slice(0, 6)}... ${activity.data.type} ${activity.data.tokenAmount} tokens`;
      case 'graduation':
        return `Agent graduated to Raydium!`;
      case 'king_change':
        return `New King: ${activity.data.name}`;
      default:
        return 'Activity occurred';
    }
  };

  return (
    <div className="activity-feed">
      <div className="feed-header">
        <h3>Live Activity</h3>
        <LiveIndicator size="sm" />
      </div>

      <div className="activities">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <span className="icon">{getActivityIcon(activity)}</span>
            <div className="content">
              <p>{getActivityMessage(activity)}</p>
              <span className="time">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 5: Manual WebSocket Control

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getWebSocketClient } from '../lib/websocket';

export default function ManualWebSocket() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const client = getWebSocketClient();

  useEffect(() => {
    // Connect
    client.connect().then(() => {
      console.log('Connected to WebSocket');
    });

    // Setup handlers
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    client.onConnect(handleConnect);
    client.onDisconnect(handleDisconnect);

    // Subscribe to multiple channels
    const channels = ['trades', 'prices', 'activities'];
    channels.forEach(channel => {
      client.subscribe(channel);
    });

    // Listen to all messages
    const handleMessage = (message) => {
      setMessages(prev => [message, ...prev].slice(0, 50));
    };

    client.on('trade_executed', handleMessage);
    client.on('price_update', handleMessage);
    client.on('new_activity', handleMessage);

    // Cleanup
    return () => {
      channels.forEach(channel => {
        client.unsubscribe(channel);
      });
      client.off('trade_executed', handleMessage);
      client.off('price_update', handleMessage);
      client.off('new_activity', handleMessage);
    };
  }, []);

  const authenticate = () => {
    // Assuming you have wallet context
    const walletAddress = '...';
    const signature = '...';
    client.authenticate(walletAddress, signature);
  };

  return (
    <div>
      <button onClick={authenticate}>
        Authenticate
      </button>

      <div className="status">
        Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <pre key={i}>{JSON.stringify(msg, null, 2)}</pre>
        ))}
      </div>
    </div>
  );
}
```

### Example 6: Conditional Subscriptions

```tsx
'use client';

import { useWebSocket } from '../hooks/useWebSocket';
import { useWallet } from '@solana/wallet-adapter-react';

export default function ConditionalSubscribe() {
  const { publicKey } = useWallet();
  const [myAgents, setMyAgents] = useState([]);

  const { subscribe, unsubscribe } = useWebSocket({
    autoConnect: true,
  });

  // Subscribe to channels based on user's agents
  useEffect(() => {
    if (!publicKey) return;

    // Fetch user's agents
    fetchMyAgents(publicKey.toString()).then(agents => {
      setMyAgents(agents);

      // Subscribe to each agent
      agents.forEach(agent => {
        subscribe(`agent:${agent.id}`, (message) => {
          console.log(`Update for ${agent.name}:`, message);
        });
      });
    });

    return () => {
      // Unsubscribe on cleanup
      myAgents.forEach(agent => {
        unsubscribe(`agent:${agent.id}`);
      });
    };
  }, [publicKey, subscribe, unsubscribe]);

  return <div>Monitoring {myAgents.length} agents</div>;
}
```

### Example 7: Toast Notifications from WebSocket

```tsx
'use client';

import { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'react-hot-toast';

export default function WebSocketNotifications() {
  const { subscribe } = useWebSocket({
    channels: ['activities'],
    autoConnect: true,
  });

  useEffect(() => {
    const handleActivity = (message) => {
      const { type, data } = message;

      switch (type) {
        case 'new_agent':
          toast.success(`🤖 New agent created: ${data.name}`);
          break;
        case 'graduation':
          toast.success(`🎓 Agent graduated to Raydium!`);
          break;
        case 'king_change':
          toast.success(`👑 New King: ${data.name}`);
          break;
      }
    };

    subscribe('activities', handleActivity);
  }, [subscribe]);

  return null; // This component just handles notifications
}
```

## Testing Examples

### Test WebSocket Connection

```javascript
// In browser console or test file
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = () => {
  console.log('Connected');

  // Subscribe to trades
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'trades'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Message:', message);
};

ws.onerror = (error) => {
  console.error('Error:', error);
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

### Test Multiple Subscriptions

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = () => {
  // Subscribe to multiple channels at once
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['trades', 'prices', 'activities']
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'trade_executed':
      console.log('Trade:', message.data);
      break;
    case 'price_update':
      console.log('Price:', message.data);
      break;
    case 'new_activity':
      console.log('Activity:', message.data);
      break;
  }
};
```

## Advanced Patterns

### Debounced Updates

```tsx
import { useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function DebouncedPriceChart({ agentId }) {
  const { subscribe } = useWebSocket({ autoConnect: true });
  const updateTimer = useRef(null);

  useEffect(() => {
    const handlePriceUpdate = (message) => {
      // Debounce updates to avoid too many re-renders
      if (updateTimer.current) {
        clearTimeout(updateTimer.current);
      }

      updateTimer.current = setTimeout(() => {
        updateChart(message.data);
      }, 500);
    };

    subscribe(`agent:${agentId}`, handlePriceUpdate);

    return () => {
      if (updateTimer.current) {
        clearTimeout(updateTimer.current);
      }
    };
  }, [agentId, subscribe]);

  return <Chart />;
}
```

### Batched Updates

```tsx
import { useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function BatchedTrades() {
  const { subscribe } = useWebSocket({ autoConnect: true });
  const batchQueue = useRef([]);
  const batchTimer = useRef(null);

  useEffect(() => {
    const processBatch = () => {
      if (batchQueue.current.length > 0) {
        setTrades(prev => [...batchQueue.current, ...prev].slice(0, 100));
        batchQueue.current = [];
      }
    };

    const handleTrade = (message) => {
      batchQueue.current.push(message.data);

      if (!batchTimer.current) {
        batchTimer.current = setTimeout(() => {
          processBatch();
          batchTimer.current = null;
        }, 1000);
      }
    };

    subscribe('trades', handleTrade);

    return () => {
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
        processBatch();
      }
    };
  }, [subscribe]);

  return <TradeList />;
}
```

These examples demonstrate the various ways to use the WebSocket system throughout the application for real-time updates.
