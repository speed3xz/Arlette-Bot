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

• :･ﾟ⊹˚• `『 D E S C A R G A S 』` •˚⊹:･ﾟ•
> Comandos de *Descargas* para descargar archivos de varias fuentes.
 */tiktok • /tt* + [Link] / [busqueda]
> ⚘ Descargar un video de TikTok.
 */mediafire • /mf* + [Link]
> ⚘ Descargar un archivo de MediaFire.
 */mega • /mg* + [Link]
> ⚘ Descargar un archivo de MEGA.
 */play • /play2 • /ytmp3 • /ytmp4* + [Cancion] / [Link]
> ⚘ Descargar una cancion o vídeo de YouTube.
 */facebook • /fb* + [Link]
> ⚘ Descargar un video de Facebook.
 */twitter • /x* + [Link]
> ⚘ Descargar un video de Twitter/X.
 */ig • /instagram* + [Link]
> ⚘ Descargar un reel de Instagram.
 */pinterest • /pin* + [busqueda] / [Link]
> ⚘ Buscar y descargar imagenes de Pinterest.
 */image • /imagen* + [busqueda]
> ⚘ Buscar y descargar imagenes de Google.
 */apk • /modapk* + [busqueda]
> ⚘ Descargar un apk de Aptoide.
 */ytsearch • /search* + [busqueda]
> ⚘ Buscar videos de YouTube.

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
handler.command = ['menu descargas', 'menú descargas', 'help descargas', 'menu downloads', 'menu download']

export default handler
