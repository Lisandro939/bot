# WhatsApp Bot para Vercel

Este es un bot de WhatsApp que se puede desplegar en Vercel con endpoints REST API.

## Características

- 📱 Conexión con WhatsApp Web
- 🚀 API REST para enviar mensajes
- 🔄 Endpoints para gestionar la sesión
- 🌐 Listo para desplegar en Vercel

## Endpoints disponibles

### GET /status
Verifica el estado del cliente de WhatsApp
```json
{
  "ready": true,
  "message": "Cliente listo"
}
```

### POST /send-message
Envía un mensaje a un número específico
```json
{
  "number": "1234567890",
  "message": "¡Hola desde el bot!"
}
```

### POST /logout
Cierra la sesión actual y regenera el QR
```json
{
  "success": true,
  "message": "Sesión cerrada. Se regenerará el QR automáticamente."
}
```

### POST /restart
Reinicia el cliente completamente
```json
{
  "success": true,
  "message": "Cliente reiniciado. Espera unos segundos para el nuevo QR."
}
```

## Instalación local

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el bot:
```bash
npm start
```

4. Escanea el código QR que aparece en la consola

## Despliegue en Vercel

1. Haz fork de este repositorio
2. Conecta tu repositorio a Vercel
3. Despliega automáticamente

### Variables de entorno (opcional)

- `PORT`: Puerto del servidor (por defecto 3000)
- `NODE_ENV`: Entorno de ejecución

## Uso

### Ejemplo con curl:
```bash
# Verificar estado
curl https://tu-bot.vercel.app/status

# Enviar mensaje
curl -X POST https://tu-bot.vercel.app/send-message \
  -H "Content-Type: application/json" \
  -d '{"number": "1234567890", "message": "¡Hola desde Vercel!"}'

# Reiniciar cliente
curl -X POST https://tu-bot.vercel.app/restart
```

## Consideraciones importantes

⚠️ **Importante**: Este bot requiere una conexión persistente para mantener la sesión de WhatsApp. Vercel es una plataforma serverless, por lo que:

- La sesión se perderá entre llamadas
- Necesitarás reautenticarte frecuentemente
- Para uso en producción, considera usar una plataforma con servidores persistentes

## Tecnologías utilizadas

- Node.js
- Express.js
- whatsapp-web.js
- qrcode-terminal
- Vercel (deployment)
