import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
    let mentionedJid = await m.mentionedJid
    let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
    
    // Array de videos para convertir a GIF
    const videoUrls = [
        'https://example.com/video1.mp4',
        'https://example.com/video2.mp4', 
        'https://example.com/video3.mp4',
        'https://example.com/video4.mp4'
    ]
    
    // Seleccionar video aleatorio
    const randomVideo = videoUrls[Math.floor(Math.random() * videoUrls.length)]
    
    let txt = `
「🎀」 ¡Hola! *@${userId.split('@')[0]}*, 
Soy *${botname}*, aquí tienes la lista de comandos.

╭── ⋅ ⋅ ── ✩ ── ⋅ ⋅ ──╮
   🌸 *ESTADO DEL BOT* 🌸
╰── ⋅ ⋅ ── ✩ ── ⋅ ⋅ ──╯

✧  *Usuarios* » ${totalreg.toLocaleString()}
✧  *Comandos* » ${totalCommands}
✧  *Versión* » ${vs}

╭── ⋅ ⋅ ── ✩ ── ⋅ ⋅ ──╮
     🎀 *CATEGORÍAS* 🎀
╰── ⋅ ⋅ ── ✩ ── ⋅ ⋅ ──╯

🌸 *INFORMACIÓN* - !help info
🦋 *BOTS* - !help bots  
🧸 *PERFIL* - !help profile
🌷 *DESCARGAS* - !help downloads
💐 *UTILIDADES* - !help tools
🍒 *GACHA* - !help gacha
💸 *ECONOMÍA* - !help economy
🧩 *GRUPO* - !help group
💗 *ANIME* - !help anime
⭐ *NSFW* - !help nsfw

> Escribe !help [categoría] para ver los comandos específicos
> Powered by speed3xz`.trim()

    try {
        // Convertir video a GIF
        const gifBuffer = await convertVideoToGif(randomVideo)
        
        // Enviar mensaje con GIF y texto con formato de reenvío del canal específico
        await conn.sendMessage(m.chat, {
            video: gifBuffer,
            gifPlayback: true,
            caption: txt,
            contextInfo: {
                mentionedJid: [userId],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363402095978084@newsletter',
                    serverMessageId: '-1',
                    newsletterName: '【 ✰ 】𝗦𝗽𝗲𝗲𝗱𝟯𝘅𝘇 𝗧𝗲𝗮𝗺 - 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 𝗖𝗵𝗮𝗻𝗲𝗹'
                },
                externalAdReply: {
                    title: botname,
                    body: 'Menu de comandos',
                    mediaType: 1,
                    mediaUrl: redes || 'https://whatsapp.com',
                    sourceUrl: redes || 'https://whatsapp.com',
                    thumbnail: await (await fetch(banner)).buffer(),
                    showAdAttribution: false,
                    containsAutoReply: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })
        
    } catch (error) {
        console.error('Error al procesar GIF:', error)
        // Enviar solo texto si falla el GIF con formato de reenvío del canal específico
        await conn.sendMessage(m.chat, { 
            text: txt,
            contextInfo: {
                mentionedJid: [userId],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363402095978084@newsletter',
                    serverMessageId: '-1', 
                    newsletterName: '【 ✰ 】𝗦𝗽𝗲𝗲𝗱𝟯𝘅𝘇 𝗧𝗲𝗮𝗺 - 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 𝗖𝗵𝗮𝗻𝗲𝗹'
                },
                externalAdReply: {
                    title: botname,
                    body: 'Menu de comandos',
                    mediaType: 1,
                    mediaUrl: redes || 'https://whatsapp.com',
                    sourceUrl: redes || 'https://whatsapp.com',
                    thumbnail: await (await fetch(banner)).buffer(),
                    showAdAttribution: false,
                    containsAutoReply: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })
    }
}

// Función para convertir video a GIF
async function convertVideoToGif(videoUrl) {
    try {
        // Descargar el video
        const videoResponse = await fetch(videoUrl)
        const videoBuffer = await videoResponse.buffer()
        
        // Aquí iría la lógica para convertir el video a GIF
        // Por ahora devolvemos el buffer del video como GIF
        return videoBuffer
        
    } catch (error) {
        console.error('Error al convertir video a GIF:', error)
        throw error
    }
}

handler.help = ['menu2']
handler.tags = ['main']
handler.command = ['menu2', 'menú2', 'help2']

export default handler
