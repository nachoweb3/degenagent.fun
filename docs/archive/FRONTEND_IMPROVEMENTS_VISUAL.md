# AGENT.FUN - Mejoras Frontend Visual

## Vista Previa de UI - Mobile vs Desktop

### Landing Page (/)

```
+------------------------------------+
|         MOBILE VIEW (375px)        |
+------------------------------------+
|                                    |
|   Launch AI Agents                 |
|      on Solana                     |
|                                    |
|   Create autonomous AI trading..   |
|                                    |
| +--------------------------------+ |
| | Create Your Agent              | |
| +--------------------------------+ |
| +--------------------------------+ |
| | Explore Agents                 | |
| +--------------------------------+ |
| +--------------------------------+ |
| | Connect Wallet                 | |
| +--------------------------------+ |
|                                    |
| +--------------------------------+ |
| | 🤖 AI-Powered                  | |
| | GPT-4 analyzes...              | |
| +--------------------------------+ |
| +--------------------------------+ |
| | ⚡ Fully Autonomous            | |
| | Your agent runs 24/7...        | |
| +--------------------------------+ |
|                                    |
+------------------------------------+

+----------------------------------------------------------------+
|                    DESKTOP VIEW (1440px)                       |
+----------------------------------------------------------------+
|                                                                |
|          Launch AI Agents on Solana                            |
|                                                                |
|     Create autonomous AI trading agents that make              |
|        intelligent decisions on Solana blockchain              |
|                                                                |
|  [Create Agent]  [Explore]  [Connect Wallet]                  |
|                                                                |
| +----------+ +----------+ +----------+ +----------+            |
| | 🤖 AI   | | ⚡ Auto | | 🔒 Secure| | 💰 Token |            |
| | Powered | | nomous  | |          | | ized    |            |
| +----------+ +----------+ +----------+ +----------+            |
|                                                                |
+----------------------------------------------------------------+
```

---

### Create Form (/create)

```
MOBILE (375px):
+----------------------------------+
|  Launch Your AI Agent            |
|  Create autonomous trading...    |
+----------------------------------+
|                                  |
| Agent Name *                     |
| +------------------------------+ |
| | MemeKing                     | |
| +------------------------------+ |
| 8/32 characters                  |
|                                  |
| Token Symbol *                   |
| +------------------------------+ |
| | MKING                        | |
| +------------------------------+ |
| 5/10 characters                  |
|                                  |
| Agent Mission *                  |
| +------------------------------+ |
| | Trade trending memecoins...  | |
| |                              | |
| +------------------------------+ |
| 45/200 characters                |
|                                  |
| +------------------------------+ |
| | Launch Agent (0.5 SOL)       | |
| +------------------------------+ |
|                                  |
+----------------------------------+

DESKTOP (1440px): Similar pero inputs mas anchos
```

---

### Agent Dashboard (/agent/[pubkey])

```
MOBILE VIEW (375px):
+------------------------------------+
| MemeKing              [Active]     |
| Trade trending memecoins...        |
|                                    |
| +----------------+----------------+|
| | Vault Balance  | Total Trades   ||
| | 2.5000 SOL     | 12             ||
| +----------------+----------------+|
| | Total Volume   | Win Rate       ||
| | $1,234         | N/A            ||
| +----------------+----------------+|
|                                    |
| +--------------------------------+ |
| | Fund Agent                     | |
| | +----------------------------+ | |
| | | 0.5                        | | |
| | +----------------------------+ | |
| | [Deposit]                      | |
| +--------------------------------+ |
|                                    |
| +--------------------------------+ |
| | Claim Revenue                  | |
| | Your Tokens: 1,000,000         | |
| | [Claim Revenue]                | |
| +--------------------------------+ |
|                                    |
| Performance Overview               |
| +--------------------------------+ |
| |     █                          | |
| |   █ █ █                        | |
| | █ █ █ █   █ █                  | |
| | D1 D2 D3 D4 D5 D6 D7           | |
| +--------------------------------+ |
|                                    |
| Recent Trades             12 trades|
| +--------------------------------+ |
| | 7h3x...k9m2                    | |
| | Oct 12, 2025 5:45 AM           | |
| | View Explorer →                | |
| +--------------------------------+ |
| | 9k2m...3x7h                    | |
| | Oct 12, 2025 4:30 AM           | |
| | View Explorer →                | |
| +--------------------------------+ |
|                                    |
+------------------------------------+

DESKTOP VIEW (1440px):
+------------------------------------------------------------------+
| MemeKing                                          [Active]       |
| Trade trending memecoins with aggressive risk appetite...        |
|                                                                  |
| +-------------+ +-------------+ +-------------+ +-------------+  |
| | Vault       | | Total       | | Total       | | Win Rate   |  |
| | Balance     | | Trades      | | Volume      | |            |  |
| | 2.5000 SOL  | | 12          | | $1,234      | | N/A        |  |
| +-------------+ +-------------+ +-------------+ +-------------+  |
|                                                                  |
| +-----------------------------+ +-----------------------------+  |
| | Fund Agent                  | | Claim Revenue               |  |
| | Deposit SOL to enable...    | | Token holders earn...       |  |
| | [Input: 0.5] [Deposit]      | | Your Tokens: 1,000,000      |  |
| |                             | | [Claim Revenue]             |  |
| +-----------------------------+ +-----------------------------+  |
|                                                                  |
| Performance Overview                                             |
| +--------------------------------------------------------------+ |
| |         █                                                    | |
| |       █ █ █                                                  | |
| |   █ █ █ █ █   █   █                                          | |
| |   D1 D2 D3 D4 D5 D6 D7                                       | |
| +--------------------------------------------------------------+ |
|                                                                  |
| Recent Trades                                         12 trades  |
| +--------------------------------------------------------------+ |
| | 7h3x...k9m2    Oct 12, 2025 5:45 AM      View Explorer →    | |
| +--------------------------------------------------------------+ |
| | 9k2m...3x7h    Oct 12, 2025 4:30 AM      View Explorer →    | |
| +--------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Componentes Visuales Clave

### StatCard (Mejorado)

```
NORMAL:
+-------------------+
| Vault Balance     |  <- text-xs sm:text-sm text-gray-500
| 2.5000 SOL        |  <- text-lg sm:text-2xl font-bold
+-------------------+

HIGHLIGHTED:
+-------------------+  <- border-solana-purple
| Vault Balance     |  <- shadow-lg shadow-purple/20
| 2.5000 SOL        |  <- text-solana-purple
+-------------------+
```

### TradeCard (Mejorado)

```
MOBILE (columna):
+--------------------------------+
| 7h3x...k9m2                    |
| Oct 12, 2025 5:45 AM           |
| View Explorer →                |
+--------------------------------+

DESKTOP (fila):
+------------------------------------------------------------+
| 7h3x...k9m2    Oct 12, 2025 5:45 AM    View Explorer →   |
+------------------------------------------------------------+
                                          ^ hover: underline
```

### Performance Chart (Nuevo)

```
h-48 (mobile) / h-64 (desktop)

   100% |
        |     █
    80% |   █ █ █
        | █ █ █ █   █ █
    60% | █ █ █ █ █ █ █
        +-----------------
          D1 D2 D3 D4 D5 D6 D7

Cada barra:
- bg-solana-purple/20 (background)
- bg-solana-purple (fill animado)
- transition-all duration-500
```

---

## Estados Interactivos

### Boton Normal -> Hover -> Active -> Disabled

```
NORMAL:
+---------------------------+
| Launch Agent (0.5 SOL)    |  bg-solana-purple
+---------------------------+

HOVER (desktop):
+---------------------------+
| Launch Agent (0.5 SOL)    |  bg-purple-700
+---------------------------+  shadow-xl

ACTIVE (mobile tap):
+-------------------------+    scale-95
| Launch Agent (0.5 SOL)  |
+-------------------------+

DISABLED:
+---------------------------+
| Launch Agent (0.5 SOL)    |  bg-gray-700
+---------------------------+  cursor-not-allowed
```

### Input Focus States

```
NORMAL:
+------------------------------+
| Amount in SOL                |  border-gray-700
+------------------------------+

FOCUS:
+------------------------------+
| 0.5_                         |  border-solana-purple
+------------------------------+  ring-2 ring-purple/20
```

---

## Animaciones Implementadas

1. **Spin Loading**
   ```
   @keyframes spin {
     from { transform: rotate(0deg); }
     to { transform: rotate(360deg); }
   }
   ```

2. **Scale Feedback**
   ```
   active:scale-95
   transition-all
   ```

3. **Hover Growth**
   ```
   hover:scale-105
   transition-all
   ```

4. **Chart Bars**
   ```
   transition-all duration-500
   height: ${value}%
   ```

---

## Color Palette

```
Primary:
- solana-purple: #9945FF
- solana-green:  #14F195

Backgrounds:
- gray-900:      #111827
- gray-800:      #1F2937
- gray-700:      #374151

Text:
- white:         #FFFFFF
- gray-400:      #9CA3AF
- gray-500:      #6B7280

States:
- green-500:     #10B981 (active)
- red-500:       #EF4444 (error)
```

---

## Iconografia

- 🤖 AI-Powered
- ⚡ Autonomous
- 🔒 Secure
- 💰 Tokenized
- 📈 Jupiter Integration
- 📱 Mobile Ready
- 📊 No trades yet (empty state)

---

## Breakpoint Reference

```
Tailwind Default:
- default:  0px     (mobile first)
- sm:       640px   (large phones, small tablets)
- md:       768px   (tablets)
- lg:       1024px  (small desktops)
- xl:       1280px  (desktops)
- 2xl:      1536px  (large desktops)

AGENT.FUN usa principalmente:
- default, sm, lg
```

---

## Touch Target Sizes (WCAG)

```
Minimo recomendado: 44px x 44px
AGENT.FUN usa:      48px+ altura

Ejemplos:
- Botones: min-h-[48px]
- Inputs:  py-3 (12px * 2 + 16px line-height = 40px+)
- Cards:   p-4 sm:p-6 (clickeable area grande)
```

---

## Responsive Patterns

### Stack -> Row
```
flex flex-col sm:flex-row
```

### 1 -> 2 -> 4 Columns
```
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
```

### Full -> Auto Width
```
w-full sm:w-auto
```

### Small -> Large Spacing
```
gap-3 sm:gap-6
py-4 sm:py-8
```

---

Actualizacion: 2025-10-12
Version: Visual Guide v1.0
