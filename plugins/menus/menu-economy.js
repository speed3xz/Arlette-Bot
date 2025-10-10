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

• :･ﾟ⊹˚• `『 E C O N O M I A 』` •˚⊹:･ﾟ•
> Comandos de *Economía* para ganar dinero.
 */w • /work • /trabajar*
> ⚘ Ganar coins trabajando.
 */slut • /protituirse*
> ⚘ Ganar coins prostituyéndote.
 */coinflip • /flip • /cf* + [cantidad] <cara/cruz>
> ⚘ Apostar coins en un cara o cruz.
 */crime • /crimen*
> ⚘ Ganar coins rapido.
 */roulette • /rt* + [red/black] [cantidad]
> ⚘ Apostar coins en una ruleta.
 */casino • /apostar* • */slot* + [cantidad]
> ⚘ Apuestar coins en el casino.
 */balance • /bal • /bank* + <usuario>
> ⚘ Ver cuantos coins tienes en el banco.
 */deposit • /dep • /depositar • /d* + [cantidad] | all
> ⚘ Depositar tus coins en el banco.
 */withdraw • /with • /retirar* + [cantidad] | all
> ⚘ Retirar tus coins del banco.
 */economyinfo • /einfo*
> ⚘ Ver tu información de economía en el grupo.
 */givecoins • /pay • /coinsgive* + [usuario] [cantidad]
> ⚘ Dar coins a un usuario.
 */miming • /minar • /mine*
> ⚘ Realizar trabajos de minería y ganar coins.
 */daily • /diario*
> ⚘ Reclamar tu recompensa diaria.
 */cofre* • */coffer*
> ⚘ Reclamar tu cofre diario.
 */weekly • /semanal*
> ⚘ Reclamar tu recompensa semanal.
 */monthly • /mensual*
> ⚘ Reclamar tu recompensa mensual.
 */steal • /robar • /rob* + [@mencion]
> ⚘ Intentar robar coins a un usuario.
 */economyboard • /eboard • /baltop* + <pagina>
> ⚘ Ver tu información de economía en el grupo.
 */aventura • /adventure*
> ⚘ Aventuras para ganar coins y exp.
 */curar • /heal*
> ⚘ Curar salud para salir de aventuras.
 */cazar • /hunt*
> ⚘ cazar animales para ganar coins y exp.
 */fish • /pescar*
> ⚘ Ganar coins y exp pescando.
 */mazmorra • /dungeon*
> ⚘ Explorar mazmorras para ganar coins y exp.

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
handler.command = ['menu economia', 'menú economia', 'help economia', 'menu economía', 'menú economía', 'menu economy', 'menú economy']

export default handler
