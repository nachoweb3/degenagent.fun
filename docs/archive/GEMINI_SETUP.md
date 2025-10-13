# Cómo Obtener tu API Key de Google Gemini (GRATIS)

Google Gemini Pro ofrece una API completamente gratuita para desarrolladores, perfecta para este proyecto.

## 🎁 Ventajas del Free Tier

- ✅ **Completamente GRATIS** - No requiere tarjeta de crédito
- ✅ **60 requests por minuto** - Más que suficiente para el MVP
- ✅ **Modelo potente** - Gemini Pro es competitivo con GPT-3.5/4
- ✅ **Sin límite de tiempo** - El free tier no expira

## 📝 Pasos para Obtener tu API Key

### 1. Visita Google AI Studio

Ve a: **https://makersuite.google.com/app/apikey**

### 2. Inicia Sesión con Google

- Haz clic en "Get API Key" o "Obtener clave de API"
- Inicia sesión con tu cuenta de Google (cualquier cuenta @gmail.com)
- No necesitas verificación de tarjeta de crédito

### 3. Crea un Proyecto (si no tienes uno)

- Si es tu primera vez, te pedirá crear un proyecto en Google Cloud
- Puedes usar el proyecto por defecto o crear uno nuevo
- Nombre sugerido: "AGENT.FUN" o "AI Trading Agents"

### 4. Genera tu API Key

- Haz clic en "Create API Key" o "Crear clave de API"
- Se generará una clave como: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- **¡Copia esta clave inmediatamente!** La necesitarás para configurar el proyecto

### 5. Guarda tu API Key de forma Segura

⚠️ **IMPORTANTE**:
- NO compartas tu API key públicamente
- NO la subas a GitHub
- Guárdala en tu archivo `.env` local

## 🔧 Configuración en AGENT.FUN

Una vez que tengas tu API key:

### 1. Abre el archivo de configuración del executor

```bash
cd executor
```

### 2. Edita el archivo `.env`

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Verifica que funciona

```bash
npm run dev
```

Deberías ver en la consola:
```
🤖 AGENT.FUN AI Executor starting...
📡 Connected to: https://api.devnet.solana.com
⏰ Execution interval: Every 5 minutes
```

## 📊 Límites del Free Tier

| Característica | Free Tier |
|----------------|-----------|
| Requests/minuto | 60 |
| Requests/día | 1,500 |
| Tokens/request | 32,000 (input) + 8,000 (output) |
| Modelos disponibles | Gemini Pro, Gemini Pro Vision |

**Para este proyecto**: Con ejecución cada 5 minutos, usarás ~12 requests/hora = ~288 requests/día, muy por debajo del límite.

## 🆙 Upgrade a Pago (Opcional)

Si necesitas más requests en producción:

1. Ve a Google Cloud Console
2. Habilita facturación en tu proyecto
3. Los precios son muy competitivos:
   - $0.00025 / 1K caracteres (input)
   - $0.0005 / 1K caracteres (output)

Pero para desarrollo y MVP, **el free tier es más que suficiente**.

## 🔒 Seguridad

### Buenas Prácticas:

1. **Usar variables de entorno**
   ```bash
   # ✅ Correcto
   GEMINI_API_KEY=tu-clave-aqui

   # ❌ Incorrecto - nunca en el código
   const apiKey = "AIzaSy...";
   ```

2. **Agregar al .gitignore**
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

3. **Rotar keys periódicamente**
   - Puedes crear múltiples API keys
   - Revoca las antiguas desde Google AI Studio

4. **Restricciones de API (Opcional)**
   - En Google Cloud Console puedes restringir tu API key:
     - Por IP
     - Por dominio
     - Por aplicación

## 🆘 Troubleshooting

### Error: "API key not valid"
- Verifica que copiaste la key completa
- Asegúrate de que no hay espacios antes/después
- Confirma que la API está habilitada en tu proyecto

### Error: "Quota exceeded"
- Has alcanzado el límite de 60 requests/minuto
- Reduce la frecuencia de ejecución (ej: cada 10 min en lugar de 5)
- O espera 1 minuto para que se restablezca el quota

### Error: "Service not available"
- Verifica tu conexión a internet
- Google Gemini API puede estar temporalmente inactiva
- Verifica el estado: https://status.cloud.google.com/

## 📚 Recursos

- **Google AI Studio**: https://makersuite.google.com/
- **Documentación oficial**: https://ai.google.dev/docs
- **Precios**: https://ai.google.dev/pricing
- **Playground**: https://makersuite.google.com/app/prompts/new_freeform

## 💡 Tips

1. **Testing en Playground**: Antes de usar en tu código, prueba tus prompts en Google AI Studio Playground

2. **Modelos disponibles**:
   - `gemini-pro`: Para texto (lo que usamos)
   - `gemini-pro-vision`: Para imágenes + texto

3. **Optimiza tus prompts**: Gemini es muy bueno siguiendo instrucciones estructuradas en JSON

4. **Monitorea tu uso**: En Google Cloud Console puedes ver estadísticas de uso

---

**¿Listo?** Obtén tu key ahora: **https://makersuite.google.com/app/apikey** 🚀
