# 🚀 Deploy Backend a Render (GRATIS)

## ✅ MÁS FÁCIL QUE RAILWAY - 5 PASOS

### Paso 1: Crear Cuenta en Render

1. Ve a https://render.com
2. Click **"Get Started"**
3. Sign up con GitHub, Google, o Email

---

### Paso 2: Crear Nueva Cuenta GitHub (Tu otra está suspendida)

1. Ve a https://github.com/signup
2. Usa otro email
3. Crea la cuenta
4. Verifica el email

---

### Paso 3: Subir Código a GitHub

En tu terminal (PowerShell):

```bash
cd "C:\Users\Usuario\Desktop\Agent.fun"

# Cambiar remote a tu nueva cuenta
git remote remove origin
git remote add origin https://github.com/TU_NUEVO_USERNAME/degenagent.git

# Crear repo en GitHub primero (desde la web)
# Luego push:
git push -u origin main
```

---

### Paso 4: Deploy en Render

1. Ve a https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Click **"Connect GitHub"**
4. Autoriza tu nueva cuenta de GitHub
5. Selecciona tu repo **"degenagent"**
6. Render detectará el `render.yaml` automáticamente
7. Click **"Apply"**

Render creará:
- ✅ Web Service (backend)
- ✅ PostgreSQL Database
- ✅ Variables de entorno

---

### Paso 5: Obtener URL

Después de 3-5 minutos:

1. Ve a tu servicio en Render
2. Copia la URL (será algo como):
   ```
   https://degenagent-backend.onrender.com
   ```

---

## 🆓 PLAN GRATIS DE RENDER:

✅ **Backend:** 750 horas/mes (suficiente 24/7)
✅ **PostgreSQL:** 90 días gratis, luego $7/mes
✅ **SSL automático**
✅ **No requiere tarjeta de crédito**

⚠️ **Nota:** El servicio gratis "duerme" después de 15 min sin uso. Se despierta automáticamente cuando recibe un request (tarda ~30 segundos).

---

## 🎯 ALTERNATIVA SIN GITHUB: RAILWAY

Si prefieres Railway (más rápido, pero requiere tarjeta):

1. Ve a https://railway.app
2. Sign up
3. Click **"New Project"** → **"Empty Project"**
4. Click en el proyecto → **"New Service"** → **"GitHub Repo"**
5. Railway te pedirá conectar GitHub o puedes hacer upload manual

---

## ⚡ OPCIÓN 3: VERCEL (Backend + Frontend en un lugar)

Vercel también puede hospedar tu backend:

```bash
cd "C:\Users\Usuario\Desktop\Agent.fun"
npm install -g vercel

vercel
```

Sigue las instrucciones.

---

## 📝 RESUMEN RÁPIDO:

### Para Render (Recomendado - Gratis):
1. Crea cuenta GitHub nueva
2. Sube el código
3. Conecta Render con GitHub
4. Deploy automático con `render.yaml`

### Para Railway (Más rápido - $5/mes):
1. Regístrate en railway.app
2. Conecta repo o upload manual
3. Añade PostgreSQL
4. Deploy

### Para Vercel (Todo en uno):
1. `npm install -g vercel`
2. `vercel` en tu carpeta
3. Sigue instrucciones

---

## ❓ ¿QUÉ PREFIERES?

1. **Render** - Gratis, fácil, requiere GitHub nuevo
2. **Railway** - Rápido, $5/mes, puede usar upload manual
3. **Vercel** - Todo en un lugar, rápido

Dime cuál prefieres y te ayudo paso a paso! 🚀
