# Inicio Rápido: Testear Agentes en Devnet

## 🎯 Resumen

Tu sistema **ya está configurado para Devnet** y listo para testear trading real sin riesgo.

---

## ⚡ Inicio Rápido (5 minutos)

### 1. Obtén SOL de Devnet (Gratis)

Visita: https://faucet.solana.com/

- Conecta tu wallet (cambiar a Devnet en Phantom/Solflare)
- Solicita 5 SOL de devnet
- Espera 30 segundos

### 2. Inicia el Backend

```bash
cd backend
npm run dev
```

### 3. Crea un Agente

**Opción A: Desde el Frontend**
```bash
cd frontend
npm run dev
# Ve a http://localhost:3000/create
# Conecta wallet y crea agente
```

**Opción B: Desde la API**
```bash
curl -X POST http://localhost:3001/api/agent/create \
  -H "Content-Type: application/json" \
  -d '{
    "creator": "TU_WALLET_PUBKEY",
    "name": "TestBot",
    "purpose": "Trading devnet",
    "riskLevel": "medium",
    "useSubagents": true
  }'
```

### 4. Deposita Fondos al Agente

```bash
# Transfiere 1 SOL al agente
solana transfer AGENT_WALLET_ADDRESS 1 \
  --url https://api.devnet.solana.com
```

### 5. Ejecuta el Script de Testing

**Windows (PowerShell):**
```powershell
$env:AGENT_WALLET="tu_agent_wallet_aqui"
.\backend\testAgent.ps1
```

**Linux/Mac:**
```bash
export AGENT_WALLET="tu_agent_wallet_aqui"
chmod +x backend/testAgent.sh
./backend/testAgent.sh
```

**Node.js (Multiplataforma):**
```bash
AGENT_WALLET="tu_agent_wallet_aqui" node backend/testAgent.js
```

---

## 📊 Qué Hace el Script

El script de testing automáticamente:

✅ **Test 1:** Verifica que el backend está funcionando
✅ **Test 2:** Consulta el balance del agente
✅ **Test 3:** Obtiene un quote de swap (SOL → USDC)
✅ **Test 4:** Analiza si el trade es viable
✅ **Test 5:** Revisa los límites de riesgo
✅ **Test 6:** Obtiene el precio actual de SOL
✅ **Test 7:** Simula un trade (sin ejecutar)
⚠️ **Test 8:** Ejecutar trade real (deshabilitado por defecto)

---

## 🚀 Ejecutar un Trade Real

### Método 1: Via Script (Recomendado)

1. Abre `backend/testAgent.sh` (o `.ps1` / `.js`)
2. Descomenta la sección "Test 8"
3. Ejecuta el script de nuevo

### Método 2: API Directa

```bash
curl -X POST http://localhost:3001/api/trading/swap \
  -H "Content-Type: application/json" \
  -d '{
    "agentPubkey": "AGENT_WALLET",
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 10000000,
    "slippageBps": 50
  }'
```

Esto intercambia **0.01 SOL** por **USDC** en devnet.

### Método 3: Sistema de 3-Subagentes

```bash
curl -X POST http://localhost:3001/api/trading/strategy/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentPubkey": "AGENT_WALLET",
    "tokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "strategy": "momentum"
  }'
```

Esto ejecuta el **ciclo completo de 3-subagentes**:
1. **Market Analyzer** encuentra oportunidades
2. **Risk Manager** evalúa el riesgo
3. **Execution Optimizer** ejecuta el trade

---

## 🔍 Verificar Resultados

### Ver Transacción en Explorer

Después de ejecutar un trade, recibirás un `signature`. Verlo en:

```
https://explorer.solana.com/tx/SIGNATURE?cluster=devnet
```

### Ver Historial de Trades

```bash
curl http://localhost:3001/api/trading/history/AGENT_ID
```

### Ver Estadísticas

```bash
curl http://localhost:3001/api/trading/stats/AGENT_ID
```

### Dashboard en Vivo

Ve a: `http://localhost:3000/agent/AGENT_PUBKEY`

---

## 🤖 Trading Automatizado

### Iniciar Bot que Tradea Cada 5 Minutos

Crea `backend/startBot.js`:

```javascript
const { startTradingBot } = require('./src/services/tradingStrategy');

const AGENT_PUBKEY = 'tu_agent_wallet';

startTradingBot({
  agentPubkey: AGENT_PUBKEY,
  strategy: 'momentum',
  watchlist: [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'  // USDT
  ],
  intervalMinutes: 5
}).then(() => {
  console.log('✅ Trading bot started!');
  console.log('Bot will analyze and execute trades every 5 minutes');
  console.log('Press Ctrl+C to stop');
});
```

Ejecutar:
```bash
node backend/startBot.js
```

---

## 📱 Monitoreo en Tiempo Real

### Via WebSocket (Frontend)

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['trades', `agent:${agentPubkey}`]
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('🔔 New event:', data);
};
```

### Canales Disponibles

- `trades` - Todos los trades ejecutados
- `prices` - Actualizaciones de precios
- `agent:{pubkey}` - Eventos específicos del agente
- `activities` - Feed de actividad general
- `kings` - Cambios de King of the Hill
- `olympics` - Eventos de Olympics

---

## 🛡️ Stop-Loss y Take-Profit

### Crear Stop-Loss (Vende si baja 10%)

```bash
curl -X POST http://localhost:3001/api/trading/orders/stop-loss \
  -H "Content-Type: application/json" \
  -d '{
    "agentPubkey": "AGENT_WALLET",
    "tokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "triggerPrice": 0.90,
    "amount": 100
  }'
```

### Crear Take-Profit (Vende si sube 20%)

```bash
curl -X POST http://localhost:3001/api/trading/orders/take-profit \
  -H "Content-Type: application/json" \
  -d '{
    "agentPubkey": "AGENT_WALLET",
    "tokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "triggerPrice": 1.20,
    "amount": 100
  }'
```

Las órdenes se monitorean automáticamente cada 30 segundos.

---

## 📈 Estrategias Disponibles

1. **Momentum** - Compra en subidas, vende en bajadas
2. **Mean Reversion** - Compra barato, vende caro
3. **Trend Following** - Sigue tendencias del mercado
4. **Scalping** - Trading de alta frecuencia

Cambiar estrategia:
```bash
curl -X POST http://localhost:3001/api/trading/strategy/execute \
  -d '{"strategy": "scalping", ...}'
```

---

## 🐛 Troubleshooting

### "Insufficient balance"
```bash
# Verifica balance
solana balance AGENT_WALLET --url devnet

# Envía más SOL
solana transfer AGENT_WALLET 1 --url devnet
```

### "Slippage tolerance exceeded"
```javascript
// Aumenta slippageBps
{
  "slippageBps": 100  // 1% en vez de 0.5%
}
```

### "Token not tradeable"
```bash
# Verifica que el token tiene liquidez en devnet
curl http://localhost:3001/api/trading/price/TOKEN_MINT
```

### Backend no responde
```bash
# Verifica que esté corriendo
curl http://localhost:3001/health

# Reinicia
cd backend
npm run dev
```

---

## 🎓 Siguientes Pasos

1. ✅ Ejecuta el script de testing
2. ✅ Haz tu primer trade manual
3. ✅ Activa el sistema de 3-subagentes
4. ✅ Configura stop-loss/take-profit
5. ✅ Inicia el bot automatizado
6. ✅ Monitorea via WebSocket
7. ✅ Revisa estadísticas y performance

---

## 📚 Recursos

- **Guía Completa:** `TESTNET_TRADING_GUIDE.md`
- **Solana Explorer:** https://explorer.solana.com/?cluster=devnet
- **Jupiter Devnet:** https://jup.ag/
- **Faucet SOL:** https://faucet.solana.com/

---

## ⚡ Comandos Útiles

```bash
# Ver logs del backend
cd backend && npm run dev

# Verificar balance
solana balance WALLET --url devnet

# Ver transacción
solana confirm SIGNATURE --url devnet

# Listar agentes
curl http://localhost:3001/api/agent/all

# Ver portfolio
curl http://localhost:3001/api/trading/portfolio/WALLET

# Ver riesgo
curl http://localhost:3001/api/trading/risk/WALLET
```

---

**¡Ya estás listo para testear trading real en devnet! 🚀**

Para más detalles, consulta `TESTNET_TRADING_GUIDE.md`
