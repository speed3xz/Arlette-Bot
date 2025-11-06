let handler = async (m, { text, usedPrefix, command }) => {
const ctxErr = (global.rcanalx || {})
const ctxWarn = (global.rcanalw || {})
const ctxOk = (global.rcanalr || {})

const userId = m.sender
if (command === 'setmeta') {
const packParts = text.split(/[\u2022|]/).map(part => part.trim())
if (packParts.length < 2) {
return await conn.reply(m.chat, `❀ Por favor, escribe el pack y el autor que deseas usar por defecto para tus stickers.\n> Ejemplo: *${usedPrefix + command} Arlette  • Bot*`, m, ctxErr)
}
const packText1 = packParts[0]
const packText2 = packParts[1]
if (!global.db.data.users[userId]) {
global.db.data.users[userId] = {}
}
const packstickers = global.db.data.users[userId]
packstickers.text1 = packText1
packstickers.text2 = packText2
await global.db.write()
return await conn.reply(m.chat, `❀ Se actualizo el pack y autor por defecto para tus stickers.`, m, ctxOk)
}
if (command === 'delmeta') {
if (!global.db.data.users[userId] || (!global.db.data.users[userId].text1 && !global.db.data.users[userId].text2)) {
return await conn.reply(m.chat, `ꕥ No tienes establecido un pack de stickers.`, m, ctxWarn)
}
const packstickers = global.db.data.users[userId]
delete packstickers.text1
delete packstickers.text2
await global.db.write()
return await conn.reply(m.chat, `❀ Se restablecio el pack y autor por defecto para tus stickers.`, m, ctxOk)
}}

handler.help = ['setmeta', 'delmeta']
handler.tags = ['tools']
handler.command = ['setmeta', 'delmeta']
handler.group = true

export default handler
