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

• :･ﾟ⊹˚• `『 P E R F I L 』` •˚⊹:･ﾟ•
> Comandos de *Perfil* para ver y configurar tu perfil.
 */leaderboard • /lboard • /top* + <Paginá>
> ⚘ Top de usuarios con más experiencia.
 */level • /lvl* + <@Mencion>
> ⚘ Ver tu nivel y experiencia actual.
 */marry • /casarse* + <@Mencion>
> ⚘ Casarte con alguien.
 */profile* + <@Mencion>
> ⚘ Ver tu perfil.
 */setbirth* + [fecha]
> ⚘ Establecer tu fecha de cumpleaños.
 */setdescription • /setdesc* + [Descripcion]
> ⚘ Establecer tu descripcion.
 */setgenre* + Hombre | Mujer
> ⚘ Establecer tu genero.
 */delgenre • /delgenero*
> ⚘ Eliminar tu género.
 */delbirth* + [fecha]
> ⚘ Borrar tu fecha de cumpleaños.
 */divorce*
> ⚘ Divorciarte de tu pareja.
 */setfavourite • /setfav* + [Personaje]
> ⚘ Establecer tu claim favorito.
 */deldescription • /deldesc*
> ⚘ Eliminar tu descripción.
 */prem • /vip*
> ⚘ Comprar membresía premium.

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
handler.command = ['menu perfil', 'menu profile', 'help profile']

export default handler
