import { resolveLidToPnJid, normalizeNumber } from '../handler.js'

const getFlag = (number) => {
    if (!number) return '🌍'
    
    const flags = [
        { code: '1', flag: '🇺🇸' },
        { code: '52', flag: '🇲🇽' },
        { code: '54', flag: '🇦🇷' },
        { code: '55', flag: '🇧🇷' },
        { code: '56', flag: '🇨🇱' },
        { code: '57', flag: '🇨🇴' },
        { code: '58', flag: '🇻🇪' },
        { code: '51', flag: '🇵🇪' },
        { code: '53', flag: '🇨🇺' },
        { code: '502', flag: '🇬🇹' },
        { code: '503', flag: '🇸🇻' },
        { code: '504', flag: '🇭🇳' },
        { code: '505', flag: '🇳🇮' },
        { code: '506', flag: '🇨🇷' },
        { code: '507', flag: '🇵🇦' },
        { code: '591', flag: '🇧🇴' },
        { code: '593', flag: '🇪🇨' },
        { code: '595', flag: '🇵🇾' },
        { code: '598', flag: '🇺🇾' },

        { code: '34', flag: '🇪🇸' },
        { code: '33', flag: '🇫🇷' },
        { code: '49', flag: '🇩🇪' },
        { code: '39', flag: '🇮🇹' },
        { code: '44', flag: '🇬🇧' },
        { code: '351', flag: '🇵🇹' },
        { code: '31', flag: '🇳🇱' },
        { code: '32', flag: '🇧🇪' },
        { code: '41', flag: '🇨🇭' },
        { code: '43', flag: '🇦🇹' },
        { code: '46', flag: '🇸🇪' },
        { code: '47', flag: '🇳🇴' },
        { code: '45', flag: '🇩🇰' },
        { code: '358', flag: '🇫🇮' },
        { code: '48', flag: '🇵🇱' },
        { code: '36', flag: '🇭🇺' },
        { code: '40', flag: '🇷🇴' },
        { code: '30', flag: '🇬🇷' },
        { code: '353', flag: '🇮🇪' },
        { code: '354', flag: '🇮🇸' },
        { code: '352', flag: '🇱🇺' },
        { code: '380', flag: '🇺🇦' },

        { code: '7', flag: '🇷🇺' },
        { code: '86', flag: '🇨🇳' },
        { code: '81', flag: '🇯🇵' },
        { code: '82', flag: '🇰🇷' },
        { code: '91', flag: '🇮🇳' },
        { code: '92', flag: '🇵🇰' },
        { code: '98', flag: '🇮🇷' },
        { code: '93', flag: '🇦🇫' },
        { code: '66', flag: '🇹🇭' },
        { code: '65', flag: '🇸🇬' },
        { code: '60', flag: '🇲🇾' },
        { code: '62', flag: '🇮🇩' },
        { code: '63', flag: '🇵🇭' },
        { code: '90', flag: '🇹🇷' },
        { code: '966', flag: '🇸🇦' },
        { code: '971', flag: '🇦🇪' },
        { code: '972', flag: '🇮🇱' },

        { code: '212', flag: '🇲🇦' },
        { code: '213', flag: '🇩🇿' },
        { code: '216', flag: '🇹🇳' },
        { code: '218', flag: '🇱🇾' },
        { code: '234', flag: '🇳🇬' },
        { code: '254', flag: '🇰🇪' },
        { code: '255', flag: '🇹🇿' },
        { code: '256', flag: '🇺🇬' },
        { code: '260', flag: '🇿🇲' },
        { code: '263', flag: '🇿🇼' },

        { code: '61', flag: '🇦🇺' },
        { code: '64', flag: '🇳🇿' }
    ]

    const match = flags.find(item => number.startsWith(item.code))
    return match ? match.flag : '🌍'
}

const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command }) => {
    const pesan = args.join` `
    const oi = `*» INFO :* Mensaje: ${pesan || 'Sin mensaje'}`
    let teks = `*!  MENCION GENERAL  !*\n  *PARA ${participants.length} MIEMBROS* 🗣️\n\n ${oi}\n\n╭  ┄ 𝅄 ۪꒰ \`⡞᪲=͟͟͞${global.botname || 'Bot'}≼᳞ׄ\` ꒱ ۟ 𝅄 ┄\n`
    
    let mentions = []

    for (const mem of participants) {
        let rawJid = mem.id
        let resolved = await resolveLidToPnJid(conn, m.chat, rawJid)
        let normalized = normalizeNumber(resolved || rawJid)
        let userJid = normalized ? normalized + '@s.whatsapp.net' : rawJid

        if (!userJid.endsWith('@s.whatsapp.net')) {
            userJid = userJid.split('@')[0].split(':')[0] + '@s.whatsapp.net'
        }

        let numberOnly = userJid.split('@')[0]
        let flag = getFlag(numberOnly)

        teks += `┊${flag} @${numberOnly}\n`
        mentions.push(userJid)
    }
    
    teks += `╰⸼ ┄ ┄ ┄ ─  ꒰  ׅ୭ ୧ ׅ ꒱  ┄  ─ ┄⸼`
    conn.sendMessage(m.chat, { text: teks, mentions: mentions })
}

handler.help = ['todos']
handler.tags = ['group']
handler.command = ['todos', 'invocar', 'tagall']
handler.admin = true
handler.group = true

export default handler
