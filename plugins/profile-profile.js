import { xpRange } from '../lib/levelling.js'
import { resolveLidToPnJid, normalizeNumber } from '../handler.js'

let handler = async (m, { conn, args, usedPrefix }) => {
    try {
        let texto = await m.mentionedJid
        let rawUserId = texto && texto.length > 0 ? texto[0] : (m.quoted ? m.quoted.sender : m.sender)

        let resolved = await resolveLidToPnJid(conn, m.chat, rawUserId)
        let normalized = normalizeNumber(resolved || rawUserId)
        let userId = normalized ? normalized + '@s.whatsapp.net' : rawUserId

        if (!userId.endsWith('@s.whatsapp.net')) {
            userId = userId.split('@')[0].split(':')[0] + '@s.whatsapp.net'
        }

        if (!global.db.data.users) global.db.data.users = {}
        if (!global.db.data.characters) global.db.data.characters = {}
        if (!global.db.data.users[userId]) global.db.data.users[userId] = {}

        const user = global.db.data.users[userId]

        let name = user.name || await conn.getName(userId).catch(() => userId.split('@')[0])
        const cumpleanos = user.birth || 'Sin especificar'
        const genero = user.genre || 'Sin especificar'
        const pareja = user.marry

        let casado = 'Nadie'
        if (pareja) {
            let pResolved = await resolveLidToPnJid(conn, m.chat, pareja)
            let pNormalized = normalizeNumber(pResolved || pareja)
            let parejaJid = pNormalized ? pNormalized + '@s.whatsapp.net' : pareja
            casado = global.db.data.users[parejaJid]?.name || await conn.getName(parejaJid).catch(() => parejaJid.split('@')[0])
        }

        const exp = user.exp || 0
        const nivel = user.level || 0
        const coin = user.coin || 0
        const bank = user.bank || 0
        const total = coin + bank

        const sorted = Object.entries(global.db.data.users)
            .map(([k, v]) => ({ ...v, jid: k }))
            .sort((a, b) => (b.level || 0) - (a.level || 0))
        const rank = sorted.findIndex(u => u.jid === userId) + 1

        const datos = xpRange(nivel, global.multiplier)
        const progreso = `${exp - datos.min} / ${datos.xp} (${Math.floor(((exp - datos.min) / datos.xp) * 100)}%)`

        const favId = user.favorite
        const favLine = favId && global.db.data.characters?.[favId] ? `\n⭐ *Favorito:* ${global.db.data.characters[favId].name || '???'}` : ''

        const ownedIDs = Object.entries(global.db.data.characters).filter(([, c]) => c.user === userId).map(([id]) => id)
        const haremCount = ownedIDs.length
        const haremValue = ownedIDs.reduce((acc, id) => {
            const char = global.db.data.characters[id] || {}
            return acc + (typeof char.value === 'number' ? char.value : 0)
        }, 0)

        const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/speed3xz/Storage/refs/heads/main/Arlette-Bot/b75b29441bbd967deda4365441497221.jpg')

        let caption = `👤 *Perfil:* ${name}\n`
        if (user.description) caption += `📝 *Info:* ${user.description}\n`
        caption += `\n`
        caption += `🎂 *Cumpleaños:* ${cumpleanos}\n`
        caption += `⚥ *Género:* ${genero}\n`
        caption += `💞 *Pareja:* ${casado}\n`
        caption += `\n`
        caption += `⭐ *Experiencia:* ${exp.toLocaleString()}\n`
        caption += `🎀 *Nivel:* ${nivel}\n`
        caption += `🏅 *Puesto:* #${rank}\n`
        caption += `🌷 *Progreso:* ${progreso}\n`
        caption += `\n`
        caption += `💐 *Harem:* ${haremCount}\n`
        caption += `💎 *Valor Harem:* ${haremValue.toLocaleString()}${favLine}\n`
        caption += `🪙 *Monedas:* ${total.toLocaleString()}\n`
        caption += `📜 *Comandos:* ${user.commands || 0}`

        await conn.sendMessage(m.chat, { image: { url: pp }, caption, mentions: [userId] }, { quoted: m })
    } catch (error) {
        m.reply(`⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`)
    }
}

handler.help = ['profile']
handler.tags = ['rg']
handler.command = ['profile', 'perfil', 'perfíl']
handler.group = true

export default handler
