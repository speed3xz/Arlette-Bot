let handler = async (m, { conn, command }) => {
if (!m.quoted) {
return conn.reply(m.chat, `❀ Por favor, cita el mensaje que deseas eliminar.`, m)
}
return conn.sendMessage(m.chat, { delete: m.quoted.key })}

handler.help = ['delete']
handler.tags = ['grupo']
handler.command = ['del', 'delete']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler