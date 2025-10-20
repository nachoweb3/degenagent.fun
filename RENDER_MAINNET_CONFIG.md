# 🚀 Configuración de Render para Mainnet-Beta

## URGENTE: Actualizar Variables de Entorno en Render

### 📍 URL de Render Dashboard
```
https://dashboard.render.com
```

### 🔐 Acceso
- Si no recuerdas la contraseña, usa "Sign in with GitHub" con tu cuenta: **nachoweb3**

---

## ⚙️ Variables de Entorno a Actualizar

### 1. Ve a tu servicio backend
```
Dashboard > degenagent-backend > Environment
```

### 2. Actualiza estas variables:

#### ✅ RPC_ENDPOINT (CRÍTICO - Cambiar de devnet a mainnet)
```bash
# Valor ANTIGUO (devnet):
RPC_ENDPOINT=https://api.devnet.solana.com

# Valor NUEVO (mainnet):
RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=0609d375-ac29-4da3-be17-5ab640679dd8
```

#### ✅ GEMINI_API_KEY (Añadir si no existe)
```bash
GEMINI_API_KEY=AIzaSyACLK9rM6eGjKdafrdI5yWOaeVug6b0mAg
```

#### ⚠️ ALLOWED_ORIGINS (Verificar que está correcto)
```bash
ALLOWED_ORIGINS=https://degenagent.fun,https://www.degenagent.fun
```

---

## 📝 Pasos Detallados

### Paso 1: Acceder a Render
1. Abre https://dashboard.render.com
2. Sign in with GitHub (nachoweb3)
3. Selecciona el servicio "degenagent-backend"

### Paso 2: Ir a Environment Variables
1. Click en "Environment" en el menú lateral izquierdo
2. Busca las variables existentes

### Paso 3: Actualizar RPC_ENDPOINT
1. Encuentra la variable `RPC_ENDPOINT`
2. Click en el botón de editar (lápiz)
3. Cambia el valor a:
   ```
   https://mainnet.helius-rpc.com/?api-key=0609d375-ac29-4da3-be17-5ab640679dd8
   ```
4. Click "Save"

### Paso 4: Añadir/Actualizar GEMINI_API_KEY
1. Si existe, edítala. Si no, click "Add Environment Variable"
2. Key: `GEMINI_API_KEY`
3. Value: `AIzaSyACLK9rM6eGjKdafrdI5yWOaeVug6b0mAg`
4. Click "Save"

### Paso 5: Guardar y Reiniciar
1. Click "Save Changes" en la parte superior
2. Render reiniciará automáticamente el servicio
3. Espera 2-3 minutos para que el servicio se reinicie

---

## ✅ Verificación

### 1. Verificar que el backend reinició correctamente
Abre en tu navegador:
```
https://egenagent-backend.onrender.com/health
```

Deberías ver:
```json
{
  "status": "ok",
  "network": "https://mainnet.helius-rpc.com/?api-key=...",
  "blockHeight": [número grande > 200000000],
  "timestamp": "..."
}
```

### 2. Verificar network en la respuesta
- ✅ Si dice `"network": "https://mainnet.helius-rpc.com/..."` - **CORRECTO** (mainnet)
- ❌ Si dice `"network": "https://api.devnet.solana.com"` - **INCORRECTO** (todavía devnet)

---

## 🚨 Troubleshooting

### El servicio no reinicia
1. Ve a "Manual Deploy" en Render
2. Click "Deploy latest commit"
3. Espera a que complete

### No puedo acceder a Render
1. Intenta "Sign in with GitHub"
2. Usa la cuenta: nachoweb3
3. Si no funciona, usa "Forgot password"

### El health check muestra devnet
1. Verifica que guardaste los cambios
2. Ve a "Logs" en Render y busca errores
3. Reinicia manualmente el servicio

---

## 📊 Estado Actual

### Frontend (Vercel)
- ✅ Desplegado en: https://degenagent.fun
- ✅ Network: mainnet-beta
- ✅ RPC: Helius mainnet
- ✅ Última actualización: 2025-10-20

### Backend (Render)
- 🟡 Desplegado en: https://egenagent-backend.onrender.com
- ⏳ Network: **PENDIENTE DE ACTUALIZAR A MAINNET**
- ⏳ RPC: **PENDIENTE DE ACTUALIZAR A HELIUS**
- ⚠️ Acción requerida: **ACTUALIZAR VARIABLES DE ENTORNO**

---

## 💰 Una vez configurado

El sistema estará listo para:
- ✅ Trading real en mainnet-beta
- ✅ Generar comisiones reales
- ✅ Crear agentes con modo FREE
- ✅ Sistema de subagentes con IA
- ✅ WebSocket en tiempo real

---

## 🔗 Enlaces Útiles

- Render Dashboard: https://dashboard.render.com
- Frontend: https://degenagent.fun
- Backend Health: https://egenagent-backend.onrender.com/health
- Helius Dashboard: https://dashboard.helius.dev
- GitHub Repo: https://github.com/nachoweb3/degenagent.fun

---

**IMPORTANTE:** Una vez actualices las variables en Render, el sistema estará 100% operativo en mainnet-beta.
