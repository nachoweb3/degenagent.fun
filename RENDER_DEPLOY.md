# 🚀 DEPLOY EN RENDER.COM (MÁS FÁCIL QUE RAILWAY)

## ✅ Ventajas de Render:
- Más estable que Railway
- Deploy desde GitHub automático
- 750 horas gratis/mes
- Setup más simple

---

## 📝 PASOS PARA DEPLOYAR:

### 1. Ve a Render
https://render.com/

### 2. Sign Up / Login
- Click **"Get Started"** o **"Sign In"**
- Usa tu cuenta de GitHub

### 3. Conecta GitHub
- Autoriza Render a acceder a tus repos
- Selecciona **"All repositories"** o solo **"agent-fun"**

### 4. Create New Web Service
- Click **"New +"** → **"Web Service"**
- Busca y selecciona: **`agent-fun`**

### 5. Configuración:
```
Name: agent-fun-backend
Region: Oregon (US West) o el más cercano
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### 6. Plan:
Selecciona **"Free"** ($0/mes)

### 7. Variables de Entorno
Click **"Advanced"** y agrega:

```
PORT=10000
NODE_ENV=production
RPC_ENDPOINT=https://api.devnet.solana.com
FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
TREASURY_WALLET=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
ENCRYPTION_MASTER_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
```

### 8. Create Web Service
- Click **"Create Web Service"**
- Render empezará a deployar automáticamente
- Espera 3-5 minutos

### 9. Tu URL
Render te dará una URL tipo:
```
https://agent-fun-backend.onrender.com
```

### 10. Verifica
Visita: `https://tu-url.onrender.com/health`

Deberías ver:
```json
{"status":"ok","network":"https://api.devnet.solana.com"}
```

---

## 🔄 Actualizar Vercel

1. Ve a: https://vercel.com/nachodacals-projects/frontend/settings/environment-variables
2. Actualiza `NEXT_PUBLIC_BACKEND_API`:
   ```
   NEXT_PUBLIC_BACKEND_API=https://tu-url.onrender.com/api
   ```
3. Guarda y **Redeploy**

---

## 🎉 ¡Listo!

Tu stack completo estará funcionando:
- ✅ Frontend en Vercel
- ✅ Backend en Render
- ✅ 100% Gratis para empezar

---

## 💡 Nota sobre Render Free Tier:
- El servicio se "duerme" después de 15 minutos de inactividad
- La primera request después de dormir toma ~30 segundos en despertar
- Después funciona normal
- Para evitar esto: Upgrade a plan pagado ($7/mes) o usa un cron job para mantenerlo despierto

---

## 🆘 Problemas?

### Build falla:
- Verifica que todas las dependencias estén en package.json
- Chequea los logs en Render Dashboard

### Health check falla:
- Verifica que el puerto sea 10000 (Render lo requiere)
- Chequea las variables de entorno

### No encuentra el repo:
- Reconecta GitHub en Render Settings
- Asegúrate que el repo sea público o que Render tenga acceso
