import { areJidsSameUser } from '@whiskeysockets/baileys'
import { resolveLidToPnJid, normalizeNumber } from '../handler.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

var handler = async (m, { conn, text, participants, command, usedPrefix }) => {
    try {
        let member = participants.map(u => u.id)
        let sum = text && !isNaN(text) ? parseInt(text) : member.length

        var total = 0
        var sider = []

        for (let i = 0; i < sum; i++) {
            let rawJid = member[i]
            let resolved = await resolveLidToPnJid(conn, m.chat, rawJid)
            let normalized = normalizeNumber(resolved)
            let userJid = normalized ? normalized + '@s.whatsapp.net' : rawJid

            let userGroup = participants.find(u => u.id === rawJid || u.id === userJid) || {}
            let userDb = global.db.data.users[userJid] || global.db.data.users[rawJid]

            if (userGroup.isAdmin || userGroup.isSuperAdmin) continue

            let isGhost = false
            if (!userDb) {
                isGhost = true
            } else if (userDb.whitelist) {
                isGhost = false
            } else if (!userDb.chat || userDb.chat === 0) {
                isGhost = true
            }

            if (isGhost) {
                total++
                sider.push(userJid)
            }
        }

        switch (command) {
            case 'inactivos': 
            case 'fantasmas': {
                if (total === 0) return conn.reply(m.chat, `🌸✨ ¡Qué grupo tan activo! No se encontraron fantasmas 🐾.`, m)
                
                m.reply(`❀ *Revisión de inactivos*\n\n✦ *Lista de fantasmas*\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n> ✰ NOTA: Esto no es al 100% acertado, el bot inicia el conteo de mensajes a partir del momento que se activa en este grupo.`, null, { mentions: sider })
                break
            }
            case 'kickinactivos': 
            case 'kickfantasmas': {
                if (total === 0) return conn.reply(m.chat, `ꕥ Este grupo es activo, no tiene fantasmas.`, m)
                
                await m.reply(`❀ *Eliminación de inactivos*\n\n✦ *Lista de fantasmas*\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n> ✰ Nota: El bot eliminará a los usuarios de la lista mencionada cada 10 segundos.`, null, { mentions: sider })
                
                await delay(10000)
                let chat = global.db.data.chats[m.chat] || {}
                chat.welcome = false

                try {
                    for (let user of sider) {
                        if (areJidsSameUser(user, conn.user.id)) continue
                        
                        let userGroup = participants.find(v => areJidsSameUser(v.id, user))
                        if (userGroup && !userGroup.isAdmin) {
                            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
                            await delay(10000)
                        }
                    }
                } finally {
                    chat.welcome = true
                }
                break
            }
        }
    } catch (e) {
        m.reply(`⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`)
    }
}

handler.tags = ['grupo']
handler.command = ['inactivos', 'fantasmas', 'kickinactivos', 'kickfantasmas']
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler
