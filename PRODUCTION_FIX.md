# 🔧 Fix Producción - degenagent.fun

## 🐛 Problema Actual

La creación de agentes falla en https://www.degenagent.fun/create

## 🔍 Diagnóstico

### URLs Actuales:
- Frontend: https://www.degenagent.fun (Vercel)
- Backend: https://agent-fun.onrender.com (Render)
- Network: mainnet-beta

### Posibles Causas:
1. ❌ Backend no responde o está caído
2. ❌ CORS no configurado correctamente
3. ❌ Variables de entorno incorrectas
4. ❌ Código desactualizado en producción
5. ❌ Database no inicializada

---

## ✅ Solución Completa

### Paso 1: Verificar Backend

```bash
# Test backend health
curl https://agent-fun.onrender.com/health

# Debería responder:
# {"status":"ok","network":"mainnet-beta","blockHeight":...}
```

### Paso 2: Actualizar Variables de Entorno

#### Backend (Render Dashboard)
```env
# Render.com → agent-fun → Environment
PORT=3001
NODE_ENV=production
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
ALLOWED_ORIGINS=https://degenagent.fun,https://www.degenagent.fun
ENCRYPTION_MASTER_KEY=<tu_key_actual>
TREASURY_WALLET=<tu_wallet>
FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
```

#### Frontend (Vercel Dashboard)
```env
# Vercel → degenagent → Settings → Environment Variables
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_BACKEND_API=https://agent-fun.onrender.com/api
NEXT_PUBLIC_NETWORK=mainnet-beta
```

### Paso 3: Actualizar Código Backend

El backend necesita los cambios que hicimos localmente.

---

## 🚀 Deploy Actualizado

### Opción A: Deploy desde Local (Recomendado)

```bash
# 1. Commit cambios
git add .
git commit -m "fix: agent creation with database save and transaction signing"

# 2. Push a GitHub
git push origin main

# 3. Render auto-deploya desde GitHub
# Espera 2-3 minutos

# 4. Vercel auto-deploya desde GitHub  
# Espera 1-2 minutos
```

### Opción B: Deploy Manual

#### Backend (Render)
```bash
cd backend

# Build
npm run build

# Render CLI (si lo tienes instalado)
render deploy
```

#### Frontend (Vercel)
```bash
cd frontend

# Build
npm run build

# Vercel CLI
vercel --prod
```

---

## 🔧 Fixes Críticos para Producción

### 1. Backend CORS Fix

**Archivo:** `backend/src/index.ts`

```typescript
// ANTES (puede causar problemas)
app.use(cors());

// DESPUÉS (más seguro)
app.use(cors({
  origin: [
    'https://degenagent.fun',
    'https://www.degenagent.fun',
    'http://localhost:3000' // solo para testing
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

### 2. Frontend API URL Fix

**Archivo:** `frontend/app/create/page.tsx`

```typescript
// Asegurar que usa la variable de entorno
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

console.log('Using backend:', BACKEND_API); // Para debug
```

### 3. Error Handling Mejorado

**Archivo:** `frontend/app/create/page.tsx`

```typescript
try {
  console.log('Creating agent...');
  console.log('Backend URL:', BACKEND_API);
  
  const response = await axios.post(`${BACKEND_API}/agent/create`, {
    name: formData.name,
    symbol: formData.symbol,
    purpose: formData.purpose,
    creatorWallet: publicKey.toString(),
    riskTolerance: formData.riskTolerance,
    tradingFrequency: formData.tradingFrequency,
    maxTradeSize: formData.maxTradeSize,
  });

  console.log('Response:', response.data);
  
  // ... resto del código
  
} catch (err: any) {
  console.error('Full error:', err);
  console.error('Error response:', err.response?.data);
  console.error('Error status:', err.response?.status);
  
  let errorMessage = 'Failed to create agent';
  
  if (err.response?.status === 404) {
    errorMessage = 'Backend API not found. Please check backend URL.';
  } else if (err.response?.status === 500) {
    errorMessage = 'Server error: ' + (err.response?.data?.details || err.response?.data?.error);
  } else if (err.code === 'ERR_NETWORK') {
    errorMessage = 'Cannot connect to backend. Backend may be down.';
  } else {
    errorMessage = err.response?.data?.error || err.message;
  }
  
  setError(errorMessage);
}
```

---

## 📝 Checklist de Deploy

### Pre-Deploy
- [ ] Todos los cambios commiteados
- [ ] Variables de entorno configuradas
- [ ] Backend builds localmente sin errores
- [ ] Frontend builds localmente sin errores

### Deploy Backend (Render)
- [ ] Push a GitHub
- [ ] Render detecta cambios y deploya
- [ ] Esperar build completo (~3 min)
- [ ] Verificar logs en Render dashboard
- [ ] Test health endpoint: `curl https://agent-fun.onrender.com/health`

### Deploy Frontend (Vercel)
- [ ] Push a GitHub (si no lo hiciste ya)
- [ ] Vercel detecta cambios y deploya
- [ ] Esperar build completo (~2 min)
- [ ] Verificar en Vercel dashboard
- [ ] Test sitio: https://www.degenagent.fun

### Post-Deploy
- [ ] Test crear agente en producción
- [ ] Verificar logs de errores
- [ ] Monitorear primeras transacciones

---

## 🐛 Debug en Producción

### Ver Logs Backend (Render)
```
1. Ir a Render Dashboard
2. Click en "agent-fun"
3. Tab "Logs"
4. Buscar errores en tiempo real
```

### Ver Logs Frontend (Vercel)
```
1. Abrir https://www.degenagent.fun/create
2. F12 → Console
3. Intentar crear agente
4. Ver errores en consola
```

### Comandos de Test
```bash
# Test backend health
curl https://agent-fun.onrender.com/health

# Test backend CORS
curl -H "Origin: https://www.degenagent.fun" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://agent-fun.onrender.com/api/agent/create

# Test crear agente (necesitas un wallet)
curl -X POST https://agent-fun.onrender.com/api/agent/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestAgent",
    "symbol": "TEST",
    "purpose": "Test agent",
    "creatorWallet": "TU_WALLET_AQUI",
    "riskTolerance": 5,
    "tradingFrequency": "medium",
    "maxTradeSize": 10
  }'
```

---

## 🚨 Errores Comunes y Soluciones

### Error: "Failed to fetch" o "Network Error"
**Causa:** Backend no responde o CORS mal configurado
**Solución:**
1. Verificar backend está corriendo: `curl https://agent-fun.onrender.com/health`
2. Verificar CORS en `backend/src/index.ts`
3. Redeploy backend

### Error: "signature verification failed"
**Causa:** Código desactualizado (no tiene el fix)
**Solución:**
1. Asegurar que backend tiene los cambios de `agentController.ts` y `solana.ts`
2. Redeploy backend

### Error: "Agent not found after creation"
**Causa:** Database no guarda el agente
**Solución:**
1. Verificar que `Agent.create()` está en el código
2. Verificar logs de database en Render
3. Redeploy backend

### Error: "ENCRYPTION_MASTER_KEY not set"
**Causa:** Variable de entorno falta
**Solución:**
1. Ir a Render Dashboard → Environment
2. Agregar `ENCRYPTION_MASTER_KEY` con un valor seguro
3. Redeploy

---

## ✅ Verificación Final

Después de deploy, verificar:

```bash
# 1. Backend health
curl https://agent-fun.onrender.com/health
# ✅ Debe responder con status: "ok"

# 2. Frontend carga
curl -I https://www.degenagent.fun
# ✅ Debe responder 200 OK

# 3. CORS funciona
curl -H "Origin: https://www.degenagent.fun" \
     -I https://agent-fun.onrender.com/api/agent/all
# ✅ Debe incluir Access-Control-Allow-Origin header

# 4. Crear agente en UI
# ✅ Abrir https://www.degenagent.fun/create
# ✅ Conectar wallet
# ✅ Llenar formulario
# ✅ Crear agente
# ✅ Debe redirigir a página del agente
```

---

## 📊 Monitoreo Post-Deploy

### Métricas a Vigilar:
- Response time del backend (<500ms)
- Error rate (<1%)
- Successful agent creations
- Database connections
- Memory usage

### Herramientas:
- Render Dashboard (logs y métricas)
- Vercel Analytics
- Browser DevTools (errores frontend)

---

## 🆘 Si Nada Funciona

### Plan B: Rollback
```bash
# Volver a versión anterior que funcionaba
git revert HEAD
git push origin main
```

### Plan C: Debug Intensivo
```bash
# Clonar repo en otra máquina
git clone <tu-repo>
cd Agent.fun

# Test local
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev

# Si funciona local pero no en prod = problema de deploy/env vars
```

---

## 📞 Necesitas Ayuda?

1. Revisa logs de Render
2. Revisa consola del browser
3. Comparte el error exacto
4. Comparte logs del backend

---

**Status:** 🔴 PRODUCCIÓN CON ERRORES

**Acción Inmediata:** Deploy código actualizado con fixes
