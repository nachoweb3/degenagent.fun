# 🚀 AGENT.FUN - AI Trading Agents on Solana

**Autonomous AI traders operating 24/7 on Solana blockchain**

Built by [@nachoweb3](https://twitter.com/nachoweb3) 💜

---

## 📖 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [What is Agent.fun?](#what-is-agentfun)
3. [Features](#features)
4. [Current Status](#current-status)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Documentation](#documentation)
8. [Deployment](#deployment)

---

## ⚡ QUICK START

**Guías disponibles:**
- **QUICK_START.md** - Guía rápida en español (5 minutos)
- **DEV_GUIDE.md** - Guía completa de desarrollo

### Inicio Rápido

```bash
# 1. Backend
cd backend
npm install
npm run dev

# 2. Frontend (nueva terminal)
cd ..
npm install
npm run dev

# 3. Verificar
# Backend: http://localhost:3001/health
# Frontend: http://localhost:5173
```

### Test del Sistema

```bash
cd backend
npx tsx src/tests/tradingSystemTest.ts
```

---

## 🤖 WHAT IS AGENT.FUN?

Plataforma revolucionaria que permite crear **agentes de IA autónomos** que operan 24/7 en el mercado crypto de Solana.

### Características Principales

- 🤖 **Trading con IA**: Sistema de trading automático con estrategias configurables
- 📊 **Gestión de Riesgo**: Risk management avanzado con stop-loss y límites
- 📺 **Reality Show**: Stream en vivo de las operaciones de los agentes
- 🔒 **Seguro**: Todas las operaciones on-chain en Solana
- 💰 **Vault Lending**: Sistema DeFi de préstamos (en desarrollo)
- ⚡ **Jupiter Integration**: DEX aggregator para mejor ejecución

### Cómo Funciona

1. **Crear**: Lanza tu agente de IA con personalidad customizable
2. **Configurar**: Define estrategia de trading y nivel de riesgo (0-100)
3. **Trading**: El agente analiza mercados y ejecuta operaciones automáticamente
4. **Monitorear**: Sigue en tiempo real el performance en el reality show

---

## ✅ ESTADO ACTUAL

### Completado ✅

#### Backend API
- [x] Sistema de trading completo con 7 servicios principales
- [x] Price Feed (Jupiter API integration)
- [x] Trading Strategy (RSI, EMA, trend analysis)
- [x] Risk Manager (stop-loss, position limits)
- [x] Trading Engine (ejecución de órdenes)
- [x] Order Manager (monitoreo automático)
- [x] Database (SQLite/Sequelize)
- [x] REST API con endpoints para agentes, trading y olympics

#### Frontend
- [x] UI completa con React + TypeScript + Vite
- [x] Páginas: Home, Create, Dashboard, Reality Show
- [x] Wallet Adapter (Phantom, Solflare)
- [x] Diseño responsive mobile-first
- [x] Integración con backend API

#### Trading System
- [x] Integración completa con Jupiter DEX
- [x] Sistema de órdenes (market, limit, stop-loss)
- [x] Monitoreo automático de precios
- [x] Gestión de riesgo configurable
- [x] Portfolio tracking en tiempo real
- [x] Caching y optimización de requests

#### Documentación
- [x] DEV_GUIDE.md - Guía completa de desarrollo
- [x] QUICK_START.md - Guía rápida
- [x] Tests del sistema de trading
- [x] Documentación de hosting y dominios

### En Desarrollo 🚧
- [ ] Reality Show stream en tiempo real
- [ ] Vault Lending (modelos creados)
- [ ] Smart contracts deployment
- [ ] Olympics leaderboard avanzado

---

## 🛠️ TECH STACK

### Backend
- **Runtime**: Node.js 18+ con Express
- **Language**: TypeScript
- **Blockchain**: Solana Web3.js
- **DEX**: Jupiter Aggregator API
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Sequelize

### Frontend
- **Framework**: React 18 con Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: Solana Wallet Adapter
- **Build**: Vite

### Trading System
- **Price Feed**: Jupiter Price API v2
- **Strategy**: RSI, EMA, Trend Analysis
- **Risk Management**: Custom risk engine
- **Execution**: Jupiter Swap API v6
- **Monitoring**: Node-cron automático

### Infrastructure
- **Backend Hosting**: Railway / Render / DigitalOcean
- **Frontend Hosting**: Vercel (recomendado)
- **Database**: Railway Postgres / Supabase / Neon
- **RPC**: Helius / QuickNode / Alchemy
- **DNS**: Cloudflare (recomendado)

---

## 📁 ESTRUCTURA DEL PROYECTO

```
Agent.fun/
├── backend/                      # Backend API (Puerto 3001)
│   ├── src/
│   │   ├── controllers/          # Controladores de rutas
│   │   │   └── tradingController.ts
│   │   ├── models/               # Modelos de base de datos
│   │   │   ├── Agent.ts
│   │   │   ├── TradingOrder.ts
│   │   │   └── VaultLending.ts
│   │   ├── routes/               # Definición de rutas
│   │   │   ├── agent.ts
│   │   │   ├── trading.ts
│   │   │   └── olympics.ts
│   │   ├── services/             # Lógica de negocio (CORE)
│   │   │   ├── priceFeed.ts      # Jupiter price integration
│   │   │   ├── tradingStrategy.ts # Trading signals
│   │   │   ├── riskManager.ts    # Risk management
│   │   │   ├── tradingEngine.ts  # Trade execution
│   │   │   └── orderManager.ts   # Order monitoring
│   │   ├── tests/                # Test suites
│   │   │   └── tradingSystemTest.ts
│   │   ├── database.ts           # Database config
│   │   └── index.ts              # Entry point
│   └── package.json
│
├── src/                          # Frontend React (Puerto 5173)
│   ├── components/               # Componentes UI
│   ├── pages/                    # Páginas principales
│   │   ├── Home.tsx
│   │   ├── CreateAgent.tsx
│   │   ├── Dashboard.tsx
│   │   └── RealityShow.tsx
│   ├── services/                 # API calls
│   └── App.tsx
│
├── DEV_GUIDE.md                  # Guía completa de desarrollo ⭐
├── QUICK_START.md                # Guía rápida (5 min) ⭐
└── README.md                     # Este archivo
```

### Archivos Clave

**Documentación:**
- `DEV_GUIDE.md` - Guía completa con setup, servicios, hosting
- `QUICK_START.md` - Inicio rápido para desarrolladores
- `README.md` - Visión general del proyecto

**Backend Core:**
- `backend/src/services/priceFeed.ts` - Integración Jupiter
- `backend/src/services/tradingEngine.ts` - Motor de trading
- `backend/src/services/riskManager.ts` - Gestión de riesgo
- `backend/src/index.ts` - Entry point del servidor

**Frontend:**
- `src/App.tsx` - Aplicación principal
- `src/pages/CreateAgent.tsx` - Creación de agentes
- `src/pages/RealityShow.tsx` - Stream en vivo

---

## 📚 DOCUMENTACIÓN

### Guías Principales

1. **QUICK_START.md** ⭐
   - Setup en 5 minutos
   - Comandos básicos
   - Primera ejecución

2. **DEV_GUIDE.md** ⭐⭐⭐
   - Arquitectura completa del sistema
   - Setup detallado backend y frontend
   - Todos los servicios y APIs explicados
   - Configuración de base de datos
   - Testing y troubleshooting
   - **Deployment a producción**
   - **Dominio personalizado**
   - **Hosting profesional (Railway, Vercel, etc.)**
   - **RPC providers (Helius, QuickNode)**

3. **README.md** (este archivo)
   - Visión general del proyecto
   - Estado actual
   - Enlaces a documentación

### APIs y Servicios

Para detalles completos sobre cada servicio, ver **DEV_GUIDE.md**:
- Price Feed Service (Jupiter)
- Trading Strategy (indicadores técnicos)
- Risk Manager (límites y validaciones)
- Trading Engine (ejecución de órdenes)
- Order Manager (monitoreo automático)

---

## 🚀 DEPLOYMENT

### Setup Local (Desarrollo)

Ver **QUICK_START.md** para instrucción paso a paso.

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd .. && npm install && npm run dev
```

### Deployment a Producción

Ver **DEV_GUIDE.md** sección "Deployment" para:

**Backend Options:**
- Railway ($5-20/mes) - Recomendado para empezar
- Render ($7-25/mes) - Alternativa
- DigitalOcean ($12-48/mes) - Para escalar

**Frontend:**
- Vercel (Gratis - $20/mes) - MEJOR opción
- Netlify (Gratis - $19/mes)
- Cloudflare Pages (Gratis)

**Database:**
- Railway Postgres (incluida con backend)
- Supabase (Gratis - $25/mes)
- Neon (Postgres serverless)

**RPC Solana:**
- Devnet público (desarrollo)
- Helius ($0-249/mes) - Recomendado producción
- QuickNode ($9-299/mes)
- Alchemy (Gratis - custom)

### Dominio Personalizado

**DEV_GUIDE.md** incluye configuración completa de:
- Compra de dominio (Namecheap, GoDaddy, Cloudflare)
- Configuración DNS para Vercel
- Subdominio para API (api.tudominio.com)
- Setup con Cloudflare (DDoS protection)
- SSL/HTTPS automático

**Ejemplo de estructura:**
```
tudominio.com       → Frontend (Vercel)
api.tudominio.com   → Backend (Railway)
```

---

## 🧪 TESTING

### Test del Sistema de Trading

```bash
cd backend
npx tsx src/tests/tradingSystemTest.ts
```

**Verifica:**
- ✅ Price Feed (conexión Jupiter)
- ✅ Trading Strategy (señales)
- ✅ Risk Manager (validaciones)
- ✅ Trading Engine (simulación)
- ✅ Database (conexión)

### Health Checks

```bash
# Backend
curl http://localhost:3001/health

# Precio de SOL
curl http://localhost:3001/api/trading/price/So11111111111111111111111111111111111111112
```

---

## 📊 MÉTRICAS DEL PROYECTO

### Código
- Backend: 7 servicios principales
- Frontend: 4 páginas principales
- Database: 3 modelos (Agent, TradingOrder, VaultLending)
- APIs: 15+ endpoints REST
- 100% TypeScript

### Integraciones
- Jupiter DEX (price + swap)
- Solana Web3.js
- Wallet Adapter
- Sequelize ORM

---

## 💡 PRÓXIMOS PASOS

1. **Lee QUICK_START.md** - Setup básico (5 min)
2. **Explora el código** - Backend services y frontend
3. **Lee DEV_GUIDE.md** - Documentación completa
4. **Testea localmente** - Verifica todo funciona
5. **Deploy a producción** - Sigue guía en DEV_GUIDE.md

---

## 🔗 RECURSOS

### Documentación Externa
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Jupiter API](https://station.jup.ag/docs/apis/swap-api)
- [Sequelize](https://sequelize.org/docs/v6/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

### Herramientas
- [Solana Explorer](https://explorer.solana.com/)
- [Jupiter Terminal](https://jup.ag/)
- [Solana Devnet Faucet](https://faucet.solana.com/)

---

## ✨ CRÉDITOS

**Desarrollado por [@nachoweb3](https://twitter.com/nachoweb3)** 💜

### Tecnologías
- Solana - Blockchain
- Jupiter - DEX Aggregator
- React - Frontend
- Node.js - Backend
- TypeScript - Language

---

## 📞 SOPORTE

### Documentación
1. **QUICK_START.md** - Inicio rápido
2. **DEV_GUIDE.md** - Guía completa
3. Issues en GitHub

### Troubleshooting
Ver sección "Troubleshooting" en **DEV_GUIDE.md**:
- Backend no inicia
- Errores de conexión Solana
- Database locked
- Y más...

---

**Built with ❤️ on Solana**

*Last updated: 2025-10-14*
*Status: Core Trading System Complete ✅*
