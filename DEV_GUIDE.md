# AGENT.FUN - Guía de Desarrollo

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Setup Backend](#setup-backend)
4. [Setup Frontend](#setup-frontend)
5. [Servicios y APIs](#servicios-y-apis)
6. [Base de Datos](#base-de-datos)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## Introducción

AGENT.FUN es una plataforma de trading autónomo en Solana que permite crear agentes de IA que operan 24/7 en el mercado crypto. La plataforma incluye:

- **Trading Engine**: Sistema de trading automático con estrategias configurables
- **Risk Management**: Gestión de riesgo avanzada con límites y stop-loss
- **Reality Show**: Stream en vivo de las operaciones de los agentes
- **Vault Lending**: Sistema de préstamos DeFi (en desarrollo)

**Stack Tecnológico:**
- Backend: Node.js + Express + TypeScript
- Frontend: React + TypeScript + Vite
- Blockchain: Solana Web3.js
- Database: SQLite (dev) / PostgreSQL (prod)
- APIs: Jupiter (DEX), Gemini AI

---

## Arquitectura del Sistema

```
agent.fun/
├── backend/               # API Backend
│   ├── src/
│   │   ├── controllers/   # Controladores de rutas
│   │   ├── models/        # Modelos de base de datos
│   │   ├── routes/        # Definición de rutas
│   │   ├── services/      # Lógica de negocio
│   │   ├── middleware/    # Middleware Express
│   │   └── index.ts       # Punto de entrada
│   └── package.json
│
└── src/                   # Frontend React
    ├── components/        # Componentes UI
    ├── services/          # API calls
    ├── hooks/             # React hooks
    └── pages/             # Páginas principales
```

### Flujo de Datos

```
Usuario → Frontend → Backend API → Solana RPC
                         ↓
                    Database (SQLite)
                         ↓
                    Trading Engine
                         ↓
                    Jupiter DEX
```

---

## Setup Backend

### 1. Requisitos Previos

- Node.js 18+
- npm o pnpm
- Git

### 2. Instalación

```bash
cd backend
npm install
```

### 3. Configuración (.env)

Crea un archivo `.env` en la carpeta `backend/`:

```env
# Solana Network
RPC_ENDPOINT=https://api.devnet.solana.com
# Para producción usar: https://api.mainnet-beta.solana.com

# Puerto del servidor
PORT=3001

# Google AI (para agentes)
GEMINI_API_KEY=tu_api_key_de_gemini

# Jupiter API (trading)
# No requiere API key, usa endpoints públicos

# Database
# SQLite se crea automáticamente en desarrollo
# Para producción configurar PostgreSQL

# Wallet Keys (CRÍTICO - nunca commitear)
# Estos son opcionales para desarrollo
AGENT_PRIVATE_KEY=tu_private_key_base58
TREASURY_WALLET=tu_wallet_publica
```

### 4. Ejecutar Backend

```bash
# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Producción
npm start
```

### 5. Verificar Funcionamiento

Abre http://localhost:3001/health

Deberías ver:
```json
{
  "status": "ok",
  "network": "devnet",
  "blockHeight": 123456,
  "timestamp": "2025-10-14T..."
}
```

---

## Setup Frontend

### 1. Instalación

```bash
cd ..  # Volver a raíz del proyecto
npm install
```

### 2. Configuración

El frontend se conecta al backend en `localhost:3001` por defecto.

Para cambiar la URL del API, edita `src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';
```

### 3. Ejecutar Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

### 4. Acceder a la Aplicación

Abre http://localhost:5173

---

## Servicios y APIs

### Backend Services

#### 1. **Price Feed Service** (`services/priceFeed.ts`)

Obtiene precios en tiempo real de Jupiter:

```typescript
import { getTokenPrice, getSolPrice, TOKENS } from './services/priceFeed';

// Precio de SOL
const solPrice = await getSolPrice();

// Precio de cualquier token
const tokenPrice = await getTokenPrice('MINT_ADDRESS', TOKENS.USDC);

// Balance de wallet
const balance = await getTokenBalance('WALLET_ADDRESS', TOKENS.SOL);

// Valor del portfolio
const portfolio = await getPortfolioValue('WALLET_ADDRESS', [TOKENS.SOL, TOKENS.USDC]);
```

**Endpoints Jupiter usados:**
- Price API: `https://api.jup.ag/price/v2`
- Quote API: `https://quote-api.jup.ag/v6`

#### 2. **Trading Strategy** (`services/tradingStrategy.ts`)

Evalúa señales de trading:

```typescript
import { TradingStrategy } from './services/tradingStrategy';

const strategy = new TradingStrategy(priceFeed);

const decision = await strategy.evaluateTrade(
  'agent-id',
  'SOL',
  currentPrice
);

// decision = {
//   shouldTrade: true/false,
//   signal: 'buy' | 'sell' | 'hold',
//   confidence: 0-1,
//   reason: 'Explicación de la decisión',
//   indicators: { rsi, ema, trend }
// }
```

**Indicadores implementados:**
- RSI (Relative Strength Index)
- EMA (Exponential Moving Average)
- Trend Detection
- Volume Analysis

#### 3. **Risk Manager** (`services/riskManager.ts`)

Gestiona límites de riesgo:

```typescript
import { validateTradeRisk, getRiskMetrics } from './services/riskManager';

// Validar trade antes de ejecutar
const validation = await validateTradeRisk(
  'wallet-address',
  'token-mint',
  tradeAmount,
  'buy',
  riskConfig
);

if (!validation.allowed) {
  console.log('Trade bloqueado:', validation.reason);
}

// Obtener métricas de riesgo
const metrics = await getRiskMetrics('wallet-address', [TOKENS.SOL]);
```

**Parámetros de riesgo:**
```typescript
{
  maxPositionSize: 20,      // 20% max por posición
  maxDailyLoss: 10,         // 10% pérdida diaria máx
  maxTradeSize: 1.0,        // 1 SOL max por trade
  maxSlippage: 100,         // 1% slippage
  stopLossPercent: 15,      // 15% stop loss
  takeProfitPercent: 50     // 50% take profit
}
```

#### 4. **Trading Engine** (`services/tradingEngine.ts`)

Motor principal de ejecución de trades:

```typescript
import { TradingEngine } from './services/tradingEngine';

const engine = new TradingEngine(
  connection,
  priceFeed,
  strategy,
  riskManager
);

// Evaluar oportunidad de trading
const result = await engine.evaluateTradingOpportunity(
  'agent-id',
  'wallet-address',
  'token-mint',
  'buy',
  amount
);

// Ejecutar trade real (requiere wallet key)
const tx = await engine.executeTrade(
  agentKeypair,
  'token-mint-input',
  'token-mint-output',
  amount,
  slippage
);
```

#### 5. **Order Manager** (`services/orderManager.ts`)

Monitorea órdenes abiertas:

```typescript
import { startOrderMonitoring } from './services/orderManager';

// Inicia monitoreo automático
startOrderMonitoring(30000); // Check cada 30 segundos

// Verifica:
// - Stop loss triggers
// - Take profit targets
// - Expiration de órdenes
// - Actualiza estado en DB
```

### API Endpoints

#### **Agentes**

```bash
# Crear agente
POST /api/agent/create
Body: {
  name: string,
  description: string,
  image: string (base64),
  personality: string,
  tradingStrategy: string,
  riskLevel: number (0-100)
}

# Listar agentes
GET /api/agent/list

# Obtener agente
GET /api/agent/:pubkey
```

#### **Trading**

```bash
# Crear orden
POST /api/trading/order
Body: {
  agentId: string,
  tokenIn: string,
  tokenOut: string,
  amount: number,
  orderType: 'market' | 'limit',
  limitPrice?: number
}

# Listar órdenes del agente
GET /api/trading/orders/:agentId

# Obtener precio
GET /api/trading/price/:tokenMint

# Portfolio del agente
GET /api/trading/portfolio/:walletAddress
```

#### **Olympics (Reality Show)**

```bash
# Crear evento
POST /api/olympics/event

# Registrar agente en olimpiadas
POST /api/olympics/register

# Leaderboard
GET /api/olympics/leaderboard

# Estado del evento
GET /api/olympics/event/:eventId
```

---

## Base de Datos

### Modelos

#### **Agent** (`models/Agent.ts`)
```typescript
{
  id: UUID,
  pubkey: string,          // Wallet pública del agente
  name: string,
  description: string,
  personality: string,
  tradingStrategy: string,
  riskLevel: number,       // 0-100
  totalVolume: number,     // Volumen total operado
  profitLoss: number,      // P&L acumulado
  winRate: number,         // % trades ganadores
  isActive: boolean
}
```

#### **TradingOrder** (`models/TradingOrder.ts`)
```typescript
{
  id: UUID,
  agentId: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: number,
  amountOut: number,
  orderType: 'market' | 'limit',
  status: 'pending' | 'executed' | 'failed' | 'cancelled',
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  txSignature: string,
  executedAt: Date
}
```

#### **VaultLending** (`models/VaultLending.ts`)
```typescript
{
  id: UUID,
  vaultAddress: string,
  depositor: string,
  amount: number,
  apy: number,
  lockPeriod: number,
  status: 'active' | 'withdrawn'
}
```

### Inicialización

La base de datos se inicializa automáticamente al arrancar el servidor:

```typescript
// En index.ts
await initDatabase();
```

Esto crea:
- Archivo `database.sqlite` en carpeta backend
- Todas las tablas según modelos de Sequelize
- Índices para búsquedas optimizadas

### Migraciones

Para producción con PostgreSQL:

```typescript
// Configurar en database.ts
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
);
```

---

## Testing

### Test del Sistema de Trading

```bash
cd backend
npx tsx src/tests/tradingSystemTest.ts
```

Este test verifica:
- ✅ Price Feed (precios en tiempo real)
- ✅ Trading Strategy (señales de compra/venta)
- ✅ Risk Manager (límites y validaciones)
- ✅ Trading Engine (simulación de trades)
- ✅ Database (conexión y modelos)

### Test Manual de APIs

Usa Thunder Client, Postman o curl:

```bash
# Health check
curl http://localhost:3001/health

# Precio de SOL
curl http://localhost:3001/api/trading/price/So11111111111111111111111111111111111111112

# Listar agentes
curl http://localhost:3001/api/agent/list
```

---

## Deployment

### Backend en Railway/Render

1. **Preparar variables de entorno:**
   ```env
   RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   PORT=3001
   GEMINI_API_KEY=...
   DATABASE_URL=postgresql://... (si usas Postgres)
   ```

2. **Build command:**
   ```bash
   npm install && npm run build
   ```

3. **Start command:**
   ```bash
   npm start
   ```

### Frontend en Vercel

1. **Build settings:**
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Environment variables:**
   ```env
   VITE_API_URL=https://tu-backend.railway.app
   ```

### Dominio Personalizado

#### Configurar en Vercel (Frontend)

1. **Comprar dominio:**
   - Namecheap, GoDaddy, Cloudflare, etc.
   - Ejemplo: `agent.fun`

2. **En Vercel Dashboard:**
   - Ve a tu proyecto → Settings → Domains
   - Click "Add Domain"
   - Escribe tu dominio: `agent.fun` o `www.agent.fun`
   - Vercel te dará registros DNS para configurar

3. **Configurar DNS en tu proveedor:**

   Para dominio raíz (`agent.fun`):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600
   ```

   Para subdominio (`www.agent.fun`):
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

4. **Verificación:**
   - Espera 5-60 minutos para propagación DNS
   - Vercel verificará automáticamente
   - SSL/HTTPS se configura automáticamente

#### Configurar Backend con Subdominio

1. **Opción A: Railway Custom Domain**

   En Railway:
   - Settings → Domains
   - Add Custom Domain: `api.agent.fun`
   - Configura CNAME en tu DNS:
   ```
   Type: CNAME
   Name: api
   Value: tu-proyecto.up.railway.app
   TTL: 3600
   ```

2. **Opción B: Cloudflare Proxy (Recomendado)**

   Ventajas: DDoS protection, caching, analytics

   - Añade tu dominio a Cloudflare
   - Crea registro CNAME:
   ```
   Type: CNAME
   Name: api
   Value: tu-backend.railway.app
   Proxy: Activado (nube naranja)
   ```
   - SSL/TLS: Full (strict)

3. **Actualizar Frontend:**
   ```env
   VITE_API_URL=https://api.agent.fun
   ```

#### Configuración Profesional Completa

**Estructura de dominios:**
```
agent.fun               → Frontend principal (Vercel)
www.agent.fun          → Redirect a agent.fun
api.agent.fun          → Backend API (Railway)
docs.agent.fun         → Documentación (opcional)
status.agent.fun       → Status page (opcional)
```

**DNS Records (ejemplo con Cloudflare):**
```
# Root domain
A     @        76.76.21.21                    Proxy: ON
CNAME www      agent.fun                      Proxy: ON

# API
CNAME api      tu-backend.railway.app         Proxy: ON

# Opcional: Docs
CNAME docs     agent-fun-docs.vercel.app      Proxy: ON
```

### Hosting Profesional: Opciones y Comparativa

#### Backend Options

**1. Railway ($5-20/mes)**
- ✅ Fácil deployment desde GitHub
- ✅ Database PostgreSQL incluida
- ✅ SSL automático
- ✅ Variables de entorno seguras
- ✅ Logs y monitoring
- ❌ Más caro que alternativas

**Setup Railway:**
```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Iniciar proyecto
railway init

# Deployar
railway up

# Añadir PostgreSQL
railway add --plugin postgresql
```

**2. Render ($7-25/mes)**
- ✅ Free tier generoso
- ✅ PostgreSQL incluida
- ✅ Auto-scaling
- ✅ Mejor para proyectos pequeños/medianos

**3. DigitalOcean App Platform ($12-48/mes)**
- ✅ Infraestructura confiable
- ✅ Más control
- ✅ Mejor para escala grande
- ❌ Setup más complejo

**4. AWS/GCP/Azure (Variable)**
- ✅ Máxima escalabilidad
- ✅ Control total
- ❌ Complejo y caro
- ❌ Solo para empresas

**Recomendación para AGENT.FUN:**
```
Desarrollo:   Railway (simplicidad)
Producción:   Railway → DigitalOcean (al escalar)
Database:     Railway Postgres → Supabase (al escalar)
```

#### Frontend Options

**1. Vercel (Gratis - $20/mes)**
- ✅ MEJOR para React/Vite
- ✅ Deploy automático desde GitHub
- ✅ Edge network global
- ✅ SSL automático
- ✅ Analytics incluido
- ✅ Free tier muy generoso

**2. Netlify (Gratis - $19/mes)**
- ✅ Similar a Vercel
- ✅ Buenas funciones serverless
- ❌ Ligeramente más lento

**3. Cloudflare Pages (Gratis)**
- ✅ Totalmente gratis
- ✅ Red global
- ✅ Unlimited bandwidth
- ❌ Menos features

**Recomendación:**
```
AGENT.FUN → Vercel (mejor DX y performance)
```

#### Database Options

**1. Railway PostgreSQL**
- ✅ Incluida con backend
- ✅ Backups automáticos
- ✅ $5/mes con backend

**2. Supabase (Gratis - $25/mes)**
- ✅ PostgreSQL gestionada
- ✅ API REST automática
- ✅ Auth y Storage incluidos
- ✅ Free tier: 500MB

**3. PlanetScale (MySQL)**
- ✅ Free tier generoso
- ✅ Branching de DB
- ❌ MySQL (no Postgres)

**4. Neon (Postgres sin servidor)**
- ✅ Auto-scaling
- ✅ Free tier incluye 3GB
- ✅ Pay per use

**Setup Neon (alternativa Railway):**
```bash
# Crear cuenta en neon.tech
# Copiar connection string
# En Railway/Vercel añadir:
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname
```

#### RPC Providers (Solana)

**Devnet (Gratis):**
```
https://api.devnet.solana.com
```

**Mainnet - Opciones profesionales:**

**1. Helius ($0-249/mes)**
```
Gratis:    250k requests/mes
Pro $99:   Unlimited requests
Enterprise: Nodes dedicados

Setup:
- Signup en helius.xyz
- Crear API key
- RPC_ENDPOINT=https://rpc.helius.xyz/?api-key=TU_KEY
```

**2. QuickNode ($9-299/mes)**
```
Starter:   100M credits/mes
Pro:       500M credits/mes
Enterprise: Unlimited

Setup:
- quicknode.com
- Crear endpoint Solana
- RPC_ENDPOINT=https://xxx.solana-mainnet.quiknode.pro/YOUR_KEY/
```

**3. Alchemy (Nuevo en Solana)**
```
Gratis: 300M compute units/mes
Growth: Custom pricing

Setup:
- alchemy.com
- Crear app Solana
- RPC_ENDPOINT=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
```

**Recomendación:**
```
Desarrollo:  Devnet público (gratis)
Testing:     Helius free tier
Producción:  Helius Pro o QuickNode Starter
Enterprise:  QuickNode Pro con nodos dedicados
```

### Consideraciones de Producción

1. **Seguridad:**
   - NUNCA commitear `.env` con private keys
   - Usar variables de entorno del hosting
   - Implementar rate limiting en API
   - Validar inputs del usuario

2. **RPC Endpoints:**
   - Desarrollo: Devnet público
   - Producción: Mainnet con proveedor premium (Helius, QuickNode)
   - Considerar caché de requests para reducir costos

3. **Database:**
   - Desarrollo: SQLite local
   - Producción: PostgreSQL en Railway/Supabase
   - Backups automáticos diarios

4. **Monitoring:**
   - Logs de errores (Sentry)
   - Métricas de performance (New Relic)
   - Alertas de trading (Telegram bot)

---

## Troubleshooting

### Backend no inicia

```bash
# Verificar puerto disponible
netstat -ano | findstr :3001

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar TypeScript
npx tsc --noEmit
```

### Errores de conexión Solana

```bash
# Verificar RPC endpoint
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Probar con endpoint alternativo
RPC_ENDPOINT=https://api.mainnet-beta.solana.com npm run dev
```

### Database locked (SQLite)

```bash
# Cerrar todas las conexiones
pkill -f tsx

# Reiniciar servidor
npm run dev
```

---

## Recursos Adicionales

### Documentación
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Jupiter API](https://station.jup.ag/docs/apis/swap-api)
- [Sequelize](https://sequelize.org/docs/v6/)

### Herramientas
- [Solana Explorer](https://explorer.solana.com/)
- [Jupiter Terminal](https://jup.ag/)
- [Solana Devnet Faucet](https://faucet.solana.com/)

### Comunidad
- Discord: AGENT.FUN Community
- Twitter: @AgentFunSol
- GitHub: Issues y PRs bienvenidos

---

## Contacto y Soporte

Para preguntas o issues:
1. Revisar esta guía primero
2. Buscar en issues de GitHub
3. Crear un nuevo issue con detalles del problema

**Happy coding!** 🚀
