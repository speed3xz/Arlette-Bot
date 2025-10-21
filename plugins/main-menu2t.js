import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
    let mentionedJid = await m.mentionedJid
    let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
    
    // Array de videos optimizados (más ligeros)
    const videoUrls = [
        'speed3xz.bot.nu/Arlette/video/o4EBAjtzqIEqKkyBgAR7QlvYrAyA8hDRfQCYEw.mp4',
        'speed3xz.bot.nu/Arlette/video/oIjloDezA7yE3QIM3CgiiBZfIC3fzCT8QABJIK.mp4', 
        'speed3xz.bot.nu/Arlette/video/oQBQJI1EDwqj0BSzQEfbAnQXiFyTBlBEHfgRlD.mp4',
        'speed3xz.bot.nu/Arlette/video/oggIoEg0wA9OAjAaKftvryzAkBksShBhD8XGQl.mp4',
        'speed3xz.bot.nu/Arlette/video/owm0pIvEBPNQSAStwifaAQQUWiloCzBC313Iii.mp4'
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
        // Primero reaccionar al mensaje
        await conn.sendMessage(m.chat, { 
            react: { 
                text: '⭐', 
                key: m.key 
            }
        })
        
        // Enviar el video directamente sin conversión a GIF
        await conn.sendMessage(m.chat, {
            video: { url: randomVideo },
            gifPlayback: true,
            caption: txt,
            contextInfo: {
                mentionedJid: [userId],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelRD.id,
                    serverMessageId: '',
                    newsletterName: channelRD.name
                },
                externalAdReply: {
                    title: botname,
                    body: 'Menu de comandos',
                    mediaType: 1,
                    thumbnail: await (await fetch(banner)).buffer(),
                    showAdAttribution: false
                }
            }
        }, { quoted: m })
        
    } catch (error) {
        console.error('Error al enviar video:', error)
        // Enviar solo texto si falla el video
        await conn.sendMessage(m.chat, { 
            text: txt,
            contextInfo: {
                mentionedJid: [userId],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelRD.id,
                    serverMessageId: '',
                    newsletterName: channelRD.name
                },
                externalAdReply: {
                    title: botname,
                    body: 'Menu de comandos',
                    mediaType: 1,
                    thumbnail: await (await fetch(banner)).buffer(),
                    showAdAttribution: false
                }
            }
        }, { quoted: m })
    }
}

handler.help = ['menu2']
handler.tags = ['main']
handler.command = ['menu2', 'menú2', 'help2']

export default handler
