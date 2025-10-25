import { promises as fs } from 'fs';

let handler = async (m, { conn, args, usedPrefix, command, quoted, text }) => {
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Obtener datos del usuario actual
        const currentUserData = global.db?.data?.users?.[m.sender] || {};
        if (!Array.isArray(currentUserData.characters)) {
            currentUserData.characters = [];
        }

        // Validar argumentos
        if (!args.length) {
            return m.reply('❀ Debes escribir el nombre del personaje y citar o mencionar al usuario que lo recibirá');
        }

        // Obtener usuario objetivo
        let targetUser = null;
        
        // Método 1: Usuarios mencionados
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetUser = m.mentionedJid[0];
        }
        // Método 2: Mensaje citado
        else if (quoted) {
            targetUser = await quoted.sender;
        }

        if (!targetUser) {
            return m.reply('❀ Debes mencionar o citar el mensaje del destinatario.');
        }

        // Obtener nombre del personaje
        let characterName = '';
        if (quoted) {
            characterName = args.join(' ').toLowerCase().trim();
        } else {
            characterName = args.slice(0, -1).join(' ').toLowerCase().trim();
        }

        // Buscar el personaje en la base de datos
        const characters = global.db?.data?.characters || {};
        const characterId = Object.keys(characters).find(charId => {
            const charData = characters[charId];
            return typeof charData.name === 'string' && 
                   charData.name.toLowerCase() === characterName && 
                   charData.user === m.sender;
        });

        if (!characterId) {
            return m.reply('ꕥ No se encontró el personaje *' + characterName + '* o no está reclamado por ti.');
        }

        const characterData = characters[characterId];

        // Verificar que el usuario actual tiene el personaje
        if (!currentUserData.characters.includes(characterId)) {
            return m.reply('ꕥ *' + characterData.name + '* no está reclamado por ti.');
        }

        // Obtener datos del usuario objetivo
        const targetUserData = global.db?.data?.users?.[targetUser] || {};
        if (!targetUserData) {
            return m.reply('ꕥ El usuario mencionado no está registrado.');
        }

        // Inicializar datos del usuario objetivo
        if (!Array.isArray(targetUserData.characters)) {
            targetUserData.characters = [];
        }

        // Transferir el personaje
        // Agregar al usuario objetivo
        if (!targetUserData.characters.includes(characterId)) {
            targetUserData.characters.push(characterId);
        }

        // Remover del usuario actual
        currentUserData.characters = currentUserData.characters.filter(id => id !== characterId);

        // Actualizar propiedad del personaje
        characterData.user = targetUser;

        // Limpiar ventas si existe
        if (currentUserData.sales?.[characterId]?.user === m.sender) {
            delete currentUserData.sales[characterId];
        }

        // Limpiar favoritos si es necesario
        if (currentUserData.favorite === characterId) {
            delete currentUserData.favorite;
        }
        if (global.db?.data?.users?.[m.sender]?.favorite === characterId) {
            delete global.db.data.users[m.sender].favorite;
        }

        // Obtener nombres para el mensaje
        const getUsername = async (userId) => {
            try {
                const userData = global.db?.data?.users?.[userId] || {};
                return userData.name?.trim() || 
                       (await conn.getName(userId)) || 
                       userId.split('@')[0];
            } catch {
                return userId.split('@')[0];
            }
        };

        const currentUsername = await getUsername(m.sender);
        const targetUsername = await getUsername(targetUser);

        // Mensaje de confirmación
        await conn.reply(
            m.chat,
            '❀ *' + characterData.name + '* ha sido regalado a *' + targetUsername + '* por *' + currentUsername + '*.',
            m,
            { mentions: [targetUser] }
        );

    } catch (error) {
        console.error('Error en handler de regalo:', error);
        await conn.reply(
            m.chat,
            '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message,
            m
        );
    }
};

// Configuración del handler
handler.help = ['givechar <personaje> @usuario', 'regalar <personaje> @usuario'];
handler.tags = ['gacha'];
handler.command = ['givewaifu', 'givechar', 'regalar'];
handler.group = true;

export default handler;