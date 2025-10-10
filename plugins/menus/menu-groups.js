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

• :･ﾟ⊹˚• `『 G R U P O S 』` •˚⊹:･ﾟ•
> Comandos para *Administradores* de grupos.
 */tag • /hidetag • /invocar • /tagall* + [mensaje]
> ⚘ Envía un mensaje mencionando a todos los usuarios del grupo.
 */detect • /alertas* + [enable/disable]
> ⚘ Activar/desactivar las alertas de promote/demote
 */antilink • /antienlace* + [enable/disable]
> ⚘ Activar/desactivar el antienlace
 */bot* + [enable/disable]
> ⚘ Activar/desactivar al bot
 */close • /cerrar*
> ⚘ Cerrar el grupo para que solo los administradores puedan enviar mensajes.
 */demote* + <@usuario> | {mencion}
> ⚘ Descender a un usuario de administrador.
 */economy* + [enable/disable]
> ⚘ Activar/desactivar los comandos de economía
 */gacha* + [enable/disable]
> ⚘ Activar/desactivar los comandos de Gacha y Games.
 */welcome • /bienvenida* + [enable/disable]
> ⚘ Activar/desactivar la bienvenida y despedida.
 */setbye* + [texto]
> ⚘ Establecer un mensaje de despedida personalizado.
 */setprimary* + [@bot]
> ⚘ Establece un bot como primario del grupo.
 */setwelcome* + [texto]
> ⚘ Establecer un mensaje de bienvenida personalizado.
 */kick* + <@usuario> | {mencion}
> ⚘ Expulsar a un usuario del grupo.
 */nsfw* + [enable/disable]
> ⚘ Activar/desactivar los comandos NSFW
 */onlyadmin* + [enable/disable]
> ⚘ Permitir que solo los administradores puedan utilizar los comandos.
 */open • /abrir*
> ⚘ Abrir el grupo para que todos los usuarios puedan enviar mensajes.
 */promote* + <@usuario> | {mencion}
> ⚘ Ascender a un usuario a administrador.
 */add • /añadir • /agregar* + {número}
> ⚘ Invita a un usuario a tu grupo.
 *admins • admin* + [texto]
> ⚘ Mencionar a los admins para solicitar ayuda.
 */restablecer • /revoke*
> ⚘ Restablecer enlace del grupo.
 */addwarn • /warn* + <@usuario> | {mencion}
> ⚘ Advertir aún usuario.
 */unwarn • /delwarn* + <@usuario> | {mencion}
> ⚘ Quitar advertencias de un usuario.
 */advlist • /listadv*
> ⚘ Ver lista de usuarios advertidos.
 */inactivos • /kickinactivos*
> ⚘ Ver y eliminar a usuarios inactivos.
 */listnum • /kicknum* [texto]
> ⚘ Eliminar usuarios con prefijo de país.
 */gpbanner • /groupimg*
> ⚘ Cambiar la imagen del grupo.
 */gpname • /groupname* [texto]
> ⚘ Cambiar la nombre del grupo.
 */gpdesc • /groupdesc* [texto]
> ⚘ Cambiar la descripción del grupo.
 */del • /delete* + {citar un mensaje}
> ⚘ Eliminar un mensaje.
 */linea • /listonline*
> ⚘ Ver lista de usuarios en linea.
 */gp • /infogrupo*
> ⚘ Ver la Informacion del grupo.
 */link*
> ⚘ Ver enlace de invitación del grupo.

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
handler.command = ['menu grupo', 'menú grupo', 'help grupo', 'menu grupos', 'menu group', 'menu groups']

export default handler
