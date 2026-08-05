const parseDuration = (str) => {
    if (!str) return 0
    let match = str.match(/^(\d+)([smhd])$/i)
    if (!match) return 0
    let value = parseInt(match[1])
    let unit = match[2].toLowerCase()
    let multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
    return value * multipliers[unit]
}

const formatDuration = (str) => {
    let match = str.match(/^(\d+)([smhd])$/i)
    if (!match) return ''
    let val = match[1]
    let unit = match[2].toLowerCase()
    let units = { s: 'segundo(s)', m: 'minuto(s)', h: 'hora(s)', d: 'día(s)' }
    return `${val} ${units[unit]}`
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
    let action = command
    let timeArg = args[0]

    if (command === 'grupo') {
        action = args[0] ? args[0].toLowerCase() : ''
        timeArg = args[1]
    }

    if (!['abrir', 'open', 'cerrar', 'close'].includes(action)) {
        return m.reply(`⚙️ *Ajustes de Configuración*\n\nUsa el comando junto con la acción que deseas cambiar:\n\n🔓 *abrir* / *open*\n🔒 *cerrar* / *close*\n\nEjemplo: *${usedPrefix}grupo abrir 10m* o *${usedPrefix}close 1h*`)
    }

    let isClose = (action === 'cerrar' || action === 'close') ? 'announcement' : 'not_announcement'
    let groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
    let isCurrentlyClosed = groupMetadata?.announce

    if (isClose === 'announcement' && isCurrentlyClosed) {
        return m.reply(`🔒 *El grupo ya se encuentra cerrado.*`)
    }
    if (isClose === 'not_announcement' && !isCurrentlyClosed) {
        return m.reply(`🔓 *El grupo ya se encuentra abierto.*`)
    }

    let timerMs = timeArg ? parseDuration(timeArg) : 0

    if (timerMs > 0) {
        let timeFormatted = formatDuration(timeArg)
        if (isClose === 'announcement') {
            m.reply(`⏳ El grupo se cerrará en *${timeFormatted}*.`)
        } else {
            m.reply(`⏳ El grupo se abrirá en *${timeFormatted}*.`)
        }

        setTimeout(async () => {
            let currentMetadata = await conn.groupMetadata(m.chat).catch(() => null)
            let currentStatus = currentMetadata?.announce

            if (isClose === 'announcement' && currentStatus) return
            if (isClose === 'not_announcement' && !currentStatus) return

            await conn.groupSettingUpdate(m.chat, isClose)
            if (isClose === 'announcement') {
                conn.sendMessage(m.chat, { text: `🔒 *El grupo ha sido cerrado.* Solo los administradores pueden enviar mensajes.` })
            } else {
                conn.sendMessage(m.chat, { text: `🔓 *El grupo ha sido abierto.* Todos los participantes pueden enviar mensajes.` })
            }
        }, timerMs)
    } else {
        await conn.groupSettingUpdate(m.chat, isClose)
        if (isClose === 'announcement') {
            m.reply(`🔒 *El grupo ha sido cerrado.* Solo los administradores pueden enviar mensajes.`)
        } else {
            m.reply(`🔓 *El grupo ha sido abierto.* Todos los participantes pueden enviar mensajes.`)
        }
    }
}

handler.help = ['grupo', 'open', 'close', 'abrir', 'cerrar']
handler.tags = ['grupo']
handler.command = ['grupo', 'open', 'close', 'abrir', 'cerrar']
handler.admin = true
handler.botAdmin = true

export default handler
