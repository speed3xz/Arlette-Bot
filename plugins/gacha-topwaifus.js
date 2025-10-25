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

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Inicializar datos de personajes si no existen
        if (!global.db.data.characters) global.db.data.characters = {};

        // Cargar datos de personajes
        const charactersData = await loadCharacters();
        const allCharacters = flattenCharacters(charactersData);

        // Crear lista de personajes con sus valores
        const charactersWithValues = allCharacters.map(character => {
            const charDbData = global.db.data.characters[character.id] || {};
            const charValue = typeof charDbData.value === 'number' ? 
                charDbData.value : Number(character.value || 0);
            
            return {
                name: character.name,
                value: charValue
            };
        });

        // Configurar paginación
        const page = parseInt(args[0]) || 1;
        const itemsPerPage = 10;
        const totalPages = Math.ceil(charactersWithValues.length / itemsPerPage);

        if (page < 1 || page > totalPages) {
            return m.reply('ꕥ Página no válida. Hay un total de *' + totalPages + '* páginas.');
        }

        // Ordenar personajes por valor (descendente)
        const sortedCharacters = charactersWithValues.sort((a, b) => b.value - a.value);
        
        // Obtener personajes de la página actual
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, sortedCharacters.length);
        const pageCharacters = sortedCharacters.slice(startIndex, endIndex);

        // Construir mensaje
        let message = '❀ *Personajes con más valor:*\n\n';
        
        pageCharacters.forEach((character, index) => {
            const position = (page - 1) * itemsPerPage + index + 1;
            message += '✰ ' + position + ' » *' + character.name + '*\n';
            message += '   → Valor: *' + character.value.toLocaleString() + '*\n';
        });

        message += '\n⌦ Página *' + page + '* de *' + totalPages + '*';

        // Enviar mensaje
        await conn.reply(m.chat, message.trim(), m);

    } catch (error) {
        console.error('Error en handler de top:', error);
        await conn.reply(
            m.chat,
            '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message,
            m
        );
    }
};

// Configuración del handler
handler.help = ['wtop [página]'];
handler.tags = ['gacha'];
handler.command = ['wtop', 'waifustop', 'topwaifus', 'waifusboard'];
handler.group = true;

export default handler;