const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;

export async function before(m, { conn, isAdmin, isBotAdmin, isROwner }) {
    if (!m.isGroup || !m?.text) return;

    const chat = global?.db?.data?.chats[m.chat];
    const isLink = linkRegex.test(m.text);

    if (chat.antilink && isLink && !isAdmin && !isROwner) {
        if (!isBotAdmin) return;

        if (m.key.participant === conn.user.jid) return;

        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant }});

        await conn.groupParticipantsUpdate(m.chat, [m.key.participant], 'remove');

        await conn.reply(m.chat, `⚠️ @${m.key.participant.split('@')[0]} fue eliminado por enviar enlaces.`, null, { mentions: [m.key.participant] });
    }
}
