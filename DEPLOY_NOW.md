# 🚀 DEPLOY TO PRODUCTION IN 15 MINUTES

Tu dApp está **LISTA PARA PRODUCCIÓN**. Solo necesitas deployar.

---

## ⚡ OPCIÓN RÁPIDA: Deploy en 15 minutos

### 1. Frontend a Vercel (5 min) - GRATIS

```bash
# Instala Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy desde la carpeta frontend
cd frontend
vercel --prod
```

Cuando te pregunte:
- Set up and deploy? **YES**
- Project name? **agent-fun**
- Directory? **.** (punto)
- Override settings? **NO**

**Variables de entorno en Vercel:**
Ve a Vercel Dashboard → Settings → Environment Variables y agrega:
```
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_BACKEND_API=https://tu-backend.railway.app/api
```

### 2. Backend a Railway (10 min) - $5/mes

1. Ve a https://railway.app
2. Login con GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Si no tienes repo en GitHub aún:
   ```bash
   # Crear repo en GitHub first
   # Luego push local code
   git remote add origin https://github.com/tu-usuario/agent-fun.git
   git branch -M main
   git commit -m "Initial commit"
   git push -u origin main
   ```
5. Selecciona tu repo
6. Root Directory: **backend**
7. Start Command: **npm start**
8. Agrega variables de entorno:
   ```
   PORT=3001
   RPC_ENDPOINT=https://api.devnet.solana.com
   FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
   MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
   TREASURY_WALLET=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
   ENCRYPTION_MASTER_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
   NODE_ENV=production
   ```
9. Click **Deploy**

Railway te dará una URL tipo: `https://agent-fun-production.up.railway.app`

### 3. Conectar Frontend con Backend (2 min)

Vuelve a Vercel:
1. Settings → Environment Variables
2. Actualiza `NEXT_PUBLIC_BACKEND_API` con la URL de Railway
3. Redeploy: Deployments → **Redeploy**

---

## ✅ VERIFICAR

### Frontend
Visita tu URL de Vercel: `https://agent-fun.vercel.app`

Deberías ver:
- ✅ Landing page funciona
- ✅ Efecto Matrix en /create
- ✅ Wallet connect funciona
- ✅ Footer con @nachoweb3

### Backend
Visita: `https://tu-backend.railway.app/health`

Debe retornar:
```json
{"status":"ok","network":"https://api.devnet.solana.com","blockHeight":123456}
```

### Test End-to-End
1. Conecta wallet (Phantom en Devnet)
2. Crea un agente de prueba
3. Verifica que funcione

---

## 💰 COSTOS

| Servicio | Costo | Límites |
|----------|-------|---------|
| Vercel | **$0** | 100 GB bandwidth/mes |
| Railway | **$5/mes** | $5 crédito gratis primero |
| **TOTAL** | **$0-5/mes** | Para empezar |

### Cuando crezcas:
- Vercel Pro: $20/mes (más bandwidth)
- Railway Pro: $20/mes (más compute)
- **Total: $40/mes** para 10K+ usuarios

---

## 🎯 ALTERNATIVA SIN GITHUB

Si no quieres usar GitHub:

### Frontend (Vercel sin GitHub)
```bash
cd frontend
vercel --prod
```
Vercel sube directamente desde tu PC.

### Backend (Render.com - alternativa a Railway)
1. Ve a https://render.com
2. New Web Service
3. Sube tu código directamente (ZIP)
4. Root directory: **backend**
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Variables de entorno (igual que Railway)

---

## 📊 DESPUÉS DEL DEPLOY

### Monitoreo Gratis
- **Railway Logs**: Ver logs en tiempo real
- **Vercel Analytics**: Ver visitas y errores
- **Solscan**: Monitorear transacciones

### Marketing Rápido
1. **Twitter**: Anuncia con demo
2. **Product Hunt**: Sube tu producto
3. **Reddit**: r/solana, r/CryptoCurrency
4. **Discord/Telegram**: Crea comunidad

---

## 💵 MONETIZACIÓN

### Revenue Streams
1. **Creation fee**: 0.5 SOL/agente = $50
2. **Trading fee**: 1% por trade
3. **Premium**: $99/mes (futuro)

### Break-even
- 10 agentes = $500
- 30 agentes = $1,500
- 100 agentes = $5,000
- 1000 agentes = $50,000

**Solo con creation fees!** Trading fees pueden ser 2-5x más.

---

## 🚀 MAINNET (Cuando estés listo)

Para pasar de devnet a mainnet:

1. **Costo**: ~20 SOL ($2,000) para deploy contracts
2. **Tiempo**: 1 hora con scripts automatizados
3. **Guía**: Ver `INSTALLATION_GUIDE.md`

**Cambios necesarios:**
```bash
# En variables de entorno
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_NETWORK=mainnet
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

Usa RPC premium (Helius/QuickNode) para mejor performance.

---

## ❓ PROBLEMAS COMUNES

### "Failed to fetch backend"
- Verifica URL backend en Vercel env vars
- Chequea CORS en backend
- Verifica que Railway esté corriendo

### "Wallet connection failed"
- Asegúrate que Phantom esté en Devnet
- Verifica RPC endpoint en env vars
- Prueba con diferentes wallets

### "Transaction failed"
- Verifica que tengas SOL en devnet
- Solicita airdrop: `solana airdrop 2`
- Verifica Program IDs

---

## 🎉 ¡LISTO!

**Total tiempo: 15-20 minutos**

Después del deploy tendrás:

✅ dApp en producción
✅ URL pública compartible
✅ Backend escalable
✅ Listo para usuarios reales
✅ Costo: $0-5/mes

**Siguiente paso:** Marketing + iterar según feedback

---

## 📞 RECURSOS

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Solana Devnet Faucet](https://solfaucet.com)
- [Quick Deploy Guide](./QUICK_DEPLOY.md)

---

**Built with ❤️ on Solana by @nachoweb3**

*¿Listo para ganar dinero? Deploy ahora! 🚀*
