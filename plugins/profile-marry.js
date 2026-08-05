import { resolveLidToPnJid, normalizeNumber } from '../handler.js'

let handler = async (m, { conn, args, usedPrefix }) => {
    conn.marry = conn.marry || {}

    let rawSender = m.sender
    let resolvedSender = await resolveLidToPnJid(conn, m.chat, rawSender)
    let normalizedSender = normalizeNumber(resolvedSender || rawSender)
    let realSender = normalizedSender ? normalizedSender + '@s.whatsapp.net' : rawSender

    if (!realSender.endsWith('@s.whatsapp.net')) {
        realSender = realSender.split('@')[0].split(':')[0] + '@s.whatsapp.net'
    }

    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[realSender]) global.db.data.users[realSender] = {}

    if (global.db.data.users[realSender]?.marry) {
        let pJid = global.db.data.users[realSender].marry
        let pName = global.db.data.users[pJid]?.name || await conn.getName(pJid).catch(() => pJid.split('@')[0])
        let gen = global.db.data.users[realSender].genre?.toLowerCase()
        let status = (gen === 'mujer' || gen === 'femenino') ? 'casada' : (gen === 'hombre' || gen === 'masculino') ? 'casado' : 'casad@'
        return m.reply(`💞 Ya estás ${status} con *${pName}*\n> Puedes divorciarte con: *${usedPrefix}divorce*`)
    }

    let texto = await m.mentionedJid
    let q = args[0]
    let rawTarget = texto && texto.length > 0 ? texto[0] : (m.quoted ? m.quoted.sender : (q ? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null))

    if (!rawTarget) {
        return m.reply(`💍 Mencióna o responde a la persona con la que deseas casarte.\n> Ejemplo: *${usedPrefix}marry @usuario*`)
    }

    let resolvedTarget = await resolveLidToPnJid(conn, m.chat, rawTarget)
    let normalizedTarget = normalizeNumber(resolvedTarget || rawTarget)
    let target = normalizedTarget ? normalizedTarget + '@s.whatsapp.net' : rawTarget

    if (!target.endsWith('@s.whatsapp.net')) {
        target = target.split('@')[0].split(':')[0] + '@s.whatsapp.net'
    }

    if (target === realSender) {
        return m.reply(`❌ No puedes casarte contigo mismo.`)
    }

    if (!global.db.data.users[target]) global.db.data.users[target] = {}

    if (conn.marry[target] === realSender) {
        global.db.data.users[realSender].marry = target
        global.db.data.users[target].marry = realSender

        let senderName = global.db.data.users[realSender]?.name || await conn.getName(realSender).catch(() => realSender.split('@')[0])
        let targetName = global.db.data.users[target]?.name || await conn.getName(target).catch(() => target.split('@')[0])

        let weddingMsg = `💍 *Boda:* ${senderName} y ${targetName}\n`
        weddingMsg += `💖 ¡Han aceptado la propuesta y ahora están oficialmente casados!`

        await conn.sendMessage(m.chat, { text: weddingMsg, mentions: [target, realSender] }, { quoted: m })
        delete conn.marry[target]
    } else {
        if (global.db.data.users[target]?.marry) {
            return m.reply(`💔 Esa persona ya se encuentra casada.`)
        }

        conn.marry[realSender] = target

        let proposal = `💍 *Propuesta de Matrimonio*\n`
        proposal += `👤 *De:* @${realSender.split('@')[0]}\n`
        proposal += `🎯 *Para:* @${target.split('@')[0]}\n\n`
        proposal += `> Responde o menciona a este usuario usando *${usedPrefix}marry* para aceptar.`

        await conn.sendMessage(m.chat, { text: proposal, mentions: [target, realSender] }, { quoted: m })

        setTimeout(() => {
            if (conn.marry[realSender]) delete conn.marry[realSender]
        }, 1800000)
    }
}

handler.help = ['marry', 'casar']
handler.tags = ['rg']
handler.command = ['marry', 'casar']
handler.group = true

export default handler
