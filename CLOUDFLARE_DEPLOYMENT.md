# ⚡ DEPLOYMENT CON CLOUDFLARE PAGES - Guía Paso a Paso

**Fecha:** 2025-10-20 18:45 UTC

---

## 🎯 PASOS PARA DEPLOYAR (5 MINUTOS)

### PASO 1: Ir al Dashboard de Cloudflare

1. **Abre tu navegador** y ve a: https://dash.cloudflare.com

2. **Login** con tu cuenta de Cloudflare
   - Si no tienes cuenta: Click "Sign Up" (gratis)
   - Email + contraseña
   - Verificar email

---

### PASO 2: Crear Proyecto en Pages

1. En el dashboard, en el menú lateral izquierdo busca: **"Workers & Pages"**

2. Click en el botón: **"Create application"**

3. Click en la pestaña: **"Pages"**

4. Click en: **"Connect to Git"**

---

### PASO 3: Conectar con GitHub

1. Click en: **"Connect GitHub"**

2. Autoriza a Cloudflare a acceder a tu GitHub

3. En la lista de repositorios, busca y selecciona: **"Agent.fun"**

4. Click en: **"Begin setup"**

---

### PASO 4: Configurar Build Settings

**Configuración del proyecto:**

```
Project name: agent-fun
Production branch: main
```

**Framework preset:** Selecciona **"Next.js"** del dropdown

**Build settings:**

```
Build command: npm run build
Build output directory: .next
Root directory (advanced): frontend
```

**IMPORTANTE:** Click en "Show advanced" o "Environment variables (advanced)" para agregar variables

---

### PASO 5: Agregar Variables de Entorno

Click en **"Add variable"** dos veces y agrega:

**Variable 1:**
```
Variable name: NEXT_PUBLIC_BACKEND_API
Value: https://degenagent-backend.onrender.com/api
```

**Variable 2:**
```
Variable name: NEXT_PUBLIC_RPC_ENDPOINT
Value: https://mainnet.helius-rpc.com/?api-key=0609d375-ac29-4da3-be17-5ab640679dd8
```

**Variable 3 (importante para Next.js):**
```
Variable name: NODE_VERSION
Value: 18
```

---

### PASO 6: Deploy

1. Verifica que todo esté correcto:
   - ✅ Framework preset: Next.js
   - ✅ Build command: npm run build
   - ✅ Build output directory: .next
   - ✅ Root directory: frontend
   - ✅ 3 variables de entorno agregadas

2. Click en el botón: **"Save and Deploy"**

3. Espera 2-4 minutos mientras Cloudflare:
   - Clona tu repositorio
   - Instala dependencias
   - Builda el proyecto
   - Deploya a su CDN global

---

## ⏱️ DURANTE EL BUILD

Verás logs en tiempo real:

```
Cloning repository...
✓ Success: Finished cloning repository files

Installing dependencies...
✓ Success: Installed dependencies

Building application...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (21/21)
✓ Success: Finished building

Deploying to Cloudflare's global network...
✓ Success: Deployed to production
```

---

## ✅ DEPLOYMENT EXITOSO

Cuando termine, verás:

```
✓ Deployment successful!

Your site is live at: https://agent-fun.pages.dev
```

**Tu sitio estará disponible en:**
- `https://agent-fun.pages.dev` (URL de Cloudflare)
- O `https://agent-fun-abc.pages.dev` (con hash aleatorio)

---

## 🔍 VERIFICAR QUE FUNCIONA

### 1. Abre la URL que te dio Cloudflare

### 2. Hard Refresh
Presiona: `Ctrl + Shift + R`

### 3. Abre Consola del Navegador
Presiona `F12` y ve a la pestaña "Console"

### 4. Verifica que NO haya errores
Deberías ver:
```javascript
[UserProfile DEBUG] publicKey: undefined
```

Y NO deberías ver:
- ❌ React error #418
- ❌ React error #423
- ❌ Hydration errors

### 5. Conecta Phantom Wallet

1. Click en **"Connect Wallet"**
2. Selecciona **Phantom**
3. Autoriza la conexión
4. Deberías ver tu avatar con iniciales
5. En consola verás:
```javascript
[UserProfile DEBUG] publicKey: <tu address>
[UserProfile DEBUG] isOpen: false
```

### 6. Prueba el Dropdown

1. Click en tu **avatar** (círculo con iniciales)
2. Debe aparecer el dropdown con:
   - 👤 View Profile
   - 📊 Analytics
   - 🎁 Referral Rewards
   - 🚪 Disconnect Wallet

### 7. Navega a Explore

1. Click en **"Explore"** en el menú
2. Deberías ver los agentes cargando
3. Con imágenes funcionando
4. Sin errores en consola

---

## 🌐 CONFIGURAR CUSTOM DOMAIN (OPCIONAL)

Si quieres usar `www.degenagent.fun`:

### En Cloudflare Pages:

1. Ve a tu proyecto: **agent-fun**

2. Click en la pestaña: **"Custom domains"**

3. Click en: **"Set up a custom domain"**

4. Escribe: `www.degenagent.fun`

5. Click en **"Continue"**

6. Cloudflare te dará instrucciones de DNS:

### En tu proveedor de dominio:

Agrega un registro CNAME:

```
Type: CNAME
Name: www
Value: agent-fun.pages.dev
TTL: Auto
```

**Espera 5-30 minutos** para que propague el DNS.

Luego tu sitio estará en: `https://www.degenagent.fun`

---

## 🔄 AUTO-DEPLOY EN CADA PUSH

**Ventaja de Cloudflare Pages:**

Cada vez que hagas `git push` a la rama `main`, Cloudflare automáticamente:

1. ✅ Detecta el nuevo commit
2. ✅ Builda el proyecto
3. ✅ Deploya a producción
4. ✅ Tu sitio se actualiza en 2-3 minutos

**Ejemplo:**

```bash
# Haces cambios en tu código
git add .
git commit -m "feat: Nueva funcionalidad"
git push

# Cloudflare automáticamente deploya en 2-3 minutos
# No necesitas hacer nada más!
```

---

## 📊 MONITORING

Desde el dashboard de Cloudflare Pages puedes ver:

- **Analytics:** Visitantes, requests, bandwidth
- **Deployments:** Historial de deployments
- **Build logs:** Logs de cada build
- **Custom domains:** Gestionar dominios
- **Environment variables:** Editar variables

---

## ⚡ VENTAJAS DE CLOUDFLARE PAGES

### 1. **CDN Global Más Rápido**
- 275+ ubicaciones en todo el mundo
- Latencia ultra baja
- Tu sitio carga en <100ms desde cualquier parte

### 2. **Bandwidth Ilimitado**
- No hay límites de tráfico
- GRATIS para siempre
- Soporta millones de requests

### 3. **Builds Súper Rápidos**
- Build en ~2 minutos
- 500 builds/mes gratis
- Unlimited builds en plan pagado ($20/mes)

### 4. **DDoS Protection**
- Protección automática contra ataques
- Incluido gratis
- Mismo sistema que usa Discord, Shopify, etc.

### 5. **SSL Automático**
- Certificado SSL gratis
- Auto-renovación
- HTTPS habilitado por defecto

---

## 🐛 TROUBLESHOOTING

### Problema: Build falla con "Module not found"

**Solución:** Verifica que `Root directory` esté en `frontend`

---

### Problema: "Environment variables not defined"

**Solución:** Ve a Settings → Environment Variables → Production

Verifica que tengas:
- `NEXT_PUBLIC_BACKEND_API`
- `NEXT_PUBLIC_RPC_ENDPOINT`
- `NODE_VERSION`

---

### Problema: Sitio carga pero wallet no funciona

**Solución:**

1. Hard refresh: `Ctrl + Shift + R`
2. Abre consola (F12)
3. Verifica que las variables de entorno estén definidas:

```javascript
console.log(process.env.NEXT_PUBLIC_BACKEND_API)
// Debe mostrar: https://degenagent-backend.onrender.com/api

console.log(process.env.NEXT_PUBLIC_RPC_ENDPOINT)
// Debe mostrar: https://mainnet.helius-rpc.com/?api-key=...
```

Si son `undefined`, las variables no se configuraron correctamente.

---

### Problema: "This page isn't working" o 404

**Solución:**

Verifica que `Build output directory` sea `.next` (no `out` ni `.next/static`)

---

## 📞 RESUMEN RÁPIDO

1. ✅ Ve a https://dash.cloudflare.com
2. ✅ Workers & Pages → Create application → Pages
3. ✅ Connect to Git → Selecciona "Agent.fun"
4. ✅ Framework: Next.js
5. ✅ Build command: `npm run build`
6. ✅ Build output: `.next`
7. ✅ Root directory: `frontend`
8. ✅ Agrega 3 variables de entorno
9. ✅ Click "Save and Deploy"
10. ✅ Espera 2-4 minutos
11. ✅ ¡LISTO! Tu sitio está LIVE

---

## 🎉 CONFIRMACIÓN FINAL

Una vez deployado, tu sitio tendrá:

- ✅ Sin errores de React
- ✅ Sin errores de hydration
- ✅ Wallet funcionando perfectamente
- ✅ CDN global súper rápido
- ✅ SSL automático
- ✅ Bandwidth ilimitado
- ✅ Auto-deploy con cada git push

**Código deployado:** Commit 643dafa (con todos los fixes)

**URL de Cloudflare:** https://agent-fun.pages.dev

**Custom domain (opcional):** https://www.degenagent.fun

---

**Última actualización:** 2025-10-20 18:45 UTC

**Tiempo estimado:** 5 minutos

**Dificultad:** Fácil (solo seguir los pasos)

**Resultado:** Sitio LIVE en producción con CDN global
