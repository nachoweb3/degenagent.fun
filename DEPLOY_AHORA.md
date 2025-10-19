# 🚀 DEPLOY BACKEND AHORA - Paso Final

## ✅ YA TIENES:
- ✅ Código en GitHub: https://github.com/nachoweb3/degenagent.fun
- ✅ Frontend LIVE: https://www.degenagent.fun
- ✅ Todo compilado y listo

---

## 🎯 ÚLTIMO PASO: Deploy Backend en Render (10 min)

### Paso 1: Ir a Render
**Abre:** https://dashboard.render.com/

### Paso 2: Crear Web Service
1. Click **"New +"** → **"Web Service"**
2. Click **"Connect GitHub"** (primera vez)
3. Autoriza Render en GitHub
4. Busca y selecciona: **nachoweb3/degenagent.fun**

### Paso 3: Configuración
Copia exactamente esto:

```
Name: degenagent-backend
Region: Oregon (o el más cercano)
Branch: main
Runtime: Node

Root Directory: backend

Build Command: npm install && npm run build

Start Command: npm start

Plan: Free
```

### Paso 4: Variables de Entorno
Click **"Advanced"** → **"Add Environment Variable"**

Agrega TODAS estas (una por una):

```
RPC_ENDPOINT
https://api.devnet.solana.com

NODE_ENV
production

PORT
3001

ALLOWED_ORIGINS
https://www.degenagent.fun,https://degenagent.fun,http://localhost:3000

TREASURY_WALLET
46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez

ADMIN_WALLET_ADDRESS
46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez

ENCRYPTION_MASTER_KEY
10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3

ENCRYPTION_KEY
10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3

FACTORY_PROGRAM_ID
Factory11111111111111111111111111111111111

MANAGER_PROGRAM_ID
Manager11111111111111111111111111111111111

COMMISSION_RATE
0.5

REFERRAL_COMMISSION_RATE
10

MIN_TRADE_FOR_COMMISSION
10
```

### Paso 5: Deploy
1. Click **"Create Web Service"**
2. Espera 5-10 minutos (verás logs en tiempo real)
3. **COPIA LA URL** cuando termine (ejemplo: https://degenagent-backend.onrender.com)

---

## 🔗 Conectar Backend con Frontend

Cuando tengas la URL de Render, ejecuta:

```powershell
cd C:\Users\Usuario\Desktop\Agent.fun\frontend

vercel env rm NEXT_PUBLIC_BACKEND_API production --yes

# Reemplaza BACKEND_URL con tu URL de Render
echo "https://TU-BACKEND-URL.onrender.com/api" | vercel env add NEXT_PUBLIC_BACKEND_API production

vercel --prod
```

---

## ✅ Verificar Todo Funciona

### 1. Backend Health:
```bash
curl https://TU-BACKEND-URL.onrender.com/health
```

Debe responder:
```json
{"status":"ok","network":"https://api.devnet.solana.com",...}
```

### 2. Frontend:
- Abre: https://www.degenagent.fun/create
- Conecta wallet
- Intenta crear un agente

### 3. Get Devnet SOL:
https://faucet.solana.com/

---

## 🎉 DESPUÉS DE ESO:

¡Tu plataforma estará 100% LIVE!

- Frontend: ✅ www.degenagent.fun
- Backend: ✅ Tu URL de Render
- Database: ✅ SQLite en Render
- Network: ✅ Solana Devnet

---

## 📞 Si algo falla:

**Backend no inicia:**
- Revisa logs en Render Dashboard
- Verifica que pusiste TODAS las variables
- Chequea que Root Directory = backend

**CORS error:**
- Espera 1-2 minutos después del deploy
- Verifica ALLOWED_ORIGINS incluye www.degenagent.fun

**Frontend no conecta:**
- Verifica que actualizaste Vercel con la URL correcta
- Redeploy frontend: `vercel --prod`

---

**EMPIEZA AQUÍ:** https://dashboard.render.com/

¡Estás a 10 minutos de tener todo online! 🚀
