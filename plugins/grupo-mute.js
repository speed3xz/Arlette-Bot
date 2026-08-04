import { resolveLidToPnJid, normalizeNumber } from '../handler.js'

let handler = async (m, { conn, command, usedPrefix, args }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat) return

    if (!Array.isArray(chat.muteds)) {
        chat.muteds = []
    }

    const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.msg?.contextInfo
    const q = args[0]

    let rawtarget = (m.mentionedJid && m.mentionedJid.length > 0) ? m.mentionedJid : contextInfo?.mentionedJid

    let who = await (m.quoted?.sender || rawtarget?.[0] || contextInfo?.participant || (q ? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null))

    if (!who || who === '@s.whatsapp.net') {
        return m.reply(`❀ *Uso correcto del comando:*\n\n> ✦ Responde a un mensaje, menciona a alguien o escribe un número.\n> » Ejemplo: *${usedPrefix + command} @usuario*`)
    }

    const resolvedJid = await resolveLidToPnJid(conn, m.chat, who)
    const normalized = normalizeNumber(resolvedJid)

    if (!normalized) {
        return m.reply(`⚠︎ No se pudo identificar al usuario.`)
    }

    const targetJid = normalized + '@s.whatsapp.net'

    if (command === 'mute' || command === 'silenciar') {
        if (chat.muteds.includes(normalized)) {
            return m.reply(`✿ El usuario @${normalized} ya está silenciado en este grupo.`, null, { mentions: [targetJid] })
        }

        chat.muteds.push(normalized)
        return m.reply(`✐ El usuario @${normalized} ha sido silenciado.\n> ✰ Sus mensajes serán eliminados automáticamente.`, null, { mentions: [targetJid] })
    }

    if (command === 'unmute' || command === 'desilenciar') {
        let index = chat.muteds.findIndex(u => normalizeNumber(u) === normalized)
        
        if (index === -1) {
            return m.reply(`✿ El usuario @${normalized} no está silenciado en este grupo.`, null, { mentions: [targetJid] })
        }

        chat.muteds.splice(index, 1)
        return m.reply(`🔊 El usuario @${normalized} ya no está silenciado.\n> ✰ Ahora puede participar libremente.`, null, { mentions: [targetJid] })
    }
}

handler.help = ['mute @user', 'unmute @user']
handler.tags = ['grupo']
handler.command = ['mute', 'silenciar', 'unmute', 'desilenciar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
