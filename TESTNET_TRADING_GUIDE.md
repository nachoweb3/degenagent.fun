# Guía Completa: Testing de Agentes en Testnet/Devnet

## Estado Actual del Sistema

✅ **Tu sistema YA está configurado para Devnet de Solana**

- Red actual: `https://api.devnet.solana.com` (ver `.env`)
- Jupiter Aggregator: Compatible con devnet
- Todos los servicios listos para trading real en testnet

---

## Paso 1: Obtener SOL de Testnet

### Opción A: Airdrop desde CLI

```bash
# Instalar Solana CLI si no lo tienes
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Solicitar 2 SOL de devnet
solana airdrop 2 TU_WALLET_ADDRESS --url https://api.devnet.solana.com

# Verificar balance
solana balance TU_WALLET_ADDRESS --url https://api.devnet.solana.com
```

### Opción B: Faucets Web

1. **SOL Devnet Faucet**: https://faucet.solana.com/
2. **QuickNode Faucet**: https://faucet.quicknode.com/solana/devnet
3. **SolFaucet**: https://solfaucet.com/

**Recomendación**: Solicita al menos 5-10 SOL para tener suficiente para:
- Crear agentes (rent + fees)
- Depositar en wallets de agentes
- Ejecutar múltiples trades

---

## Paso 2: Crear un Agente de Trading

### Desde el Frontend

```bash
cd frontend
npm run dev
```

1. Ve a `/create`
2. Conecta tu wallet (Phantom/Solflare en modo Devnet)
3. Completa el formulario:
   - Nombre: "Test Bot 1"
   - Propósito: "Trade memecoins on devnet"
   - Risk Level: Medium
   - Max Trade Size: 10%
   - **✅ Activa "Use 3-Subagent System"** para ver el sistema completo

### Desde el Backend (API directa)

```bash
curl -X POST http://localhost:3001/api/agent/create \
  -H "Content-Type: application/json" \
  -d '{
    "creator": "TU_WALLET_PUBKEY",
    "name": "DevBot Alpha",
    "purpose": "Automated memecoin trading",
    "riskLevel": "medium",
    "riskTolerance": 6,
    "maxTradeSize": 15,
    "tradingFrequency": "medium",
    "aiModel": "gemini-pro",
    "useSubagents": true
  }'
```

---

## Paso 3: Depositar Fondos al Agente

El agente necesita SOL para ejecutar trades.

### Opción A: Desde Frontend

1. Ve a la página del agente `/agent/[pubkey]`
2. Click en "Deposit"
3. Ingresa cantidad (ej: 1 SOL)
4. Confirma la transacción

### Opción B: Transferencia Directa

```bash
# Transferir SOL directamente a la wallet del agente
solana transfer AGENT_WALLET_ADDRESS 1 \
  --url https://api.devnet.solana.com \
  --keypair /path/to/your/keypair.json
```

### Opción C: Via API

```bash
curl -X POST http://localhost:3001/api/agent/AGENT_PUBKEY/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "depositor": "TU_WALLET_PUBKEY",
    "amount": 1000000000
  }'
# amount en lamports (1 SOL = 1,000,000,000 lamports)
```

---

## Paso 4: Ejecutar Trades Reales en Devnet

### Método 1: Trading Manual (Probar API directamente)

#### A) Obtener Quote

```bash
curl -X POST http://localhost:3001/api/trading/quote \
  -H "Content-Type: application/json" \
  -d '{
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 100000000,
    "slippageBps": 50
  }'
```

**Tokens populares en Devnet:**
- SOL: `So11111111111111111111111111111111111111112`
- USDC (devnet): `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- USDT (devnet): `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`

#### B) Ejecutar Swap Real

```bash
curl -X POST http://localhost:3001/api/trading/swap \
  -H "Content-Type: application/json" \
  -d '{
    "agentPubkey": "AGENT_WALLET_ADDRESS",
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 100000000,
    "slippageBps": 50
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "signature": "2x3abc...",
  "inputAmount": 100000000,
  "outputAmount": 9950000,
  "inputMint": "So11...",
  "outputMint": "EPj...",
  "priceImpact": 0.15
}
```

#### C) Verificar Transacción

```bash
# Ver en Solana Explorer (Devnet)
https://explorer.solana.com/tx/SIGNATURE?cluster=devnet

# O verificar via CLI
solana confirm SIGNATURE --url https://api.devnet.solana.com
```

---

### Método 2: Sistema de 3-Subagentes Automatizado

#### Ejecutar Ciclo de Trading Completo

```bash
curl -X POST http://localhost:3001/api/trading/strategy/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentPubkey": "AGENT_WALLET_ADDRESS",
    "tokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "strategy": "momentum"
  }'
```

**Estrategias disponibles:**
- `momentum` - Compra en subidas, vende en bajadas
- `mean_reversion` - Compra barato, vende caro
- `trend_following` - Sigue tendencias del mercado
- `scalping` - Trading de alta frecuencia

**Proceso del Sistema:**

```
1. MARKET ANALYZER 📊
   ├─ Escanea tokens
   ├─ Analiza sentiment
   └─ Identifica oportunidades

2. RISK MANAGER 🛡️
   ├─ Evalúa riesgo
   ├─ Calcula position size
   └─ Aprueba/Rechaza trade

3. EXECUTION OPTIMIZER ⚡
   ├─ Optimiza precio entrada
   ├─ Calcula slippage
   └─ Ejecuta trade
```

---

### Método 3: Bot Automatizado 24/7

#### Iniciar Bot de Trading Continuo

```javascript
// En backend/src/services/tradingStrategy.ts
import { startTradingBot } from './services/tradingStrategy';

// Iniciar bot que tradea cada 5 minutos
const botHandle = await startTradingBot({
  agentPubkey: 'AGENT_WALLET_ADDRESS',
  strategy: 'momentum',
  watchlist: [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'  // USDT
  ],
  intervalMinutes: 5
});

// Detener bot
clearInterval(botHandle);
```

---

## Paso 5: Monitorear Trading en Tiempo Real

### A) Via WebSocket (Frontend)

```typescript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  // Suscribirse a eventos de trades
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['trades', `agent:${agentPubkey}`]
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Trade ejecutado:', data);
};
```

### B) Ver Historial de Trades

```bash
# Obtener historial completo
curl http://localhost:3001/api/trading/history/AGENT_ID

# Estadísticas del agente
curl http://localhost:3001/api/trading/stats/AGENT_ID
```

### C) Dashboard en Vivo

Ve a: `http://localhost:3000/agent/AGENT_PUBKEY`

Verás:
- 📊 Gráfico de rendimiento
- 📈 Trades en tiempo real
- 🤖 Estado de subagentes
- 💰 Balance actual
- 📉 P&L (Profit & Loss)

---

## Paso 6: Testing Avanzado

### Test 1: Stop-Loss & Take-Profit

```bash
# Crear orden de stop-loss (vende si baja 10%)
curl -X POST http://localhost:3001/api/trading/orders/stop-loss \
  -H "Content-Type: application/json" \
  -d '{
    "agentPubkey": "AGENT_WALLET",
    "tokenMint": "USDC_MINT",
    "triggerPrice": 0.90,
    "amount": 100
  }'

# Crear take-profit (vende si sube 20%)
curl -X POST http://localhost:3001/api/trading/orders/take-profit \
  -H "Content-Type: application/json" \
  -d '{
    "agentPubkey": "AGENT_WALLET",
    "tokenMint": "USDC_MINT",
    "triggerPrice": 1.20,
    "amount": 100
  }'
```

Las órdenes se ejecutan automáticamente cada 30 segundos (ver `orderManager.ts`).

### Test 2: Risk Management

```bash
# Verificar límites de riesgo antes de trade
curl http://localhost:3001/api/trading/risk/AGENT_PUBKEY
```

**Respuesta esperada:**
```json
{
  "totalValue": 1.5,
  "positions": [
    {
      "token": "USDC",
      "balance": 100,
      "valueInSOL": 0.5,
      "percentOfPortfolio": 33.33
    }
  ],
  "largestPositionPercent": 33.33,
  "dailyPnl": 0.15,
  "isRiskLimitBreached": false,
  "warnings": []
}
```

### Test 3: Backtesting de Estrategia

```bash
curl -X POST http://localhost:3001/api/strategy/backtest \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "AGENT_ID",
    "strategy": "momentum",
    "historicalData": [...],
    "startDate": "2025-01-01",
    "endDate": "2025-10-20"
  }'
```

---

## Paso 7: Debugging & Troubleshooting

### Ver Logs del Backend

```bash
cd backend
npm run dev
# Los logs mostrarán cada trade ejecutado
```

### Logs importantes a buscar:

```
✅ Swap quote received: { input: 0.1, estimatedOutput: 99.5, priceImpact: 0.15 }
✅ Transaction confirmed: 2x3abc...
✅ Trade executed successfully
✅ Commission recorded: 0.001 SOL
```

### Errores comunes:

#### "Insufficient balance"
- Solución: Deposita más SOL al agente

#### "Slippage tolerance exceeded"
- Solución: Aumenta `slippageBps` (ej: 100 = 1%)

#### "Token not tradeable"
- Solución: Verifica que el token existe en devnet y tiene liquidez

#### "Agent keypair not found"
- Solución: Verifica que el agente se creó correctamente y las llaves están en `.keys/`

---

## Paso 8: Verificar Resultados

### Verificar Balance del Agente

```bash
curl http://localhost:3001/api/trading/portfolio/AGENT_WALLET
```

**Respuesta:**
```json
{
  "totalValueSOL": 1.25,
  "tokens": [
    {
      "mint": "EPj...",
      "symbol": "USDC",
      "balance": 100,
      "decimals": 6,
      "valueSOL": 0.5
    }
  ]
}
```

### Ver Estadísticas de Performance

```bash
curl http://localhost:3001/api/performance/AGENT_ID
```

**Métricas:**
- Win Rate: 65%
- Total Trades: 42
- Successful: 27
- Total Profit: +0.35 SOL (+23%)
- Sharpe Ratio: 1.8
- Max Drawdown: -8%

---

## Paso 9: Migrar a Mainnet (Cuando estés listo)

### Cambios necesarios:

1. **Actualizar `.env`:**
```bash
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
# O usa un RPC dedicado (más rápido):
# RPC_ENDPOINT=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
```

2. **Usar tokens reales:**
- SOL: igual
- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- BONK: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`

3. **Ajustar límites de riesgo:**
```typescript
// Más conservador en mainnet
maxTradeSize: 5%  // vs 10-20% en testnet
maxSlippage: 50   // vs 100-200 en testnet
```

4. **Monitorear GAS fees:**
```typescript
priorityFee: 10000  // Prioriza tus transacciones
```

---

## Scripts de Testing Rápido

Crea este archivo para testing automatizado:

**`backend/testAgent.sh`:**
```bash
#!/bin/bash

AGENT_WALLET="TU_AGENT_WALLET"
BACKEND_URL="http://localhost:3001"

echo "🚀 Testing Agent on Devnet..."

echo "\n1️⃣ Checking agent balance..."
curl "$BACKEND_URL/api/trading/portfolio/$AGENT_WALLET"

echo "\n\n2️⃣ Getting swap quote..."
curl -X POST "$BACKEND_URL/api/trading/quote" \
  -H "Content-Type: application/json" \
  -d '{
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 10000000,
    "slippageBps": 50
  }'

echo "\n\n3️⃣ Analyzing trade opportunity..."
curl -X POST "$BACKEND_URL/api/trading/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "agentPubkey": "'"$AGENT_WALLET"'",
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 10000000
  }'

echo "\n\n✅ Tests completed!"
```

---

## Resumen: Flujo Completo de Testing

```
1. Obtener SOL devnet (faucet) ✓
2. Crear agente via frontend/API ✓
3. Depositar SOL al agente ✓
4. Ejecutar primer trade manual ✓
5. Ver transacción en explorer ✓
6. Activar bot automatizado ✓
7. Monitorear via WebSocket ✓
8. Verificar P&L y estadísticas ✓
```

---

## Recursos Adicionales

- **Solana Devnet Explorer**: https://explorer.solana.com/?cluster=devnet
- **Jupiter Devnet**: https://jup.ag/ (cambiar a devnet en settings)
- **Solana Cookbook**: https://solanacookbook.com/
- **Jupiter API Docs**: https://station.jup.ag/docs/apis/swap-api

---

## Soporte

Si encuentras problemas:

1. Revisa logs del backend: `npm run dev`
2. Verifica balance de SOL: `solana balance --url devnet`
3. Confirma que estás en devnet en tu wallet
4. Chequea que Jupiter API responde: `curl https://quote-api.jup.ag/v6/quote?...`

**¡Ahora puedes testear trading real en devnet sin riesgo! 🚀**
