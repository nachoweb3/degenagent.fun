# 🚀 Guía Manual de Submission - Solana dApp Store

## ⚠️ PROBLEMA DETECTADO

La nueva versión del CLI (`@solana-mobile/dapp-store-cli@0.13.1`) tiene bugs/cambios que causan errores con nuestro `config.yaml`.

Error: `Cannot read properties of undefined (reading 'find')`

## ✅ LO QUE ESTÁ LISTO

- ✅ **Wallet creada** con 0.119 SOL
  - Address: `5DRE14DX2wCAgXhcnN4fc5SFBzQJTReekd1WGCZpnWDr`
  - Keypair: `solana-dapp-publishing/degenagent-publisher.json`

- ✅ **APK generado y listo**
  - Location: `solana-dapp-publishing/build/app-release-signed.apk`
  - Size: 1.4 MB

- ✅ **assetlinks.json deployed**
  - URL: `https://frontend-5t3wkkwaj-nachodacals-projects.vercel.app/.well-known/assetlinks.json`

- ✅ **Assets preparados**
  - icon-512.png
  - banner-1200x600.png
  - feature-1200x1200.png

---

## 🎯 OPCIONES PARA CONTINUAR

### OPCIÓN 1: Usar el Portal Web (RECOMENDADO)

El Solana dApp Store ahora tiene un portal web para publishers:

**Portal URL:** https://dapp-publishing.solanamobile.com/

#### Pasos:

1. **Conecta tu wallet**
   - Ve a https://dapp-publishing.solanamobile.com/
   - Conecta con Phantom/Solflare usando la wallet:
     ```
     5DRE14DX2wCAgXhcnN4fc5SFBzQJTReekd1WGCZpnWDr
     ```
   - **IMPORTANTE:** Necesitarás importar la keypair a Phantom/Solflare primero

2. **Importar keypair a Phantom:**
   ```bash
   # Primero, exporta la private key en formato base58:
   solana-keygen pubkey /c/Users/Usuario/Desktop/Agent.fun/solana-dapp-publishing/degenagent-publisher.json --outfile pubkey.txt

   # Luego en Phantom:
   # Settings → Add/Connect Wallet → Import Private Key
   # Pega la seed phrase que guardamos:
   # curtain brown tribe armed grass rally become erase blast solar color decline
   ```

3. **Subir tu app en el portal:**
   - Click en "Submit New App"
   - Llena el formulario con los datos de `config.yaml`
   - Sube el APK: `solana-dapp-publishing/build/app-release-signed.apk`
   - Sube las imágenes:
     - Icon: `solana-dapp-publishing/assets/icon-512.png`
     - Banner: `solana-dapp-publishing/assets/banner-1200x600.png`
     - Feature: `solana-dapp-publishing/assets/feature-1200x1200.png`

4. **Submit para review**

---

### OPCIÓN 2: Contactar al Team de Solana Mobile

El equipo de Solana Mobile puede ayudarte directamente:

1. **Discord de Solana Mobile:**
   - Join: https://discord.gg/solanamobile
   - Canal: `#dapp-store`
   - Pide ayuda con la submission

2. **Email:**
   - Email: concerns@dappstore.solanamobile.com
   - Explica que tienes un APK listo para submit
   - Adjunta info de tu app

---

### OPCIÓN 3: Intentar con Versión Anterior del CLI

Podemos intentar con una versión anterior del CLI que no tenga este bug:

```bash
cd C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing

# Intentar con versión anterior (0.12.x o 0.11.x)
npx @solana-mobile/dapp-store-cli@0.12.0 create app -k ./degenagent-publisher.json -u https://api.mainnet-beta.solana.com

# Si funciona, continuar con:
npx @solana-mobile/dapp-store-cli@0.12.0 create release -k ./degenagent-publisher.json -u https://api.mainnet-beta.solana.com

# Y luego submit:
npx @solana-mobile/dapp-store-cli@0.12.0 publish submit -k ./degenagent-publisher.json -u https://api.mainnet-beta.solana.com --requestor-is-authorized --complies-with-solana-dapp-store-policies
```

---

## 📋 INFORMACIÓN PARA SUBMISSION MANUAL

Si usas el portal web o contactas al team, aquí está toda la info necesaria:

### App Details
```yaml
App Name: DegenAgent.fun
Package Name: fun.degenagent.app
Category: FINANCE
Version: 1.0.0 (Build 1)
```

### URLs
```
Website: https://degenagent.fun
Privacy Policy: https://degenagent.fun/privacy
Terms: https://degenagent.fun/terms
Twitter: https://twitter.com/degenagent_fun
Telegram: https://t.me/agentfun
Discord: https://discord.gg/agentfun
```

### Description (English)
```
DegenAgent.fun is a revolutionary platform that allows you to create and manage
autonomous AI trading agents on Solana. Powered by GPT-4, your agents analyze
markets, execute trades, and generate profits while you sleep.

KEY FEATURES:
🤖 AI-Powered Trading - GPT-4 analyzes market sentiment and makes intelligent decisions
⚡ Fully Autonomous - Your agent operates 24/7 without manual intervention
🔒 Secure & Transparent - All trades executed on-chain with full transparency
💰 Tokenized Ownership - Each agent has its own SPL token with revenue sharing
📈 Jupiter Integration - Best-in-class DEX aggregation for optimal prices
📱 Mobile Ready - Optimized for Solana Saga and Seeker devices

HOW IT WORKS:
1. Create - Define your agent's trading mission and risk tolerance
2. Fund - Deposit SOL into your agent's vault
3. Trade - AI analyzes markets and executes trades automatically
4. Earn - Hold agent tokens to receive trading profits

MONETIZATION:
• Direct trading profits from successful trades
• Passive income from agent token holdings
• Referral rewards (10% commission per referral)
• Daily challenges with SOL rewards

FEATURES:
✅ 3-Subagent AI System (Market Analyzer, Risk Manager, Execution Optimizer)
✅ Risk management with stop-loss and position limits
✅ Real-time portfolio tracking
✅ Social trading features and leaderboards
✅ Referral system with passive income
✅ Live trading stream (Reality Show)

SECURITY:
• Non-custodial wallets (you control your funds)
• HD wallets with encrypted private keys
• On-chain transparency
• Audited smart contracts

Join thousands of traders using AI to maximize their DeFi returns on Solana!
```

### Short Description
```
Create AI trading agents that operate 24/7 on Solana blockchain
```

### Keywords
```
Solana, DeFi, AI Trading, Trading Bot, Crypto, Autonomous Agent, Jupiter, Memecoin, GPT-4, Passive Income
```

### Compliance
```
Age Rating: TEEN (13+)
Complies with Policies: Yes

Warnings:
- Trading cryptocurrencies involves significant risk
- Past performance does not guarantee future results
- Only invest what you can afford to lose

Content Rating:
- Financial Services
- Real Money Trading
```

### Technical
```
Min SDK: Android 7.0 (API 24)
Target SDK: Android 14 (API 34)

Permissions:
- INTERNET
- ACCESS_NETWORK_STATE
- VIBRATE
- WAKE_LOCK
```

### Files Ready
```
APK: solana-dapp-publishing/build/app-release-signed.apk (1.4 MB)
AAB: solana-dapp-publishing/build/app-release-bundle.aab (1.5 MB)
Icon: solana-dapp-publishing/assets/icon-512.png (512x512)
Banner: solana-dapp-publishing/assets/banner-1200x600.png (1200x600)
Feature: solana-dapp-publishing/assets/feature-1200x1200.png (1200x1200)
Keystore: solana-dapp-publishing/build/signing.keystore
```

### Wallet Info
```
Publisher Wallet: 5DRE14DX2wCAgXhcnN4fc5SFBzQJTReekd1WGCZpnWDr
Balance: 0.119 SOL
Seed Phrase: (en WALLET_INFO.md - NO COMPARTIR PÚBLICAMENTE)
```

---

## 🎯 RECOMENDACIÓN

**MI RECOMENDACIÓN: Usa la OPCIÓN 1 (Portal Web)**

Es más fácil, visual, y evita los problemas del CLI. El portal te guiará paso a paso.

1. Importa la seed phrase a Phantom
2. Ve al portal: https://dapp-publishing.solanamobile.com/
3. Conecta wallet y sube tu app
4. Submit!

---

## 📞 NECESITAS AYUDA?

### Solana Mobile Discord
- URL: https://discord.gg/solanamobile
- Canal: `#dapp-store`
- Menciona que tienes un APK listo y necesitas ayuda con submission

### Email Support
- Email: concerns@dappstore.solanamobile.com
- Subject: "dApp Submission - DegenAgent.fun"
- Explica tu situación

---

## ✅ SIGUIENTE PASO

**Elige una de las 3 opciones arriba y procede!**

Todo está preparado:
- ✅ APK generado y firmado
- ✅ Wallet con SOL
- ✅ Assets listos
- ✅ assetlinks.json deployed
- ✅ Config completo

Solo falta hacer el submit usando el portal web o contactando al team!

---

*Generado: 14 de Octubre 2025*
*Última actualización: Después de detectar bug en CLI v0.13.1*
