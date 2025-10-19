# 🚀 DEPLOYMENT SIMPLE - PASO A PASO

Ya que Railway no funciona por el plan gratuito, voy a preparar todo para Render.

## ✅ LO QUE YA ESTÁ HECHO:

1. ✅ Backend construido sin errores
2. ✅ Frontend construido sin errores
3. ✅ Vercel CLI instalado y funcionando
4. ✅ Variables de entorno configuradas
5. ✅ Dominio www.degenagent.fun configurado

---

## 🎯 SOLO NECESITAS HACER ESTO:

### OPCIÓN 1: Render Dashboard (MÁS FÁCIL - 10 minutos)

#### Paso 1: Ir a Render
1. Abre: https://dashboard.render.com/
2. Crea cuenta (gratis) o inicia sesión
3. Click en "New +" → "Web Service"

#### Paso 2: Conectar Código
Tienes 2 opciones:

**Opción A - GitHub (Recomendado si funciona):**
- Click "Connect GitHub"
- Autoriza Render
- Selecciona el repositorio agent-fun

**Opción B - Sin GitHub:**
- Click "Public Git repository"
- Pega esta URL: `https://github.com/nachoweb3/agent-fun`

#### Paso 3: Configurar Servicio

Copia y pega exactamente esto:

```
Name: degenagent-backend
Runtime: Node
Build Command: cd backend && npm install && npm run build
Start Command: cd backend && npm start
Plan: Free
```

#### Paso 4: Variables de Entorno

Click en "Advanced" → "Add Environment Variable"

Copia TODAS estas líneas (una por una):

```
RPC_ENDPOINT=https://api.devnet.solana.com
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://www.degenagent.fun,https://degenagent.fun,http://localhost:3000
TREASURY_WALLET=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
ADMIN_WALLET_ADDRESS=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
ENCRYPTION_MASTER_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
ENCRYPTION_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
COMMISSION_RATE=0.5
REFERRAL_COMMISSION_RATE=10
MIN_TRADE_FOR_COMMISSION=10
```

#### Paso 5: Deploy
- Click "Create Web Service"
- Espera 5-10 minutos
- **COPIA LA URL** que te da (ejemplo: `https://degenagent-backend.onrender.com`)

---

### OPCIÓN 2: Comandos Automáticos (Más Rápido)

Abre PowerShell en esta carpeta y ejecuta:

```powershell
# 1. Actualizar Vercel con la URL que te dio Render
cd C:\Users\Usuario\Desktop\Agent.fun\frontend

# 2. Primero necesito que me des la URL de Render
# Cuando tengas la URL de Render, ejecuta:
# (Reemplaza TU_URL_RENDER con la URL real)

vercel env rm NEXT_PUBLIC_BACKEND_API production --yes
echo "TU_URL_RENDER/api" | vercel env add NEXT_PUBLIC_BACKEND_API production
vercel --prod
```

---

## 📋 CHECKLIST FINAL

Después de que Render termine el deploy:

- [ ] Backend URL recibida de Render
- [ ] Vercel actualizado con nueva backend URL
- [ ] Frontend redeployado
- [ ] Verificar: `curl TU_BACKEND_URL/health`
- [ ] Abrir: https://www.degenagent.fun/create
- [ ] Conectar wallet
- [ ] Crear agente de prueba

---

## 🆘 SI ALGO FALLA

### Render dice "Build failed"
- Revisa los logs en Render dashboard
- Asegúrate que pusiste todas las variables de entorno
- Verifica que el Build Command es correcto

### Vercel no actualiza
- Ejecuta: `vercel env ls production`
- Verifica que `NEXT_PUBLIC_BACKEND_API` apunta a Render
- Redeploy manual en dashboard

### "CORS error" en el navegador
- Verifica que `ALLOWED_ORIGINS` en Render incluye www.degenagent.fun
- Espera 1-2 minutos después del deploy

---

## 💡 LO MÁS IMPORTANTE

**PASO 1:** Ve a Render y crea el Web Service
**PASO 2:** Cuando termine, copia la URL
**PASO 3:** Actualiza Vercel con esa URL
**PASO 4:** Redeploy frontend
**PASO 5:** ¡Prueba en www.degenagent.fun!

---

**¿Necesitas ayuda?** Dime en qué paso estás y te ayudo.
