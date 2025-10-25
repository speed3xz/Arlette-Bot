import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

function flattenCharacters(charactersData) {
    return Object.values(charactersData).flatMap(series => 
        Array.isArray(series.characters) ? series.characters : []
    );
}

let handler = async (m, { conn, args, usedPrefix, command, quoted }) => {
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Inicializar datos si no existen
        if (!global.db.data.characters) global.db.data.characters = {};
        if (!global.db.data.users) global.db.data.users = {};

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
        // Método 3: Usuario actual
        else {
            targetUser = m.sender;
        }

        // Obtener nombre del usuario objetivo
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

        // Cargar datos de personajes
        const charactersData = await loadCharacters();
        const allCharacters = flattenCharacters(charactersData);

        // Obtener personajes del usuario objetivo
        const userCharacters = Object.entries(global.db.data.characters)
            .filter(([_, charData]) => 
                (charData.user || '').replace(/[^0-9]/g, '') === targetUser.replace(/[^0-9]/g, '')
            )
            .map(([charId]) => charId);

        // Verificar si el usuario tiene personajes
        if (userCharacters.length === 0) {
            const message = targetUser === m.sender ? 
                'ꕥ No tienes personajes reclamados.' : 
                'ꕥ *' + targetUsername + '* no tiene personajes reclamados.';
            
            return conn.reply(m.chat, message, m, { mentions: [targetUser] });
        }

        // Ordenar personajes por valor (descendente)
        userCharacters.sort((charA, charB) => {
            const charAData = global.db.data.characters[charA] || {};
            const charBData = global.db.data.characters[charB] || {};
            
            const charAOriginal = allCharacters.find(char => char.id === charA);
            const charBOriginal = allCharacters.find(char => char.id === charB);
            
            const valueA = typeof charAData.value === 'number' ? 
                charAData.value : Number(charAOriginal?.value || 0);
            const valueB = typeof charBData.value === 'number' ? 
                charBData.value : Number(charBOriginal?.value || 0);
            
            return valueB - valueA;
        });

        // Configurar paginación
        const page = parseInt(args[1]) || 1;
        const itemsPerPage = 50;
        const totalPages = Math.ceil(userCharacters.length / itemsPerPage);

        if (page < 1 || page > totalPages) {
            return conn.reply(
                m.chat, 
                '❀ Página no válida. Hay un total de *' + totalPages + '* páginas.', 
                m
            );
        }

        // Obtener personajes de la página actual
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, userCharacters.length);
        const pageCharacters = userCharacters.slice(startIndex, endIndex);

        // Construir mensaje
        let message = '✿ Personajes reclamados ✿\n';
        message += '⌦ Usuario: *' + targetUsername + '*\n';
        message += '♡ Personajes: *(' + userCharacters.length + ')*\n\n';

        for (const charId of pageCharacters) {
            const charData = global.db.data.characters[charId] || {};
            const charOriginal = allCharacters.find(char => char.id === charId);
            
            const charName = charOriginal?.name || charData.name || `ID:${charId}`;
            const charValue = typeof charData.value === 'number' ? 
                charData.value : Number(charOriginal?.value || 0);
            
            message += '» *' + charName + '* (*' + charValue.toLocaleString() + '*)\n';
        }

        message += '\n⌦ _Página *' + page + '* de *' + totalPages + '*_';

        // Enviar mensaje
        await conn.reply(m.chat, message.trim(), m, { mentions: [targetUser] });

    } catch (error) {
        console.error('Error en handler de harem:', error);
        await conn.reply(
            m.chat, 
            '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, 
            m
        );
    }
};

// Configuración del handler
handler.help = ['harem [@usuario] [página]'];
handler.tags = ['anime'];
handler.command = ['harem', 'waifus', 'claims'];
handler.group = true;

export default handler;