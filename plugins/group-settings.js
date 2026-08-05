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
        return m.reply(`⚙️ *Ajustes de Grupo*\n\nUsa el comando junto con la acción que deseas realizar:\n\n🔓 *abrir* / *open*\n🔒 *cerrar* / *close*\n\nEjemplo: *${usedPrefix}grupo abrir 10m* o *${usedPrefix}cerrar 1h*`)
    }

    let isClose = (action === 'cerrar' || action === 'close') ? 'announcement' : 'not_announcement'
    let timerMs = timeArg ? parseDuration(timeArg) : 0

    if (timerMs > 0) {
        let timeFormatted = formatDuration(timeArg)
        if (isClose === 'announcement') {
            m.reply(`🔒 *Ajustes de Grupo*\n\nEl grupo se cerrará automáticamente en *${timeFormatted}*.`)
        } else {
            m.reply(`🔓 *Ajustes de Grupo*\n\nEl grupo se abrirá automáticamente en *${timeFormatted}*.`)
        }

        setTimeout(async () => {
            await conn.groupSettingUpdate(m.chat, isClose)
            if (isClose === 'announcement') {
                conn.sendMessage(m.chat, { text: `🔒 *Ajustes de Grupo*\n\nEl tiempo ha finalizado. Sólo los admins pueden escribir en este grupo.` })
            } else {
                conn.sendMessage(m.chat, { text: `🔓 *Ajustes de Grupo*\n\nEl tiempo ha finalizado. Ya todos pueden escribir en este grupo.` })
            }
        }, timerMs)
    } else {
        await conn.groupSettingUpdate(m.chat, isClose)
        if (isClose === 'announcement') {
            m.reply(`🔒 *Ajustes de Grupo*\n\nSólo los admins pueden escribir en este grupo.`)
        } else {
            m.reply(`🔓 *Ajustes de Grupo*\n\nYa todos pueden escribir en este grupo.`)
        }
    }
}

handler.help = ['grupo', 'open', 'close', 'abrir', 'cerrar']
handler.tags = ['grupo']
handler.command = ['grupo', 'open', 'close', 'abrir', 'cerrar']
handler.admin = true
handler.botAdmin = true

export default handler
