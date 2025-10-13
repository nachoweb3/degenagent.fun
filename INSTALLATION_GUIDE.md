# 🛠️ Guía de Instalación Manual - Agent.fun

Ya que la instalación automática tiene problemas, aquí está la guía manual paso a paso.

---

## ✅ Estado Actual

- ✅ Rust instalado (1.88.0)
- ✅ Cargo instalado (1.88.0)
- ✅ Backend dependencies instaladas
- ✅ Smart contract creado
- ✅ Scripts de deployment creados
- ❌ Solana CLI necesita instalación manual
- ❌ Anchor necesita instalación manual

---

## 📦 Opción 1: Instalación Manual de Herramientas (Recomendada)

### Paso 1: Instalar Solana CLI

**Método 1 - Instalador Windows (Más Fácil):**

1. Descarga el instalador desde aquí:
   ```
   https://github.com/solana-labs/solana/releases/download/v1.18.17/solana-install-init-x86_64-pc-windows-msvc.exe
   ```

2. Ejecuta el instalador descargado

3. Reinicia tu terminal (PowerShell o CMD)

4. Verifica la instalación:
   ```powershell
   solana --version
   ```

   Debería mostrar: `solana-cli 1.18.17`

**Método 2 - PowerShell (Alternativo):**

```powershell
# Ejecutar PowerShell como Administrador
sh -c "$(curl -sSfL https://release.solana.com/v1.18.17/install)"
```

**Método 3 - WSL (Si tienes Ubuntu/WSL):**

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.17/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### Paso 2: Instalar Anchor Framework

Una vez que Solana CLI esté instalado:

```powershell
# Instalar AVM (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Instalar Anchor 0.29.0
avm install 0.29.0
avm use 0.29.0

# Verificar
anchor --version
```

Debería mostrar: `anchor-cli 0.29.0`

**Nota**: La instalación de Anchor puede tomar 10-15 minutos.

---

## 📦 Opción 2: Usar los Scripts Automatizados

Si prefieres usar los scripts que creé:

### Script 1: Instalar Herramientas

```powershell
cd C:\Users\Usuario\Desktop\Agent.fun
powershell -ExecutionPolicy Bypass -File scripts\install-tools.ps1
```

**Reinicia tu terminal después de esto.**

### Script 2: Configurar Devnet

```powershell
cd C:\Users\Usuario\Desktop\Agent.fun
powershell -ExecutionPolicy Bypass -File scripts\setup-devnet.ps1
```

Esto:
- Configura Solana para devnet
- Crea un wallet de testing
- Obtiene SOL gratis de devnet (airdrops)

### Script 3: Compilar y Deployar

```powershell
cd C:\Users\Usuario\Desktop\Agent.fun
powershell -ExecutionPolicy Bypass -File scripts\build-and-deploy.ps1
```

Esto:
- Compila el smart contract
- Deploya a devnet
- Actualiza el backend con el Program ID
- Guarda el Program ID en archivo

---

## 📦 Opción 3: Comandos Manuales (Paso a Paso)

Si prefieres ejecutar cada comando manualmente:

### 1. Configurar Devnet

```powershell
# Configurar cluster
solana config set --url https://api.devnet.solana.com

# Crear wallet de devnet
solana-keygen new --outfile %USERPROFILE%\.config\solana\devnet.json --no-bip39-passphrase

# Configurar keypair
solana config set --keypair %USERPROFILE%\.config\solana\devnet.json

# Verificar configuración
solana config get
```

### 2. Obtener SOL de Devnet (Gratis)

```powershell
# Solicitar airdrops (2 SOL cada vez)
solana airdrop 2
solana airdrop 2
solana airdrop 2

# Verificar balance
solana balance
```

**Necesitas al menos 3-5 SOL devnet para deployar.**

Si el airdrop falla por límite de rate, usa estos faucets:
- https://solfaucet.com
- https://faucet.triangleplatform.com/solana/devnet

### 3. Compilar Smart Contract

```powershell
cd C:\Users\Usuario\Desktop\Agent.fun

# Limpiar builds anteriores
anchor clean

# Compilar (toma 2-5 minutos)
anchor build
```

Verifica que se creó: `target\deploy\agent_registry.so`

### 4. Deploy a Devnet

```powershell
# Deploy
anchor deploy --provider.cluster devnet

# Guarda el "Program Id" que aparece en el output!
```

### 5. Actualizar Backend

Edita `backend\.env` y agrega/actualiza:

```env
REGISTRY_PROGRAM_ID=<tu-program-id-aqui>
NETWORK=devnet
RPC_ENDPOINT=https://api.devnet.solana.com
```

### 6. Reiniciar Backend

```powershell
cd backend

# Detener backend actual (Ctrl+C si está corriendo)

# Reiniciar
npm run dev
```

Deberías ver:
```
✅ Database connection established
✅ Database models synchronized
🚀 AGENT.FUN Backend running on port 3001
📡 Connected to: https://api.devnet.solana.com
💾 Database: SQLite (development)
```

---

## 🧪 Testing

### 1. Health Check

```powershell
curl http://localhost:3001/health
```

Debería retornar:
```json
{
  "status": "ok",
  "network": "https://api.devnet.solana.com",
  "blockHeight": 123456789
}
```

### 2. Frontend

1. Abre: http://localhost:3002
2. **Configura tu wallet (Phantom) a Devnet:**
   - Abre Phantom
   - Settings → Developer Settings
   - Change Network → Devnet
3. Conecta wallet
4. Intenta crear un agente de prueba

### 3. Verificar en Blockchain

Verifica tu Program ID en Solscan:
```
https://solscan.io/account/<TU-PROGRAM-ID>?cluster=devnet
```

---

## ❌ Troubleshooting

### Error: "solana: command not found"

**Solución:**
1. Verifica que Solana CLI esté instalado
2. Reinicia tu terminal
3. Verifica el PATH:
   ```powershell
   $env:Path
   ```
4. Debería incluir: `C:\Users\Usuario\.local\share\solana\install\active_release\bin`

### Error: "anchor: command not found"

**Solución:**
1. Verifica que Anchor esté instalado: `avm list`
2. Instala si es necesario:
   ```powershell
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install 0.29.0
   avm use 0.29.0
   ```

### Error: "Airdrop request limit exceeded"

**Solución:**
1. Espera 1 hora e intenta de nuevo
2. O usa un faucet alternativo:
   - https://solfaucet.com
   - https://faucet.triangleplatform.com/solana/devnet

### Error al compilar: "failed to compile"

**Solución:**
1. Verifica versión de Rust: `rustc --version`
2. Actualiza Rust si es necesario:
   ```powershell
   rustup update
   ```
3. Limpia y recompila:
   ```powershell
   anchor clean
   anchor build
   ```

### Backend no conecta a Solana

**Solución:**
1. Verifica que RPC_ENDPOINT esté en `.env`:
   ```
   RPC_ENDPOINT=https://api.devnet.solana.com
   ```
2. Verifica que el Program ID esté correcto
3. Reinicia el backend

---

## 📊 Estimación de Tiempo

| Tarea | Tiempo | Dificultad |
|-------|--------|------------|
| Instalar Solana CLI | 5-10 min | Fácil |
| Instalar Anchor | 10-15 min | Media |
| Configurar Devnet | 5 min | Fácil |
| Obtener SOL devnet | 2 min | Fácil |
| Compilar contract | 3-5 min | Fácil |
| Deploy a devnet | 2-3 min | Fácil |
| Actualizar backend | 2 min | Fácil |
| Testing | 5-10 min | Fácil |
| **TOTAL** | **35-55 min** | **Media** |

---

## ✅ Checklist

- [ ] Solana CLI instalado y verificado
- [ ] Anchor instalado y verificado
- [ ] Devnet configurado
- [ ] Wallet de devnet creado
- [ ] 3+ SOL devnet obtenidos
- [ ] Smart contract compilado
- [ ] Deploy exitoso a devnet
- [ ] Program ID guardado
- [ ] Backend .env actualizado
- [ ] Backend reiniciado sin errores
- [ ] Health check responde OK
- [ ] Frontend carga correctamente
- [ ] Wallet conecta (en devnet)
- [ ] Primer agente creado

---

## 🎯 Siguiente Paso

Una vez completado todo lo anterior:

1. **Crea tu primer agente de prueba:**
   - Abre http://localhost:3002
   - Conecta wallet (en devnet)
   - Create Agent
   - Name: "Test Agent 1"
   - Purpose: "Testing hybrid architecture"
   - Initial Deposit: 0.1 SOL

2. **Verifica en Solscan:**
   - https://solscan.io/account/<AGENT-WALLET>?cluster=devnet
   - Deberías ver la transacción de creación

3. **Verifica en Database:**
   ```powershell
   sqlite3 backend\data\agent-fun.db "SELECT * FROM agents;"
   ```

4. **¡Todo funciona!** 🎉

---

## 💬 ¿Necesitas Ayuda?

Si te trabas en algún paso:

1. **Revisa los logs** del backend y frontend
2. **Verifica tu configuración** con `solana config get`
3. **Chequea tu balance** con `solana balance`
4. **Revisa Solscan** para transacciones
5. **Pregúntame** y te ayudo a debuggear

---

## 🚀 Después del Testing en Devnet

Una vez que todo funcione en devnet:

### Opción 1: Deploy a Mainnet
```powershell
# Configurar mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Necesitarás 3-5 SOL REALES
solana balance

# Deploy (mismo comando)
anchor deploy --provider.cluster mainnet
```

**Costo**: 2.5-3.5 SOL ($250-350)

### Opción 2: Más Testing
- Invita usuarios a probar en devnet
- Itera según feedback
- Deploy a mainnet cuando estés 100% listo

---

**¡Suerte con el deployment! 🚀**

Si encuentras algún problema, avísame y te ayudo a resolverlo.
