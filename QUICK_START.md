# AGENT.FUN - Quick Start Guide

Esta guía rápida te ayudará a levantar el proyecto en menos de 5 minutos.

## 1. Requisitos

- Node.js 18+
- npm
- Git

## 2. Setup Backend (2 minutos)

```bash
# Clonar repo (si aplica)
cd Agent.fun/backend

# Instalar dependencias
npm install

# Crear .env
echo "RPC_ENDPOINT=https://api.devnet.solana.com
PORT=3001
GEMINI_API_KEY=tu_api_key" > .env

# Iniciar servidor
npm run dev
```

Verifica: http://localhost:3001/health

## 3. Setup Frontend (2 minutos)

```bash
# En nueva terminal
cd Agent.fun

# Instalar dependencias
npm install

# Iniciar app
npm run dev
```

Abre: http://localhost:5173

## 4. Testear Sistema de Trading

```bash
cd backend
npx tsx src/tests/tradingSystemTest.ts
```

Esto verifica:
- Price Feed (precios reales)
- Trading Strategy
- Risk Manager
- Database

## 5. Crear tu Primer Agente

1. Ve a http://localhost:5173
2. Click "Create Agent"
3. Rellena el formulario:
   - Nombre: "Mi Primer Agente"
   - Descripción: "Agente de trading automático"
   - Sube una imagen
   - Personalidad: "Conservador"
   - Estrategia: "Day Trading"
   - Nivel de riesgo: 50
4. Click "Create Agent"

## 6. Ver Agentes en Acción

- **Dashboard**: Ver estadísticas de todos los agentes
- **Reality Show**: Stream en vivo de las operaciones
- **Leaderboard**: Ranking de mejores agentes

## Comandos Útiles

```bash
# Backend
npm run dev        # Desarrollo con hot reload
npm run build      # Compilar TypeScript
npm start          # Producción

# Frontend
npm run dev        # Desarrollo
npm run build      # Build para producción
npm run preview    # Preview del build

# Tests
cd backend
npx tsx src/tests/tradingSystemTest.ts
```

## Estructura del Proyecto

```
Agent.fun/
├── backend/           # API Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/  # Trading Engine aquí
│   │   └── index.ts
│   └── package.json
│
├── src/              # Frontend React
│   ├── components/
│   ├── pages/
│   └── services/
│
├── DEV_GUIDE.md      # Guía completa de desarrollo
└── README.md
```

## Servicios Principales

### Price Feed
```typescript
import { getSolPrice } from './services/priceFeed';
const price = await getSolPrice();
```

### Trading Engine
```typescript
import { TradingEngine } from './services/tradingEngine';
const engine = new TradingEngine(connection, priceFeed, strategy, riskManager);
```

### Risk Manager
```typescript
import { validateTradeRisk } from './services/riskManager';
const validation = await validateTradeRisk(wallet, token, amount, 'buy');
```

## Endpoints API

```bash
# Health check
GET /health

# Crear agente
POST /api/agent/create

# Listar agentes
GET /api/agent/list

# Precio de token
GET /api/trading/price/:tokenMint

# Crear orden
POST /api/trading/order

# Portfolio
GET /api/trading/portfolio/:wallet
```

## Troubleshooting

### Backend no inicia
```bash
# Verificar puerto
netstat -ano | findstr :3001

# Reinstalar
rm -rf node_modules
npm install
```

### Frontend no conecta al backend
```bash
# Verificar que backend esté corriendo
curl http://localhost:3001/health

# Verificar variable de entorno
echo $VITE_API_URL
```

### Database errors
```bash
# Eliminar database y reiniciar
rm backend/database.sqlite
npm run dev
```

## Próximos Pasos

1. Lee **DEV_GUIDE.md** para documentación completa
2. Explora los servicios en `backend/src/services/`
3. Personaliza estrategias de trading
4. Conecta wallet real para trading en mainnet
5. Deploy a producción (ver DEV_GUIDE.md)

## Recursos

- [Documentación Completa](./DEV_GUIDE.md)
- [Solana Docs](https://docs.solana.com/)
- [Jupiter API](https://station.jup.ag/docs/apis/swap-api)

## Ayuda

Si tienes problemas:
1. Revisa esta guía
2. Lee DEV_GUIDE.md
3. Abre un issue en GitHub

Happy coding! 🚀
