import fetch from 'node-fetch'
import { WAMessageStubType } from '@whiskeysockets/baileys'

async function obtenerImagenUsuario(conn, userId, chatJid) {
    const fallbackUrl = global.icono || 'https://raw.githubusercontent.com/speed3xz/Storage/refs/heads/main/Arlette-Bot/b75b29441bbd967deda4365441497221.jpg'

    try {
        const url = await conn.profilePictureUrl(userId, 'image').catch(() => null)
        if (url) {
            const res = await fetch(url)
            if (res.ok) return await res.buffer()
        }
    } catch {}

    try {
        const url = await conn.profilePictureUrl(chatJid, 'image').catch(() => null)
        if (url) {
            const res = await fetch(url)
            if (res.ok) return await res.buffer()
        }
    } catch {}

    try {
        const res = await fetch(fallbackUrl)
        if (res.ok) return await res.buffer()
    } catch {}

    return Buffer.from('')
}

function formatearMensaje(plantilla, userNum, grupo, desc) {
    if (!plantilla) return ''
    return plantilla
        .replace(/{usuario}|@usuario|#usuario/g, `@${userNum}`)
        .replace(/{grupo}|@grupo|#grupo/g, grupo)
        .replace(/{desc}|@desc|#desc/g, desc)
}

async function generarBienvenida({ conn, userId, groupMetadata, chat, chatJid }) {
    const userNum = userId.split('@')[0]
    const userJid = userNum + '@s.whatsapp.net'
    const imageBuffer = await obtenerImagenUsuario(conn, userId, chatJid)
    
    const desc = groupMetadata?.desc ? String(groupMetadata.desc) : 'Sin descripción'
    const grupo = groupMetadata?.subject || 'el grupo'

    const mensajeCustom = chat.sWelcome 
        ? formatearMensaje(chat.sWelcome, userNum, grupo, desc)
        : `Bienvenido(a) a *${grupo}*`

    const caption = `👋🏻 @${userNum}\n${mensajeCustom}`

    return { image: imageBuffer, caption, mentions: [userJid] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat, chatJid }) {
    const userNum = userId.split('@')[0]
    const userJid = userNum + '@s.whatsapp.net'
    const imageBuffer = await obtenerImagenUsuario(conn, userId, chatJid)
    
    const desc = groupMetadata?.desc ? String(groupMetadata.desc) : 'Sin descripción'
    const grupo = groupMetadata?.subject || 'el grupo'

    const mensajeCustom = chat.sBye 
        ? formatearMensaje(chat.sBye, userNum, grupo, desc)
        : `se fue de *${grupo}*\nUn estorbo menos, ni te ocupábamos.`

    const caption = `👋🏻 @${userNum} ${mensajeCustom}`

    return { image: imageBuffer, caption, mentions: [userJid] }
}

let handler = m => m
handler.before = async function (m, { conn, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return !0
    
    const primaryBot = global.db.data.chats[m.chat]?.primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) throw !1
    
    const chat = global.db.data.chats[m.chat]
    const rawUser = m.messageStubParameters?.[0]
    if (!rawUser) return !0

    const userId = rawUser.split(':')[0] + '@s.whatsapp.net'
    
    if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const { image, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat, chatJid: m.chat })
        await conn.sendMessage(m.chat, { image, caption, mentions }, { quoted: null })
    }
    
    if (chat.welcome && (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
        const { image, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat, chatJid: m.chat })
        await conn.sendMessage(m.chat, { image, caption, mentions }, { quoted: null })
    }
}

export { generarBienvenida, generarDespedida }
export default handler
