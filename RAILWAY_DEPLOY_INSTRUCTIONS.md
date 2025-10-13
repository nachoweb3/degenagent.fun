# 🚂 INSTRUCCIONES PARA DEPLOY EN RAILWAY

## 📝 Pasos para deployar el backend:

### 1. Ve a Railway
Abre: https://railway.app/new

### 2. Selecciona "Deploy from GitHub repo"
- Click en "Deploy from GitHub repo"
- Busca y selecciona: **agent-fun**

### 3. Configuración del Servicio
Railway detectará automáticamente el proyecto. Configura:

**Root Directory:** `backend`

**Build Command:** (Railway lo detecta automáticamente)
```
npm install && npm run build
```

**Start Command:** (Railway lo detecta automáticamente)
```
npm start
```

### 4. Variables de Entorno
En Railway, ve a **Settings → Variables** y agrega:

```env
PORT=3001
NODE_ENV=production
RPC_ENDPOINT=https://api.devnet.solana.com
FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
TREASURY_WALLET=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
ENCRYPTION_MASTER_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
```

### 5. Deploy
- Click **Deploy**
- Espera 2-3 minutos
- Railway te dará una URL tipo: `https://agent-fun-backend-production.up.railway.app`

### 6. Verifica el Deploy
Una vez que el deploy termine, visita:
```
https://TU-URL-DE-RAILWAY.railway.app/health
```

Deberías ver:
```json
{
  "status": "ok",
  "network": "https://api.devnet.solana.com",
  "blockHeight": 123456789
}
```

### 7. Actualiza Vercel
1. Ve a Vercel: https://vercel.com/nachodacals-projects/frontend/settings/environment-variables
2. Actualiza la variable `NEXT_PUBLIC_BACKEND_API` con tu URL de Railway:
   ```
   NEXT_PUBLIC_BACKEND_API=https://TU-URL-DE-RAILWAY.railway.app/api
   ```
3. Guarda y redeploy el frontend

---

## 🎉 ¡Listo!

Tu stack completo estará en producción:
- ✅ Frontend en Vercel
- ✅ Backend en Railway
- ✅ Todo conectado y funcionando

---

## 💰 Costos

- **Railway:** $5/mes (incluye $5 crédito gratis el primer mes)
- **Vercel:** $0 (plan gratuito)
- **Total:** $0-5/mes para empezar

---

## 🆘 Ayuda

Si tienes problemas:
1. Chequea los logs en Railway Dashboard
2. Verifica que todas las variables de entorno estén configuradas
3. Verifica que el health check responda
