const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
    const primaryBot = global.db.data.chats[m.chat]?.primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) throw !1

    const chat = global.db.data.chats[m.chat]
    let type = command.toLowerCase()

    const enableKeys = ['on', 'enable', 'encender', 'activar', '1', 'true']
    const disableKeys = ['off', 'disable', 'apagar', 'desactivar', '0', 'false']

    const isDirectToggle = enableKeys.includes(type) || disableKeys.includes(type)

    if (isDirectToggle) {
        const option = args[0]?.toLowerCase()
        const availableOptions = [
            'welcome', 'bienvenida',
            'modoadmin', 'onlyadmin',
            'detect', 'alertas',
            'antilink', 'antienlace',
            'nsfw', 'modohorny',
            'economy', 'economia',
            'rpg', 'gacha'
        ]

        if (!option || !availableOptions.includes(option)) {
            return conn.reply(m.chat, `⚙️ *Ajustes de Configuración*\n\nUsa el comando junto con la función que deseas cambiar:\n\n` +
            `👋 *welcome* / *bienvenida*\n` +
            `👑 *modoadmin* / *onlyadmin*\n` +
            `🔔 *detect* / *alertas*\n` +
            `🔗 *antilink* / *antienlace*\n` +
            `🔞 *nsfw* / *modohorny*\n` +
            `💰 *economy* / *economia*\n` +
            `🎮 *rpg* / *gacha*\n\n` +
            `Ejemplo: *${usedPrefix}${type} alertas*`, m)
        }

        type = option
        args[0] = enableKeys.includes(command.toLowerCase()) ? 'on' : 'off'
    }

    let isEnable = false
    let actionArg = args[0]?.toLowerCase()

    let label = ''
    let icon = ''

    switch (type) {
        case 'welcome': case 'bienvenida': 
            type = 'welcome'
            label = 'Bienvenida'
            icon = '👋'
            break
        case 'modoadmin': case 'onlyadmin': 
            type = 'modoadmin'
            label = 'Modo admin'
            icon = '👑'
            break
        case 'detect': case 'alertas': 
            type = 'detect'
            label = 'Alertas de grupo'
            icon = '🔔'
            break
        case 'antilink': case 'antienlace': case 'antilinks': case 'antienlaces': 
            type = 'antiLink'
            label = 'Anti-enlaces'
            icon = '🔗'
            break
        case 'nsfw': case 'modohorny': 
            type = 'nsfw'
            label = 'Contenido NSFW'
            icon = '🔞'
            break
        case 'economy': case 'economia': 
            type = 'economy'
            label = 'Economía'
            icon = '💰'
            break
        case 'rpg': case 'gacha': 
            type = 'gacha'
            label = 'Juegos RPG'
            icon = '🎮'
            break
    }

    let currentStatus = chat[type] !== undefined ? chat[type] : false

    if (enableKeys.includes(actionArg)) {
        if (currentStatus) return conn.reply(m.chat, `${icon} *${label}*\nEsta función ya estaba activada.`, m)
        isEnable = true
    } else if (disableKeys.includes(actionArg)) {
        if (!currentStatus) return conn.reply(m.chat, `${icon} *${label}*\nEsta función ya estaba desactivada.`, m)
        isEnable = false
    } else {
        return conn.reply(m.chat, `${icon} *${label}*\n\nUso del comando:\n• Activar: *${usedPrefix}${command} on*\n• Desactivar: *${usedPrefix}${command} off*\n\nEstado actual: *${currentStatus ? 'Activado' : 'Desactivado'}*`, m)
    }

    if (!m.isGroup) {
        if (!isOwner) {
            global.dfail('group', m, conn)
            throw false
        }
    } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
    }

    chat[type] = isEnable
    conn.reply(m.chat, `${icon} *${label}*\nHas ${isEnable ? 'activado' : 'desactivado'} la función para este grupo.`, m)
}

handler.help = ['on', 'off']
handler.tags = ['enable']
handler.command = ['on', 'off', 'enable', 'disable', 'welcome', 'bienvenida', 'modoadmin', 'onlyadmin', 'nsfw', 'modohorny', 'economy', 'economia', 'rpg', 'gacha', 'detect', 'alertas', 'antilink', 'antienlace', 'antilinks', 'antienlaces']
handler.group = true

export default handler
