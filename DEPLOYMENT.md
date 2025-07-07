# Despliegue en Vercel - WhatsApp Bot

## Pasos para desplegar en Vercel:

### 1. Preparar el repositorio
```bash
# Inicializar git (si no está inicializado)
git init

# Agregar archivos
git add .
git commit -m "Initial commit - WhatsApp Bot ready for Vercel"

# Subir a GitHub
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### 2. Configurar Vercel
1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Conecta tu repositorio de GitHub
3. Importa el proyecto
4. Vercel detectará automáticamente que es un proyecto Node.js

### 3. Variables de entorno (opcional)
En el dashboard de Vercel, configura estas variables:
- `NODE_ENV`: production
- `PORT`: 3000 (aunque Vercel asigna automáticamente)

### 4. Desplegar
Vercel desplegará automáticamente cuando hagas push a main.

## URLs de ejemplo:
- `https://tu-bot.vercel.app/` - Información del bot
- `https://tu-bot.vercel.app/status` - Estado del cliente
- `https://tu-bot.vercel.app/send-message` - Enviar mensaje (POST)

## Limitaciones en Vercel:
⚠️ **Importante**: Vercel es serverless, por lo que:
- La sesión de WhatsApp se perderá entre requests
- Necesitarás reautenticarte frecuentemente
- El QR se generará en los logs de Vercel (no muy práctico)

## Recomendaciones:
Para uso en producción, considera:
- Railway
- Heroku
- DigitalOcean
- VPS con Node.js persistente

## Comandos útiles:
```bash
# Ejecutar localmente
npm start

# Ejecutar en modo desarrollo
npm run dev

# Verificar la build
npm run vercel-build
```
