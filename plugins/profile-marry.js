import { resolveLidToPnJid, normalizeNumber } from '../handler.js'

let handler = async (m, { conn, args, command, usedPrefix }) => {
    switch (command) {
        case 'marry':
        case 'casar':
        case 'aceptar': {
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
                return m.reply(`✿ Ya estás ${status} con *${pName}*\n> Puedes divorciarte con: *${usedPrefix}divorce*`)
            }

            let texto = await m.mentionedJid
            let q = args[0]
            let rawTarget = texto && texto.length > 0 ? texto[0] : (m.quoted ? m.quoted.sender : (q ? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null))

            let pendingProposer = Object.keys(conn.marry).find(proposer => conn.marry[proposer] === realSender)

            if (!rawTarget && pendingProposer) {
                rawTarget = pendingProposer
            }

            if (!rawTarget) {
                return m.reply(`✿ Debes mencionar o responder al usuario con el que te quieres casar o aceptar una propuesta.\n> Ejemplo » *${usedPrefix}marry @usuario*`)
            }

            let resolvedTarget = await resolveLidToPnJid(conn, m.chat, rawTarget)
            let normalizedTarget = normalizeNumber(resolvedTarget || rawTarget)
            let target = normalizedTarget ? normalizedTarget + '@s.whatsapp.net' : rawTarget

            if (!target.endsWith('@s.whatsapp.net')) {
                target = target.split('@')[0].split(':')[0] + '@s.whatsapp.net'
            }

            if (target === realSender) {
                return conn.sendMessage(m.chat, { text: `✰ No puedes casarte contigo mism@.`, mentions: [realSender] }, { quoted: m })
            }

            if (!global.db.data.users[target]) global.db.data.users[target] = {}

            if (conn.marry[target] === realSender || (pendingProposer && pendingProposer === target)) {
                let proposer = conn.marry[target] === realSender ? target : pendingProposer

                global.db.data.users[realSender].marry = proposer
                global.db.data.users[proposer].marry = realSender

                let gen1 = global.db.data.users[proposer].genre?.toLowerCase()
                let gen2 = global.db.data.users[realSender].genre?.toLowerCase()
                let label1 = (gen1 === 'mujer' || gen1 === 'femenino') ? 'Esposa' : (gen1 === 'hombre' || gen1 === 'masculino') ? 'Esposo' : 'Espos@'
                let label2 = (gen2 === 'mujer' || gen2 === 'femenino') ? 'Esposa' : (gen2 === 'hombre' || gen2 === 'masculino') ? 'Esposo' : 'Espos@'

                let weddingMsg = `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩\n¡Se han Casado! ฅ^•ﻌ•^ฅ*:･ﾟ✧\n\n*•.¸♡ ${label1} @${proposer.split('@')[0]} ♡¸.•*\n*•.¸♡ ${label2} @${realSender.split('@')[0]} ♡¸.•*\n\n\`Disfruten de su luna de miel\`\n✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩`

                await conn.sendMessage(m.chat, { text: weddingMsg, mentions: [proposer, realSender] }, { quoted: m })
                delete conn.marry[proposer]
            } else {
                if (global.db.data.users[target]?.marry) {
                    return m.reply(`✿ Esa persona ya está casada.`)
                }

                conn.marry[realSender] = target

                let proposal = `♡ @${target.split('@')[0]}, @${realSender.split('@')[0]} te ha propuesto matrimonio, ¿aceptas? •(=^●ω●^=)•\n> ✐ Responde a este mensaje o menciona al usuario con *${usedPrefix}marry* o *${usedPrefix}aceptar* para aceptar.`

                await conn.sendMessage(m.chat, { text: proposal, mentions: [target, realSender] }, { quoted: m })

                setTimeout(() => {
                    if (conn.marry[realSender] === target) {
                        delete conn.marry[realSender]
                    }
                }, 3600000)
            }
            break
        }

        case 'divorce':
        case 'divorcio':
        case 'divorciarse': {
            let rawSender = m.sender
            let resolvedSender = await resolveLidToPnJid(conn, m.chat, rawSender)
            let normalizedSender = normalizeNumber(resolvedSender || rawSender)
            let realSender = normalizedSender ? normalizedSender + '@s.whatsapp.net' : rawSender

            if (!realSender.endsWith('@s.whatsapp.net')) {
                realSender = realSender.split('@')[0].split(':')[0] + '@s.whatsapp.net'
            }

            if (!global.db.data.users) global.db.data.users = {}
            if (!global.db.data.users[realSender]) global.db.data.users[realSender] = {}

            const user = global.db.data.users[realSender]

            if (!user.marry) {
                let gen = user.genre?.toLowerCase()
                let status = (gen === 'mujer' || gen === 'femenino') ? 'casada' : (gen === 'hombre' || gen === 'masculino') ? 'casado' : 'casad@'
                return conn.sendMessage(m.chat, { text: `✐ No estás ${status} con nadie.` }, { quoted: m })
            }

            const partner = user.marry

            delete global.db.data.users[realSender].marry
            if (global.db.data.users[partner]) {
                delete global.db.data.users[partner].marry
            }

            let divorceMsg = `✐ @${realSender.split('@')[0]} y @${partner.split('@')[0]} se han divorciado.`

            await conn.sendMessage(m.chat, { text: divorceMsg, mentions: [realSender, partner] }, { quoted: m })
            break
        }
    }
}

handler.help = ['marry', 'casar', 'aceptar', 'divorce', 'divorcio', 'divorciarse']
handler.tags = ['rg']
handler.command = ['marry', 'casar', 'aceptar', 'divorce', 'divorcio', 'divorciarse']
handler.group = true

export default handler
