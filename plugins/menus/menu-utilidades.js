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

• :･ﾟ⊹˚• `『 U T I L I D A D E S 』` •˚⊹:･ﾟ•
> Comandos de *Útilidades*.
 */calcular • /cal*
> ⚘ Calcular tipos de ecuaciones.
 */delmeta*
> ⚘ Restablecer el pack y autor por defecto para tus stickers.
 */getpic • /pfp* + [@usuario]
> ⚘ Ver la foto de perfil de un usuario.
 */say* + [texto]
> ⚘ Repetir un mensaje
 */setmeta* + [autor] | [pack]
> ⚘ Establecer el pack y autor por defecto para tus stickers.
 */sticker • /s • /wm* + {citar una imagen/video}
> ⚘ Convertir una imagen/video a sticker
 */toimg • /img* + {citar sticker}
> ⚘ Convertir un sticker/imagen de una vista a imagen.
 */brat • /bratv • /qc • /emojimix*︎ 
> ⚘ Crear stickers con texto.
 */enhance • /remini • /hd*
> ⚘ Mejorar calidad de una imagen.
 */letra • /style* 
> ⚘ Cambia la fuente de las letras.
 */read • /readviewonce*
> ⚘ Ver imágenes viewonce.
 */ss • /ssweb*
> ⚘ Ver el estado de una página web.
 */translate • /traducir • /trad*
> ⚘ Traducir palabras en otros idiomas.
 */ia • /gemini*
> ⚘ Preguntar a Chatgpt.
 */tourl • /catbox*
> ⚘ Convertidor de imágen/video en urls.
 */wiki • /wikipedia*
> ⚘ Investigar temas a través de Wikipedia.
 */dalle • /flux*
> ⚘ Crear imágenes con texto mediante IA.
 */google*
> ⚘ Realizar búsquedas por Google.

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
handler.command = ['menu utilidades', 'menú utilidades', 'help utilidades', 'menu utilities']

export default handler
