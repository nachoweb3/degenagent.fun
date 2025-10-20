# 🔍 WALLET DEBUGGING GUIDE - Verificar que todo funciona

**Fecha:** 2025-10-20 18:00 UTC
**Estado:** Sistema mejorado con logs de debugging

---

## ✅ PASO 1: ACCEDER AL SITIO

### URL que funciona AHORA:
```
✅ https://www.degenagent.fun (ACTIVO - 200 OK)
```

**Nota:** Usa `www.degenagent.fun` (con www). El dominio sin www puede tardar más en propagar DNS.

---

## 🔧 PASO 2: ABRIR CONSOLA DEL NAVEGADOR

### En Chrome/Brave/Edge:
1. Presiona `F12` o Click derecho → "Inspect" → Pestaña "Console"

### En Firefox:
1. Presiona `F12` o Click derecho → "Inspect Element" → Pestaña "Console"

### En Safari (Mac):
1. `Cmd + Option + C`

### En Móvil (Chrome Android):
1. Conecta tu teléfono a PC via USB
2. En PC: Abre `chrome://inspect` en Chrome desktop
3. Habilita USB Debugging en tu teléfono
4. Selecciona tu dispositivo y "Inspect"

---

## 📊 PASO 3: VERIFICAR LOS LOGS

### Deberías ver en la consola:

```javascript
[WalletProvider] Using RPC: Custom Helius
[WalletProvider] Initializing wallet adapters...
[WalletProvider] Rendering with 5 wallet adapters
[UserProfile] Rendering - publicKey: undefined
```

**Esto significa:**
- ✅ WalletProvider se inicializó correctamente
- ✅ RPC de Helius (mainnet-beta) está configurado
- ✅ 5 wallet adapters disponibles (Phantom, Solflare, Coinbase, Trust, Torus)
- ✅ UserProfile está esperando que conectes wallet

---

## 🦊 PASO 4: CONECTAR PHANTOM WALLET

### Desktop:
1. Haz click en **"Connect Wallet"** (botón morado arriba a la derecha)
2. Selecciona **"Phantom"** en el modal
3. Se abre popup de Phantom → Click **"Connect"**
4. Revisa consola, deberías ver:

```javascript
[UserProfile] Wallet state: {
  connected: true,
  connecting: false,
  hasPublicKey: true,
  walletName: "Phantom"
}
[UserProfile] Rendering - publicKey: <tu address>
```

5. El botón "Connect Wallet" debe cambiar a tu avatar con iniciales

### Móvil (con Phantom App instalada):
1. Abre **www.degenagent.fun** en el navegador de Phantom App
2. Click en hamburger menu (☰) arriba derecha
3. Click **"Connect Wallet"**
4. Autoriza la conexión
5. Deberías ver tu address en el menú

---

## ⚠️ TROUBLESHOOTING

### Problema 1: No veo los logs de [WalletProvider]

**Causa:** No estás usando la última versión del sitio.

**Solución:**
1. Presiona `Ctrl + Shift + R` (hard refresh)
2. O `Ctrl + F5`
3. O limpia caché del navegador
4. Refresca www.degenagent.fun

---

### Problema 2: Error "[WalletProvider] Error: ..."

**Causa:** Problema de conexión con el RPC o wallet bloqueada.

**Solución:**
1. Verifica que tu wallet (Phantom) esté desbloqueada
2. Verifica que estás en la red Solana Mainnet-Beta en Phantom
3. Intenta desconectar y reconectar wallet
4. Revisa el error específico en consola

---

### Problema 3: "Connect Wallet" no hace nada al hacer click

**Causa:** JavaScript bloqueado o popup bloqueado.

**Solución:**
1. Verifica que popups no estén bloqueados para www.degenagent.fun
2. Verifica que JavaScript esté habilitado
3. Intenta en modo incógnito
4. Intenta en otro navegador

---

### Problema 4: Dice "connected: true" pero no veo mi avatar

**Causa:** Problema de rendering o z-index.

**Solución:**
1. Hard refresh (Ctrl + Shift + R)
2. Verifica en consola si ves `[UserProfile] Rendering - publicKey: <address>`
3. Si publicKey muestra undefined, desconecta y reconecta wallet
4. Revisa si hay errores de React en consola

---

### Problema 5: En móvil no puedo conectar

**Causa:** Menú no se abre o wallet no detectada.

**Solución Desktop que no funciona en móvil:**
- NO uses el navegador normal del teléfono
- SÍ usa el navegador integrado de Phantom App

**Pasos:**
1. Abre **Phantom App** en tu móvil
2. Dentro de Phantom, ve a **Browser** (icono de globo/navegador)
3. Escribe: `www.degenagent.fun`
4. Ahora sí podrás conectar sin problemas

**Logs esperados en móvil:**
```javascript
[MobileMenu] Wallet state: {
  connected: true,
  hasPublicKey: true,
  walletName: "Phantom"
}
```

---

## ✅ PASO 5: VERIFICAR QUE EL MENÚ FUNCIONA

### Desktop:
1. Con wallet conectada, click en tu **avatar** (círculo con iniciales)
2. Debe aparecer dropdown con:
   - 👤 View Profile
   - 📊 Analytics
   - 🎁 Referral Rewards
   - 🚪 Disconnect Wallet
3. El dropdown debe aparecer **ENCIMA** de todo (z-index: 9999)
4. Click en cualquier opción → navega correctamente

### Móvil:
1. Con wallet conectada, click en **hamburger menu** (☰)
2. Debe aparecer menú lateral con:
   - Tu avatar y address arriba
   - Navigation links
   - Profile section:
     - 👤 My Profile
     - 📊 Analytics
     - 🎁 Referrals
   - 🚪 Disconnect Wallet (botón rojo)
3. Click en cualquier link → navega correctamente

---

## 🧪 PASO 6: TEST COMPLETO

### Test 1: Conectar Wallet
- [ ] Click "Connect Wallet"
- [ ] Selecciono Phantom
- [ ] Phantom pide permiso
- [ ] Acepto conexión
- [ ] Veo mi avatar con iniciales
- [ ] Logs muestran "connected: true"

### Test 2: Menú Desktop
- [ ] Click en avatar
- [ ] Dropdown aparece encima
- [ ] Veo todas las opciones
- [ ] Click "View Profile" → navega a /profile
- [ ] Click avatar de nuevo → dropdown se cierra
- [ ] Click fuera → dropdown se cierra

### Test 3: Menú Móvil
- [ ] Click hamburger (☰)
- [ ] Menú lateral se abre desde la derecha
- [ ] Veo mi address y avatar
- [ ] Veo todas las opciones
- [ ] Click "🎁 Referrals" → navega a /referrals
- [ ] Click overlay (fondo oscuro) → menú se cierra

### Test 4: Desconectar
- [ ] Click "Disconnect Wallet"
- [ ] Logs muestran "connected: false"
- [ ] Avatar desaparece
- [ ] Vuelve botón "Connect Wallet"

---

## 🔍 LOGS ESPERADOS (Completos)

### Al cargar la página:
```javascript
[WalletProvider] Using RPC: Custom Helius
[WalletProvider] Initializing wallet adapters...
[WalletProvider] Rendering with 5 wallet adapters
[UserProfile] Rendering - publicKey: undefined
```

### Al conectar wallet:
```javascript
[UserProfile] Wallet state: {
  connected: true,
  connecting: false,
  hasPublicKey: true,
  walletName: "Phantom"
}
[UserProfile] Rendering - publicKey: 7vXB9kR... (tus primeros 8 caracteres)
```

### Si hay error:
```javascript
[WalletProvider] Error: <descripción del error>
```

---

## 📱 SOPORTE POR PLATAFORMA

### ✅ Desktop (Chrome/Brave/Firefox)
- **Wallet:** Phantom Browser Extension
- **Método:** Click "Connect Wallet" → Popup
- **Estado:** ✅ FUNCIONAL

### ✅ Móvil (iOS/Android)
- **Wallet:** Phantom Mobile App
- **Método:** Usar navegador integrado de Phantom
- **URL:** www.degenagent.fun dentro de Phantom Browser
- **Estado:** ✅ FUNCIONAL

### ⚠️ Móvil (Navegador normal - Safari/Chrome)
- **Estado:** ⚠️ LIMITADO
- **Problema:** Phantom no se puede conectar desde navegadores normales
- **Solución:** Usa Phantom App → Browser integrado

---

## 🛠️ CAMBIOS TÉCNICOS APLICADOS

### WalletProvider.tsx:
```typescript
// ✅ ARREGLADO: Network siempre mainnet-beta
const network = WalletAdapterNetwork.Mainnet;

// ✅ ARREGLADO: RPC endpoint con fallback
const endpoint = useMemo(() => {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
  console.log('[WalletProvider] Using RPC:', rpcUrl ? 'Custom Helius' : 'Default cluster');
  return rpcUrl || clusterApiUrl(network);
}, [network]);

// ✅ ARREGLADO: Wallets sin dependencias innecesarias
const wallets = useMemo(() => {
  console.log('[WalletProvider] Initializing wallet adapters...');
  return [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new TrustWalletAdapter(),
    new TorusWalletAdapter(),
  ];
}, []);

// ✅ ARREGLADO: Error handler
const onError = useMemo(
  () => (error: any) => {
    console.error('[WalletProvider] Error:', error);
  },
  []
);
```

### UserProfile.tsx:
```typescript
// ✅ ARREGLADO: Debug logging agregado
useEffect(() => {
  console.log('[UserProfile] Wallet state:', {
    connected,
    connecting,
    hasPublicKey: !!publicKey,
    walletName: wallet?.adapter?.name
  });
}, [connected, connecting, publicKey, wallet]);

// ✅ ARREGLADO: Z-index del dropdown
<div className="relative z-50">  {/* Container */}
  <div className="absolute ... z-[9999]">  {/* Dropdown */}
```

### MobileMenu.tsx:
```typescript
// ✅ ARREGLADO: Debug logging agregado
useEffect(() => {
  console.log('[MobileMenu] Wallet state:', {
    connected,
    hasPublicKey: !!publicKey,
    walletName: wallet?.adapter?.name
  });
}, [connected, publicKey, wallet]);
```

---

## 🎯 PRÓXIMOS PASOS

### Para el usuario:
1. **Accede a:** https://www.degenagent.fun
2. **Abre consola** (F12)
3. **Conecta Phantom**
4. **Verifica logs** (debe decir "connected: true")
5. **Prueba menú** (click en avatar)
6. **Crea agente** (/create)
7. **Tradea** (/explore → click agente → buy/sell)

### Si sigue sin funcionar:
1. **Copia los logs de consola** (texto completo)
2. **Toma screenshot** del error
3. **Especifica:**
   - Navegador (Chrome, Firefox, Safari, móvil)
   - Sistema operativo (Windows, Mac, Linux, iOS, Android)
   - Wallet usada (Phantom, Solflare, etc.)
   - Pasos exactos que hiciste
4. **Comparte** esa información

---

## ✅ VERIFICACIÓN FINAL

### Backend:
```bash
curl https://egenagent-backend.onrender.com/health
# Debe retornar: {"status":"ok","network":"https://mainnet.helius-rpc.com/...","blockHeight":...}
```

### Frontend:
```bash
curl -I https://www.degenagent.fun
# Debe retornar: HTTP/1.1 200 OK
```

### RPC:
```bash
curl -X POST https://mainnet.helius-rpc.com/?api-key=0609d375-ac29-4da3-be17-5ab640679dd8 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
# Debe retornar: {"id":1,"jsonrpc":"2.0","result":"ok"}
```

**Todos los servicios están operativos** ✅

---

**Última actualización:** 2025-10-20 18:00 UTC
**Deployment:** https://www.degenagent.fun
**Status:** ✅ LIVE con debug logging
**Commit:** 76cb60f - wallet detection improvements
