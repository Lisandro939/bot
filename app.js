const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('Hola')

const flowHorarios = addKeyword(['horario', 'Horarios'])
    .addAnswer([
        'Lunes: 14:30hs a 17:30hs',
        'Martes: 16:45hs a 19:00hs',
        'Miercoles: 13:45hs a 19:hs',
        'Jueves: 14:00hs a 19:00hs',
        'Viernes: Libre',
        'Sábado: 09:00hs a 11:00hs',
        'Domingo: Obvio que libre...'
    ])

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, flowHorarios])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
