let handler = async (m, { conn, usedPrefix, isOwner }) => {
let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;Milanesa con traumas 🎀;;\nFN:Milanesa con traumas 🎀\nORG:Milanesa con traumas 🎀\nTITLE:\nitem1.TEL;waid=573114910796:573114910796\nitem1.X-ABLabel:Milanesa con traumas 🎀\nX-WA-BIZ-DESCRIPTION:\nX-WA-BIZ-NAME:Milanesa con traumas 🎀\nEND:VCARD`
await conn.sendMessage(m.chat, { contacts: { displayName: 'Milanesa con traumas 🎀⁩', contacts: [{ vcard }] }}, {quoted: m})
}
handler.help = ['owner']
handler.tags = ['main']
handler.command = ['owner', 'creator', 'creador', 'dueño'] 

export default handler
