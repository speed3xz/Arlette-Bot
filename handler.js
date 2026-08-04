import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"

export const groupMetadataCache = new Map();
export const lidCache = new Map();
export const metadataTTL = 5000;

export function decodeJid(jid) {
    if (!jid) return '';
    if (/:\d+@/gi.test(jid)) {
        const decode = jid.match(/(\d+)(:\d+)?@(.+)/);
        return decode ? `${decode[1]}@${decode[3]}` : jid;
    }
    return jid;
}

export function normalizeNumber(jid) {
    if (!jid) return '';
    return jid.split('@')[0].replace(/[^0-9]/g, '');
}

export async function resolveLidToPnJid(conn, chatJid, candidateJid) {
    const jid = decodeJid(candidateJid);
    if (!jid) return jid;
    
    if (jid.endsWith('@s.whatsapp.net')) {
        const cleanNumber = jid.split('@')[0].split(':')[0];
        return `${cleanNumber}@s.whatsapp.net`;
    }
    
    if (!jid.endsWith('@lid') || !chatJid?.endsWith('@g.us')) return jid;
    
    if (lidCache.has(jid)) return lidCache.get(jid);

    try {
        let cached = groupMetadataCache.get(chatJid);
        let meta = (cached && (Date.now() - cached.timestamp < metadataTTL)) ? cached.metadata : null;

        if (!meta) {
            meta = await conn.groupMetadata(chatJid).catch(() => null);
            groupMetadataCache.set(chatJid, { metadata: meta, timestamp: Date.now() });
        }

        const participants = Array.isArray(meta?.participants) ? meta.participants : [];

        const found = participants.find(p => {
            const pid = decodeJid(p?.id || '');
            const plid = decodeJid(p?.lid || '');
            return pid === jid || plid === jid;
        });

        if (found) {
            let realNumber = found.phoneNumber || (found.id?.endsWith('@s.whatsapp.net') ? found.id : null);
            if (realNumber) {
                const cleanNumber = realNumber.split('@')[0].split(':')[0];
                const finalPn = `${cleanNumber}@s.whatsapp.net`;
                lidCache.set(jid, finalPn);
                return finalPn;
            }
        }
        
        if (conn?.onWhatsApp) {
            const [onWa] = await conn.onWhatsApp(jid.split('@')[0]).catch(() => []);
            if (onWa && onWa.exists) {
                const cleanNumber = decodeJid(onWa.jid).split('@')[0].split(':')[0];
                const fixed = `${cleanNumber}@s.whatsapp.net`;
                lidCache.set(jid, fixed);
                return fixed;
            }
        }

    } catch (e) {}

    if (jid.endsWith('@lid')) {
        const cleanNumber = jid.split('@')[0];
        return `${cleanNumber}@s.whatsapp.net`;
    }

    return jid;
}

export async function pickTargetJid(m, conn) {
    const chatJid = decodeJid(m?.chat || m?.key?.remoteJid || m?.from || '');
    const ctx = m?.message?.extendedTextMessage?.contextInfo || m?.msg?.contextInfo || {};

    let raw = '';
    const mentioned = m?.mentionedJid || ctx?.mentionedJid || ctx?.mentionedJidList || [];
    
    if (Array.isArray(mentioned) && mentioned.length) {
        raw = mentioned[0];
    } else if (m?.quoted || ctx?.participant) {
        raw = m?.quoted?.participant || ctx?.participant || m?.quoted?.key?.participant || m?.quoted?.key?.remoteJid || '';

        const selfJid = decodeJid(m?.key?.participant || m?.key?.remoteJid || '');
        if (!raw || decodeJid(raw) === selfJid) {
            raw = m?.quoted?.key?.remoteJid
               || m?.quoted?.key?.participant
               || raw;
        }
    } else if (conn?.parseMention) {
        const text = m?.text || m?.body || m?.message?.conversation || '';
        const parsed = conn.parseMention(String(text));
        if (parsed?.length) raw = parsed[0];
    }

    if (raw) {
        return await resolveLidToPnJid(conn, chatJid, raw);
    } else {
        const rawSender = m?.key?.participant || m?.key?.remoteJid || m?.sender || '';
        return await resolveLidToPnJid(conn, chatJid, rawSender);
    }
}

export async function deleteBotMessage(sock, from, targetSender, quotedKey) {
    return new Promise(async (resolve) => {
        try {
            const botId = decodeJid(sock.user?.jid || sock.user?.id || '');
            const botLid = sock.user?.lid ? decodeJid(sock.user.lid) : null;

            const isBotMessage = targetSender === botId || (botLid && targetSender === botLid);

            if (isBotMessage && quotedKey) {
                await sock.sendMessage(from, { 
                    delete: { 
                        remoteJid: from, 
                        fromMe: true, 
                        id: quotedKey.stanzaId || quotedKey.id, 
                        participant: quotedKey.participant 
                    } 
                }).catch(() => null);
                return resolve(true);
            }
            resolve(false);
        } catch {
            resolve(false);
        }
    });
}

export async function getAdminStatus(sock, from, sender) {
    return new Promise(async (resolve) => {
        try {
            let cached = groupMetadataCache.get(from);
            let meta = (cached && (Date.now() - cached.timestamp < metadataTTL)) ? cached.metadata : null;

            if (!meta) {
                meta = await sock.groupMetadata(from).catch(() => null);
                if (meta) groupMetadataCache.set(from, { metadata: meta, timestamp: Date.now() });
            }

            if (!meta) return resolve({ isUserAdmin: false, isBotAdmin: false });

            const participants = Array.isArray(meta.participants) ? meta.participants : [];
            const admins = participants.filter(p => p.admin).map(p => decodeJid(p.id || p.jid));

            const botId = decodeJid(sock.user?.jid || sock.user?.id || '');
            const botLid = sock.user?.lid ? decodeJid(sock.user.lid) : null;

            const decodedSender = decodeJid(sender);
            const isUserAdmin = admins.some(admin => admin === decodedSender);
            const isBotAdmin = admins.some(admin => admin === botId || (botLid && admin === botLid));

            resolve({ isUserAdmin, isBotAdmin });
        } catch {
            resolve({ isUserAdmin: false, isBotAdmin: false });
        }
    });
}

const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || []
this.uptime = this.uptime || Date.now()
if (!chatUpdate) return
this.pushMessage(chatUpdate.messages).catch(console.error)
let rawMsg = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!rawMsg) return

if (global.db.data == null)
await global.loadDatabase()

const chatJid = rawMsg.key?.remoteJid || ''
const rawSenderJid = rawMsg.key?.participant || rawMsg.key?.remoteJid || ''
const fastSender = await resolveLidToPnJid(this, chatJid, rawSenderJid)

const fastChat = global.db.data.chats?.[chatJid]
if (fastChat && Array.isArray(fastChat.muteds) && fastChat.muteds.length > 0) {
    const normalizedSender = normalizeNumber(fastSender)
    const isMuted = fastChat.muteds.some(mUser => normalizeNumber(mUser) === normalizedSender)
    const isOwner = [...global.owner.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net"), this.user.jid].includes(fastSender)
    
    if (isMuted && !isOwner) {
        await this.sendMessage(chatJid, { delete: rawMsg.key }).catch(() => null)
        return
    }
}

let m = rawMsg
let sender = ''

try {
m = smsg(this, m) || m
if (!m) return

sender = fastSender;

try {
    Object.defineProperty(m, 'sender', {
        value: sender,
        writable: true,
        configurable: true,
        enumerable: true
    });
} catch (err) {
    m.sender = sender;
}

m.exp = 0
try {
const user = global.db.data.users[sender]
if (typeof user !== "object") {
global.db.data.users[sender] = {}
}
if (user) {
if (!("name" in user)) user.name = m.name
if (!("exp" in user) || !isNumber(user.exp)) user.exp = 0
if (!("coin" in user) || !isNumber(user.coin)) user.coin = 0
if (!("bank" in user) || !isNumber(user.bank)) user.bank = 0
if (!("level" in user) || !isNumber(user.level)) user.level = 0
if (!("health" in user) || !isNumber(user.health)) user.health = 100
if (!("genre" in user)) user.genre = ""
if (!("birth" in user)) user.birth = ""
if (!("marry" in user)) user.marry = ""
if (!("description" in user)) user.description = ""
if (!("packstickers" in user)) user.packstickers = null
if (!("premium" in user)) user.premium = false
if (!("premiumTime" in user)) user.premiumTime = 0
if (!("banned" in user)) user.banned = false
if (!("bannedReason" in user)) user.bannedReason = ""
if (!("commands" in user) || !isNumber(user.commands)) user.commands = 0
if (!("afk" in user) || !isNumber(user.afk)) user.afk = -1
if (!("afkReason" in user)) user.afkReason = ""
if (!("warn" in user) || !isNumber(user.warn)) user.warn = 0
} else global.db.data.users[sender] = {
name: m.name,
exp: 0,
coin: 0,
bank: 0,
level: 0,
health: 100,
genre: "",
birth: "",
marry: "",
description: "",
packstickers: null,
premium: false,
premiumTime: 0,
banned: false,
bannedReason: "",
commands: 0,
afk: -1,
afkReason: "",
warn: 0
}
const chat = global.db.data.chats[m.chat]
if (typeof chat !== "object") {
global.db.data.chats[m.chat] = {}
}
if (chat) {
if (!("isBanned" in chat)) chat.isBanned = false
if (!("isMute" in chat)) chat.isMute = false;
if (!("muteds" in chat)) chat.muteds = [];
if (!("welcome" in chat)) chat.welcome = false
if (!("sWelcome" in chat)) chat.sWelcome = ""
if (!("sBye" in chat)) chat.sBye = ""
if (!("detect" in chat)) chat.detect = false
if (!("modoadmin" in chat)) chat.modoadmin = false
if (!("antiLink" in chat)) chat.antiLink = false
if (!("nsfw" in chat)) chat.nsfw = false
if (!("economy" in chat)) chat.economy = true;
if (!("gacha" in chat)) chat.gacha = true
} else global.db.data.chats[m.chat] = {
isBanned: false,
isMute: false,
muteds: [],
welcome: false,
sWelcome: "",
sBye: "",
detect: false,
modoadmin: false,
antiLink: false,
nsfw: false,
economy: true,
gacha: true
}
const settings = global.db.data.settings[this.user.jid]
if (typeof settings !== "object") {
global.db.data.settings[this.user.jid] = {}
}
if (settings) {
if (!("self" in settings)) settings.self = false
if (!("restrict" in settings)) settings.restrict = true
if (!("antiPrivate" in settings)) settings.antiPrivate = false
if (!("gponly" in settings)) settings.gponly = false
} else global.db.data.settings[this.user.jid] = {
self: false,
restrict: true,
antiPrivate: false,
gponly: false
}} catch (e) {
console.error(e)
}

if (typeof m.text !== "string") m.text = ""
const user = global.db.data.users[sender]
try {
const actual = user.name || ""
const nuevo = m.pushName || await this.getName(sender)
if (typeof nuevo === "string" && nuevo.trim() && nuevo !== actual) {
user.name = nuevo
}} catch {}
const chat = global.db.data.chats[m.chat]
const settings = global.db.data.settings[this.user.jid]  
const isROwner = [...global.owner.map((number) => number)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(sender)
const isOwner = isROwner || m.fromMe
const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(sender) || user.premium == true
const isOwners = [this.user.jid, ...global.owner.map((number) => number + "@s.whatsapp.net")].includes(sender)

if (settings.self && !isOwners) return
if (settings.gponly && !isOwners && !m.chat.endsWith('g.us') && !/code|p|ping|qr|estado|status|infobot|botinfo|report|reportar|invite|join|logout|suggest|help|menu/gim.test(m.text)) return
if (opts["queque"] && m.text && !(isPrems)) {
const queque = this.msgqueque, time = 1000 * 5
const previousID = queque[queque.length - 1]
queque.push(m.id || m.key.id)
setInterval(async function () {
if (queque.indexOf(previousID) === -1) clearInterval(this)
await delay(time)
}, time)
}
 
if (m.isBaileys) return
m.exp += Math.ceil(Math.random() * 10)
let usedPrefix

let cachedMeta = groupMetadataCache.get(m.chat)
let metaDataObj = (cachedMeta && (Date.now() - cachedMeta.timestamp < metadataTTL)) ? cachedMeta.metadata : null
if (!metaDataObj && m.isGroup) {
    metaDataObj = await this.groupMetadata(m.chat).catch(_ => null) || {}
    groupMetadataCache.set(m.chat, { metadata: metaDataObj, timestamp: Date.now() })
}

const groupMetadata = m.isGroup ? { ...(this.chats?.[m.chat]?.metadata || metaDataObj || {}), ...(((this.chats?.[m.chat]?.metadata || metaDataObj || {}).participants) && { participants: ((this.chats?.[m.chat]?.metadata || metaDataObj || {}).participants || []).map(p => ({ ...p, id: decodeJid(p.id || p.jid), jid: decodeJid(p.jid || p.id), lid: decodeJid(p.lid) })) }) } : {}
const participants = ((m.isGroup ? groupMetadata.participants : []) || []).map(participant => ({ id: participant.jid, jid: participant.jid, lid: participant.lid, admin: participant.admin }))

const botId = decodeJid(this.user?.jid || this.user?.id || '')
const botLid = this.user?.lid ? decodeJid(this.user.lid) : null

const userGroup = (m.isGroup ? participants.find((u) => decodeJid(u.jid) === sender || decodeJid(u.lid) === sender) : {}) || {}
const botGroup = (m.isGroup ? participants.find((u) => {
    const uJid = decodeJid(u.jid || u.id);
    const uLid = decodeJid(u.lid);
    return uJid === botId || (botLid && uLid === botLid) || (botLid && uJid === botLid);
}) : {}) || {}

const isRAdmin = userGroup?.admin == "superadmin" || false
const isAdmin = isRAdmin || userGroup?.admin == "admin" || false
const isBotAdmin = !!botGroup?.admin

const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
for (const name in global.plugins) {
const plugin = global.plugins[name]
if (!plugin) continue
if (plugin.disabled) continue
const __filename = join(___dirname, name)
if (typeof plugin.all === "function") {
try {
await plugin.all.call(this, m, {
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
})
} catch (err) {
console.error(err)
}}
if (!opts["restrict"])
if (plugin.tags && plugin.tags.includes("admin")) {
continue
}
const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
const pluginPrefix = plugin.customPrefix || this.prefix || global.prefix
const match = (pluginPrefix instanceof RegExp ?
[[pluginPrefix.exec(m.text), pluginPrefix]] :
Array.isArray(pluginPrefix) ?
pluginPrefix.map(prefix => {
const regex = prefix instanceof RegExp ?
prefix : new RegExp(strRegex(prefix))
return [regex.exec(m.text), regex]
}) : typeof pluginPrefix === "string" ?
[[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] :
[[[], new RegExp]]).find(prefix => prefix[1])
if (typeof plugin.before === "function") {
if (await plugin.before.call(this, m, {
match,
conn: this,
participants,
groupMetadata,
userGroup,
botGroup,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
})) {
continue
}}
if (typeof plugin !== "function") {
continue
}
if ((usedPrefix = (match[0] || "")[0])) {
const noPrefix = m.text.replace(usedPrefix, "")
let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
args = args || []
let _args = noPrefix.trim().split(" ").slice(1)
let text = _args.join(" ")
command = (command || "").toLowerCase()
const fail = plugin.fail || global.dfail
const isAccept = plugin.command instanceof RegExp ?
plugin.command.test(command) :
Array.isArray(plugin.command) ?
plugin.command.some(cmd => cmd instanceof RegExp ?
cmd.test(command) : cmd === command) :
typeof plugin.command === "string" ?
plugin.command === command : false
global.comando = command
                        
if ((m.id.startsWith("NJX-") || (m.id.startsWith("BAE5") && m.id.length === 16) || (m.id.startsWith("B24E") && m.id.length === 20))) return

if (!isAccept) continue
m.plugin = name
if (isAccept) { global.db.data.users[sender].commands = (global.db.data.users[sender].commands || 0) + 1 }
if (chat) {
if (name !== "group-banchat.js" && chat?.isBanned && !isROwner) {
const aviso = `ꕥ El bot *${global.botname || 'Bot'}* está desactivado en este grupo\n\n> ✦ Un *administrador* puede activarlo con el comando:\n> » *${usedPrefix}bot on*`.trim()
await m.reply(aviso)
return
}
if (m.text && user.banned && !isROwner) {
const mensaje = `ꕥ Estas baneado/a, no puedes usar comandos en este bot!\n\n> ● *Razón ›* ${user.bannedReason}\n\n> ● Si este Bot es cuenta oficial y tienes evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`.trim()
m.reply(mensaje)
return
}}
const adminMode = chat.modoadmin || false
const wa = plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || pluginPrefix || m.text.slice(0, 1) === pluginPrefix || plugin.command
if (adminMode && !isOwner && m.isGroup && !isAdmin && wa) return
if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
fail("owner", m, this)
return
}
if (plugin.rowner && !isROwner) {
fail("rowner", m, this)
return
}
if (plugin.owner && !isOwner) {
fail("owner", m, this)
return
}
if (plugin.premium && !isPrems) {
fail("premium", m, this)
return
}
if (plugin.group && !m.isGroup) {
fail("group", m, this)
return
} else if (plugin.botAdmin && !isBotAdmin) {
fail("botAdmin", m, this)
return
} else if (plugin.admin && !isAdmin) {
fail("admin", m, this)
return
}
if (plugin.private && m.isGroup) {
fail("private", m, this)
return
}
m.isCommand = true
m.exp += plugin.exp ? parseInt(plugin.exp) : 10
let extra = {
match,
usedPrefix,
noPrefix,
_args,
args,
command,
text,
conn: this,
participants,
groupMetadata,
userGroup,
botGroup,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
}
try {
await plugin.call(this, m, extra)
} catch (err) {
m.error = err
console.error(err)
} finally {
if (typeof plugin.after === "function") {
try {
await plugin.after.call(this, m, extra)
} catch (err) {
console.error(err)
}}}}}} catch (err) {
console.error(err)
} finally {
if (opts["queque"] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
if (quequeIndex !== -1)
this.msgqueque.splice(quequeIndex, 1)
}
let user, stats = global.db.data.stats
if (m) {
if (sender && (user = global.db.data.users[sender])) {
user.exp += m.exp
}}
try {
if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
} catch (err) {
console.warn(err)
console.log(m.message)
}}}

global.dfail = (type, m, conn) => {
const msg = {
rowner: `🌸 *Acceso Especial* 🌸\n\n┊ El comando *${global.comando}* solo puede ser usado por los *creadores* del bot. ✨`, 
owner: `🎀 *Zona de Desarrolladores* 🎀\n\n┊ El comando *${global.comando}* solo está disponible para los *desarrolladores* del bot. ♡`, 
mods: `🍥 *Solo para Moderadores* 🍥\n\n┊ El comando *${global.comando}* es exclusivo para *moderadores*.`, 
premium: `💖 *Usuario Premium* 💖\n\n┊ El comando *${global.comando}* está reservado para los *usuarios premium*\n> use el comando "/vip". ₊˚ʚ♡ɞ˚₊`, 
group: `🌼 *Disponible en Grupos* 🌼\n\n┊ El comando *${global.comando}* solo puede usarse en *grupos*. (≧◡┴)`,
private: `💌 *Solo en Privado* 💌\n\n┊ El comando *${global.comando}* solo funciona en *chats privados*. ꒰ᐢ. .ᐢ꒱`,
admin: `⭐ *Requiere Admin* ⭐\n\n┊ El comando *${global.comando}* es para los *administradores* del grupo. ฅ^•ﻌ•^ฅ`, 
botAdmin: `⚙️ *Necesito Ser Admin* ⚙️\n\n┊ Para ejecutar *${global.comando}*, primero debo ser *admin* del grupo, ¡ayúdame! (｡•́︿•̀｡)`,
restrict: `🚫 *Función No Disponible* 🚫\n\n┊ Esta característica está *desactivada* por ahora. ₍ᐢ.ˬ.ᐢ₎`
}[type]
if (msg) return conn.reply(m.chat, msg, m).then(_ => m.react('✖️')).catch(() => null)
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizo 'handler.js'"))
if (global.reloadHandler) console.log(await global.reloadHandler())
})
