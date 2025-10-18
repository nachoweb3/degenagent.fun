# 🔑 Solana dApp Store Publisher Wallet

## ⚠️ INFORMACIÓN CRÍTICA - GUARDA ESTO EN UN LUGAR SEGURO

### Wallet Address
```
5DRE14DX2wCAgXhcnN4fc5SFBzQJTReekd1WGCZpnWDr
```

### Seed Phrase (Recovery)
```
curtain brown tribe armed grass rally become erase blast solar color decline
```

**⚠️ NUNCA COMPARTAS ESTA SEED PHRASE CON NADIE!**

### Keypair File Location
```
C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing\degenagent-publisher.json
```

---

## 💰 SIGUIENTE PASO: Depositar SOL

Necesitas depositar **~0.1 SOL** a esta wallet para poder mint los NFTs.

### Cómo depositar:

1. **Abre Phantom o Solflare**
2. **Send SOL a esta dirección:**
   ```
   5DRE14DX2wCAgXhcnN4fc5SFBzQJTReekd1WGCZpnWDr
   ```
3. **Cantidad:** 0.1 SOL (o más para estar seguro)
4. **Verifica el balance:**
   ```bash
   solana balance C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing\degenagent-publisher.json --url mainnet-beta
   ```

---

## 📝 Cuando tengas SOL depositado, ejecuta:

```bash
cd C:\Users\Usuario\Desktop\Agent.fun\solana-dapp-publishing

# Mint Publisher NFT
npx @solana-mobile/dapp-store-cli@latest publish create ^
  --keypair ./degenagent-publisher.json ^
  --config ./config.yaml ^
  --type publisher ^
  --url https://api.mainnet-beta.solana.com

# Guarda el Publisher mint address que te dé

# Mint App NFT (reemplaza <PUBLISHER_MINT>)
npx @solana-mobile/dapp-store-cli@latest publish create ^
  --keypair ./degenagent-publisher.json ^
  --config ./config.yaml ^
  --type app ^
  --url https://api.mainnet-beta.solana.com ^
  --publisher-mint <PUBLISHER_MINT>

# Guarda el App mint address

# Mint Release NFT (reemplaza <APP_MINT>)
npx @solana-mobile/dapp-store-cli@latest publish create ^
  --keypair ./degenagent-publisher.json ^
  --config ./config.yaml ^
  --type release ^
  --url https://api.mainnet-beta.solana.com ^
  --app-mint <APP_MINT> ^
  --apk ./build/app-release-signed.apk

# Guarda el Release mint address

# Submit para review (reemplaza <RELEASE_MINT>)
npx @solana-mobile/dapp-store-cli@latest publish submit ^
  -k ./degenagent-publisher.json ^
  -u https://api.mainnet-beta.solana.com ^
  --release-mint <RELEASE_MINT> ^
  --requestor-is-authorized ^
  --complies-with-solana-dapp-store-policies
```

---

## ✅ CHECKLIST

- [x] Wallet generada
- [x] Seed phrase guardada
- [x] APK generado y guardado en build/
- [x] assetlinks.json deployed en producción
- [ ] **0.1 SOL depositado a la wallet** ← HACER AHORA
- [ ] Publisher NFT minted
- [ ] App NFT minted
- [ ] Release NFT minted
- [ ] Submission enviada
- [ ] Email de confirmación recibido

---

## 📞 Backup de Información

**GUARDA ESTA INFORMACIÓN EN MÚLTIPLES LUGARES SEGUROS:**
- Seed phrase en papel
- Seed phrase en password manager (1Password, Bitwarden, etc.)
- Keypair file backed up en USB/cloud encriptado

**Sin la seed phrase o el keypair file, NO PODRÁS:**
- Actualizar tu app en el dApp Store
- Recuperar el acceso a los NFTs
- Hacer cambios a tu listing

---

*Generado: 14 de Octubre 2025*
