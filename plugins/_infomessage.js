let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

const groupMetadataCache = new Map()
const lidCache = new Map()
const metadataTTL = 5000

function decodeJid(jid) {
    if (!jid) return ''
    if (/:\d+@/gi.test(jid)) {
        const decode = jid.match(/(\d+)(:\d+)?@(.+)/)
        return decode ? `${decode[1]}@${decode[3]}` : jid
    }
    return jid
}

async function resolveLidToPnJid(conn, chatJid, candidateJid) {
    const jid = decodeJid(candidateJid)
    if (!jid) return jid
    if (jid.endsWith('@s.whatsapp.net')) return jid.split(':')[0] + '@s.whatsapp.net'
    if (!jid.endsWith('@lid') || !chatJid?.endsWith('@g.us')) return jid
    
    if (lidCache.has(jid)) return lidCache.get(jid)

    try {
        let cached = groupMetadataCache.get(chatJid)
        let meta = (cached && (Date.now() - cached.timestamp < metadataTTL)) ? cached.metadata : null

        if (!meta) {
            meta = await conn.groupMetadata(chatJid)
            groupMetadataCache.set(chatJid, { metadata: meta, timestamp: Date.now() })
        }

        const participants = Array.isArray(meta?.participants) ? meta.participants : []

        const found = participants.find(p => {
            const pid = decodeJid(p?.id || '')
            const plid = decodeJid(p?.lid || '')
            return pid === jid || plid === jid
        })

        if (found) {
            let realNumber = found.phoneNumber || (found.id.endsWith('@s.whatsapp.net') ? found.id : null)
            if (realNumber) {
                const finalPn = decodeJid(realNumber.includes('@') ? realNumber : `${realNumber}@s.whatsapp.net`).split(':')[0] + '@s.whatsapp.net'
                lidCache.set(jid, finalPn)
                return finalPn
            }
        }
        
        const [onWa] = await conn.onWhatsApp(jid.split('@')[0])
        if (onWa && onWa.exists) {
            const fixed = decodeJid(onWa.jid).split(':')[0] + '@s.whatsapp.net'
            lidCache.set(jid, fixed)
            return fixed
        }
    } catch (e) {}

    if (jid.endsWith('@lid')) {
        return jid.split('@')[0] + '@s.whatsapp.net'
    }

    return jid
}

function parseCleanJid(raw) {
    if (!raw) return ''
    let str = typeof raw === 'object' ? JSON.stringify(raw) : String(raw)
    
    let match = str.match(/\d+(?::\d+)?@(?:s\.whatsapp\.net|lid)/)
    if (match) return decodeJid(match[0])

    let digits = str.match(/\d+/g)
    if (digits) {
        return digits.join('') + '@s.whatsapp.net'
    }
    return ''
}

const handler = m => m

handler.before = async function (m, { conn }) {
    if (!m.messageStubType || !m.isGroup) return
    const primaryBot = global.db.data.chats[m.chat]?.primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) throw !1

    const chat = global.db.data.chats[m.chat]
    const chatJid = decodeJid(m.chat)

    const rawTarget = parseCleanJid(m.messageStubParameters?.[0])
    const rawSender = parseCleanJid(m.sender)

    const target = await resolveLidToPnJid(conn, chatJid, rawTarget)
    const realSender = await resolveLidToPnJid(conn, chatJid, rawSender)

    const nombre = `📝 *Nombre actualizado*\n@${realSender.split('@')[0]} cambió el nombre a: *${m.messageStubParameters[0]}*`
    const edit = `⚙️ *Ajustes del grupo*\n@${realSender.split('@')[0]} cambió la configuración: ${m.messageStubParameters[0] == 'on' ? 'Solo administradores pueden editar los datos del grupo.' : 'Todos los miembros pueden editar los datos del grupo.'}`
    const newlink = `🔗 *Enlace restablecido*\n@${realSender.split('@')[0]} ha restablecido el enlace de invitación.`
    const status = m.messageStubParameters[0] == 'on' 
        ? `🔒 *El grupo ha sido cerrado.*\nAcción por @${realSender.split('@')[0]}. Solo los administradores pueden enviar mensajes.`
        : `🔓 *El grupo ha sido abierto.*\nAcción por @${realSender.split('@')[0]}. Todos los participantes pueden enviar mensajes.`
    const admingp = `👑 *Nuevo administrador*\n@${target.split('@')[0]} ahora es admin. Otorgado por @${realSender.split('@')[0]}`
    const noadmingp = `👤 *Admin removido*\n@${target.split('@')[0]} ya no es admin. Removido por @${realSender.split('@')[0]}`

    if (chat.detect && m.messageStubType == 2) {
        const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
        const sessionPath = `./${global.sessions || 'sessions'}/`
        for (const file of await fs.promises.readdir(sessionPath).catch(() => [])) {
            if (file.includes(uniqid)) {
                await fs.promises.unlink(path.join(sessionPath, file))
                console.log(`${chalk.yellow.bold('✎ Delete!')} ${chalk.greenBright(`'${file}'`)}`)
            }
        }
    } 

    if (chat.detect && m.messageStubType == 21) {
        await this.sendMessage(m.chat, { text: nombre, mentions: [realSender] })
    } if (chat.detect && m.messageStubType == 23) {
        await this.sendMessage(m.chat, { text: newlink, mentions: [realSender] })
    } if (chat.detect && m.messageStubType == 25) {
        await this.sendMessage(m.chat, { text: edit, mentions: [realSender] })
    } if (chat.detect && m.messageStubType == 26) {
        await this.sendMessage(m.chat, { text: status, mentions: [realSender] })
    } if (chat.detect && m.messageStubType == 29) {
        await this.sendMessage(m.chat, { text: admingp, mentions: [target, realSender] })
        return
    } if (chat.detect && m.messageStubType == 30) {
        await this.sendMessage(m.chat, { text: noadmingp, mentions: [target, realSender] })
    } else { 
        if (m.messageStubType == 2 || m.messageStubType == 22) return
        console.log({
            messageStubType: m.messageStubType,
            messageStubParameters: m.messageStubParameters,
            type: WAMessageStubType[m.messageStubType], 
        })
    }
}

export default handler
