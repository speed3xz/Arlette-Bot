import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        const charactersData = await loadCharacters();

        switch (command) {
            case 'serielist':
            case 'slist':
            case 'animelist': {
                const seriesKeys = Object.keys(charactersData);
                const totalSeries = seriesKeys.length;
                const page = parseInt(args[0]) || 1;
                const itemsPerPage = 20;
                const totalPages = Math.max(1, Math.ceil(totalSeries / itemsPerPage));

                if (page < 1 || page > totalPages) {
                    return m.reply('ꕥ Página no válida. Hay un total de *' + totalPages + '* páginas.');
                }

                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = Math.min(startIndex + itemsPerPage, totalSeries);
                const pageSeries = seriesKeys.slice(startIndex, endIndex);

                let seriesList = '*❏ Lista de series (' + totalSeries + '):*\n\n';
                
                for (const seriesKey of pageSeries) {
                    const series = charactersData[seriesKey];
                    const seriesName = typeof series.name === 'string' ? series.name : seriesKey;
                    const characterCount = Array.isArray(series.characters) ? series.characters.length : 0;
                    
                    seriesList += '» *' + seriesName + '* (`' + characterCount + '`) *ID* (' + seriesKey + ')\n';
                }

                seriesList += '\n> • _Página ' + page + '/' + totalPages + '_';
                await m.reply(seriesList.trim());
                break;
            }

            case 'serieinfo':
            case 'ainfo':
            case 'animeinfo': {
                if (!args.length) {
                    return m.reply('❀ Debes especificar el nombre de un anime\n> Ejemplo » *' + (usedPrefix + command) + ' Naruto*');
                }

                const query = args.join(' ').toLowerCase().trim();
                const seriesEntries = Object.entries(charactersData);

                // Buscar serie por nombre o tags
                const foundSeries = seriesEntries.find(([_, seriesData]) => 
                    typeof seriesData.name === 'string' && 
                    seriesData.name.toLowerCase().includes(query)
                ) || seriesEntries.find(([_, seriesData]) => 
                    Array.isArray(seriesData.tags) && 
                    seriesData.tags.some(tag => tag.toLowerCase().includes(query))
                ) || seriesEntries.find(([_, seriesData]) => 
                    typeof seriesData.name === 'string' && 
                    query.split(' ').some(word => 
                        seriesData.name.toLowerCase().includes(word) || 
                        (Array.isArray(seriesData.tags) && 
                         seriesData.tags.some(tag => tag.toLowerCase().includes(word)))
                    )
                );

                if (!foundSeries) {
                    return m.reply('ꕥ No se encontró la serie *' + query + '*\n> Puedes sugerirlo usando el comando *' + usedPrefix + 'suggest sugerencia de serie: ' + query + '*');
                }

                const [seriesKey, seriesData] = foundSeries;
                let characters = Array.isArray(seriesData.characters) ? seriesData.characters : [];
                const totalCharacters = characters.length;

                // Contar personajes reclamados
                const claimedCharacters = characters.filter(character => 
                    Object.values(global.db?.data?.users || {}).some(user => 
                        Array.isArray(user.characters) && 
                        user.characters.includes(character.id)
                    )
                );

                // Ordenar personajes por valor
                characters.sort((a, b) => {
                    const charA = global.db?.data?.characters?.[a.id] || {};
                    const charB = global.db?.data?.characters?.[b.id] || {};
                    const valueA = typeof charA.value === 'number' ? charA.value : Number(a.value || 0);
                    const valueB = typeof charB.value === 'number' ? charB.value : Number(b.value || 0);
                    return valueB - valueA;
                });

                let seriesInfo = '*❀ Fuente: `<' + (seriesData.name || seriesKey) + '>`*\n\n';
                seriesInfo += '❏ Personajes » *`' + totalCharacters + '`*\n';
                seriesInfo += '♡ Reclamados » *`' + claimedCharacters.length + '/' + totalCharacters + ' (' + 
                            ((claimedCharacters.length / totalCharacters) * 100).toFixed(0) + '%)`*\n';
                seriesInfo += '\n❏ Lista de personajes:\n\n';

                for (const character of characters) {
                    const charDbData = global.db?.data?.characters?.[character.id] || {};
                    const charValue = typeof charDbData.value === 'number' ? charDbData.value : Number(character.value || 0);

                    // Encontrar usuario que reclama el personaje
                    const claimingUser = Object.entries(global.db?.data?.users || {}).find(([_, userData]) => 
                        Array.isArray(userData.characters) && 
                        userData.characters.includes(character.id)
                    );

                    let claimantName = 'desconocido';
                    if (claimingUser) {
                        try {
                            claimantName = global.db?.data?.users?.[claimingUser[0]]?.name?.trim() || 
                                         (await conn.getName(claimingUser[0])) || 
                                         claimingUser[0].split('@')[0];
                        } catch {
                            claimantName = claimingUser[0].split('@')[0];
                        }
                    }

                    const status = claimingUser ? 'Reclamado por *' + claimantName + '*' : 'Libre';
                    
                    seriesInfo += '» *' + character.name + '* (`' + charValue.toLocaleString() + '`) • ' + status + '.\n';
                }

                seriesInfo += '\n> ⌦ _Página *1* de *1*_';
                await conn.reply(m.chat, seriesInfo.trim(), m);
                break;
            }
        }

    } catch (error) {
        console.error('Error en handler de series:', error);
        await conn.reply(
            m.chat, 
            '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, 
            m
        );
    }
};

// Configuración del handler
handler.help = ['serielist [página]', 'serieinfo <nombre>'];
handler.tags = ['gacha'];
handler.command = [
    'serielist', 'slist', 'animelist',
    'serieinfo', 'ainfo', 'animeinfo'
];
handler.group = true;

export default handler;