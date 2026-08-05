let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

const lidCache = new Map()
const handler = m => m

handler.before = async function (m, { conn, participants }) {
    if (!m.messageStubType || !m.isGroup) return
    const primaryBot = global.db.data.chats[m.chat]?.primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) throw !1

    const chat = global.db.data.chats[m.chat]
    let rawUser = m.messageStubParameters[0]
    
    if (typeof rawUser === 'object' && rawUser !== null) {
        rawUser = rawUser.id || rawUser.jid || JSON.stringify(rawUser)
    }
    
    const users = typeof rawUser === 'string' ? rawUser.split('@')[0] : ''
    const usuario = await resolveLidToRealJid(m?.sender, conn, m?.chat)

    const nombre = `📝 *Nombre actualizado*\n@${usuario.split('@')[0]} cambió el nombre a: *${m.messageStubParameters[0]}*`
    const edit = `⚙️ *Ajustes del grupo*\n@${usuario.split('@')[0]} cambió la configuración: ${m.messageStubParameters[0] == 'on' ? 'Solo administradores pueden editar los datos del grupo.' : 'Todos los miembros pueden editar los datos del grupo.'}`
    const newlink = `🔗 *Enlace restablecido*\n@${usuario.split('@')[0]} ha restablecido el enlace de invitación.`
    const status = m.messageStubParameters[0] == 'on' 
        ? `🔒 *El grupo ha sido cerrado.*\nAcción por @${usuario.split('@')[0]}. Solo los administradores pueden enviar mensajes.`
        : `🔓 *El grupo ha sido abierto.*\nAcción por @${usuario.split('@')[0]}. Todos los participantes pueden enviar mensajes.`
    const admingp = `👑 *Nuevo administrador*\n@${users} ahora es admin. Otorgado por @${usuario.split('@')[0]}`
    const noadmingp = `👤 *Admin removido*\n@${users} ya no es admin. Removido por @${usuario.split('@')[0]}`

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
        await this.sendMessage(m.chat, { text: nombre, mentions: [usuario] })
    } if (chat.detect && m.messageStubType == 23) {
        await this.sendMessage(m.chat, { text: newlink, mentions: [usuario] })
    } if (chat.detect && m.messageStubType == 25) {
        await this.sendMessage(m.chat, { text: edit, mentions: [usuario] })
    } if (chat.detect && m.messageStubType == 26) {
        await this.sendMessage(m.chat, { text: status, mentions: [usuario] })
    } if (chat.detect && m.messageStubType == 29) {
        const targetJid = rawUser.includes('@') ? rawUser : `${users}@s.whatsapp.net`
        await this.sendMessage(m.chat, { text: admingp, mentions: [usuario, targetJid] })
        return
    } if (chat.detect && m.messageStubType == 30) {
        const targetJid = rawUser.includes('@') ? rawUser : `${users}@s.whatsapp.net`
        await this.sendMessage(m.chat, { text: noadmingp, mentions: [usuario, targetJid] })
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

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
    const inputJid = lid ? lid.toString() : ''
    if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) { 
        return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net` 
    }
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
                    }
                } catch (e) { continue }
            }
            lidCache.set(inputJid, inputJid)
            return inputJid
        } catch (e) {
            if (++attempts >= maxRetries) {
                lidCache.set(inputJid, inputJid)
                return inputJid
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
        }
    }
    return inputJid
}
