import { promises as fs } from 'fs';

const file = './lib/characters.json';

async function loadCharacters() {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
}

function flattenCharacters(charactersData) {
    return Object.values(charactersData).flatMap(series => 
        Array.isArray(series.characters) ? series.characters : []
    );
}

let pendingTransfers = {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Obtener usuario mencionado
        const mentionedUsers = await m.mentionedJid();
        const targetUser = mentionedUsers[0] || (m.quoted && await m.quoted.sender);

        // Validar usuario objetivo
        if (!targetUser || typeof targetUser !== 'string' || !targetUser.includes('@')) {
            return m.reply('❀ Debes mencionar a quien quieras regalarle tus personajes.');
        }

        // Verificar que el usuario objetivo existe en la base de datos
        const targetUserData = global.db?.data?.users?.[targetUser];
        if (!targetUserData) {
            return m.reply('ꕥ El usuario mencionado no está registrado.');
        }

        // Obtener datos del usuario actual
        const currentUserData = global.db?.data?.users?.[m.sender];
        if (!Array.isArray(currentUserData.characters)) {
            currentUserData.characters = [];
        }

        // Inicializar datos del usuario objetivo
        if (!Array.isArray(targetUserData.characters)) {
            targetUserData.characters = [];
        }

        // Cargar datos de personajes
        const charactersData = await loadCharacters();
        const allCharacters = flattenCharacters(charactersData);

        // Obtener información detallada de los personajes del usuario
        const userCharacters = currentUserData.characters.map(charId => {
            const charDbData = global.db?.data?.characters?.[charId] || {};
            const charOriginalData = allCharacters.find(char => char.id === charId);
            
            const charValue = typeof charDbData.value === 'number' ? 
                charDbData.value : 
                typeof charOriginalData?.value === 'number' ? 
                charOriginalData.value : 0;

            return {
                id: charId,
                name: charDbData.name || charOriginalData?.name || `ID:${charId}`,
                value: charValue
            };
        });

        // Validar que el usuario tenga personajes para regalar
        if (userCharacters.length === 0) {
            return m.reply('ꕥ No tienes personajes para regalar.');
        }

        // Calcular valor total
        const totalValue = userCharacters.reduce((sum, char) => sum + char.value, 0);

        // Obtener nombres de usuarios
        const getUsername = async (userId) => {
            try {
                return global.db?.data?.users?.[userId]?.name?.trim() || 
                       (await conn.getName(userId)) || 
                       userId.split('@')[0];
            } catch {
                return userId.split('@')[0];
            }
        };

        const targetUsername = await getUsername(targetUser);
        const currentUsername = await getUsername(m.sender);

        // Crear solicitud de transferencia pendiente
        pendingTransfers[m.sender] = {
            sender: m.sender,
            to: targetUser,
            value: totalValue,
            count: userCharacters.length,
            ids: userCharacters.map(char => char.id),
            chat: m.chat,
            timeout: setTimeout(() => {
                delete pendingTransfers[m.sender];
            }, 60000) // 60 segundos de timeout
        };

        // Enviar mensaje de confirmación
        await conn.reply(
            m.chat,
            '「✿」 *' + currentUsername + '*, ¿confirmas regalar todo tu harem a *' + targetUsername + '*?\n\n❏ Personajes a transferir: *' + userCharacters.length + 
            '*\n❏ Valor total: *' + totalValue.toLocaleString() + 
            '*\n\n✐ Para confirmar responde a este mensaje con "Aceptar".\n> Esta acción no se puede deshacer, revisa bien los datos antes de confirmar.',
            m,
            { mentions: [targetUser] }
        );

    } catch (error) {
        console.error('Error en handler de giveallharem:', error);
        await conn.reply(m.chat, '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, m);
    }
};

// Handler para confirmar la transferencia
handler.before = async (m, { conn, usedPrefix }) => {
    try {
        const transferData = pendingTransfers[m.sender];
        
        // Verificar si es una confirmación válida
        if (!transferData || m.text?.trim().toLowerCase() !== 'aceptar') {
            return;
        }

        // Verificar que la solicitud corresponde al chat correcto
        if (m.sender !== transferData.sender || transferData.chat !== m.chat) {
            return;
        }

        // Validar usuario objetivo
        if (typeof transferData.to !== 'string' || !transferData.to.includes('@')) {
            return;
        }

        const currentUserData = global.db?.data?.users?.[m.sender];
        const targetUserData = global.db?.data?.users?.[transferData.to];

        // Transferir cada personaje
        for (const charId of transferData.ids) {
            const charData = global.db?.data?.characters?.[charId];
            
            // Verificar que el personaje aún pertenece al usuario
            if (!charData || charData.user !== m.sender) continue;

            // Transferir propiedad
            charData.user = transferData.to;

            // Agregar a la lista del usuario objetivo
            if (!targetUserData.characters.includes(charId)) {
                targetUserData.characters.push(charId);
            }

            // Remover de la lista del usuario actual
            currentUserData.characters = currentUserData.characters.filter(id => id !== charId);

            // Limpiar ventas si existe
            if (currentUserData.sales?.[charId]?.user === m.sender) {
                delete currentUserData.sales[charId];
            }

            // Limpiar favoritos si es necesario
            if (currentUserData.favorite === charId) {
                delete currentUserData.favorite;
            }
        }

        // Limpiar la solicitud pendiente
        clearTimeout(transferData.timeout);
        delete pendingTransfers[m.sender];

        // Obtener nombre del usuario objetivo
        const targetUsername = await (async () => {
            try {
                return targetUserData.name?.trim() || 
                       (await conn.getName(transferData.to)) || 
                       transferData.to.split('@')[0];
            } catch {
                return transferData.to.split('@')[0];
            }
        })();

        // Mensaje de confirmación
        await m.reply(
            '「✿」 Has regalado con éxito todos tus personajes a *' + targetUsername + 
            '*!\n\n> ❏ Personajes regalados: *' + transferData.count + 
            '*\n> ⴵ Valor total: *' + transferData.value.toLocaleString() + '*'
        );

        return true;

    } catch (error) {
        console.error('Error en handler before de giveallharem:', error);
        await conn.reply(m.chat, '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, m);
    }
};

// Configuración del handler
handler.help = ['giveallharem @usuario'];
handler.tags = ['gacha'];
handler.command = ['giveallharem'];
handler.group = true;

export default handler;