import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args }) => {
    const ctxErr = (global.rcanalx || {})
    const ctxWarn = (global.rcanalw || {})
    const ctxOk = (global.rcanalr || {})
    
    let stiker = false
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}
    let texto1 = packstickers.text1 || global.packsticker
    let texto2 = packstickers.text2 || global.packsticker2
    
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        let txt = args.join(' ')
        
        if (/webp|image|video/g.test(mime) && q.download) {
            if (/video/.test(mime) && (q.msg || q).seconds > 16)
                return await conn.reply(m.chat, '✧ El video no puede durar más de *15 segundos*', m, ctxWarn)
            
            let buffer = await q.download()
            await m.react('🕓')
            let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]
            stiker = await sticker(buffer, false, marca[0], marca[1])
        } else if (args[0] && isUrl(args[0])) {
            stiker = await sticker(false, args[0], texto1, texto2)
        } else {
            return await conn.reply(m.chat, '❀ Por favor, envía una *imagen* o *video* para hacer un sticker.', m, ctxErr)
        }
    } catch (e) {
        await conn.reply(m.chat, '⚠︎ Ocurrió un Error: ' + e.message, m, ctxErr)
        await m.react('✖️')
        return
    }
    
    if (stiker) {
        try {
            // Verificar si stiker es un buffer válido
            if (Buffer.isBuffer(stiker)) {
                await conn.sendMessage(m.chat, { 
                    sticker: stiker 
                }, { 
                    quoted: m 
                })
                await m.react('✅')
            } else {
                // Si no es un buffer, intentar convertirlo
                console.log('Sticker no es un buffer:', typeof stiker)
                await conn.reply(m.chat, '⚠︎ Error al crear el sticker', m, ctxErr)
                await m.react('✖️')
            }
        } catch (error) {
            console.error('Error enviando sticker:', error)
            await conn.reply(m.chat, '⚠︎ Error al enviar el sticker: ' + error.message, m, ctxErr)
            await m.react('✖️')
        }
    }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker']

export default handler

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
                    }
