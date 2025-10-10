import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
let mentionedJid = await m.mentionedJid
let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
let totalreg = Object.keys(global.db.data.users).length
let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
    
let txt = `
「🎀」 ¡Hola! *@${userId.split('@')[0]}*, Soy *${botname}*, Aquí tienes la lista de comandos.\n> Para Ver Tu Perfil Usa */perfil* ❒

╭────── · · ୨୧ · · ──────╮
│❀ *Modo* » Publico
│ᰔ *Tipo* » ${(conn.user.jid == global.conn.user.jid ? 'Principal 🎀' : 'Sub-Bot 💗')}
│✰ *Usuarios* » ${totalreg.toLocaleString()}
│⚘ *Versión* » ${vs}
│ꕥ *Comandos* » ${totalCommands}
│🜸 Baileys » Multi Device
╰────── · · ୨୧ · · ──────╯

• :･ﾟ⊹˚• `『 N S F W 』` •˚⊹:･ﾟ•
 */danbooru • /dbooru* + [Tags]
> ⚘ Buscar imagenes en Danbooru
 */gelbooru • /gbooru* + [Tags]
> ⚘ Buscar imagenes en Gelbooru
 */rule34 • /r34* + [Tags]
> ⚘ Buscar imagenes en Rule34
 */xvideos •/xvideosdl* + [Link]
> ⚘ Descargar un video Xvideos. 
 */xnxx •/xnxxdl* + [Link]
> ⚘ Descargar un video Xnxx.

> ✐ Powered By Speed3xz`.trim()
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
body: textbot,
mediaType: 1,
mediaUrl: redes,
sourceUrl: redes,
thumbnail: await (await fetch(banner)).buffer(),
showAdAttribution: false,
containsAutoReply: true,
renderLargerThumbnail: true
}}}, { quoted: m })
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu nsfw', 'menú nsfw', 'help nsfw']

export default handler
