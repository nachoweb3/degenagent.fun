# 🌐 Configurar degenagent.fun en Vercel

## Paso 1: En Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Click en **Settings** → **Domains**
3. Click en **Add Domain**
4. Escribe: `degenagent.fun`
5. Click **Add**

Vercel te mostrará los registros DNS que necesitas configurar.

---

## Paso 2: En Namecheap

1. Entra a **Namecheap** → **Domain List**
2. Click en **Manage** al lado de `degenagent.fun`
3. Ve a **Advanced DNS**

### Configurar estos registros:

#### Para el dominio raíz (`degenagent.fun`):

```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

#### Para www (`www.degenagent.fun`):

```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

### **IMPORTANTE**: Elimina estos registros si existen:
- Parking Page (redirect)
- URL Redirect Record
- Cualquier otro A Record o CNAME en @ o www

---

## Paso 3: Esperar Propagación DNS

- ⏰ Puede tardar 5-60 minutos
- Vercel verificará automáticamente
- SSL/HTTPS se configurará solo

---

## Paso 4: Verificar

Después de 30-60 minutos:

```bash
# Verificar DNS propagado
nslookup degenagent.fun

# O en browser
https://degenagent.fun
https://www.degenagent.fun
```

---

## Configuración del Backend API

Si quieres usar un subdominio para la API:

### En Namecheap:

```
Type: CNAME Record
Host: api
Value: tu-proyecto.up.railway.app
TTL: Automatic
```

Esto creará: `api.degenagent.fun`

### En Railway:

1. Settings → Domains
2. Add Custom Domain: `api.degenagent.fun`
3. Esperar verificación

---

## Actualizar Frontend

Edita `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.degenagent.fun
NEXT_PUBLIC_SITE_URL=https://degenagent.fun
```

---

## Configuración con Cloudflare (Opcional - Recomendado)

### Ventajas:
- ✅ DDoS protection
- ✅ CDN gratis
- ✅ Analytics
- ✅ Firewall

### Setup:

1. Añade `degenagent.fun` a Cloudflare
2. Cloudflare te dará nameservers:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```

3. En Namecheap:
   - Domain → Nameservers
   - Selecciona "Custom DNS"
   - Añade los nameservers de Cloudflare

4. En Cloudflare DNS:
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy: ON (nube naranja)

   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy: ON

   Type: CNAME
   Name: api
   Target: tu-proyecto.up.railway.app
   Proxy: ON
   ```

5. SSL/TLS Settings:
   - SSL/TLS → Full (strict)

---

## Troubleshooting

### "Domain not verifying"
- Espera más tiempo (hasta 24h)
- Verifica que eliminaste todos los registros conflictivos
- Usa `nslookup` para verificar DNS

### "SSL Error"
- Espera a que Vercel genere el certificado (automático)
- Puede tardar 10-30 minutos después de DNS propagado

### "API CORS error"
- Asegúrate que backend acepta tu dominio
- En `backend/src/index.ts`:
  ```typescript
  app.use(cors({
    origin: ['https://degenagent.fun', 'https://www.degenagent.fun']
  }));
  ```

---

## URLs Finales

Cuando todo esté listo:

```
✅ https://degenagent.fun           → Frontend
✅ https://www.degenagent.fun       → Frontend (redirect)
✅ https://api.degenagent.fun       → Backend API
```

---

## Comandos Útiles

```bash
# Verificar DNS propagación
dig degenagent.fun
dig www.degenagent.fun
dig api.degenagent.fun

# Ver SSL cert
openssl s_client -connect degenagent.fun:443 -servername degenagent.fun

# Test API
curl https://api.degenagent.fun/health
```

---

**Tiempo total estimado: 1-2 horas** (mayoría es esperar DNS) 🚀
