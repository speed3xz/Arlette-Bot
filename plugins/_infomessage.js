let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const groupMetadataCache = new Map()
const lidCache = new Map()
const handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return
const primaryBot = global.db.data.chats[m.chat].primaryBot
if (primaryBot && conn.user.jid !== primaryBot) throw !1
const chat = global.db.data.chats[m.chat]
const users = m.messageStubParameters[0]
const usuario = await resolveLidToRealJid(m?.sender, conn, m?.chat)
const groupAdmins = participants.filter(p => p.admin)
const rcanal = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: '', newsletterName: channelRD.name }, externalAdReply: { title: "⸝⸝　 ꒰　A V I S O　꒱  ⁞　ˎˊ˗", body: textbot, mediaUrl: null, description: null, previewType: "PHOTO", thumbnail: await (await fetch(icono)).buffer(), sourceUrl: redes, mediaType: 1, renderLargerThumbnail: false }, mentionedJid: null }}
const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg'
const nombre = `🌸✨ ¡NUEVO NOMBRE! ✨🌸\n\n
@${usuario.split('@')[0]} decidió darle un nuevo nombre\n.
💌 Ahora se llama: *${m.messageStubParameters[0]}*`;
const foto = `🖼️🌷 ¡Foto renovada! 🌷🖼️\n\n
👀 Acción hecha por: @${usuario.split('@')[0]}`
const edit = `🔧✨ Configuración del grupo ✨🔧\n\n
@${usuario.split('@')[0]} ha decidido que ${m.messageStubParameters[0] == 'on' ? 'solo los admins 🌟' : 'todos los miembros 🌼'} puedan modificar el grupo.`
const newlink = `🔗💫 ¡Enlace del grupo actualizado! 💫🔗\n\n
✦ Gracias a: @${usuario.split('@')[0]}\n
Ahora todos pueden unirse de nuevo 🌸`
const status = `🚦🌸 Estado del grupo 🌸🚦\n\n
El grupo ha sido ${m.messageStubParameters[0] == 'on' ? '*cerrado* 🔒' : '*abierto* 🔓'}.\n
✦ Por: @${usuario.split('@')[0]}\n
🌿 ${m.messageStubParameters[0] == 'on' ? 'Solo admins pueden enviar mensajes' : 'Todos pueden enviar mensajes'}`
const admingp = `🌟✨ ¡Admin nuevo! ✨🌟\n\n
@${users.split('@')[0]} ahora es admin del grupo.\n
🖇️ Acción realizada por: @${usuario.split('@')[0]} 💖`
const noadmingp = `🌸⚡ ¡Admin removido! ⚡🌸\n\n
@${users.split('@')[0]} ya no tiene permisos de admin.\n
🖇️ Acción realizada por: @${usuario.split('@')[0]} 💌`
if (chat.detect && m.messageStubType == 2) {
const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
const sessionPath = `./${sessions}/`
for (const file of await fs.promises.readdir(sessionPath)) {
if (file.includes(uniqid)) {
await fs.promises.unlink(path.join(sessionPath, file))
console.log(`${chalk.yellow.bold('✎ Delete!')} ${chalk.greenBright(`'${file}'`)}\n${chalk.redBright('Que provoca el "undefined" en el chat.')}`)
}}} if (chat.detect && m.messageStubType == 21) {
rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
await this.sendMessage(m.chat, { text: nombre, ...rcanal }, { quoted: null })
} if (chat.detect && m.messageStubType == 22) {
rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
await this.sendMessage(m.chat, { image: { url: pp }, caption: foto, ...rcanal }, { quoted: null })
} if (chat.detect && m.messageStubType == 23) {
rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
await this.sendMessage(m.chat, { text: newlink, ...rcanal }, { quoted: null })
} if (chat.detect && m.messageStubType == 25) {
rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
await this.sendMessage(m.chat, { text: edit, ...rcanal }, { quoted: null })
} if (chat.detect && m.messageStubType == 26) {
rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
await this.sendMessage(m.chat, { text: status, ...rcanal }, { quoted: null })
} if (chat.detect && m.messageStubType == 29) {
rcanal.contextInfo.mentionedJid = [usuario, users, ...groupAdmins.map(v => v.id)].filter(Boolean)
await this.sendMessage(m.chat, { text: admingp, ...rcanal }, { quoted: null })
return
} if (chat.detect && m.messageStubType == 30) {
rcanal.contextInfo.mentionedJid = [usuario, users, ...groupAdmins.map(v => v.id)].filter(Boolean)
await this.sendMessage(m.chat, { text: noadmingp, ...rcanal }, { quoted: null })
} else { 
if (m.messageStubType == 2) return
console.log({messageStubType: m.messageStubType,
messageStubParameters: m.messageStubParameters,
type: WAMessageStubType[m.messageStubType], 
})}}

export default handler

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
const inputJid = lid.toString()
if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) { return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net` }
if (lidCache.has(inputJid)) { return lidCache.get(inputJid) }
const lidToFind = inputJid.split("@")[0]
let attempts = 0
while (attempts < maxRetries) {
try {
const metadata = await conn?.groupMetadata(groupChatId)
if (!metadata?.participants) { throw new Error("No se obtuvieron participantes") }
for (const participant of metadata.participants) {
try {
if (!participant?.jid) continue
const contactDetails = await conn?.onWhatsApp(participant.jid)
if (!contactDetails?.[0]?.lid) continue
const possibleLid = contactDetails[0].lid.split("@")[0]
if (possibleLid === lidToFind) {
lidCache.set(inputJid, participant.jid)
return participant.jid
}} catch (e) { continue }}
lidCache.set(inputJid, inputJid)
return inputJid
} catch (e) {
if (++attempts >= maxRetries) {
lidCache.set(inputJid, inputJid)
return inputJid
}
await new Promise((resolve) => setTimeout(resolve, retryDelay))
}}
return inputJid
}
