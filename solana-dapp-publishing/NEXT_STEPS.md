# 🚀 PRÓXIMOS PASOS - Publicación en Solana dApp Store

## ✅ Completado

- ✅ Assets copiados desde Desktop/assets a solana-dapp-publishing/assets/
- ✅ Config.yaml configurado con todos los detalles de la app
- ✅ Scripts de minting y submission listos
- ✅ Manifest.json verificado y listo
- ✅ Template de assetlinks.json creado

---

## 📋 LO QUE NECESITAS HACER AHORA

### 1️⃣ CONVERTIR PWA A APK (OPCIÓN MÁS FÁCIL)

Ve a **PWABuilder.com**:

```
URL: https://www.pwabuilder.com/

Pasos:
1. Ingresa: https://degenagent.fun
2. Click "Start"
3. Click "Package for Stores" → "Android"
4. Configura:
   - Package ID: fun.degenagent.app
   - App name: DegenAgent.fun
   - Launcher name: DegenAgent
   - Theme color: #9945FF
   - Background color: #000000
   - Start URL: https://degenagent.fun
5. Click "Generate"
6. Descarga el APK
7. Guárdalo en: solana-dapp-publishing/build/app-release-signed.apk
```

**IMPORTANTE**: PWABuilder generará también un archivo `assetlinks.json`. Guárdalo porque lo necesitarás en el paso 2.

---

### 2️⃣ DEPLOY ASSETLINKS.JSON

Necesitas subir el archivo `assetlinks.json` a tu dominio:

```bash
# Copia el assetlinks.json de PWABuilder
cp assetlinks.json frontend/public/.well-known/assetlinks.json

# Deploy a Vercel
cd frontend
vercel --prod

# Verifica que funcione
curl https://degenagent.fun/.well-known/assetlinks.json
```

**DEBE** estar accesible en: `https://degenagent.fun/.well-known/assetlinks.json`

---

### 3️⃣ TEST DEL APK (OPCIONAL PERO RECOMENDADO)

Instala el APK en tu teléfono Android para probarlo:

**Opción A - USB:**
```bash
adb devices
adb install solana-dapp-publishing/build/app-release-signed.apk
```

**Opción B - Email/Telegram:**
- Envíate el APK por email o Telegram
- En el teléfono: Settings → Security → "Allow install from unknown sources"
- Abre el archivo APK y instala

---

### 4️⃣ CREAR KEYPAIR Y DEPOSITAR SOL

```bash
# Crear keypair para publicación
solana-keygen new --outfile ~/degenagent-publisher.json

# IMPORTANTE: Guarda la seed phrase en un lugar seguro!

# Ver tu dirección
solana address -k ~/degenagent-publisher.json

# Deposita ~0.1 SOL desde Phantom/Solflare a esta dirección

# Verificar balance
solana balance ~/degenagent-publisher.json --url mainnet-beta
```

---

### 5️⃣ MINT NFTs

**Opción A - Usando el script (Linux/Mac/Git Bash):**

```bash
cd solana-dapp-publishing/scripts
chmod +x mint-nfts.sh
./mint-nfts.sh ~/degenagent-publisher.json
```

**Opción B - Manual (Windows CMD):**

```bash
cd C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing

# 1. Mint Publisher NFT
npx @solana-mobile/dapp-store-cli@latest publish create ^
  --keypair ~/degenagent-publisher.json ^
  --config ./config.yaml ^
  --type publisher ^
  --url https://api.mainnet-beta.solana.com

# Copia el "Publisher mint address"

# 2. Mint App NFT
npx @solana-mobile/dapp-store-cli@latest publish create ^
  --keypair ~/degenagent-publisher.json ^
  --config ./config.yaml ^
  --type app ^
  --url https://api.mainnet-beta.solana.com ^
  --publisher-mint <PUBLISHER_MINT_ADDRESS>

# Copia el "App mint address"

# 3. Mint Release NFT
npx @solana-mobile/dapp-store-cli@latest publish create ^
  --keypair ~/degenagent-publisher.json ^
  --config ./config.yaml ^
  --type release ^
  --url https://api.mainnet-beta.solana.com ^
  --app-mint <APP_MINT_ADDRESS> ^
  --apk ./build/app-release-signed.apk

# Copia el "Release mint address"
```

**GUARDA TODOS LOS MINT ADDRESSES** en un archivo de texto seguro!

---

### 6️⃣ SUBMIT PARA REVIEW

**Opción A - Usando el script:**

```bash
cd solana-dapp-publishing/scripts
chmod +x submit-for-review.sh
./submit-for-review.sh ~/degenagent-publisher.json <RELEASE_MINT_ADDRESS>
```

**Opción B - Manual:**

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

Antes de submitir, verifica:

- [ ] APK generado y guardado en `solana-dapp-publishing/build/app-release-signed.apk`
- [ ] assetlinks.json deployed y accesible en `https://degenagent.fun/.well-known/assetlinks.json`
- [ ] APK testeado en dispositivo Android (opcional pero recomendado)
- [ ] Keypair creado con ~0.1 SOL en mainnet-beta
- [ ] Publisher NFT minted
- [ ] App NFT minted
- [ ] Release NFT minted
- [ ] Todos los mint addresses guardados
- [ ] Submission enviada

---

## 📧 QUÉ ESPERAR DESPUÉS

1. **Email de Confirmación** (Inmediato)
   - A: support@degenagent.fun
   - Confirma que submission fue recibida

2. **Review Process** (2-3 días)
   - Solana Mobile team revisará la app
   - Verificarán compliance con políticas
   - Testarán el APK

3. **Email de Resultado**
   - **Aprobado:** App aparecerá en dApp Store 🎉
   - **Rechazado:** Te dirán qué arreglar y puedes re-submitir

---

## 📁 ESTRUCTURA DE ARCHIVOS ACTUAL

```
solana-dapp-publishing/
├── assets/
│   ├── icon-512.png                    ✅ (Copiado desde Desktop/assets)
│   ├── banner-1200x600.png             ✅ (Copiado desde Desktop/assets)
│   ├── feature-1200x1200.png           ✅ (Copiado desde Desktop/assets)
│   └── screenshots/                    ⚠️ (Necesitas crear screenshots 1080x1920)
│       ├── 1-home.png                  ⚠️ (Pendiente)
│       ├── 2-create.png                ⚠️ (Pendiente)
│       ├── 3-dashboard.png             ⚠️ (Pendiente)
│       ├── 4-trading.png               ⚠️ (Pendiente)
│       └── 5-referral.png              ⚠️ (Pendiente)
├── build/
│   ├── app-release-signed.apk          ⚠️ (Genera con PWABuilder)
│   └── assetlinks.json                 ⚠️ (Genera con PWABuilder)
├── scripts/
│   ├── mint-nfts.sh                    ✅ (Listo)
│   └── submit-for-review.sh            ✅ (Listo)
├── config.yaml                          ✅ (Configurado)
├── assetlinks.json.template             ✅ (Template listo)
├── README.md                            ✅ (Documentación completa)
├── ASSETS_REQUIREMENTS.md               ✅ (Guía de assets)
├── COMMANDS_TO_RUN.md                   ✅ (Comandos paso a paso)
└── NEXT_STEPS.md                        ✅ (Este archivo)
```

---

## ⚠️ NOTA SOBRE SCREENSHOTS

Los screenshots (1080x1920px) son **OPCIONALES** para la submission inicial, pero **ALTAMENTE RECOMENDADOS** para mejor presencia en la Store.

**Cómo crearlos:**

1. Abre Chrome DevTools (F12)
2. Click en "Toggle device toolbar" (Ctrl+Shift+M)
3. Ajusta dimensiones: 1080 × 1920
4. Navega a cada página:
   - https://degenagent.fun/ (home)
   - https://degenagent.fun/create (create agent)
   - https://degenagent.fun/dashboard (dashboard)
   - https://degenagent.fun/explore (trading)
   - https://degenagent.fun/referrals (referral)
5. Captura: Ctrl+Shift+P → "Capture full size screenshot"
6. Guarda en `solana-dapp-publishing/assets/screenshots/`

**Si no tienes tiempo ahora**, puedes submitir sin screenshots y agregarlos en una actualización posterior.

---

## 🆘 SOPORTE

### Solana Mobile:
- **Email:** concerns@dappstore.solanamobile.com
- **Docs:** https://docs.solanamobile.com/dapp-publishing
- **Discord:** https://discord.gg/solanamobile

### PWABuilder:
- **Website:** https://www.pwabuilder.com/
- **Discord:** https://aka.ms/pwab/discord

---

## 🎉 ¡CASI LISTO!

Los pasos más importantes son:

1. **Generar APK con PWABuilder** (~5 minutos)
2. **Deploy assetlinks.json** (~2 minutos)
3. **Crear keypair y depositar 0.1 SOL** (~5 minutos)
4. **Mint NFTs** (~5 minutos)
5. **Submit** (~1 minuto)

**Tiempo total estimado: ~20 minutos**

Después de eso, solo espera 2-3 días para la aprobación! 🚀

---

**¡Buena suerte con la publicación! 🎊**

*Si tienes alguna duda, consulta los otros archivos .md en esta carpeta para más detalles.*
