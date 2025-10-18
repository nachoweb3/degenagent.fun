# 🚀 DEPLOY AHORA - Pasos Exactos

## ⚡ Solución Rápida (5 minutos)

### 1. Commit y Push (1 min)
```bash
cd c:\Users\Usuario\Desktop\Agent.fun

git add .
git commit -m "fix: production agent creation with CORS and database save"
git push origin main
```

### 2. Esperar Auto-Deploy (3-4 min)
- ✅ Render detecta push y deploya backend automáticamente
- ✅ Vercel detecta push y deploya frontend automáticamente

### 3. Verificar (1 min)
```bash
# Test backend
curl https://agent-fun.onrender.com/health

# Debe responder:
# {"status":"ok","network":"mainnet-beta",...}
```

### 4. Test en Producción
1. Abrir: https://www.degenagent.fun/create
2. Conectar wallet
3. Crear agente
4. ✅ Debe funcionar!

---

## 🔧 Si Auto-Deploy No Funciona

### Opción A: Deploy Manual Backend (Render)

```bash
# 1. Ir a Render Dashboard
https://dashboard.render.com/

# 2. Click en "agent-fun"

# 3. Click "Manual Deploy" → "Deploy latest commit"

# 4. Esperar 2-3 minutos

# 5. Verificar logs
```

### Opción B: Deploy Manual Frontend (Vercel)

```bash
# 1. Ir a Vercel Dashboard
https://vercel.com/dashboard

# 2. Click en "degenagent"

# 3. Click "Deployments"

# 4. Click "Redeploy" en el último deployment

# 5. Esperar 1-2 minutos
```

---

## 📋 Checklist Post-Deploy

### Backend ✅
- [ ] Health endpoint responde: `curl https://agent-fun.onrender.com/health`
- [ ] Logs no muestran errores
- [ ] Database conectada
- [ ] CORS configurado

### Frontend ✅
- [ ] Sitio carga: https://www.degenagent.fun
- [ ] Página create carga: https://www.degenagent.fun/create
- [ ] Wallet se puede conectar
- [ ] No hay errores en consola (F12)

### Integración ✅
- [ ] Frontend puede llamar al backend
- [ ] Crear agente funciona
- [ ] Transaction se firma correctamente
- [ ] Redirect funciona después de crear

---

## 🐛 Debug Si Falla

### Ver Logs Backend
```
1. https://dashboard.render.com/
2. Click "agent-fun"
3. Tab "Logs"
4. Buscar líneas rojas (errores)
```

### Ver Logs Frontend
```
1. Abrir https://www.degenagent.fun/create
2. Presionar F12
3. Tab "Console"
4. Intentar crear agente
5. Ver errores
```

### Errores Comunes

**Error: "Network Error"**
```
Causa: Backend no responde
Solución: Verificar backend está corriendo en Render
```

**Error: "CORS policy"**
```
Causa: CORS mal configurado
Solución: Ya está arreglado en el código, solo redeploy
```

**Error: "signature verification failed"**
```
Causa: Código viejo en producción
Solución: Redeploy con código nuevo
```

---

## ✅ Cambios Aplicados

### Backend (`backend/src/index.ts`)
```typescript
// CORS mejorado para producción
app.use(cors({
  origin: [
    'https://degenagent.fun',
    'https://www.degenagent.fun',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

### Backend (`backend/src/controllers/agentController.ts`)
```typescript
// Guarda agente en database
const agent = await Agent.create({
  onchainId,
  name,
  purpose,
  owner: creatorWallet,
  // ... todos los campos
});

// Retorna tokenMintKeypair
res.json({
  agentId: agent.id,
  tokenMintKeypair: result.tokenMintKeypair,
  // ...
});
```

### Backend (`backend/src/services/solana.ts`)
```typescript
// No firma parcialmente, retorna keypair
const tokenMintKeypair = {
  publicKey: tokenMint.publicKey.toString(),
  secretKey: Array.from(tokenMint.secretKey)
};

return {
  // ...
  tokenMintKeypair
};
```

### Frontend (`frontend/app/create/page.tsx`)
```typescript
// Recrea keypair y firma correctamente
const tokenMint = Keypair.fromSecretKey(
  new Uint8Array(tokenMintKeypair.secretKey)
);

transaction.partialSign(tokenMint);
```

---

## 🎯 Resultado Esperado

Después del deploy:

1. ✅ Backend responde en https://agent-fun.onrender.com
2. ✅ Frontend carga en https://www.degenagent.fun
3. ✅ Crear agente funciona sin errores
4. ✅ Transaction se confirma en Solana
5. ✅ Agente se guarda en database
6. ✅ Redirect a página del agente

---

## 📞 Comandos Útiles

```bash
# Ver status de git
git status

# Ver último commit
git log -1

# Ver remote URL
git remote -v

# Force push (solo si es necesario)
git push origin main --force

# Ver branches
git branch -a
```

---

## ⏱️ Timeline

```
T+0:00 - Commit y push código
T+0:30 - Render detecta cambios
T+1:00 - Render empieza build
T+3:00 - Render deploy completo
T+3:30 - Vercel detecta cambios
T+4:00 - Vercel build completo
T+5:00 - Todo funcionando ✅
```

---

## 🚨 Emergencia

Si después de 10 minutos no funciona:

```bash
# 1. Verificar que el push se hizo
git log -1

# 2. Verificar en GitHub que el código está actualizado
# https://github.com/TU_USUARIO/TU_REPO

# 3. Forzar redeploy manual en Render y Vercel

# 4. Si nada funciona, contactar soporte:
# Render: https://render.com/support
# Vercel: https://vercel.com/support
```

---

**ACCIÓN INMEDIATA:** 

```bash
git add .
git commit -m "fix: production agent creation"
git push origin main
```

**Luego espera 5 minutos y prueba crear un agente en:**
https://www.degenagent.fun/create

🎯 **Debería funcionar!**
