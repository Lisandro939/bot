const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
require('dotenv').config()

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const ChatGPTClass = require('./chatgpt.class')

/* const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('Hola!')

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

const flowHowAreU = addKeyword(['como estás', 'como estas?', 'cmo stas?', 'como andamos?'])
.addAnswer('Bien! y vos?')

const flowHowAreU2 = addKeyword(['todo bien?'])
.addAnswer('Todo bien, vos?')

const flowHowAreU3 = addKeyword(['todo tranqui?'])
.addAnswer('Todo tranqui, y vos?')
 */

const createBotGPT = async ({provider, database }) => {
    return new ChatGPTClass(database, provider)
} 

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([])
    const adapterProvider = createProvider(BaileysProvider)

    createBotGPT({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    /* createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    }) */

    QRPortalWeb()
}

main()
