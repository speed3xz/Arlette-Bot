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

• :･ﾟ⊹˚• `『 A N I M E 』` •˚⊹:･ﾟ•
> Comandos de reacciones de anime.
 */angry • /enojado* + <mencion>
> ⚘ Estar enojado
 */bath • /bañarse* + <mencion>
> ⚘ Bañarse
 */bite • /morder* + <mencion>
> ⚘ Muerde a alguien
 */bleh • /lengua* + <mencion>
> ⚘ Sacar la lengua
 */blush • /sonrojarse* + <mencion>
> ⚘ Sonrojarte
 */bored • /aburrido* + <mencion>
> ⚘ Estar aburrido
 */clap • /aplaudir* + <mencion>
> ⚘ Aplaudir
 */coffee • /cafe • /café* + <mencion>
> ⚘ Tomar café
 */cry • /llorar* + <mencion>
> ⚘ Llorar por algo o alguien
 */cuddle • /acurrucarse* + <mencion>
> ⚘ Acurrucarse
 */dance • /bailar* + <mencion>
> ⚘ Sacate los pasitos prohíbidos
 */dramatic • /drama* + <mencion>
> ⚘ Drama
 */drunk • /borracho* + <mencion>
> ⚘ Estar borracho
 */eat • /comer* + <mencion>
> ⚘ Comer algo delicioso
 */facepalm • /palmada* + <mencion>
> ⚘ Darte una palmada en la cara
 */happy • /feliz* + <mencion>
> ⚘ Salta de felicidad
 */hug • /abrazar* + <mencion>
> ⚘ Dar un abrazo
 */impregnate • /preg • /preñar • /embarazar* + <mencion>
> ⚘ Embarazar a alguien
 */kill • /matar* + <mencion>
> ⚘ Toma tu arma y mata a alguien
 */kiss • /muak* + <mencion>
> ⚘ Dar un beso
 */kisscheek • /beso* + <mencion>
> ⚘ Beso en la mejilla
 */laugh • /reirse* + <mencion>
> ⚘ Reírte de algo o alguien
 */lick • /lamer* + <mencion>
> ⚘ Lamer a alguien
 */love • /amor • /enamorado • /enamorada* + <mencion>
> ⚘ Sentirse enamorado
 */pat • /palmadita • /palmada* + <mencion>
> ⚘ Acaricia a alguien
 */poke • /picar* + <mencion>
> ⚘ Picar a alguien
 */pout • /pucheros* + <mencion>
> ⚘ Hacer pucheros
 */punch • /pegar • /golpear* + <mencion>
> ⚘ Dar un puñetazo
 */run • /correr* + <mencion>
> ⚘ Correr
 */sad • /triste* + <mencion>
> ⚘ Expresar tristeza
 */scared • /asustado • /asustada* + <mencion>
> ⚘ Estar asustado
 */seduce • /seducir* + <mencion>
> ⚘ Seducir a alguien
 */shy • /timido • /timida* + <mencion>
> ⚘ Sentir timidez
 */slap • /bofetada* + <mencion>
> ⚘ Dar una bofetada
 */sleep • /dormir* + <mencion>
> ⚘ Tumbarte a dormir
 */smoke • /fumar* + <mencion>
> ⚘ Fumar
 */spit • /escupir* + <mencion>
> ⚘ Escupir
 */step • /pisar* + <mencion>
> ⚘ Pisar a alguien
 */think • /pensar* + <mencion>
> ⚘ Pensar en algo
 */walk • /caminar* + <mencion>
> ⚘ Caminar
 */wink • /guiñar* + <mencion>
> ⚘ Guiñar el ojo
 */cringe • /avergonzarse* + <mencion>
> ⚘ Sentir vergüenza ajena
 */smug • /presumir* + <mencion>
> ⚘ Presumir con estilo
 */smile • /sonreir* + <mencion>
> ⚘ Sonreír con ternura
 */highfive • /5* + <mencion>
> ⚘ Chocar los cinco
 */bully • /bullying* + <mencion>
> ⚘ Molestar a alguien
 */handhold • /mano* + <mencion>
> ⚘ Tomarse de la mano
 */wave • /ola • /hola* + <mencion>
> ⚘ Saludar con la mano
 */waifu*
> ⚘ Buscar una waifu aleatoria.
 */ppcouple • /ppcp*
> ⚘ Genera imágenes para amistades o parejas.

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
handler.command = ['menu anime', 'menú anime', 'help anime']

export default handler
