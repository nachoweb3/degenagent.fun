# 📱 DegenAgent.fun - Solana dApp Store Submission

Guía completa para publicar DegenAgent.fun en el Solana dApp Store.

---

## 📋 Requisitos Previos

### 1. Instalaciones Necesarias
```bash
# Node.js 14.15.0+
node --version

# Solana dApp Store CLI
npm install -g @solana-mobile/dapp-store-cli

# PWABuilder CLI (para convertir PWA a APK)
npm install -g @pwabuilder/cli
```

### 2. Assets Necesarios

✅ **Todos los assets están en `/solana-dapp-publishing/assets/`**

#### Iconos Requeridos:
- ✅ `icon-512.png` (512x512px) - App icon

#### Gráficos Requeridos:
- ✅ `banner-1200x600.png` (1200x600px) - Banner graphic
- ✅ `feature-1200x1200.png` (1200x1200px) - Feature graphic

#### Screenshots Requeridos (mínimo 4):
- ✅ `screenshots/1-home.png` (1080x1920px)
- ✅ `screenshots/2-create.png` (1080x1920px)
- ✅ `screenshots/3-dashboard.png` (1080x1920px)
- ✅ `screenshots/4-trading.png` (1080x1920px)
- ✅ `screenshots/5-referral.png` (1080x1920px)

---

## 🚀 Proceso de Publicación

### Paso 1: Convertir PWA a APK

#### Opción A: Usando PWABuilder (Recomendado)

```bash
# 1. Ir al directorio frontend
cd frontend

# 2. Build de producción
npm run build

# 3. Usar PWABuilder online
# Visita: https://www.pwabuilder.com/
# Ingresa URL: https://degenagent.fun
# Download Android package
```

#### Opción B: Usando Bubblewrap CLI

```bash
# 1. Instalar Bubblewrap
npm install -g @bubblewrap/cli

# 2. Inicializar proyecto
bubblewrap init --manifest https://degenagent.fun/manifest.json

# 3. Build APK
bubblewrap build

# Output: app-release-signed.apk
```

#### Configuración TWA (Trusted Web Activity)

El archivo `assetlinks.json` debe estar en:
```
https://degenagent.fun/.well-known/assetlinks.json
```

Contenido:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "fun.degenagent.twa",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

### Paso 2: Mint NFTs en Solana

Los NFTs son necesarios para registrar tu dApp on-chain.

```bash
# 1. Tener una wallet con SOL (mainnet-beta)
# Necesitarás ~0.1 SOL para minting

# 2. Generar keypair (si no tienes)
solana-keygen new --outfile ~/my-keypair.json

# 3. Mint Publisher NFT
npx dapp-store publish create \
  --keypair ~/my-keypair.json \
  --config ./config.yaml \
  --type publisher

# 4. Mint App NFT
npx dapp-store publish create \
  --keypair ~/my-keypair.json \
  --config ./config.yaml \
  --type app

# 5. Mint Release NFT
npx dapp-store publish create \
  --keypair ~/my-keypair.json \
  --config ./config.yaml \
  --type release \
  --apk ./app-release-signed.apk
```

### Paso 3: Submit para Review

```bash
npx dapp-store publish submit \
  -k ~/my-keypair.json \
  -u https://api.mainnet-beta.solana.com \
  --requestor-is-authorized \
  --complies-with-solana-dapp-store-policies
```

---

## 📊 Configuración Actual

### URLs de Producción:
- **Frontend:** https://degenagent.fun
- **Backend API:** https://agent-fun.onrender.com
- **Manifest:** https://degenagent.fun/manifest.json

### App Details:
- **Package Name:** fun.degenagent.app
- **Version:** 1.0.0 (Build 1)
- **Min SDK:** Android 7.0 (API 24)
- **Target SDK:** Android 14 (API 34)

### Categoría:
- **Primary:** Finance
- **Secondary:** Utilities, Productivity

---

## 🎨 Assets Checklist

### Iconos:
- [ ] `icon-512.png` (512x512px) - **CREAR**
- [ ] `icon-192.png` (192x192px) - Ya existe en `/frontend/public/`

### Gráficos Promocionales:
- [ ] `banner-1200x600.png` - **CREAR**
- [ ] `feature-1200x1200.png` - **CREAR**

### Screenshots (1080x1920px):
- [ ] Screenshot 1: Homepage
- [ ] Screenshot 2: Create Agent
- [ ] Screenshot 3: Dashboard
- [ ] Screenshot 4: Trading View
- [ ] Screenshot 5: Referral Dashboard

---

## 📝 Store Listing Content

### Short Description (80 chars):
```
Create AI trading agents that operate 24/7 on Solana blockchain
```

### Full Description:
Ver `config.yaml` sección `store_listing.en-US.description`

### Keywords:
- Solana
- DeFi
- AI Trading
- Trading Bot
- Crypto
- Autonomous Agent
- Jupiter
- Memecoin
- GPT-4
- Passive Income

---

## 🔐 Signing Configuration

### Generar Keystore (primera vez):

```bash
keytool -genkey -v -keystore degenagent-release.keystore \
  -alias degenagent \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# IMPORTANTE: Guarda el keystore en un lugar seguro!
# NO lo subas a Git
```

### Extraer SHA256 Fingerprint:

```bash
keytool -list -v -keystore degenagent-release.keystore \
  -alias degenagent

# Copia el SHA256 fingerprint para assetlinks.json
```

---

## 📋 Compliance

### Políticas que Cumplimos:

✅ **Solana dApp Store Policies**
- App funciona correctamente
- No contenido malicioso
- Descripción precisa
- Assets apropiados
- Permisos justificados

✅ **Age Rating:** TEEN (13+)
- Servicios financieros
- Trading con dinero real
- Requiere entendimiento de riesgos crypto

✅ **Disclaimers Incluidos:**
- Trading cryptocurrencies involves risk
- Past performance ≠ future results
- Only invest what you can afford to lose

---

## 📈 Review Timeline

### Tiempos Esperados:
- **New App:** 2-3 días
- **Updates:** 1 día

### Seguimiento:
- Email de notificación cuando se apruebe/rechace
- Panel de publisher en Solana dApp Store

---

## 🛠️ Troubleshooting

### Error: "Invalid manifest.json"
**Solución:** Verificar que el manifest tenga todos los campos requeridos
```bash
# Validar manifest
curl https://degenagent.fun/manifest.json | json_pp
```

### Error: "APK signature mismatch"
**Solución:** El APK debe estar firmado con el keystore correcto
```bash
# Verificar firma
jarsigner -verify -verbose app-release-signed.apk
```

### Error: "Asset links not found"
**Solución:** Asegurar que assetlinks.json sea accesible
```bash
curl https://degenagent.fun/.well-known/assetlinks.json
```

---

## 📞 Contacto y Soporte

### Solana Mobile Support:
- **Email:** concerns@dappstore.solanamobile.com
- **Docs:** https://docs.solanamobile.com/dapp-publishing
- **Discord:** Solana Mobile Discord

### DegenAgent Team:
- **Email:** support@degenagent.fun
- **Twitter:** @degenagent_fun
- **Discord:** https://discord.gg/agentfun

---

## 📚 Referencias

### Documentación Oficial:
- [Solana dApp Publishing Overview](https://docs.solanamobile.com/dapp-publishing/overview)
- [Prepare dApp for Publishing](https://docs.solanamobile.com/dapp-publishing/prepare)
- [Submit dApp Release](https://docs.solanamobile.com/dapp-publishing/submit)
- [Publishing PWAs](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa)

### Tools:
- [PWABuilder](https://www.pwabuilder.com/)
- [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)
- [Solana dApp Store CLI](https://github.com/solana-mobile/dapp-publishing)

---

## ✅ Next Steps

1. **Crear Assets** (iconos, banners, screenshots)
2. **Convertir PWA a APK** usando PWABuilder
3. **Deploy assetlinks.json** a degenagent.fun
4. **Test APK** en dispositivo Android
5. **Mint NFTs** en Solana mainnet
6. **Submit** para review
7. **Wait** 2-3 días para aprobación
8. **Launch!** 🚀

---

*Última actualización: 14 de Octubre 2025*
