// Cargar variables de entorno
require('dotenv').config();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const QRCode = require("qrcode");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para CORS (necesario para Vercel)
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);

	if (req.method === "OPTIONS") {
		res.sendStatus(200);
	} else {
		next();
	}
});

// Endpoint de health check
app.get("/", (req, res) => {
	res.json({
		status: "WhatsApp Bot API",
		version: "1.0.0",
		ready: isClientReady,
		qrAvailable: !!currentQR,
		endpoints: {
			status: "/status",
			qr: "/qr",
			qrImage: "/qr-image",
			sendMessage: "/send-message",
			logout: "/logout",
			restart: "/restart",
		},
	});
});

// Endpoint para mostrar el QR como página HTML
app.get("/qr", (req, res) => {
	if (!currentQR || !qrDataURL) {
		return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WhatsApp Bot - QR Code</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 20px; 
                        background-color: #f5f5f5; 
                    }
                    .container { 
                        max-width: 500px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                    }
                    .status { 
                        color: #666; 
                        font-size: 18px; 
                        margin-bottom: 20px; 
                    }
                    .refresh-btn { 
                        background: #25d366; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        font-size: 16px; 
                        margin-top: 20px; 
                    }
                    .refresh-btn:hover { 
                        background: #20b358; 
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📱 WhatsApp Bot</h1>
                    <div class="status">
                        ${isClientReady
				? "✅ Cliente conectado y listo"
				: "⏳ Esperando código QR..."
			}
                    </div>
                    ${isClientReady
				? "<p>El bot está conectado y funcionando correctamente.</p>"
				: "<p>Inicia sesión en WhatsApp para generar el código QR.</p>"
			}
                    <button class="refresh-btn" onclick="window.location.reload()">
                        🔄 Actualizar página
                    </button>
                </div>
            </body>
            </html>
        `);
	}

	res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhatsApp Bot - QR Code</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 20px; 
                    background-color: #f5f5f5; 
                }
                .container { 
                    max-width: 500px; 
                    margin: 0 auto; 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                }
                .qr-code { 
                    margin: 20px 0; 
                    padding: 20px; 
                    background: #f8f9fa; 
                    border-radius: 10px; 
                    border: 2px solid #25d366; 
                }
                .qr-code img { 
                    max-width: 100%; 
                    height: auto; 
                }
                .instructions { 
                    color: #666; 
                    font-size: 16px; 
                    margin-bottom: 20px; 
                    line-height: 1.5; 
                }
                .refresh-btn { 
                    background: #25d366; 
                    color: white; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    font-size: 16px; 
                    margin-top: 20px; 
                }
                .refresh-btn:hover { 
                    background: #20b358; 
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📱 WhatsApp Bot - Código QR</h1>
                <div class="instructions">
                    <p><strong>Instrucciones:</strong></p>
                    <p>1. Abre WhatsApp en tu teléfono</p>
                    <p>2. Ve a <strong>Configuración > Dispositivos vinculados</strong></p>
                    <p>3. Toca <strong>"Vincular un dispositivo"</strong></p>
                    <p>4. Escanea este código QR</p>
                </div>
                <div class="qr-code">
                    <img src="${qrDataURL}" alt="Código QR de WhatsApp" />
                </div>
                <button class="refresh-btn" onclick="window.location.reload()">
                    🔄 Actualizar QR
                </button>
            </div>
            <script>
                // Auto-refresh cada 30 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 30000);
            </script>
        </body>
        </html>
    `);
});

// Endpoint para obtener solo la imagen QR
app.get("/qr-image", (req, res) => {
	if (!currentQR || !qrDataURL) {
		return res.status(404).json({
			error: "No hay código QR disponible",
			ready: isClientReady,
		});
	}

	// Convertir Data URL a Buffer
	const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, "");
	const buffer = Buffer.from(base64Data, "base64");

	res.setHeader("Content-Type", "image/png");
	res.setHeader("Content-Length", buffer.length);
	res.send(buffer);
});

const wwebVersion = "2.2412.54";

const client = new Client({
	authStrategy: new LocalAuth({
		clientId: "client-one",
	}),
	puppeteer: {
		args: ["--no-sandbox"],
	},
	webVersionCache: {
		type: "remote",
		remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
	},
});

let isClientReady = false;
let currentQR = null;
let qrDataURL = null;

client.on("qr", async (qr) => {
	console.log("═══════════════════════════════════════");
	console.log("📱 CÓDIGO QR GENERADO - DISPONIBLE EN /qr");
	console.log("═══════════════════════════════════════");

	// Guardar el QR actual
	currentQR = qr;

	// Generar imagen QR como Data URL
	try {
		qrDataURL = await QRCode.toDataURL(qr, {
			width: 300,
			margin: 2,
			color: {
				dark: "#000000",
				light: "#FFFFFF",
			},
		});
		console.log("✅ Código QR disponible en: http://localhost:" + PORT + "/qr");
	} catch (error) {
		console.error("❌ Error generando imagen QR:", error);
	}

	// También mostrar en terminal como respaldo
	qrcode.generate(qr, { small: true });
	console.log("═══════════════════════════════════════");
	console.log("✅ Escanea el código QR desde /qr o desde arriba");
	console.log("═══════════════════════════════════════");
});

client.on("ready", () => {
	console.log("🚀 Client is ready!");
	console.log("✅ WhatsApp Web está conectado y listo para usar");
	isClientReady = true;
	// Limpiar QR cuando esté listo
	currentQR = null;
	qrDataURL = null;
});

client.on("authenticated", () => {
	console.log("🔐 Cliente autenticado correctamente!");
});

client.on("auth_failure", (msg) => {
	console.error("❌ Error de autenticación:", msg);
	console.log(
		"💡 Sugerencia: Elimina la carpeta .wwebjs_auth y vuelve a intentar"
	);
});

client.on("disconnected", (reason) => {
	console.log("📱 Cliente desconectado:", reason);
	isClientReady = false;
	// Limpiar QR cuando se desconecte
	currentQR = null;
	qrDataURL = null;
});

client.on("loading_screen", (percent, message) => {
	console.log("⏳ Cargando...", percent, message);
});

// Manejar mensajes entrantes
client.on("message", async (message) => {
	try {
		// Solo procesar mensajes de tipo text
		if (message.type !== "chat") {
			return;
		}

		// Obtener información del contacto
		const contact = await message.getContact();
		const chat = await message.getChat();

		// Obtener el número de teléfono del remitente
		const phoneNumber = contact.number;

		console.log(
			`📨 Mensaje recibido de ${contact.name || contact.pushname || phoneNumber
			}: ${message.body}`
		);
		console.log(`📞 Número de teléfono: ${phoneNumber}`);

		// Verificar si el mensaje es exactamente "Quiero solicitar propiedad del negocio"
		const triggerMessage = "Quiero solicitar propiedad del negocio";

		if (message.body.trim().toLowerCase() === triggerMessage.toLowerCase()) {
			console.log(`🎯 Mensaje de solicitud detectado, enviando petición a API...`);

			try {
				// Hacer fetch POST a la API solo cuando se reciba el mensaje específico
				const response = await fetch(`${process.env.API_URL}/ownership/request-by-phone`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						phone: phoneNumber
					}),
				});

				if (response.ok) {
					const apiData = await response.json();
					console.log(`✅ Respuesta exitosa de la API:`, apiData);
				} else {
					console.error(`❌ Error en API response: ${response.status} ${response.statusText}`);

					// Responder con mensaje de error
					const errorMessage = `❌ Lo siento, hubo un problema procesando tu solicitud. Por favor, intenta nuevamente más tarde.`;
					await message.reply(errorMessage);
				}
			} catch (fetchError) {
				console.error(`❌ Error al contactar la API:`, fetchError);
			}
		} else {
			// Responder con instrucciones si el mensaje no es el correcto
			const instructionMessage = `Hola 👋\n\nPara solicitar la propiedad de un negocio, por favor envía exactamente este mensaje:\n\n"${triggerMessage}"\n\nTu número actual es: ${phoneNumber}`;
			await message.reply(instructionMessage);

			console.log(`📤 Instrucciones enviadas a ${phoneNumber}`);
		}

	} catch (error) {
		console.error("❌ Error procesando mensaje:", error);

		// Responder con mensaje de error general
		try {
			await message.reply("❌ Ocurrió un error procesando tu mensaje. Por favor, intenta nuevamente.");
		} catch (replyError) {
			console.error("❌ Error enviando mensaje de error:", replyError);
		}
	}
});

// Endpoint para enviar mensajes
app.post("/send-message", async (req, res) => {
	try {
		const { number, message } = req.body;

		// Validar que el cliente esté listo
		if (!isClientReady) {
			return res.status(400).json({
				error:
					"El cliente de WhatsApp no está listo. Por favor, escanea el código QR primero.",
			});
		}

		// Validar parámetros
		if (!number || !message) {
			return res.status(400).json({
				error: 'Se requieren los campos "number" y "message"',
			});
		}

		// Formatear el número (agregar @c.us si no lo tiene)
		const formattedNumber = number.includes("@c.us")
			? number
			: `${number}@c.us`;

		const numberDetails = await client.getNumberId(formattedNumber);

		console.log(`📞 Enviando mensaje a: ${JSON.stringify(numberDetails)}`);

		// Enviar el mensaje
		if (!!numberDetails) {
			try {
				const response = await client.sendMessage(
					numberDetails._serialized,
					message
				);
				console.log(`📬 Respuesta del envío: ${JSON.stringify(response)}`);
			} catch (error) {
				console.log(`❌ Error al enviar mensaje a ${formattedNumber}:`, error);
				return res.status(500).json({
					error: "Error al enviar el mensaje",
				});
			}
		}

		res.json({
			success: true,
			message: "Mensaje enviado correctamente",
			to: number,
		});
	} catch (error) {
		console.error("Error al enviar mensaje:", error);
		res.status(500).json({
			error: "Error al enviar el mensaje",
			details: error.message,
		});
	}
});

// Endpoint para verificar el estado del cliente
app.get("/status", (req, res) => {
	res.json({
		ready: isClientReady,
		qrAvailable: !!currentQR,
		message: isClientReady ? "Cliente listo" : "Cliente no está listo",
		qrUrl: currentQR ? "/qr" : null,
		instructions:
			!isClientReady && !currentQR
				? "Usa POST /restart para generar un nuevo QR"
				: isClientReady
					? "Bot listo para enviar mensajes"
					: "QR disponible en /qr",
	});
});

// Endpoint para forzar logout y regenerar QR
app.post("/logout", async (req, res) => {
	try {
		console.log("🔄 Cerrando sesión y regenerando QR...");
		await client.logout();
		isClientReady = false;
		res.json({
			success: true,
			message: "Sesión cerrada. Se regenerará el QR automáticamente.",
		});
	} catch (error) {
		console.error("Error al cerrar sesión:", error);
		res.status(500).json({
			error: "Error al cerrar sesión",
			details: error.message,
		});
	}
});

// Endpoint para reiniciar el cliente completamente
app.post("/restart", async (req, res) => {
	try {
		console.log("🔄 Reiniciando cliente...");
		await client.destroy();
		isClientReady = false;

		// Reinicializar después de un breve delay
		setTimeout(() => {
			client.initialize();
		}, 2000);

		res.json({
			success: true,
			message: "Cliente reiniciado. Espera unos segundos para el nuevo QR.",
		});
	} catch (error) {
		console.error("Error al reiniciar:", error);
		res.status(500).json({
			error: "Error al reiniciar",
			details: error.message,
		});
	}
});

// Inicializar el cliente de WhatsApp
console.log("🚀 Iniciando cliente de WhatsApp...");
client.initialize();

// Iniciar el servidor Express solo si no estamos en Vercel
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
	app.listen(PORT, () => {
		console.log(`🌐 Servidor Express ejecutándose en puerto ${PORT}`);
		console.log(`📋 Endpoints disponibles:`);
		console.log(`- GET  http://localhost:${PORT}/`);
		console.log(`- GET  http://localhost:${PORT}/status`);
		console.log(`- GET  http://localhost:${PORT}/qr`);
		console.log(`- GET  http://localhost:${PORT}/qr-image`);
		console.log(`- POST http://localhost:${PORT}/send-message`);
		console.log(`- POST http://localhost:${PORT}/logout`);
		console.log(`- POST http://localhost:${PORT}/restart`);
		console.log("");
		console.log(
			"📱 Para escanear el QR, abre: http://localhost:" + PORT + "/qr"
		);
		console.log("💡 Si no aparece el QR, usa:");
		console.log(`   POST http://localhost:${PORT}/logout`);
		console.log(`   POST http://localhost:${PORT}/restart`);
	});
}

// Exportar la app para Vercel
module.exports = app;
