# 🚀 Comandos Exactos para Ejecutar

Copia y pega estos comandos exactamente como aparecen.

---

## 📋 Prerequisitos

### 1. Instalar Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Verifica instalación
solana --version
```

### 2. Instalar dApp Store CLI

```bash
npm install -g @solana-mobile/dapp-store-cli

# Verifica instalación
npx @solana-mobile/dapp-store-cli --version
```

### 3. Crear/Usar Keypair

**Opción A: Crear Nueva Keypair**
```bash
solana-keygen new --outfile ~/degenagent-publisher.json

# Guarda la seed phrase en un lugar SEGURO!
```

**Opción B: Usar Keypair Existente**
```bash
# Exporta tu private key de Phantom/Solflare
# Guarda en ~/degenagent-publisher.json
```

### 4. Depositar SOL (Mainnet)

```bash
# Ver tu wallet address
solana address -k ~/degenagent-publisher.json

# Deposita ~0.1 SOL desde tu wallet principal a esta address

# Verificar balance
solana balance ~/degenagent-publisher.json --url mainnet-beta
```

---

## 🎨 PASO 1: Crear Assets

Ver guía completa en: `ASSETS_REQUIREMENTS.md`

### Assets Necesarios:

```bash
# Crear estas carpetas primero
mkdir -p assets/screenshots

# Luego crear estos archivos:
# assets/icon-512.png (512x512px)
# assets/banner-1200x600.png (1200x600px)
# assets/feature-1200x1200.png (1200x1200px)
# assets/screenshots/1-home.png (1080x1920px)
# assets/screenshots/2-create.png (1080x1920px)
# assets/screenshots/3-dashboard.png (1080x1920px)
# assets/screenshots/4-trading.png (1080x1920px)
# assets/screenshots/5-referral.png (1080x1920px)
```

**Herramientas:**
- Icon/Banner: https://www.canva.com/
- Screenshots: Chrome DevTools (Responsive 1080x1920)

---

## 📱 PASO 2: Convertir PWA a APK

### Usando PWABuilder.com (Más Fácil):

```
1. Ve a: https://www.pwabuilder.com/

2. Ingresa tu URL: https://degenagent.fun

3. Click "Start"

4. Click "Package for Stores" → "Android"

5. Configura:
   Package ID: fun.degenagent.app
   App name: DegenAgent.fun
   Launcher name: DegenAgent
   Theme color: #9945FF
   Background color: #000000
   Icon URL: https://degenagent.fun/icon-512.png
   Start URL: https://degenagent.fun
   Display mode: standalone
   Orientation: portrait

6. Click "Generate"

7. Descarga:
   - app-release-signed.apk
   - app-release-bundle.aab
   - assetlinks.json

8. Guarda todo en:
   solana-dapp-publishing/build/
```

### O Usando Bubblewrap CLI:

```bash
# Instalar Bubblewrap
npm install -g @bubblewrap/cli

# Navegar al directorio
cd C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing

# Inicializar proyecto
bubblewrap init --manifest https://degenagent.fun/manifest.json

# Configurar cuando se te pida:
# Package name: fun.degenagent.app
# App name: DegenAgent.fun
# Display mode: standalone
# etc.

# Build APK
bubblewrap build

# Output estará en:
# ./app-release-signed.apk
# Muévelo a build/
mv app-release-signed.apk build/
```

---

## 🌐 PASO 3: Deploy assetlinks.json

```bash
# Navegar al proyecto
cd C:\Users\Usuario\Desktop\Agent.fun

# Crear directorio .well-known
mkdir -p frontend/public/.well-known

# Copiar assetlinks.json generado por PWABuilder
cp solana-dapp-publishing/build/assetlinks.json frontend/public/.well-known/assetlinks.json

# Deploy a Vercel
cd frontend
vercel --prod

# Espera a que termine el deploy

# Verifica que funcione
curl https://degenagent.fun/.well-known/assetlinks.json

# Debería retornar JSON válido
```

---

## 📲 PASO 4: Test APK (Opcional pero Recomendado)

### En Windows con Android:

```bash
# Conecta tu teléfono Android con USB debugging

# Verifica conexión
adb devices

# Instala APK
adb install solana-dapp-publishing/build/app-release-signed.apk

# Abre el app en tu teléfono y prueba que todo funcione
```

### O Envía APK por Email/Telegram:

```bash
# Simplemente envía el archivo:
# solana-dapp-publishing/build/app-release-signed.apk
# A tu email o teléfono

# En el teléfono:
# 1. Permite "Install from unknown sources"
# 2. Abre el archivo APK
# 3. Instala
# 4. Prueba el app
```

---

## 🔑 PASO 5: Mint NFTs en Solana

```bash
# Navegar al directorio de scripts
cd C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing\scripts

# Hacer scripts ejecutables (en Linux/Mac)
chmod +x mint-nfts.sh
chmod +x submit-for-review.sh

# Ejecutar script de minting
# Reemplaza <KEYPAIR_PATH> con tu ruta real
./mint-nfts.sh ~/degenagent-publisher.json

# Si no funciona en Windows, ejecuta manualmente:
```

### Mint Manual (Si el Script No Funciona):

```bash
cd C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing

# 1. Mint Publisher NFT
npx @solana-mobile/dapp-store-cli@latest publish create \
  --keypair ~/degenagent-publisher.json \
  --config ./config.yaml \
  --type publisher \
  --url https://api.mainnet-beta.solana.com

# Output: Copia el "Publisher mint address"
# Ejemplo: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

# 2. Mint App NFT (usa el Publisher address del paso anterior)
npx @solana-mobile/dapp-store-cli@latest publish create \
  --keypair ~/degenagent-publisher.json \
  --config ./config.yaml \
  --type app \
  --url https://api.mainnet-beta.solana.com \
  --publisher-mint <PUBLISHER_MINT_ADDRESS>

# Output: Copia el "App mint address"
# Ejemplo: 8yYXtg3CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV

# 3. Mint Release NFT (usa el App address del paso anterior)
npx @solana-mobile/dapp-store-cli@latest publish create \
  --keypair ~/degenagent-publisher.json \
  --config ./config.yaml \
  --type release \
  --url https://api.mainnet-beta.solana.com \
  --app-mint <APP_MINT_ADDRESS> \
  --apk ./build/app-release-signed.apk

# Output: Copia el "Release mint address"
# Ejemplo: 9zZXtg4CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV

# GUARDA TODOS LOS ADDRESSES! Los necesitarás
```

---

## 📤 PASO 6: Submit para Review

```bash
# Usando el script (si funciona)
cd C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing\scripts
./submit-for-review.sh ~/degenagent-publisher.json <RELEASE_MINT_ADDRESS>
```

### Submit Manual (Si el Script No Funciona):

```bash
cd C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing

# Usa el Release NFT address del paso anterior
npx @solana-mobile/dapp-store-cli@latest publish submit \
  -k ~/degenagent-publisher.json \
  -u https://api.mainnet-beta.solana.com \
  --release-mint <RELEASE_MINT_ADDRESS> \
  --requestor-is-authorized \
  --complies-with-solana-dapp-store-policies

# Confirma cuando se te pida

# Output: Confirmation message
# Email de confirmación llegará a: support@degenagent.fun
```

---

## ✅ Verificación Final

### Después de Submit:

```bash
# 1. Verificar que assetlinks.json sea accesible
curl https://degenagent.fun/.well-known/assetlinks.json

# 2. Verificar que manifest.json sea correcto
curl https://degenagent.fun/manifest.json

# 3. Verificar health check del backend
curl https://agent-fun.onrender.com/health

# 4. Verificar que todos los NFTs fueron creados
# Ve a Solscan para verificar las transacciones:
# https://solscan.io/account/<PUBLISHER_MINT>
# https://solscan.io/account/<APP_MINT>
# https://solscan.io/account/<RELEASE_MINT>
```

---

## 📧 Después de Submitir

### Qué Esperar:

1. **Email de Confirmación** (Inmediato)
   - A: support@degenagent.fun
   - Confirma que submission fue recibida

2. **Review Process** (2-3 días)
   - Solana Mobile team revisará tu app
   - Verificarán compliance con políticas
   - Testarán el APK

3. **Email de Resultado** (2-3 días después)
   - **Aprobado:** App aparecerá en dApp Store
   - **Rechazado:** Te dirán qué arreglar

### Si Te Rechazan:

1. Lee el feedback del email
2. Arregla los issues mencionados
3. Incrementa version en `config.yaml`:
   ```yaml
   release:
     version_name: "1.0.1"
     version_code: 2
   ```
4. Genera nuevo APK
5. Mint nuevo Release NFT
6. Re-submit

---

## 🎉 Una Vez Aprobado

### Tu app estará en:

```
https://dapp-store.solanamobile.com/app/fun.degenagent.app
```

### Promociona:

```bash
# Tweet de ejemplo:
"🎉 DegenAgent.fun is now LIVE on @SolanaMobile dApp Store!

Create AI trading agents that operate 24/7 on #Solana

📱 Download: [link]
💰 Start earning passive income with autonomous trading
🤖 Powered by GPT-4

#SolanaMobile #DeFi #AITrading"
```

---

## 🆘 Troubleshooting

### Error: "Command not found"

```bash
# Asegura que Node.js esté instalado
node --version
npm --version

# Reinstala el CLI
npm install -g @solana-mobile/dapp-store-cli
```

### Error: "Insufficient balance"

```bash
# Verifica balance
solana balance ~/degenagent-publisher.json --url mainnet-beta

# Deposita más SOL si es necesario
# Necesitas mínimo ~0.1 SOL
```

### Error: "Invalid manifest"

```bash
# Verifica que manifest.json sea válido
curl https://degenagent.fun/manifest.json | json_pp

# Asegura que tenga todos los campos requeridos
```

### Error: "Asset links not found"

```bash
# Verifica que assetlinks.json esté deployed
curl https://degenagent.fun/.well-known/assetlinks.json

# Si no funciona, re-deploy:
cd frontend
vercel --prod
```

### Error: "APK signature mismatch"

```bash
# Verifica firma del APK
jarsigner -verify -verbose solana-dapp-publishing/build/app-release-signed.apk

# Si falla, regenera APK con PWABuilder
```

---

## 📞 Soporte

### Solana Mobile:
- **Email:** concerns@dappstore.solanamobile.com
- **Discord:** https://discord.gg/solanamobile
- **Docs:** https://docs.solanamobile.com/dapp-publishing

### PWABuilder:
- **Website:** https://www.pwabuilder.com/
- **Discord:** https://aka.ms/pwab/discord
- **GitHub:** https://github.com/pwa-builder/PWABuilder

---

## 💡 Tips Finales

1. **Guarda todos los mint addresses** - Los necesitarás para updates

2. **Backup tu keypair** - Sin él no podrás actualizar tu app

3. **Test todo antes de submitir** - Ahorra tiempo de review

4. **Prepara marketing** - Anuncia cuando se apruebe

5. **Monitor reviews** - Responde a feedback de usuarios

---

## ✅ Checklist de Ejecución

- [ ] Solana CLI instalado
- [ ] dApp Store CLI instalado
- [ ] Keypair creado/importado
- [ ] 0.1 SOL depositado (mainnet)
- [ ] Assets visuales creados
- [ ] APK generado con PWABuilder
- [ ] assetlinks.json deployed
- [ ] APK testeado en Android
- [ ] Publisher NFT minted
- [ ] App NFT minted
- [ ] Release NFT minted
- [ ] Submission enviada
- [ ] Email de confirmación recibido
- [ ] Esperando review (2-3 días)

---

**¡Todo listo! Solo copia y pega los comandos paso a paso! 🚀**

*Si tienes dudas, revisa: SOLANA_DAPP_STORE_QUICKSTART.md*
