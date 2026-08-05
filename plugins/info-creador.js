import PhoneNumber from 'awesome-phonenumber'

async function handler(m, { conn }) {
    let ownerNumber = global.owner?.[1] || '819095203873'
    if (Array.isArray(ownerNumber)) ownerNumber = ownerNumber[0]

    let number = ownerNumber.replace(/[^0-9]/g, '')
    let name = global.etiqueta || 'Arlette Xz'
    let formattedNumber = PhoneNumber('+' + number).getNumber('international') || '+' + number

    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
item1.TEL;waid=${number}:${formattedNumber}
END:VCARD`.trim()

    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: name,
            contacts: [{ vcard, displayName: name }]
        }
    }, { quoted: m })
}

handler.help = ['owner', 'creador', 'creator']
handler.tags = ['info']
handler.command = ['owner', 'creator', 'creador', 'dueño', 'creadora', 'dueña']

export default handler
