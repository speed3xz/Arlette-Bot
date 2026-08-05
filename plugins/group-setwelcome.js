import fetch from 'node-fetch'
import { generarBienvenida, generarDespedida } from './_welcome.js'

const handler = async (m, { conn, command, usedPrefix, text, groupMetadata }) => {
    const value = text ? text.trim() : ''
    const chat = global.db.data.chats[m.chat]

    if (command === 'setgp') {
        return m.reply(
            `⚙️ *Ajustes del Grupo*\n\n` +
            `Selecciona una categoría para modificar:\n\n` +
            `• *${usedPrefix}gpname* <texto> » Cambia el nombre\n` +
            `• *${usedPrefix}gpdesc* <texto> » Cambia la descripción\n` +
            `• *${usedPrefix}gpbanner* (imagen) » Cambia la foto del grupo\n` +
            `• *${usedPrefix}setwelcome* <texto> » Configura la bienvenida\n` +
            `• *${usedPrefix}setbye* <texto> » Configura la despedida\n` +
            `• *${usedPrefix}testwelcome* » Prueba la bienvenida\n` +
            `• *${usedPrefix}testbye* » Prueba la despedida`
        )
    }

    try {
        switch (command) {
            case 'setwelcome': {
                if (!value) return m.reply(`👋🏻 *Mensaje de Bienvenida*\n\nIngresa el texto a mostrar cuando alguien se una.\n\nVariables disponibles:\n• *@usuario* / *#usuario*\n• *@grupo* / *#grupo*\n• *@desc* / *#desc*\n\nEjemplo: *${usedPrefix}setwelcome Hola @usuario, bienvenido a @grupo*`)
                chat.sWelcome = value
                m.reply(`👋🏻 *Mensaje guardado*\nHas configurado la bienvenida correctamente.\n\nUsa *${usedPrefix}testwelcome* para probarla.`)
                break
            }
            case 'setbye': {
                if (!value) return m.reply(`👋🏻 *Mensaje de Despedida*\n\nIngresa el texto a mostrar cuando alguien salga.\n\nVariables disponibles:\n• *@usuario* / *#usuario*\n• *@grupo* / *#grupo*\n• *@desc* / *#desc*\n\nEjemplo: *${usedPrefix}setbye Adiós @usuario, te esperamos pronto en @grupo*`)
                chat.sBye = value
                m.reply(`👋🏻 *Mensaje guardado*\nHas configurado la despedida correctamente.\n\nUsa *${usedPrefix}testbye* para probarla.`)
                break
            }
            case 'testwelcome': {
                const { image, caption, mentions } = await generarBienvenida({ conn, userId: m.sender, groupMetadata, chat, chatJid: m.chat })
                
                if (image && image.length > 0) {
                    await conn.sendMessage(m.chat, { image, caption, mentions }, { quoted: m })
                } else {
                    await conn.sendMessage(m.chat, { text: caption, mentions }, { quoted: m })
                }
                break
            }
            case 'testbye': {
                const { image, caption, mentions } = await generarDespedida({ conn, userId: m.sender, groupMetadata, chat, chatJid: m.chat })
                
                if (image && image.length > 0) {
                    await conn.sendMessage(m.chat, { image, caption, mentions }, { quoted: m })
                } else {
                    await conn.sendMessage(m.chat, { text: caption, mentions }, { quoted: m })
                }
                break
            }
        }
    } catch (e) {
        m.reply(`⚠️ *Ocurrió un error*\n\n${e.message}`)
    }
}

handler.help = ['setwelcome', 'setbye', 'testwelcome', 'testbye']
handler.tags = ['group']
handler.command = ['setgp', 'setwelcome', 'setbye', 'testwelcome', 'testbye']
handler.admin = true
handler.group = true

export default handler
