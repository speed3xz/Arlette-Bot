export async function before(m, { conn, isAdmin, isBotAdmin, isROwner }) {
    if (m.isBaileys && m.fromMe) return !0
    if (m.isGroup) return !1
    if (!m.message) return !0
    if (m.sender === conn.user?.jid) return
    if (m.text.includes('PIEDRA') || m.text.includes('PAPEL') || m.text.includes('TIJERA') || m.text.includes('code') || m.text.includes('qr')) return !0
    const chat = global.db.data.chats[m.chat]
    const bot = global.db.data.settings[conn.user.jid] || {}
    if (m.chat === '120363401404146384@newsletter') return !0
    if (bot.antiPrivate && !isROwner) {
        await m.reply(`🔒 @${m.sender.split`@`[0]} los chats privados están desactivados. Serás bloqueado automáticamente.\n\nComunidad: ${community}`, false, {mentions: [m.sender]})
        await this.updateBlockStatus(m.chat, 'block')
    }
    return !1
}
