// Regex para detectar cualquier link (http, https, www, dominios, etc.)
const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;

export async function before(m, { conn, isAdmin, isBotAdmin, isROwner }) {
    if (!m.isGroup || !m?.text) return;

    const chat = global?.db?.data?.chats[m.chat];
    const isLink = linkRegex.test(m.text);

    // Solo actuar si el Anti-Link está activado, es un link y el remitente no es admin/propietario
    if (chat.antilink && isLink && !isAdmin && !isROwner) {
        if (!isBotAdmin) return; // el bot no puede eliminar ni expulsar

        if (m.key.participant === conn.user.jid) return; // evitar eliminar mensajes propios

        // Borrar mensaje
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant }});

        // Expulsar usuario
        await conn.groupParticipantsUpdate(m.chat, [m.key.participant], 'remove');

        // Notificar
        const userName = global.db.data.users[m.key.participant]?.name || 'Usuario';
        await conn.reply(m.chat, `> ꕥ Se ha eliminado a *${userName}* del grupo por \`Anti-Link\`. No se permiten enlaces de ningún tipo.`, null);
    }
}
