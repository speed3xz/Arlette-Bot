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

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Inicializar datos si no existen
        if (!global.db.data.characters) global.db.data.characters = {};
        if (!global.db.data.users) global.db.data.users = {};

        const charactersData = await loadCharacters();
        const allCharacters = flattenCharacters(charactersData);
        const userData = global.db.data.users[m.sender] || {};

        // Inicializar datos del usuario
        if (!Array.isArray(userData.characters)) {
            userData.characters = [];
        }

        switch (command) {
            case 'setfav':
            case 'wfav': {
                if (!args.length) {
                    return m.reply('❀ Debes especificar un personaje.\n> Ejemplo » *' + (usedPrefix + command) + ' nombre*');
                }

                const characterName = args.join(' ').toLowerCase().trim();
                const character = allCharacters.find(char => 
                    char.name.toLowerCase() === characterName
                );

                if (!character) {
                    return m.reply('ꕥ No se encontró el personaje *' + characterName + '*.');
                }

                // Verificar que el usuario tiene el personaje
                if (!userData.characters.includes(character.id)) {
                    return m.reply('ꕥ El personaje *' + character.name + '* no está reclamado por ti.');
                }

                const previousFavorite = userData.favorite;
                userData.favorite = character.id;

                // Si ya tenía un favorito, mostrar mensaje de reemplazo
                if (previousFavorite && previousFavorite !== character.id) {
                    const previousCharData = global.db.data.characters?.[previousFavorite] || {};
                    const previousCharName = typeof previousCharData.name === 'string' ? 
                        previousCharData.name : 'personaje anterior';
                    
                    return m.reply('❀ Se ha reemplazado tu favorito *' + previousCharName + '* por *' + character.name + '*!');
                }

                return m.reply('❀ Ahora *' + character.name + '* es tu personaje favorito!');
            }

            case 'favtop':
            case 'favoritetop':
            case 'favboard': {
                // Contar favoritos por personaje
                const favoritesCount = {};
                
                for (const [_, user] of Object.entries(global.db.data.users)) {
                    const favoriteId = user.favorite;
                    if (favoriteId) {
                        favoritesCount[favoriteId] = (favoritesCount[favoriteId] || 0) + 1;
                    }
                }

                // Crear lista de personajes con sus conteos de favoritos
                const favoriteCharacters = allCharacters.map(character => ({
                    name: character.name,
                    favorites: favoritesCount[character.id] || 0
                })).filter(char => char.favorites > 0);

                // Configurar paginación
                const page = parseInt(args[0]) || 1;
                const itemsPerPage = 10;
                const totalPages = Math.max(1, Math.ceil(favoriteCharacters.length / itemsPerPage));

                if (page < 1 || page > totalPages) {
                    return m.reply('ꕥ Página no válida. Hay un total de *' + totalPages + '* páginas.');
                }

                // Ordenar por favoritos (descendente)
                const sortedFavorites = favoriteCharacters.sort((a, b) => b.favorites - a.favorites);
                const pageFavorites = sortedFavorites.slice(
                    (page - 1) * itemsPerPage, 
                    page * itemsPerPage
                );

                let favoritesList = '✰ Top de personajes favoritos:\n\n';
                
                pageFavorites.forEach((character, index) => {
                    const position = (page - 1) * itemsPerPage + index + 1;
                    favoritesList += '#' + position + '   ♡ *' + character.name + '*\n';
                    favoritesList += '      ' + character.favorites + ' favorito' + 
                                   (character.favorites !== 1 ? 's' : '') + '.\n';
                });

                favoritesList += '\n> Página ' + page + ' de ' + totalPages;
                await conn.reply(m.chat, favoritesList.trim(), m);
                break;
            }

            case 'delfav':
            case 'deletefav': {
                if (!userData.favorite) {
                    return m.reply('❀ No tienes ningún personaje marcado como favorito.');
                }

                const favoriteId = userData.favorite;
                const favoriteData = global.db.data.characters?.[favoriteId] || {};
                
                let characterName = typeof favoriteData.name === 'string' ? 
                    favoriteData.name : null;

                // Si no hay nombre en la base de datos, buscarlo en characters.json
                if (!characterName) {
                    const characterFromJson = allCharacters.find(char => char.id === favoriteId);
                    characterName = characterFromJson?.name || 'personaje desconocido';
                }

                // Eliminar favorito
                delete userData.favorite;
                m.reply('✎ *' + characterName + '* ha dejado de ser tu personaje favorito.');
                break;
            }
        }

    } catch (error) {
        console.error('Error en handler de favoritos:', error);
        await conn.reply(
            m.chat, 
            '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, 
            m
        );
    }
};

// Configuración del handler
handler.help = [
    'setfav <personaje>',
    'favtop [página]', 
    'delfav'
];
handler.tags = ['gacha'];
handler.command = [
    'setfav', 'wfav',
    'favtop', 'favoritetop', 'favboard', 
    'delfav', 'deletefav'
];
handler.group = true;

export default handler;