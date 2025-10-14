# 🚂 Desplegar Backend a Railway

## 📋 PREPARACIÓN

### 1. Crea cuenta en Railway
- Ve a https://railway.app
- Sign up with GitHub
- Conecta tu cuenta de GitHub

---

## 🚀 DEPLOYMENT PASO A PASO

### Paso 1: Crear Nuevo Proyecto en Railway

1. Click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Selecciona tu repositorio **"agent-fun"** (o como lo hayas llamado)
4. Railway detectará automáticamente tu `railway.json`

### Paso 2: Añadir Base de Datos PostgreSQL

1. En tu proyecto de Railway, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creará automáticamente la variable `DATABASE_URL`
3. Espera 1-2 minutos a que la base de datos esté lista

### Paso 3: Configurar Variables de Entorno

En Railway, ve a tu servicio → **"Variables"** y añade:

```env
NODE_ENV=production
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
PORT=3001
ALLOWED_ORIGINS=https://degenagent.fun,https://www.degenagent.fun
COMMISSION_RATE=0.5
REFERRAL_COMMISSION_RATE=10
MIN_TRADE_FOR_COMMISSION=10
```

**⚠️ IMPORTANTE:** Railway ya configura `DATABASE_URL` automáticamente, no la añadas manualmente.

### Paso 4: Deploy!

1. Railway desplegará automáticamente
2. Espera 3-5 minutos
3. Verás los logs en tiempo real
4. Cuando termine, verás ✅ **"Success"**

### Paso 5: Obtener URL del Backend

1. En Railway, ve a tu servicio
2. Click en **"Settings"** → **"Domains"**
3. Click **"Generate Domain"**
4. Obtendrás una URL como: `https://agent-fun-production.up.railway.app`

---

## 🔧 CONFIGURACIÓN OPCIONAL (Recomendada)

### Añadir Dominio Personalizado

Si quieres usar `api.degenagent.fun`:

1. En Railway → **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Ingresa: `api.degenagent.fun`
4. Railway te dará un CNAME record

5. Ve a **Namecheap** → **Advanced DNS**
6. Añade:
   ```
   Type:  CNAME Record
   Host:  api
   Value: [el valor que te dio Railway]
   TTL:   Automatic
   ```

---

## 📊 VERIFICAR QUE FUNCIONA

### Test 1: Health Check

Abre en tu navegador:
```
https://tu-backend-url.up.railway.app/health
```

Deberías ver:
```json
{
  "status": "ok",
  "network": "mainnet-beta",
  "blockHeight": 123456789,
  "timestamp": "2024-..."
}
```

### Test 2: Commission Stats

```
https://tu-backend-url.up.railway.app/api/commission/stats
```

Deberías ver:
```json
{
  "success": true,
  "stats": {
    "totalCommissions": 0,
    "unclaimedCommissions": 0,
    ...
  }
}
```

---

## 💰 MONETIZACIÓN - CÓMO FUNCIONA

### Sistema de Comisiones Automático

Cada vez que un agente hace un trade:

1. **Se ejecuta el trade** en Jupiter
2. **Se registra la comisión** (0.5% del trade)
3. **Se actualiza el referral** (10% de la comisión va al referrer)
4. **Tú recibes** el 90% restante

### Ver tus comisiones:

```bash
# Stats totales
curl https://tu-backend-url/api/commission/stats

# Comisiones recientes
curl https://tu-backend-url/api/commission/recent?limit=100

# Total sin reclamar
curl https://tu-backend-url/api/commission/unclaimed
```

### Ejemplo de Ganancias:

```
Usuario tradea $1,000
→ Comisión plataforma: $5 (0.5%)
→ Referrer gana: $0.50 (10% de $5)
→ TÚ GANAS: $4.50 (90% de $5)

Con 100 trades de $1,000/día:
→ $450/día = $13,500/mes 💰
```

---

## 🎯 PRÓXIMOS PASOS

### 1. Actualizar Frontend

Edita `frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://tu-backend-url.up.railway.app/api
# O si usas dominio custom:
NEXT_PUBLIC_API_URL=https://api.degenagent.fun/api
```

### 2. Redeploy Frontend en Vercel

```bash
git add .
git commit -m "Update API URL for production"
git push
```

Vercel desplegará automáticamente.

### 3. Usar RPC Privado (RECOMENDADO)

Para mejor performance y sin rate limits:

**Opción A: Helius (Recomendado)**
- Ve a https://helius.dev
- Crea cuenta gratis
- Crea un proyecto
- Copia tu RPC URL
- En Railway → Variables:
  ```
  RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=TU_API_KEY
  ```

**Opción B: QuickNode**
- Ve a https://quicknode.com
- Plan gratuito: 100K requests/mes
- Similar setup

---

## 🔒 SEGURIDAD

### Variables Sensibles

**NUNCA** commitees a Git:
- Private keys
- API keys
- Encryption keys
- Wallet addresses privadas

### Backup de Base de Datos

Railway hace backups automáticos, pero puedes hacer backups manuales:

1. Railway → Database → **Backups**
2. Click **"Create Backup"**

---

## 📈 MONITORING

### Ver Logs en Tiempo Real

1. Railway → Tu servicio → **"Deployments"**
2. Click en el deployment activo
3. Verás logs en vivo

### Alertas (Railway Pro)

- Setup alerts para errores
- Notificaciones en Slack/Discord
- Uptime monitoring

---

## 💵 COSTOS

### Railway Pricing

**Hobby Plan (Gratis):**
- $5 de créditos mensuales
- Suficiente para empezar
- ~500,000 requests/mes

**Developer Plan ($5/mes):**
- $5 de créditos + $5 adicionales
- ~1,000,000 requests/mes

**Team Plan ($20/mes):**
- $20 de créditos
- Priority support
- Custom domains ilimitados

### Proyección de Costos

```
< 10 usuarios:     $0/mes (Hobby plan gratis)
10-100 usuarios:   $5/mes
100-1000 usuarios: $20/mes
1000+ usuarios:    $50-100/mes
```

**ROI:**
Con solo 10 usuarios activos tradeando $100/día:
- Tú ganas: ~$50/mes
- Costo Railway: $5/mes
- **Profit: $45/mes** 📈

---

## 🆘 TROUBLESHOOTING

### Error: "Build failed"

1. Revisa los logs en Railway
2. Asegúrate que `backend/tsconfig.json` existe
3. Verifica que todas las dependencias están en `package.json`

### Error: "Database connection failed"

1. Verifica que PostgreSQL está running en Railway
2. Verifica que `DATABASE_URL` está configurada
3. Reinicia el servicio

### Error: "Module not found"

```bash
# En tu local:
cd backend
npm install
npm run build

# Luego push a git
git add .
git commit -m "Fix dependencies"
git push
```

---

## ✅ CHECKLIST FINAL

- [ ] Backend desplegado en Railway
- [ ] PostgreSQL conectada
- [ ] Variables de entorno configuradas
- [ ] Health check funcionando
- [ ] Dominio personalizado (opcional)
- [ ] Frontend actualizado con URL del backend
- [ ] RPC privado configurado (recomendado)
- [ ] Sistema de comisiones testeado

---

**¡Listo!** Tu backend está en producción y ganando dinero automáticamente 💰🚀
