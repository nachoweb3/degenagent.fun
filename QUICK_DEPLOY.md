# 🚀 QUICK DEPLOY TO PRODUCTION

## Objetivo: Estar en producción en 30 minutos

---

## 📦 PASO 1: Deploy Frontend a Vercel (5 minutos)

### Opción A: Vercel CLI (Más Rápido)

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
cd C:\Users\Usuario\Desktop\Agent.fun\frontend
vercel
```

4. Sigue las instrucciones:
   - Set up and deploy? **YES**
   - Which scope? **Tu cuenta personal**
   - Link to existing project? **NO**
   - Project name? **agent-fun** (o el que quieras)
   - Directory? **.**
   - Override settings? **NO**

5. ¡Listo! Te dará una URL tipo: `https://agent-fun.vercel.app`

### Opción B: Vercel Dashboard (Más Fácil)

1. Ve a: https://vercel.com/new
2. Conecta tu GitHub
3. **Sube el repositorio** o importa desde GitHub
4. Configuración:
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Variables de entorno:
   ```
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
   NEXT_PUBLIC_NETWORK=devnet
   NEXT_PUBLIC_BACKEND_API=https://TU-BACKEND.railway.app/api
   ```
6. Click **Deploy**

---

## 📦 PASO 2: Deploy Backend a Railway (10 minutos)

### Método: Railway Dashboard

1. Ve a: https://railway.app/
2. Crea cuenta / Login con GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Selecciona o sube tu repo `Agent.fun`
5. Configuración:
   - Root Directory: **backend**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Variables de entorno (Settings → Variables):
   ```
   PORT=3001
   RPC_ENDPOINT=https://api.devnet.solana.com
   FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
   MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
   TREASURY_WALLET=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
   ENCRYPTION_MASTER_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
   NODE_ENV=production
   ```
7. Click **Deploy**
8. Espera 2-3 minutos
9. Railway te dará una URL: `https://agent-fun-backend-production.up.railway.app`

---

## 📦 PASO 3: Conectar Frontend con Backend (2 minutos)

1. Copia la URL del backend de Railway
2. Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables
3. Actualiza o agrega:
   ```
   NEXT_PUBLIC_BACKEND_API=https://TU-BACKEND.railway.app/api
   ```
4. Redeploy frontend:
   - En Vercel Dashboard: Deployments → Three dots → Redeploy

---

## 📦 PASO 4: Executor Service (Opcional - para trading automático)

Si quieres que los agentes hagan trading automático:

### Railway Worker Service

1. En Railway, click **New Service**
2. Selecciona tu repo
3. Configuración:
   - Root Directory: **executor**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Variables de entorno:
   ```
   RPC_ENDPOINT=https://api.devnet.solana.com
   BACKEND_API=https://TU-BACKEND.railway.app/api
   OPENAI_API_KEY=tu-openai-key
   CHECK_INTERVAL=300000
   ```
5. Deploy

---

## ✅ VERIFICACIÓN

### 1. Check Frontend

Visita: `https://tu-app.vercel.app`

Deberías ver:
- Landing page con diseño
- Efecto Matrix en /create
- Botón "Connect Wallet"

### 2. Check Backend

Visita: `https://tu-backend.railway.app/health`

Debería retornar:
```json
{
  "status": "ok",
  "network": "https://api.devnet.solana.com",
  "blockHeight": 123456789
}
```

### 3. Test End-to-End

1. Conecta wallet (configura Phantom a Devnet)
2. Ve a "Create Agent"
3. Crea un agente de prueba
4. Verifica que se cree correctamente

---

## 🔧 TROUBLESHOOTING

### Error: "Failed to fetch backend"

**Solución:**
1. Verifica que el backend esté corriendo en Railway
2. Verifica la URL en variables de entorno de Vercel
3. Chequea CORS en backend

### Error: "Wallet connection failed"

**Solución:**
1. Asegúrate de que Phantom esté en Devnet
2. Verifica RPC_ENDPOINT en variables de entorno
3. Prueba con diferentes wallets (Solflare, etc)

### Error: "Transaction failed"

**Solución:**
1. Verifica que tengas SOL en devnet
2. Solicita airdrop: `solana airdrop 2`
3. Verifica Program IDs en backend

---

## 💰 COSTOS

| Servicio | Costo Mensual | Límites Gratis |
|----------|---------------|----------------|
| **Vercel** | $0 | 100 GB bandwidth, builds ilimitados |
| **Railway** | $5 | $5 crédito gratis/mes, después $0.000231/min |
| **Total Inicio** | **~$0-5/mes** | Suficiente para 1000+ usuarios |

### Cuando Crezcas:

- Railway Pro: $20/mes (más recursos)
- Vercel Pro: $20/mes (más bandwidth)
- **Total:** $40/mes para 10K+ usuarios

---

## 🚀 MAINNET DEPLOYMENT (Cuando Estés Listo)

### Costo de Deploy a Mainnet:
- Program deployment: ~2-3 SOL ($200-300)
- Testing en mainnet: ~0.5 SOL ($50)
- **Total:** ~$250-350

### Pasos:

1. Compila smart contract para mainnet:
```bash
anchor build
anchor deploy --provider.cluster mainnet
```

2. Actualiza variables de entorno:
```
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_NETWORK=mainnet
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

3. Usa RPC privado para mejor performance:
   - **Helius**: https://helius.dev/ (gratis hasta 100k requests/day)
   - **QuickNode**: https://quicknode.com/ (desde $9/mes)
   - **Alchemy**: https://alchemy.com/ (gratis hasta 300M compute units)

---

## 📊 MONITORING (Recomendado)

### Free Tools:

1. **Railway Logs**: Ver logs en tiempo real
2. **Vercel Analytics**: Ver pageviews, errores
3. **Solscan**: Monitorear transacciones on-chain
4. **Sentry** (gratis 5k events/mes): Error tracking

### Setup Sentry (opcional):

```bash
npm install @sentry/nextjs @sentry/node
```

Agrega en frontend y backend para tracking de errores.

---

## 🎯 CHECKLIST PRE-LAUNCH

- [ ] Frontend deployed a Vercel
- [ ] Backend deployed a Railway
- [ ] Health check responde OK
- [ ] Wallet conecta correctamente
- [ ] Crear agente funciona en devnet
- [ ] Todas las páginas cargan (/, /create, /explore)
- [ ] Responsive en mobile
- [ ] Error handling funciona
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente

---

## 📱 MARKETING RÁPIDO (Post-Launch)

1. **Twitter Thread:**
   - Anuncia el launch
   - Demo de crear un agente
   - Tag: @solana, @phantom, crypto influencers

2. **Product Hunt:**
   - Sube a Product Hunt
   - Pide upvotes a amigos

3. **Reddit:**
   - r/solana
   - r/CryptoCurrency
   - r/SolanaNFT

4. **Discord/Telegram:**
   - Crea comunidad
   - Invita early adopters

---

## 💵 MONETIZACIÓN

### Modelo de Revenue:

1. **Fees por creación**: 0.5 SOL por agente = **$50**
2. **Trading fees**: 1% de cada trade
3. **Token supply**: Hold 10% de cada agent token

### Proyecciones:

| Agentes Creados | Revenue |
|----------------|---------|
| 10 agentes | $500 |
| 100 agentes | $5,000 |
| 1,000 agentes | $50,000 |

**Solo con creation fees!** Trading fees pueden ser 2-5x más.

---

## 🎉 ¡LISTO!

**Tiempo total: ~30-45 minutos**

Una vez deployado:

1. ✅ Tienes una dApp funcionando en producción
2. ✅ Usuarios pueden conectar wallets
3. ✅ Pueden crear agentes AI
4. ✅ Todo on-chain en Solana
5. ✅ Costo: $0-5/mes para empezar

**Siguiente paso:** Marketing + iterar según feedback

---

**¿Necesitas ayuda con algún paso?** ¡Avísame!
