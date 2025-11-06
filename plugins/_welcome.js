import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const nombreUsuario = userId.split('@')[0]
    
    // Obtener avatar del usuario
    const avatar = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/speed3xz/Storage/refs/heads/main/Arlette-Bot/b75b29441bbd967deda4365441497221.jpg')
    
    // Background para la bienvenida
    const background = 'https://speed3xz.bot.nu/storage/img/IMG_5018.jpeg'
    
    // Descripción con nombre del grupo
    const descripcion = `to ${groupMetadata.subject}`
    
    // Construir URL de la API
    const apiUrl = `https://api.siputzx.my.id/api/canvas/welcomev4?avatar=${encodeURIComponent(avatar)}&background=${encodeURIComponent(background)}&description=${encodeURIComponent(descripcion)}`
    
    const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' })
    const groupSize = groupMetadata.participants.length + 1
    const desc = groupMetadata.desc?.toString() || 'Sin descripción'
    
    const mensaje = (chat.sWelcome || '૮꒰ ˶• ᴗ •˶꒱ა Disfruta tu estadía en el grupo!\n\n> 🎀 Personaliza este mensaje usando: */setwelcome*')
        .replace(/{usuario}/g, `${username}`)
        .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
        .replace(/{desc}/g, `${desc}`)
    
    const caption = `
╭───·˚ 🐝 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🐝 ·˚───╮

  𐔌՞. .՞𐦯 ¡Hola, ${username}  
  Te damos la bienvenida a: *${groupMetadata.subject}*

${mensaje}
  
╰──·˚ 🌷 ¡Disfruta tu estadía! ˚·──╯`

    return { imageUrl: apiUrl, caption, mentions: [userId] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const nombreUsuario = userId.split('@')[0]
    
    // Obtener avatar del usuario
    const avatar = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/speed3xz/Storage/refs/heads/main/Arlette-Bot/b75b29441bbd967deda4365441497221.jpg')
    
    // Background para la despedida (puedes cambiar si quieres uno diferente)
    const background = 'https://speed3xz.bot.nu/storage/img/IMG_5018.jpeg'
    
    // Descripción con nombre del grupo
    const descripcion = `Se fue de ${groupMetadata.subject}`
    
    // Construir URL de la API usando goodbyev4
    const apiUrl = `https://api.siputzx.my.id/api/canvas/goodbyev4?avatar=${encodeURIComponent(avatar)}&background=${encodeURIComponent(background)}&description=${encodeURIComponent(descripcion)}`
    
    const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' })
    const groupSize = groupMetadata.participants.length - 1
    const desc = groupMetadata.desc?.toString() || 'Sin descripción'
    
    const mensaje = (chat.sBye || '-1 homosexual 🥺\n\n> 🎀 Personaliza este mensaje usando: */setbye*')
        .replace(/{usuario}/g, `${username}`)
        .replace(/{grupo}/g, `${groupMetadata.subject}`)
        .replace(/{desc}/g, `*${desc}*`)
    
    const caption = `
╭───·˚ 🐝 𝐆𝐎𝐎𝐃 𝐁𝐘𝐄 🐝 ·˚───╮

  𐔌՞. .՞𐦯 – ${username}  
  Se fue de: *${groupMetadata.subject}*

${mensaje}
  
╰───·˚  🌷 ¡Hasta pronto!  ˚·───╯`

    return { imageUrl: apiUrl, caption, mentions: [userId] }
}

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return !0
    
    const primaryBot = global.db.data.chats[m.chat].primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) throw !1
    
    const chat = global.db.data.chats[m.chat]
    const userId = m.messageStubParameters[0]
    
    if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const { imageUrl, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat })
        
        // Configurar menciones
        const messageOptions = {
            image: { url: imageUrl },
            caption: caption,
            mentions: mentions
        }
        
        await conn.sendMessage(m.chat, messageOptions, { quoted: null })
    }
    
    if (chat.welcome && (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
        const { imageUrl, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat })
        
        // Configurar menciones
        const messageOptions = {
            image: { url: imageUrl },
            caption: caption,
            mentions: mentions
        }
        
        await conn.sendMessage(m.chat, messageOptions, { quoted: null })
    }
}

export { generarBienvenida, generarDespedida }
export default handler
