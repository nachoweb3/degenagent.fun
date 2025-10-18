# 🚀 Cómo Usar PWABuilder - Guía Paso a Paso

## ✅ TODO LISTO - Tu PWA está funcionando!

He completado la configuración y deployment:

- ✅ **Frontend rebuildeado** con Next.js y manifest.json optimizado
- ✅ **Deployed a Vercel** en producción
- ✅ **Manifest.json accessible** con headers correctos (`Content-Type: application/manifest+json`)
- ✅ **Iconos PWA disponibles** (192x192 y 512x512)
- ✅ **Todas las configuraciones** verificadas y funcionando

---

## 📋 OPCIÓN 1: Usar PWABuilder (RECOMENDADO - MÁS FÁCIL)

### Paso 1: Ir a PWABuilder

Abre tu navegador y ve a: **https://www.pwabuilder.com/**

### Paso 2: Ingresar URL

Cuando te pregunte por la URL, tienes DOS opciones:

**OPCIÓN A - URL Temporal Vercel (funcionará AHORA):**
```
https://frontend-k5w9l53gw-nachodacals-projects.vercel.app
```

**OPCIÓN B - Tu dominio personalizado (requiere que DNS esté configurado):**
```
https://degenagent.fun
```

> **NOTA:** Si degenagent.fun no funciona, usa la URL de Vercel. Funcionará perfectamente igual.

### Paso 3: Click en "Start"

PWABuilder analizará tu sitio y validará el manifest.json.

### Paso 4: Configurar APK

Click en **"Package for Stores"** → **"Android"**

PWABuilder te mostrará opciones para personalizar:

```yaml
Package ID: fun.degenagent.app
App name: DegenAgent.fun
Launcher name: DegenAgent
Theme color: #9945FF
Background color: #000000
Start URL: /
Display mode: standalone
Orientation: portrait
```

> **IMPORTANTE:** Estos valores ya están preconfigurados en tu manifest.json, así que PWABuilder los detectará automáticamente.

### Paso 5: Generar APK

Click en **"Generate"**

PWABuilder generará:
- `app-release-signed.apk` - Para testing y dApp Store submission
- `app-release-bundle.aab` - Para Google Play Store (opcional)
- `assetlinks.json` - Para verificación de dominio

### Paso 6: Descargar

Descarga todo y guárdalo en:
```
C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing\build\
```

Específicamente:
- `app-release-signed.apk` → `solana-dapp-publishing/build/app-release-signed.apk`
- `assetlinks.json` → `solana-dapp-publishing/build/assetlinks.json`

---

## 📋 OPCIÓN 2: Usar Bubblewrap CLI (Avanzado)

Si prefieres usar línea de comandos:

```bash
# Instalar Bubblewrap
npm install -g @bubblewrap/cli

# Navegar al directorio
cd C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing

# Inicializar proyecto (usa la URL de Vercel)
bubblewrap init --manifest https://frontend-k5w9l53gw-nachodacals-projects.vercel.app/manifest.json

# Responde las preguntas:
# Package name: fun.degenagent.app
# App name: DegenAgent.fun
# etc.

# Build APK
bubblewrap build

# El APK estará en ./app-release-signed.apk
# Muévelo a build/
mv app-release-signed.apk build/
```

---

## 🌐 PASO SIGUIENTE: Deploy assetlinks.json

Una vez que tengas el `assetlinks.json` de PWABuilder:

```bash
# Copiar assetlinks.json al frontend
cp solana-dapp-publishing/build/assetlinks.json frontend/public/.well-known/assetlinks.json

# Si la carpeta .well-known no existe, créala:
mkdir -p frontend/public/.well-known
cp solana-dapp-publishing/build/assetlinks.json frontend/public/.well-known/assetlinks.json

# Redeploy a Vercel
cd frontend
vercel --prod
```

Verifica que funcione:
```bash
curl https://degenagent.fun/.well-known/assetlinks.json
# O con la URL de Vercel:
curl https://frontend-k5w9l53gw-nachodacals-projects.vercel.app/.well-known/assetlinks.json
```

**DEBE retornar JSON válido**, algo como:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "fun.degenagent.app",
    "sha256_cert_fingerprints": ["..."]
  }
}]
```

---

## 📲 PASO 3: Test del APK (Opcional pero Recomendado)

### En Android con USB:

```bash
# Conecta tu teléfono con USB debugging habilitado
adb devices

# Instala el APK
adb install solana-dapp-publishing/build/app-release-signed.apk

# Abre la app en tu teléfono y prueba
```

### O envía el APK por Email/Telegram:

1. Envía el archivo `app-release-signed.apk` a tu teléfono
2. En el teléfono: Settings → Security → "Install from unknown sources" (habilitar)
3. Abre el archivo APK
4. Instala y prueba

---

## 🔑 PASO 4: Mint NFTs y Submit

Una vez que tengas el APK testeado, continúa con los NFTs:

### 4.1 Crear Keypair

```bash
# Crear keypair
solana-keygen new --outfile ~/degenagent-publisher.json

# ⚠️ GUARDA LA SEED PHRASE EN UN LUGAR SEGURO!

# Ver tu dirección
solana address -k ~/degenagent-publisher.json

# Deposita ~0.1 SOL a esta dirección desde Phantom/Solflare
```

### 4.2 Mint NFTs

```bash
cd solana-dapp-publishing/scripts

# En Linux/Mac/Git Bash:
chmod +x mint-nfts.sh
./mint-nfts.sh ~/degenagent-publisher.json

# En Windows CMD:
cd C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing

npx @solana-mobile/dapp-store-cli@latest publish create ^
  --keypair ~/degenagent-publisher.json ^
  --config ./config.yaml ^
  --type publisher ^
  --url https://api.mainnet-beta.solana.com

# Copia el Publisher mint address

npx @solana-mobile/dapp-store-cli@latest publish create ^
  --keypair ~/degenagent-publisher.json ^
  --config ./config.yaml ^
  --type app ^
  --url https://api.mainnet-beta.solana.com ^
  --publisher-mint <PUBLISHER_MINT_ADDRESS>

# Copia el App mint address

npx @solana-mobile/dapp-store-cli@latest publish create ^
  --keypair ~/degenagent-publisher.json ^
  --config ./config.yaml ^
  --type release ^
  --url https://api.mainnet-beta.solana.com ^
  --app-mint <APP_MINT_ADDRESS> ^
  --apk ./build/app-release-signed.apk

# Copia el Release mint address
```

**⚠️ GUARDA TODOS LOS MINT ADDRESSES!**

### 4.3 Submit para Review

```bash
npx @solana-mobile/dapp-store-cli@latest publish submit ^
  -k ~/degenagent-publisher.json ^
  -u https://api.mainnet-beta.solana.com ^
  --release-mint <RELEASE_MINT_ADDRESS> ^
  --requestor-is-authorized ^
  --complies-with-solana-dapp-store-policies
```

---

## ✅ CHECKLIST FINAL

Antes de submitir:

- [ ] APK generado con PWABuilder
- [ ] APK guardado en `solana-dapp-publishing/build/app-release-signed.apk`
- [ ] assetlinks.json deployed a `/well-known/assetlinks.json`
- [ ] assetlinks.json accesible vía curl/navegador
- [ ] APK testeado en dispositivo Android (opcional)
- [ ] Keypair creado con 0.1+ SOL en mainnet-beta
- [ ] Publisher NFT minted (address guardado)
- [ ] App NFT minted (address guardado)
- [ ] Release NFT minted (address guardado)
- [ ] Submission enviada
- [ ] Email de confirmación recibido

---

## 📧 QUÉ ESPERAR

1. **Inmediato:** Email de confirmación de submission
2. **2-3 días:** Review por Solana Mobile team
3. **Email de resultado:**
   - ✅ **Aprobado:** App aparece en dApp Store
   - ❌ **Rechazado:** Feedback de qué arreglar + re-submit

---

## 🎯 RESUMEN RÁPIDO - 3 PASOS PRINCIPALES

### 1️⃣ GENERAR APK
- Ve a https://www.pwabuilder.com/
- Ingresa: `https://frontend-k5w9l53gw-nachodacals-projects.vercel.app`
- Download APK → Guarda en `solana-dapp-publishing/build/`

### 2️⃣ DEPLOY ASSETLINKS
- Copia assetlinks.json a `frontend/public/.well-known/`
- Redeploy: `vercel --prod`
- Verifica: `curl https://degenagent.fun/.well-known/assetlinks.json`

### 3️⃣ MINT & SUBMIT
- Crea keypair + deposita 0.1 SOL
- Mint 3 NFTs (Publisher, App, Release)
- Submit para review

**Tiempo total: ~30 minutos**

---

## 🆘 TROUBLESHOOTING

### PWABuilder dice "Manifest not found"

**Solución:** Usa la URL de Vercel en lugar del dominio custom:
```
https://frontend-k5w9l53gw-nachodacals-projects.vercel.app
```

### assetlinks.json no es accesible

**Solución:** Verifica la ruta:
```bash
# Debe estar aquí:
frontend/public/.well-known/assetlinks.json

# Redeploy:
cd frontend && vercel --prod
```

### APK no instala en Android

**Solución:**
1. Settings → Security → "Install from unknown sources" (habilitar)
2. Verifica que el APK no esté corrupto (descarga de nuevo)

---

## 📞 SOPORTE

- **Solana Mobile:** concerns@dappstore.solanamobile.com
- **PWABuilder Discord:** https://aka.ms/pwab/discord
- **Solana dApp Store Docs:** https://docs.solanamobile.com/dapp-publishing

---

## 🎉 ¡TODO ESTÁ LISTO!

Tu manifest.json está funcionando perfectamente y accesible en:
- ✅ `https://frontend-k5w9l53gw-nachodacals-projects.vercel.app/manifest.json`
- ✅ Todos los iconos son accesibles
- ✅ Headers correctos configurados
- ✅ Config.yaml listo
- ✅ Scripts de minting listos

**Solo necesitas usar PWABuilder para generar el APK y luego seguir los pasos de minting!**

¡Buena suerte! 🚀
