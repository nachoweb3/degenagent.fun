# 🧪 Guía de Testing en Devnet - Agent.fun

## 🎯 Objetivo

Testear la arquitectura híbrida optimizada en Solana Devnet **completamente gratis** antes de deployar a mainnet.

---

## ✅ Estado Actual

### Completado ✅
- [x] Smart contract simplificado (`agent-registry`) creado
- [x] Modelos de base de datos (Agent, Trade) definidos
- [x] Sistema de database configurado (SQLite dev)
- [x] Backend actualizado para inicializar DB
- [x] Dependencias instaladas (sequelize, sqlite3)
- [x] Documentación completa

### Pendiente ⏳
- [ ] Instalar Solana CLI
- [ ] Instalar Anchor Framework
- [ ] Compilar smart contract
- [ ] Deploy a devnet
- [ ] Actualizar backend para usar nuevos contratos
- [ ] Testing end-to-end

---

## 📦 Prerequisitos

### 1. Instalar Solana CLI

**Windows:**
```powershell
# Descargar e instalar
curl https://release.solana.com/v1.18.17/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs

# Ejecutar instalador
C:\solana-install-tmp\solana-install-init.exe v1.18.17

# Agregar a PATH (reiniciar terminal después)
# %USERPROFILE%\.local\share\solana\install\active_release\bin
```

**Verificar instalación:**
```bash
solana --version
# Debería mostrar: solana-cli 1.18.17
```

### 2. Instalar Rust (si no lo tienes)

**Windows:**
```powershell
# Descargar e instalar rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Reiniciar terminal y verificar
rustc --version
cargo --version
```

### 3. Instalar Anchor Framework

```bash
# Instalar AVM (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Instalar Anchor 0.29.0
avm install 0.29.0
avm use 0.29.0

# Verificar
anchor --version
# Debería mostrar: anchor-cli 0.29.0
```

---

## 🚀 Proceso de Testing en Devnet

### Paso 1: Configurar Solana para Devnet

```bash
# Configurar cluster a devnet
solana config set --url https://api.devnet.solana.com

# Crear wallet de testing (si no tienes)
solana-keygen new --outfile ~/.config/solana/devnet.json

# Usar este wallet
solana config set --keypair ~/.config/solana/devnet.json

# Verificar configuración
solana config get
```

**Salida esperada:**
```
Config File: C:\Users\Usuario\.config\solana\cli\config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: C:\Users\Usuario\.config\solana\devnet.json
Commitment: confirmed
```

### Paso 2: Obtener SOL de Devnet (Gratis)

```bash
# Solicitar airdrop (2 SOL cada vez)
solana airdrop 2

# Verificar balance
solana balance

# Puedes solicitar más airdrops si necesitas
solana airdrop 2
solana airdrop 2
# Total: 6 SOL devnet (gratis)
```

**Nota**: Devnet SOL no tiene valor real, es solo para testing.

### Paso 3: Compilar Smart Contract

```bash
# Desde la raíz del proyecto
cd C:\Users\Usuario\Desktop\Agent.fun

# Limpiar builds anteriores
anchor clean

# Compilar (toma ~2-5 minutos)
anchor build
```

**Salida esperada:**
```
Compiling agent-registry v0.1.0
    Finished release [optimized] target(s) in 2m 34s
```

**Verificar el build:**
```bash
# Verificar que se creó el archivo .so
dir target\deploy\agent_registry.so

# Ver tamaño (debería ser ~15-20 KB)
# Comparado con 220 KB de la versión anterior
```

### Paso 4: Deploy a Devnet

```bash
# Deploy (usa SOL de devnet, gratis)
anchor deploy --provider.cluster devnet

# Esto tomará ~2-3 minutos
# Costo: ~2-3 SOL devnet (gratis)
```

**Salida esperada:**
```
Deploying cluster: devnet
Upgrade authority: YourPublicKey...
Deploying program "agent-registry"...
Program Id: NewProgramId123...

Deploy success
```

**Guardar el Program ID que aparece en la salida!**

### Paso 5: Actualizar Environment Variables

Copia el Program ID del paso anterior y actualízalo en el backend:

**Archivo**: `backend/.env`
```bash
# Agregar o actualizar:
REGISTRY_PROGRAM_ID=<Program-ID-del-deploy>
RPC_ENDPOINT=https://api.devnet.solana.com
NETWORK=devnet
```

### Paso 6: Generar TypeScript Types

```bash
# Anchor genera automáticamente los tipos
# Están en: target/types/agent_registry.ts

# Copiar al backend
cp target/types/agent_registry.ts backend/src/types/
```

### Paso 7: Reiniciar Backend

```bash
# Detener backend actual (Ctrl+C)

# Reiniciar
cd backend
npm run dev
```

**Verificar en logs:**
```
✅ Database connection established
✅ Database models synchronized
🚀 AGENT.FUN Backend running on port 3001
📡 Connected to: https://api.devnet.solana.com
💾 Database: SQLite (development)
```

### Paso 8: Testing End-to-End

#### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

**Salida esperada:**
```json
{
  "status": "ok",
  "network": "https://api.devnet.solana.com",
  "blockHeight": 123456789,
  "timestamp": "2025-01-13T..."
}
```

#### Test 2: Crear Agente (Vía Frontend)

1. Abrir: http://localhost:3002
2. Conectar wallet (Phantom en devnet)
3. Ir a "Create Agent"
4. Rellenar:
   - Name: "Test Agent"
   - Purpose: "Testing hybrid architecture"
   - Initial Deposit: 0.1 SOL
5. Click "Create Agent"

**Backend debería:**
- Generar wallet para el agente
- Encriptar private key
- Guardar en SQLite
- Llamar `register_agent` en blockchain
- Retornar agent_id

**Verificar en Solscan:**
```
https://solscan.io/account/<AGENT-WALLET>?cluster=devnet
```

#### Test 3: Verificar en Base de Datos

```bash
# Instalar sqlite3 CLI (opcional)
# O usar un GUI como DB Browser for SQLite

# Ver agentes creados
sqlite3 backend/data/agent-fun.db "SELECT * FROM agents;"
```

#### Test 4: Verificar en Blockchain

```bash
# Ver la cuenta del registry en blockchain
solana account <REGISTRY-PDA-ADDRESS> --url devnet

# Ver balance del agente
solana balance <AGENT-WALLET> --url devnet
```

---

## 🧪 Tests Adicionales

### Test Trading (Manual)

Una vez tengas un agente creado, puedes testear el flujo de trading:

1. **Depositar fondos al agente** (vía frontend)
2. **Ejecutar trade manualmente** (vía backend API):
   ```bash
   curl -X POST http://localhost:3001/api/agent/execute-trade \
     -H "Content-Type: application/json" \
     -d '{
       "agentId": "your-agent-uuid",
       "tokenIn": "So11111111111111111111111111111111111111112",
       "tokenOut": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
       "amount": 0.01
     }'
   ```

3. **Verificar trade en DB**:
   ```bash
   sqlite3 backend/data/agent-fun.db "SELECT * FROM trades WHERE agentId='your-agent-uuid';"
   ```

4. **Verificar transacción en Solscan**:
   ```
   https://solscan.io/tx/<SIGNATURE>?cluster=devnet
   ```

### Test Revenue Flow

1. **Simular revenue acumulado** (modifica DB o ejecuta trades)
2. **Llamar deposit_revenue** desde backend
3. **Owner reclama revenue** (vía frontend)
4. **Verificar transfer en blockchain**

---

## 📊 Comparación: Devnet vs Mainnet

| Aspecto | Devnet | Mainnet |
|---------|--------|---------|
| SOL | Gratis (airdrop) | Real ($100/SOL) |
| Deploy cost | Gratis | 2-3 SOL ($200-300) |
| Transacciones | Gratis | ~0.00001 SOL |
| Reset | Periódicamente | Never |
| Datos | Pueden perderse | Permanentes |
| Testing | Ilimitado | Cuidadoso |
| Users | Solo testing | Reales |
| Revenue | Simulado | Real |

---

## ✅ Checklist de Testing

### Pre-Deploy
- [ ] Solana CLI instalado
- [ ] Anchor instalado
- [ ] Wallet devnet creado
- [ ] 5+ SOL devnet obtenidos

### Deploy
- [ ] `anchor build` exitoso
- [ ] `anchor deploy` exitoso
- [ ] Program ID guardado
- [ ] Backend actualizado con Program ID

### Backend
- [ ] Database inicializada
- [ ] Health check responde
- [ ] Logs sin errores

### Frontend
- [ ] UI carga en localhost:3002
- [ ] Wallet conecta (devnet)
- [ ] Puede ver la página de crear agente

### Funcionalidad
- [ ] Crear agente exitoso
- [ ] Agente visible en Solscan
- [ ] Agente guardado en DB
- [ ] Depositar fondos funciona
- [ ] Trade ejecuta correctamente
- [ ] Trade guardado en DB
- [ ] Transaction visible en Solscan
- [ ] Revenue flow funciona

---

## 🐛 Troubleshooting

### Error: "anchor: command not found"
**Solución**: Instalar Anchor:
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0
```

### Error: "Airdrop request limit exceeded"
**Solución**: Espera 1 hora o usa un faucet alternativo:
- https://solfaucet.com
- https://faucet.triangleplatform.com/solana/devnet

### Error: "Transaction simulation failed"
**Solución**:
1. Verifica que el Program ID es correcto
2. Chequea que la wallet tiene fondos
3. Revisa logs del backend para más detalles

### Error: Database sync failed
**Solución**:
1. Verifica que el directorio `backend/data` existe
2. Comprueba permisos de escritura
3. Borra `backend/data/agent-fun.db` y reinicia

### Smart contract no compila
**Solución**:
1. Verifica versión de Rust: `rustc --version`
2. Actualiza Rust: `rustup update`
3. Limpia y recompila: `anchor clean && anchor build`

---

## 📈 Próximos Pasos

Una vez completado el testing en devnet:

### Opción 1: Deploy a Mainnet
Si todo funciona perfectamente:
```bash
solana config set --url mainnet-beta
# Necesitarás 3-5 SOL reales
anchor deploy --provider.cluster mainnet
```

### Opción 2: Beta Testing Extendido
Si quieres más testing:
1. Invita 5-10 usuarios a probar en devnet
2. Itera según feedback
3. Corrige bugs
4. Deploy a mainnet cuando estés 100% seguro

### Opción 3: Continuar Desarrollo
Si necesitas añadir features:
1. Desarrolla en devnet
2. Testing continuo gratis
3. Deploy a mainnet cuando esté completo

---

## 💡 Ventajas de Testing en Devnet

1. **Gratis** - No gastas SOL real
2. **Ilimitado** - Puedes hacer 1000 deploys si quieres
3. **Rápido** - Sin preocupaciones de costos
4. **Realista** - Funciona igual que mainnet
5. **Seguro** - Aprende sin riesgo financiero
6. **Iterativo** - Prueba, falla, aprende, repite

---

## 🎓 Aprendizaje

Este proceso de devnet te permite:
- Familiarizarte con Anchor y Solana
- Entender el flujo completo de la dApp
- Debuggear issues sin costo
- Validar la arquitectura híbrida
- Optimizar antes de mainnet
- Ganar confianza antes de invertir $300

---

## 📞 Soporte

Si encuentras problemas durante el testing:

1. **Revisa los logs** del backend y frontend
2. **Consulta Solscan** para ver transacciones
3. **Verifica la configuración** (Program ID, RPC endpoint)
4. **Pregunta** si algo no está claro

---

## 🚀 Resumen

**Hoy puedes:**
1. Instalar herramientas (30 min)
2. Deploy a devnet (15 min)
3. Crear primer agente (5 min)
4. Testear trading (10 min)
5. Validar todo funciona (10 min)

**Total**: ~70 minutos
**Costo**: $0

**Luego decides:**
- Deploy a mainnet (3 SOL)
- Más testing en devnet (gratis)
- Añadir features

---

**¿Listo para comenzar?** 🎉

**Siguiente comando:**
```bash
# Instalar Solana CLI
curl https://release.solana.com/v1.18.17/install -sSf | sh
```
