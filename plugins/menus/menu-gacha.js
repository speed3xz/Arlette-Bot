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

• :･ﾟ⊹˚• `『 G A C H A 』` •˚⊹:･ﾟ•
> Comandos de *Gacha* para reclamar y colecciónar personajes.
 */buycharacter • /buychar • /buyc* + [nombre]
> ⚘ Comprar un personaje en venta.
 */charimage • /waifuimage • /cimage • /wimage* + [nombre]
> ⚘ Ver una imagen aleatoria de un personaje.
 */charinfo • /winfo • /waifuinfo* + [nombre]
> ⚘ Ver información de un personaje.
 */claim • /c • /reclamar* + {citar personaje}
> ⚘ Reclamar un personaje.
 */delclaimmsg*
> ⚘ Restablecer el mensaje al reclamar un personaje
 */deletewaifu • /delwaifu • /delchar* + [nombre]
> ⚘ Eliminar un personaje reclamado.
 */favoritetop • /favtop*
> ⚘ Ver el top de personajes favoritos.
 */gachainfo • /ginfo • /infogacha*
> ⚘ Ver tu información de gacha.
 */giveallharem* + [@usuario]
> ⚘ Regalar todos tus personajes a otro usuario.
 */givechar • /givewaifu • /regalar* + [@usuario] [nombre]
> ⚘ Regalar un personaje a otro usuario.
 */robwaifu • /robarwaifu* + [@usuario]
> ⚘ Robar un personaje a otro usuario.
 */harem • /waifus • /claims* + <@usuario>
> ⚘ Ver tus personajes reclamados.
 */haremshop • /tiendawaifus • /wshop* + <Pagina>
> ⚘ Ver los personajes en venta.
 */removesale • /removerventa* + [precio] [nombre]
> ⚘ Eliminar un personaje en venta.
 */rollwaifu • /rw • /roll*
> ⚘ Waifu o husbando aleatorio
 */sell • /vender* + [precio] [nombre]
> ⚘ Poner un personaje a la venta.
 */serieinfo • /ainfo • /animeinfo* + [nombre]
> ⚘ Información de un anime.
 */serielist • /slist • /animelist*
> ⚘ Listar series del bot
 */setclaimmsg • /setclaim* + [mensaje]
> ⚘ Modificar el mensaje al reclamar un personaje
 */trade • /intercambiar* + [Tu personaje] / [Personaje 2]
> ⚘ Intercambiar un personaje con otro usuario
 */vote • /votar* + [nombre]
> ⚘ Votar por un personaje para subir su valor.
 */waifusboard • /waifustop • /topwaifus • /wtop* + [número]
> ⚘ Ver el top de personajes con mayor valor.

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
handler.command = ['menu gacha', 'menú gacha', 'help gacha']

export default handler
