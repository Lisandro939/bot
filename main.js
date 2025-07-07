const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para CORS (necesario para Vercel)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Endpoint de health check
app.get('/', (req, res) => {
    res.json({
        status: 'WhatsApp Bot API',
        version: '1.0.0',
        ready: isClientReady,
        endpoints: {
            status: '/status',
            sendMessage: '/send-message',
            logout: '/logout',
            restart: '/restart'
        }
    });
});

const client = new Client({
    authStrategy: new LocalAuth()
});

let isClientReady = false;

client.on('qr', (qr) => {
    console.log('═══════════════════════════════════════');
    console.log('📱 CÓDIGO QR GENERADO - ESCANEA CON WHATSAPP');
    console.log('═══════════════════════════════════════');
    qrcode.generate(qr, { small: true });
    console.log('═══════════════════════════════════════');
    console.log('✅ Escanea el código QR con WhatsApp Web');
    console.log('═══════════════════════════════════════');
});

client.on('ready', () => {
    console.log('🚀 Client is ready!');
    console.log('✅ WhatsApp Web está conectado y listo para usar');
    isClientReady = true;
});

client.on('authenticated', () => {
    console.log('🔐 Cliente autenticado correctamente!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
    console.log('💡 Sugerencia: Elimina la carpeta .wwebjs_auth y vuelve a intentar');
});

client.on('disconnected', (reason) => {
    console.log('📱 Cliente desconectado:', reason);
    isClientReady = false;
});

client.on('loading_screen', (percent, message) => {
    console.log('⏳ Cargando...', percent, message);
});

// Endpoint para enviar mensajes
app.post('/send-message', async (req, res) => {
    try {
        const { number, message } = req.body;
        
        // Validar que el cliente esté listo
        if (!isClientReady) {
            return res.status(400).json({ 
                error: 'El cliente de WhatsApp no está listo. Por favor, escanea el código QR primero.' 
            });
        }
        
        // Validar parámetros
        if (!number || !message) {
            return res.status(400).json({ 
                error: 'Se requieren los campos "number" y "message"' 
            });
        }
        
        // Formatear el número (agregar @c.us si no lo tiene)
        const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

        const numberDetails = await client.getNumberId(formattedNumber);

        console.log(`📞 Enviando mensaje a: ${JSON.stringify(numberDetails)}`);

        // Enviar el mensaje
        if (!!numberDetails) {
            const response = await client.sendMessage(numberDetails._serialized, message);
            console.log(`📬 Respuesta del envío: ${JSON.stringify(response)}`);
        }
        
        res.json({ 
            success: true, 
            message: 'Mensaje enviado correctamente',
            to: number
        });
        
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({ 
            error: 'Error al enviar el mensaje', 
            details: error.message 
        });
    }
});

// Endpoint para verificar el estado del cliente
app.get('/status', (req, res) => {
    res.json({
        ready: isClientReady,
        message: isClientReady ? 'Cliente listo' : 'Cliente no está listo'
    });
});

// Endpoint para forzar logout y regenerar QR
app.post('/logout', async (req, res) => {
    try {
        console.log('🔄 Cerrando sesión y regenerando QR...');
        await client.logout();
        isClientReady = false;
        res.json({ 
            success: true, 
            message: 'Sesión cerrada. Se regenerará el QR automáticamente.' 
        });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ 
            error: 'Error al cerrar sesión', 
            details: error.message 
        });
    }
});

// Endpoint para reiniciar el cliente completamente
app.post('/restart', async (req, res) => {
    try {
        console.log('🔄 Reiniciando cliente...');
        await client.destroy();
        isClientReady = false;
        
        // Reinicializar después de un breve delay
        setTimeout(() => {
            client.initialize();
        }, 2000);
        
        res.json({ 
            success: true, 
            message: 'Cliente reiniciado. Espera unos segundos para el nuevo QR.' 
        });
    } catch (error) {
        console.error('Error al reiniciar:', error);
        res.status(500).json({ 
            error: 'Error al reiniciar', 
            details: error.message 
        });
    }
});

// Inicializar el cliente de WhatsApp
console.log('🚀 Iniciando cliente de WhatsApp...');
client.initialize();

// Iniciar el servidor Express solo si no estamos en Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🌐 Servidor Express ejecutándose en puerto ${PORT}`);
        console.log(`📋 Endpoints disponibles:`);
        console.log(`- GET  http://localhost:${PORT}/`);
        console.log(`- GET  http://localhost:${PORT}/status`);
        console.log(`- POST http://localhost:${PORT}/send-message`);
        console.log(`- POST http://localhost:${PORT}/logout`);
        console.log(`- POST http://localhost:${PORT}/restart`);
        console.log('');
        console.log('💡 Si no aparece el QR, usa:');
        console.log(`   POST http://localhost:${PORT}/logout`);
        console.log(`   POST http://localhost:${PORT}/restart`);
    });
}

// Exportar la app para Vercel
module.exports = app;
