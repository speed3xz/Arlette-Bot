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

• :･ﾟ⊹˚• `『 I N F O — B O T 』` •˚⊹:･ﾟ•
> Comandos de *Info-bot*.
 */help • /menu*
> ⚘ Ver el menú de comandos.
 */sug • /suggest*
> ⚘ Sugerir nuevas funciones al desarrollador.
 */reporte • /reportar*
> ⚘ Reportar fallas o problemas del bot.
 */owner • /creador*
> ⚘ Contacto del creador del bot.
 */p • /ping*
> ⚘ Ver la velocidad de respuesta del Bot.
 */sc • /script*
> ⚘ Link del repositorio oficial de la Bot
 */status • /system*
> ⚘ Ver estado del sistema de alojamiento.
 */stest • /speedtest*
> ⚘ Ver las estadísticas de velocidad de la Bot.
 */ds • /fixmsgespera*
> ⚘ Eliminar archivos de sesión innecesarios.

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

handler.help = ['menu info']
handler.tags = ['main']
handler.command = ['menu info', 'menú info', 'help info', 'menu informacion', 'menu informacion', 'menu information']

export default handler
