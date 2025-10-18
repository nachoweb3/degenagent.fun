# 🚀 Quick Start: Publicar en Solana dApp Store

Guía rápida para publicar DegenAgent.fun en el Solana dApp Store.

---

## ⚡ TL;DR - Lo que Necesitas Hacer

### 1. Crear Assets (15 minutos)
- Icon 512x512px
- Banner 1200x600px
- Feature graphic 1200x1200px
- 5 screenshots 1080x1920px

### 2. Convertir a APK (10 minutos)
- Usar PWABuilder.com
- Descargar APK firmado

### 3. Submit a Solana (10 minutos)
- Mint NFTs on-chain
- Submit para review
- Esperar 2-3 días

---

## 📝 Paso a Paso EXACTO

### PASO 1: Crear Assets

#### A. Logo/Icon (512x512px)

Puedes usar herramientas online:
- **Canva:** https://www.canva.com/
- **Figma:** https://www.figma.com/
- **Photopea:** https://www.photopea.com/ (Photoshop online gratis)

**Especificaciones:**
- Tamaño: 512x512 píxeles
- Formato: PNG con fondo transparente
- Contenido: Logo de DegenAgent.fun (robot + Solana theme)
- Colores: Purple (#9945FF) y Green (#14F195)

**Guardar como:**
```
solana-dapp-publishing/assets/icon-512.png
```

#### B. Banner (1200x600px)

**Especificaciones:**
- Tamaño: 1200x600 píxeles
- Formato: PNG o JPG
- Contenido:
  - Logo + texto "DegenAgent.fun"
  - Tagline: "AI Trading Agents on Solana"
  - Background gradient purple to green

**Guardar como:**
```
solana-dapp-publishing/assets/banner-1200x600.png
```

#### C. Feature Graphic (1200x1200px)

**Especificaciones:**
- Tamaño: 1200x1200 píxeles
- Formato: PNG o JPG
- Contenido:
  - Hero image para Editor's Choice
  - Mostrar UI del app
  - Incluir beneficios clave

**Guardar como:**
```
solana-dapp-publishing/assets/feature-1200x1200.png
```

#### D. Screenshots (1080x1920px cada uno)

**Cómo capturarlos:**
1. Abre Chrome DevTools (F12)
2. Click en "Toggle device toolbar" (Ctrl+Shift+M)
3. Selecciona "Responsive" y ajusta a 1080x1920
4. Navega a cada página:
   - https://degenagent.fun/
   - https://degenagent.fun/create
   - https://degenagent.fun/dashboard
   - https://degenagent.fun/explore
   - https://degenagent.fun/referrals
5. Toma screenshots (Ctrl+Shift+P → "Capture screenshot")

**Guardar como:**
```
solana-dapp-publishing/assets/screenshots/1-home.png
solana-dapp-publishing/assets/screenshots/2-create.png
solana-dapp-publishing/assets/screenshots/3-dashboard.png
solana-dapp-publishing/assets/screenshots/4-trading.png
solana-dapp-publishing/assets/screenshots/5-referral.png
```

---

### PASO 2: Convertir PWA a APK

#### Opción Más Fácil: PWABuilder.com

1. **Ve a:** https://www.pwabuilder.com/

2. **Ingresa tu URL:**
   ```
   https://degenagent.fun
   ```

3. **Click en "Start"**

4. **Review Score:**
   - PWABuilder analizará tu manifest.json
   - Debería mostrar un buen score

5. **Click en "Package for Stores"**

6. **Selecciona "Android"**

7. **Configuración:**
   ```
   Package ID: fun.degenagent.app
   App name: DegenAgent.fun
   Launcher name: DegenAgent
   Theme color: #9945FF
   Background color: #000000
   Icon URL: https://degenagent.fun/icon-512.png
   Start URL: https://degenagent.fun
   Display mode: standalone
   Orientation: portrait
   ```

8. **Signing Key:**
   - Selecciona "Generate new key"
   - O sube tu propio keystore si ya tienes

9. **Click "Generate"**

10. **Descarga:**
    - `app-release-signed.apk` (para testing)
    - `app-release-bundle.aab` (para store)
    - `assetlinks.json` (para deployment)

11. **Guarda todo en:**
    ```
    solana-dapp-publishing/build/
    ```

---

### PASO 3: Deploy assetlinks.json

El archivo `assetlinks.json` debe estar accesible en:
```
https://degenagent.fun/.well-known/assetlinks.json
```

**Pasos:**

1. **Crea el archivo en tu frontend:**
   ```bash
   mkdir -p frontend/public/.well-known
   ```

2. **Copia el assetlinks.json generado por PWABuilder:**
   ```bash
   cp solana-dapp-publishing/build/assetlinks.json \
      frontend/public/.well-known/assetlinks.json
   ```

3. **Deploy a Vercel:**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Verifica que funcione:**
   ```bash
   curl https://degenagent.fun/.well-known/assetlinks.json
   ```

   Debería retornar JSON válido.

---

### PASO 4: Test APK Localmente

Antes de submitir, prueba el APK:

1. **Instala en tu Android:**
   ```bash
   # Con USB debugging enabled
   adb install solana-dapp-publishing/build/app-release-signed.apk
   ```

2. **O envía el APK a tu teléfono:**
   - Por email/Telegram
   - Instala manualmente
   - Permite "Install from unknown sources"

3. **Test checklist:**
   - [ ] App abre correctamente
   - [ ] Muestra el sitio web
   - [ ] Wallet connect funciona
   - [ ] Navegación smooth
   - [ ] No hay errores

---

### PASO 5: Mint NFTs en Solana

Necesitas 3 NFTs para registrar tu app on-chain:
1. Publisher NFT
2. App NFT
3. Release NFT

**Prerequisitos:**
```bash
# 1. Instalar Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# 2. Instalar dApp Store CLI
npm install -g @solana-mobile/dapp-store-cli

# 3. Tener wallet con ~0.1 SOL (mainnet)
```

**Crear/Usar Keypair:**

```bash
# Opción A: Usar tu wallet existente
# Exporta tu private key de Phantom/Solflare a un archivo

# Opción B: Crear nueva keypair
solana-keygen new --outfile ~/degenagent-publisher.json

# Verificar balance
solana balance ~/degenagent-publisher.json --url mainnet-beta

# Si necesitas SOL, deposita desde tu wallet principal
```

**Mint Publisher NFT:**

```bash
cd solana-dapp-publishing

npx dapp-store publish create \
  --keypair ~/degenagent-publisher.json \
  --config ./config.yaml \
  --type publisher \
  --url mainnet-beta

# Output: Publisher NFT address
# Guarda este address!
```

**Mint App NFT:**

```bash
npx dapp-store publish create \
  --keypair ~/degenagent-publisher.json \
  --config ./config.yaml \
  --type app \
  --url mainnet-beta \
  --publisher-mint <PUBLISHER_NFT_ADDRESS>

# Output: App NFT address
# Guarda este address!
```

**Mint Release NFT:**

```bash
npx dapp-store publish create \
  --keypair ~/degenagent-publisher.json \
  --config ./config.yaml \
  --type release \
  --url mainnet-beta \
  --app-mint <APP_NFT_ADDRESS> \
  --apk ./build/app-release-signed.apk

# Output: Release NFT address
# Guarda este address!
```

---

### PASO 6: Submit para Review

Una vez tengas los 3 NFTs:

```bash
npx dapp-store publish submit \
  -k ~/degenagent-publisher.json \
  -u https://api.mainnet-beta.solana.com \
  --release-mint <RELEASE_NFT_ADDRESS> \
  --requestor-is-authorized \
  --complies-with-solana-dapp-store-policies
```

**Confirmación:**
- Deberías recibir un email de confirmación
- Review toma 2-3 días
- Te notificarán cuando se apruebe/rechace

---

## 📋 Checklist Final

Antes de submitir, verifica:

### Assets ✅
- [ ] icon-512.png creado y guardado
- [ ] banner-1200x600.png creado y guardado
- [ ] feature-1200x1200.png creado y guardado
- [ ] 5 screenshots 1080x1920px capturados

### Build ✅
- [ ] APK generado con PWABuilder
- [ ] APK firmado correctamente
- [ ] assetlinks.json deployed a degenagent.fun
- [ ] APK testeado en Android

### Solana ✅
- [ ] Keypair creado/importado
- [ ] Wallet tiene >0.1 SOL (mainnet)
- [ ] Publisher NFT minted
- [ ] App NFT minted
- [ ] Release NFT minted
- [ ] Submission enviada

### Compliance ✅
- [ ] config.yaml completado
- [ ] Políticas de Solana leídas y aceptadas
- [ ] Disclaimers de riesgo incluidos
- [ ] Email de contacto válido

---

## 💰 Costos

### Una Vez:
- **Mint NFTs:** ~0.05 SOL (~$5)
- **Gas fees:** ~0.01 SOL (~$1)
- **Total:** ~0.06 SOL (~$6)

### Recurrente:
- **Ninguno** - Es gratis mantener tu app en la store

---

## 📧 Notificaciones

Recibirás emails a: `support@degenagent.fun`

Tipos de notificaciones:
- ✅ Submission received
- ⏳ Under review
- ✅ Approved / ❌ Rejected
- 📱 Updates available
- 🚨 Policy violations (si las hay)

---

## 🎉 Después de la Aprobación

Una vez aprobado:

1. **App aparecerá en Solana dApp Store**
   - Buscar: "DegenAgent"
   - Categoría: Finance

2. **Comparte el link:**
   ```
   https://dapp-store.solanamobile.com/app/fun.degenagent.app
   ```

3. **Marketing:**
   - Tweet anunciando
   - Post en Discord/Telegram
   - Update en degenagent.fun

4. **Monitor:**
   - Downloads
   - Reviews/ratings
   - User feedback

---

## 🔄 Updates Futuros

Para actualizar tu app:

1. **Incrementa version en config.yaml:**
   ```yaml
   release:
     version_name: "1.0.1"  # era 1.0.0
     version_code: 2        # era 1
   ```

2. **Build nuevo APK con PWABuilder**

3. **Mint nuevo Release NFT:**
   ```bash
   npx dapp-store publish create \
     --type release \
     --app-mint <APP_NFT_ADDRESS> \
     --apk ./build/app-release-signed-v2.apk
   ```

4. **Submit update:**
   ```bash
   npx dapp-store publish submit \
     --release-mint <NEW_RELEASE_NFT_ADDRESS>
   ```

Review toma solo 1 día para updates.

---

## ❓ FAQ

### ¿Necesito una cuenta de desarrollador de Google?
**No.** Solana dApp Store es independiente de Google Play.

### ¿Puedo tener mi app en ambas stores?
**Sí**, pero necesitas APKs con diferentes signing keys.

### ¿Qué pasa si me rechazan?
Te dirán la razón. Arregla y re-submitea.

### ¿Cuánto cuesta listar?
Solo el costo de minting NFTs (~0.06 SOL). No hay fees mensuales.

### ¿Puedo eliminar mi app?
Sí, puedes burn los NFTs para removerla.

---

## 🆘 Si Necesitas Ayuda

1. **Docs oficiales:** https://docs.solanamobile.com/dapp-publishing
2. **Solana Mobile Discord:** https://discord.gg/solanamobile
3. **Email:** concerns@dappstore.solanamobile.com

---

## ✅ Listo para Empezar?

**PASO 1:** Crea los assets (iconos, banners, screenshots)
**PASO 2:** Usa PWABuilder.com para generar APK
**PASO 3:** Deploy assetlinks.json
**PASO 4:** Mint NFTs en Solana
**PASO 5:** Submit para review
**PASO 6:** Espera 2-3 días
**PASO 7:** ¡Tu app está live! 🚀

---

*Tiempo total estimado: 1-2 horas*
*Costo total: ~$6 en SOL*

**¡Buena suerte! 🎉**
