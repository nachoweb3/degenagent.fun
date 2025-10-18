# 🎨 Assets Requirements for Solana dApp Store

Especificaciones exactas para todos los assets necesarios.

---

## 📋 Checklist de Assets

- [ ] Icon 512x512px
- [ ] Banner 1200x600px
- [ ] Feature Graphic 1200x1200px
- [ ] Screenshot 1: Home (1080x1920px)
- [ ] Screenshot 2: Create Agent (1080x1920px)
- [ ] Screenshot 3: Dashboard (1080x1920px)
- [ ] Screenshot 4: Trading (1080x1920px)
- [ ] Screenshot 5: Referral (1080x1920px)

---

## 1️⃣ App Icon (512x512px)

### Especificaciones:
- **Tamaño:** 512x512 píxeles
- **Formato:** PNG
- **Background:** Transparente (recomendado) o sólido
- **Color Profile:** sRGB
- **Nombre archivo:** `icon-512.png`

### Contenido Sugerido:
```
Logo DegenAgent.fun:
- Robot/AI icon
- Colores Solana: Purple (#9945FF) + Green (#14F195)
- Puede incluir símbolo de Solana (S)
- Diseño moderno y limpio
- Legible en tamaños pequeños
```

### Herramientas:
- **Canva:** https://www.canva.com/
  - Template: "App Icon"
  - Dimensiones custom: 512x512

- **Figma:** https://www.figma.com/
  - Frame size: 512x512
  - Export as PNG

- **Adobe Express:** https://www.adobe.com/express/
  - Free logo maker
  - Export 512x512

### Tips:
- ✅ Mantén el diseño simple (se verá en tamaños pequeños)
- ✅ Usa colores contrastantes
- ✅ Evita texto pequeño
- ✅ Asegura que se vea bien en fondos claros y oscuros
- ❌ No uses gradientes muy complejos
- ❌ No incluyas muchos detalles

### Ubicación:
```
solana-dapp-publishing/assets/icon-512.png
```

---

## 2️⃣ Banner Graphic (1200x600px)

### Especificaciones:
- **Tamaño:** 1200x600 píxeles
- **Formato:** PNG o JPG
- **Aspect Ratio:** 2:1
- **Max File Size:** 1 MB
- **Nombre archivo:** `banner-1200x600.png`

### Contenido Sugerido:
```
Layout:
┌─────────────────────────────────────────┐
│  [Logo]                                  │
│                                          │
│  DegenAgent.fun                          │
│  AI Trading Agents on Solana             │
│                                          │
│  [Imagen de UI o Robot]                  │
└─────────────────────────────────────────┘

Elementos:
- Logo en esquina superior izquierda
- Título: "DegenAgent.fun"
- Tagline: "AI Trading Agents on Solana"
- Background: Gradient purple (#9945FF) a green (#14F195)
- Imagen de UI del dashboard o robot trading
```

### Herramientas:
- **Canva:**
  - Template: "Banner" o "Social Media"
  - Custom size: 1200x600

- **Photopea:** https://www.photopea.com/
  - Free Photoshop alternative
  - New Project: 1200x600

### Tips:
- ✅ Muestra el valor principal de tu app
- ✅ Incluye elementos visuales atractivos
- ✅ Usa fonts legibles (tamaño mínimo 24px)
- ✅ Mantén márgenes de 40px en los bordes
- ❌ No sobrecargues con texto
- ❌ No uses imágenes pixeladas

### Ubicación:
```
solana-dapp-publishing/assets/banner-1200x600.png
```

---

## 3️⃣ Feature Graphic (1200x1200px)

### Especificaciones:
- **Tamaño:** 1200x1200 píxeles
- **Formato:** PNG o JPG
- **Aspect Ratio:** 1:1
- **Max File Size:** 2 MB
- **Nombre archivo:** `feature-1200x1200.png`

### Contenido Sugerido:
```
Layout:
┌────────────────────────────┐
│                            │
│    [Logo Grande]           │
│                            │
│  DegenAgent.fun            │
│                            │
│  Key Features:             │
│  🤖 AI Trading             │
│  ⚡ 24/7 Autonomous         │
│  💰 Passive Income          │
│                            │
│  [Screenshot del app]      │
│                            │
└────────────────────────────┘

Elementos:
- Featured para "Editor's Choice" carousel
- Mostrar UI del app en acción
- Highlight key benefits
- Background atractivo
- Call-to-action implícito
```

### Herramientas:
Las mismas que para el banner (Canva, Figma, Photopea)

### Tips:
- ✅ Este es el hero image - hazlo impactante
- ✅ Muestra la UI del app si es posible
- ✅ Incluye máximo 3-4 bullet points de beneficios
- ✅ Usa imágenes de alta calidad
- ❌ No copies/pegues screenshots directamente
- ❌ No uses texto muy pequeño

### Ubicación:
```
solana-dapp-publishing/assets/feature-1200x1200.png
```

---

## 4️⃣ Screenshots (1080x1920px cada uno)

### Especificaciones:
- **Tamaño:** 1080x1920 píxeles (portrait)
- **Formato:** PNG
- **Cantidad:** Mínimo 4, máximo 8 (recomendado 5)
- **Aspect Ratio:** 9:16
- **Max File Size:** 2 MB cada uno
- **Nombres archivos:** `1-home.png`, `2-create.png`, etc.

### Screenshots Requeridos:

#### Screenshot 1: Home Page
**Contenido:** Página principal con hero section
**URL:** https://degenagent.fun/
**Highlights:**
- Hero title
- CTA buttons
- Feature cards
- Stats

#### Screenshot 2: Create Agent
**Contenido:** Formulario de creación de agente
**URL:** https://degenagent.fun/create
**Highlights:**
- Agent customization
- Risk slider
- Trading frequency selector
- Visual customization

#### Screenshot 3: Dashboard
**Contenido:** Dashboard del agente con stats
**URL:** https://degenagent.fun/dashboard
**Highlights:**
- Agent performance
- Trading history
- Portfolio value
- Charts

#### Screenshot 4: Trading View
**Contenido:** Trading view o agent detail
**URL:** https://degenagent.fun/explore
**Highlights:**
- Active trades
- Real-time data
- Market analysis
- Trading actions

#### Screenshot 5: Referral Dashboard
**Contenido:** Sistema de referidos
**URL:** https://degenagent.fun/referrals
**Highlights:**
- Referral link
- Stats (referrals, earnings)
- Social sharing
- How it works

### Cómo Capturar Screenshots:

#### Método 1: Chrome DevTools (Recomendado)

```bash
1. Abre Chrome
2. Ve a https://degenagent.fun
3. Presiona F12 (DevTools)
4. Click en "Toggle device toolbar" (Ctrl+Shift+M)
5. Selecciona "Responsive"
6. Ajusta dimensiones: 1080 × 1920
7. Navega a cada página
8. Captura:
   - Ctrl+Shift+P
   - Escribe "Capture screenshot"
   - Selecciona "Capture full size screenshot"
9. Guarda con nombre correcto
```

#### Método 2: Browser Extension

```bash
1. Instala "GoFullPage" o "FireShot"
2. Ajusta ventana a 1080x1920
3. Captura full page
4. Crop si es necesario
```

#### Método 3: Manual con Photoshop/Photopea

```bash
1. Captura screenshot normal
2. Abre en Photoshop/Photopea
3. Crop a 1080x1920
4. Exporta como PNG
```

### Tips para Screenshots:
- ✅ Usa datos reales (no lorem ipsum)
- ✅ Conecta wallet para mostrar UI real
- ✅ Captura en modo oscuro (theme actual)
- ✅ Asegura que todo el texto sea legible
- ✅ Muestra features principales en cada screenshot
- ❌ No incluyas información personal sensible
- ❌ No muestres errores o UI rota
- ❌ No uses imágenes borrosas

### Ubicación:
```
solana-dapp-publishing/assets/screenshots/1-home.png
solana-dapp-publishing/assets/screenshots/2-create.png
solana-dapp-publishing/assets/screenshots/3-dashboard.png
solana-dapp-publishing/assets/screenshots/4-trading.png
solana-dapp-publishing/assets/screenshots/5-referral.png
```

---

## 📁 Estructura Final de Carpetas

```
solana-dapp-publishing/
├── assets/
│   ├── icon-512.png                    (512x512)
│   ├── banner-1200x600.png             (1200x600)
│   ├── feature-1200x1200.png           (1200x1200)
│   └── screenshots/
│       ├── 1-home.png                  (1080x1920)
│       ├── 2-create.png                (1080x1920)
│       ├── 3-dashboard.png             (1080x1920)
│       ├── 4-trading.png               (1080x1920)
│       └── 5-referral.png              (1080x1920)
├── build/
│   ├── app-release-signed.apk
│   ├── app-release-bundle.aab
│   └── assetlinks.json
├── scripts/
│   ├── mint-nfts.sh
│   └── submit-for-review.sh
├── config.yaml
└── README.md
```

---

## ✅ Validation Checklist

Antes de submitir, verifica cada asset:

### Icon:
- [ ] Tamaño exacto: 512x512px
- [ ] Formato: PNG
- [ ] No pixelado
- [ ] Legible en tamaño pequeño
- [ ] Colores apropiados

### Banner:
- [ ] Tamaño exacto: 1200x600px
- [ ] Formato: PNG o JPG
- [ ] Texto legible
- [ ] Muestra valor de la app
- [ ] No sobrecargado

### Feature Graphic:
- [ ] Tamaño exacto: 1200x1200px
- [ ] Formato: PNG o JPG
- [ ] Impactante y atractivo
- [ ] Muestra UI o beneficios
- [ ] Alta calidad

### Screenshots:
- [ ] Todos son 1080x1920px
- [ ] Formato: PNG
- [ ] Mínimo 4 screenshots
- [ ] Muestran features principales
- [ ] Datos reales (no placeholders)
- [ ] UI completa y funcional
- [ ] Texto legible

---

## 🎨 Color Palette (Referencia)

Para mantener consistencia visual:

```css
Primary Colors:
- Solana Purple: #9945FF
- Solana Green: #14F195

Background:
- Black: #000000
- Gray 900: #111111
- Gray 800: #1a1a1a

Text:
- White: #FFFFFF
- Gray 400: #9CA3AF
- Gray 500: #6B7280

Accent:
- Purple Dark: #7928CA
- Green Dark: #00D4AA
```

---

## 📐 Design Resources

### Free Icons:
- **Heroicons:** https://heroicons.com/
- **Lucide:** https://lucide.dev/
- **Feather Icons:** https://feathericons.com/

### Free Fonts:
- **Inter:** https://fonts.google.com/specimen/Inter
- **Poppins:** https://fonts.google.com/specimen/Poppins
- **Space Grotesk:** https://fonts.google.com/specimen/Space+Grotesk

### Stock Images:
- **Unsplash:** https://unsplash.com/
- **Pexels:** https://www.pexels.com/

### Design Tools:
- **Canva:** https://www.canva.com/ (Free + Pro)
- **Figma:** https://www.figma.com/ (Free tier)
- **Photopea:** https://www.photopea.com/ (Free)

---

## 💡 Pro Tips

1. **Mantén Consistencia:**
   - Usa mismo logo en todos los assets
   - Usa misma paleta de colores
   - Usa mismas fonts

2. **Optimiza Tamaños:**
   ```bash
   # Optimiza PNGs con TinyPNG
   https://tinypng.com/

   # O con CLI:
   npm install -g pngquant
   pngquant --quality=80-100 icon-512.png
   ```

3. **Test en Diferentes Contextos:**
   - Verifica cómo se ven los assets en:
     - Fondos claros y oscuros
     - Diferentes tamaños
     - Mobile y desktop

4. **Obtén Feedback:**
   - Comparte assets con amigos/comunidad
   - Pide opiniones honestas
   - Itera basado en feedback

---

## 🆘 Need Help Creating Assets?

Si necesitas ayuda profesional:

### Freelance Designers:
- **Fiverr:** https://www.fiverr.com/ ($5-$50)
- **Upwork:** https://www.upwork.com/ ($10-$100)
- **99designs:** https://99designs.com/ ($299+)

### AI Tools:
- **Midjourney:** https://www.midjourney.com/ (AI images)
- **DALL-E:** https://openai.com/dall-e (AI images)
- **Looka:** https://looka.com/ (Logo generator)

### Budget:
- **DIY:** Gratis (usando Canva/Figma)
- **Freelancer:** $20-100
- **Professional:** $300-1000

---

## ✅ Ready to Create?

1. [ ] Lee todas las especificaciones
2. [ ] Elige tus herramientas
3. [ ] Crea el icon
4. [ ] Crea el banner
5. [ ] Crea feature graphic
6. [ ] Captura 5 screenshots
7. [ ] Optimiza tamaños de archivo
8. [ ] Valida todos los assets
9. [ ] Guarda en la estructura correcta
10. [ ] ¡Listo para convertir a APK!

---

*Tiempo estimado: 1-3 horas (dependiendo de experiencia)*

**¡Buena suerte! 🎨**
