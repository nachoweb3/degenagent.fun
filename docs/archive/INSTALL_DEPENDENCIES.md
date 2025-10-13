# Instalacion de Dependencias - Frontend Mobile-First

## Paquetes Necesarios

### Ya Instalados (verificar en package.json):
```bash
cd frontend

npm list @solana/wallet-adapter-react
npm list @solana/wallet-adapter-react-ui
npm list @solana/wallet-adapter-wallets
npm list @solana/web3.js
npm list next
npm list react
npm list tailwindcss
npm list axios
```

### Si falta alguno, instalar:

```bash
# Wallet Adapters
npm install @solana/wallet-adapter-base \
            @solana/wallet-adapter-react \
            @solana/wallet-adapter-react-ui \
            @solana/wallet-adapter-wallets

# Solana Web3
npm install @solana/web3.js

# Next.js y React (si es proyecto nuevo)
npm install next react react-dom

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Axios para API calls
npm install axios
```

---

## Verificar Tailwind Config

Archivo: `frontend/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'solana-purple': '#9945FF',
        'solana-green': '#14F195',
      },
    },
  },
  plugins: [],
}
export default config
```

---

## Variables de Entorno

Archivo: `frontend/.env.local`

```bash
NEXT_PUBLIC_BACKEND_API=http://localhost:3001/api
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

Para produccion:
```bash
NEXT_PUBLIC_BACKEND_API=https://tu-api.com/api
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

---

## Wallet Adapters Configurados

El archivo `frontend/components/WalletProvider.tsx` ahora incluye:

1. **PhantomWalletAdapter** - Wallet mas popular en Solana
2. **SolflareWalletAdapter** - Wallet multi-chain
3. **TorusWalletAdapter** - Wallet con login social

Estos 3 cubren la mayoria de casos de uso mobile y desktop.

---

## Scripts de Desarrollo

En `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

Ejecutar:
```bash
cd frontend
npm run dev
```

Abrir en navegador: `http://localhost:3000`

---

## Testing Mobile

### 1. Chrome DevTools (F12)
- Click en icono de dispositivo (Ctrl+Shift+M)
- Seleccionar "iPhone 12 Pro" o "Pixel 5"
- Probar touch interactions

### 2. Navegador Mobile Real
```bash
# En tu computadora, obtener IP local
ipconfig  # Windows
ifconfig  # Mac/Linux

# Ejemplo IP: 192.168.1.100
# En mobile, abrir: http://192.168.1.100:3000
```

### 3. Solana Mobile Wallet Adapter
- Instalar Phantom Mobile
- Conectar desde el navegador mobile
- Probar transacciones

---

## Build para Produccion

```bash
cd frontend
npm run build
npm run start
```

Esto genera una build optimizada en `.next/`

---

## Deployment Options

### Vercel (Recomendado para Next.js):
```bash
npm install -g vercel
vercel
```

### Netlify:
```bash
npm run build
# Subir carpeta .next/
```

### Docker:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Troubleshooting

### Error: Module not found '@solana/wallet-adapter-wallets'
```bash
npm install @solana/wallet-adapter-wallets
```

### Error: Tailwind classes not working
```bash
npm run dev  # Reiniciar servidor
# Verificar tailwind.config.ts tiene paths correctos
```

### Error: Cannot connect wallet
```bash
# Verificar .env.local tiene RPC_ENDPOINT correcto
# En devnet usar: https://api.devnet.solana.com
```

### Slow Performance en Mobile
```bash
# Habilitar produccion mode:
npm run build
npm run start
```

---

## Optimizaciones Adicionales

### 1. Image Optimization
```bash
# Instalar sharp para Next.js Image
npm install sharp
```

### 2. PWA Support
```bash
npm install next-pwa
```

### 3. Analytics
```bash
npm install @vercel/analytics
```

### 4. Error Tracking
```bash
npm install @sentry/nextjs
```

---

## Estructura de Archivos Final

```
frontend/
├── app/
│   ├── page.tsx                    ✅ Mejorado
│   ├── create/
│   │   └── page.tsx               ✅ Mejorado
│   ├── agent/
│   │   └── [pubkey]/
│   │       └── page.tsx           ✅ Mejorado
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── WalletProvider.tsx         ✅ Mejorado
├── public/
├── .env.local                     ⚙️ Configurar
├── tailwind.config.ts             ⚙️ Verificar
├── package.json
└── next.config.js
```

---

## Checklist de Instalacion

- [ ] Node.js 18+ instalado
- [ ] `npm install` completado sin errores
- [ ] `.env.local` configurado
- [ ] `tailwind.config.ts` tiene colores Solana
- [ ] `npm run dev` inicia sin errores
- [ ] Pagina carga en `http://localhost:3000`
- [ ] Wallet adapter funciona
- [ ] Mobile responsive en DevTools
- [ ] Transacciones funcionan en devnet

---

Actualizacion: 2025-10-12
Version: Installation Guide v1.0
