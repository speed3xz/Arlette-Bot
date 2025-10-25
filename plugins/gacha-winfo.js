import { promises as fs } from 'fs';
import fetch from 'node-fetch';

const charactersFilePath = './lib/characters.json';

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading characters:', error);
        return {};
    }
}

function flattenCharacters(charactersData) {
    return Object.values(charactersData).flatMap(series => 
        Array.isArray(series.characters) ? series.characters : []
    );
}

function getSeriesNameByCharacter(charactersData, characterId) {
    const seriesEntry = Object.entries(charactersData).find(([_, series]) => 
        Array.isArray(series.characters) && 
        series.characters.some(char => char.id === characterId)
    );
    return seriesEntry?.[1]?.name || 'Desconocido';
}

function formatElapsed(ms) {
    if (!ms || ms <= 0) return '—';
    
    const totalSeconds = Math.floor(ms / 1000);
    const weeks = Math.floor(totalSeconds / 604800);
    const days = Math.floor(totalSeconds % 604800 / 86400);
    const hours = Math.floor(totalSeconds % 86400 / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (weeks > 0) parts.push(weeks + 'w');
    if (days > 0) parts.push(days + 'd');
    if (hours > 0) parts.push(hours + 'h');
    if (minutes > 0) parts.push(minutes + 'm');
    if (seconds > 0) parts.push(seconds + 's');
    
    return parts.join(' ');
}

function formatTag(tag) {
    return String(tag).toLowerCase().trim().replace(/\s+/g, '_');
}

async function buscarImagenDelirius(tag) {
    const formattedTag = formatTag(tag);
    const apiUrls = [
        `https://danbooru.donmai.us/posts.json?tags=${formattedTag}`,
        `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${formattedTag}`,
        `${global.APIs?.delirius?.url || 'https://api.delirius.cc'}/search/gelbooru?query=${formattedTag}`
    ];
    
    for (const url of apiUrls) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json'
                }
            });
            
            const contentType = response.headers.get('content-type') || '';
            if (!response.ok || !contentType.includes('application/json')) continue;
            
            const data = await response.json();
            const posts = Array.isArray(data) ? data : data?.posts || data?.data || [];
            
            const images = posts.map(post => 
                post?.file_url || 
                post?.large_file_url || 
                post?.sample_url || 
                post?.media_asset?.variants?.[0]?.url
            ).filter(url => typeof url === 'string' && /\.(jpe?g|png)$/i.test(url));
            
            if (images.length) return images;
        } catch (error) {
            console.error(`Error fetching from ${url}:`, error);
        }
    }
    return [];
}

const handler = async (m, { conn, args, usedPrefix, command, text }) => {
    try {
        if (!args.length) {
            return m.reply(`🎀 Por favor, proporciona el nombre de un personaje.\n> Ejemplo » *${usedPrefix + command} nombre*`);
        }
        
        const charactersData = await loadCharacters();
        const allCharacters = flattenCharacters(charactersData);
        const query = text.toLowerCase().trim();
        
        const character = allCharacters.find(char => 
            String(char.name).toLowerCase() === query
        ) || allCharacters.find(char => 
            String(char.name).toLowerCase().includes(query) || 
            (Array.isArray(char.tags) && char.tags.some(tag => tag.toLowerCase().includes(query)))
        ) || allCharacters.find(char => 
            query.split(' ').some(word => 
                String(char.name).toLowerCase().includes(word) || 
                (Array.isArray(char.tags) && char.tags.some(tag => tag.toLowerCase().includes(word)))
            )
        );
        
        if (!character) {
            return m.reply(`🎀 No se encontró el personaje *${query}*.`);
        }
        
        const db = global.db?.data || {};

        switch (command) {
            case 'charinfo':
            case 'winfo':
            case 'waifuinfo': {
                if (!db.characters) db.characters = {};
                if (!db.characters[character.id]) db.characters[character.id] = {};
                
                const charData = db.characters[character.id];
                charData.name = charData.name || character.name;
                charData.value = typeof charData.value === 'number' ? charData.value : Number(character.value || 100);
                charData.votes = typeof charData.votes === 'number' ? charData.votes : 0;
                
                const seriesName = getSeriesNameByCharacter(charactersData, character.id);
                
                // Buscar si el personaje está reclamado
                let claimant = null;
                if (db.users) {
                    claimant = Object.entries(db.users).find(([_, user]) => 
                        Array.isArray(user.characters) && user.characters.includes(character.id)
                    );
                }
                
                let claimantName = 'Nunca';
                if (claimant) {
                    try {
                        claimantName = db.users[claimant[0]]?.name || 
                                      (await conn.getName(claimant[0])) || 
                                      claimant[0].split('@')[0];
                    } catch {
                        claimantName = claimant[0].split('@')[0];
                    }
                }
                
                const claimDate = charData.claimedAt ? 
                    `\nⴵ Fecha de reclamo » *${new Date(charData.claimedAt).toLocaleDateString('es-VE', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}*` : '';
                
                const lastVote = typeof charData.lastVotedAt === 'number' ? 
                    `\nⴵ Último voto » *${formatElapsed(Date.now() - charData.lastVotedAt)}*` : '—';
                
                // Calcular ranking
                let rank = '—';
                if (db.characters) {
                    const rankedChars = Object.values(db.characters)
                        .filter(char => typeof char.value === 'number')
                        .sort((a, b) => b.value - a.value);
                    rank = rankedChars.findIndex(char => char.name === character.name) + 1 || '—';
                }
                
                const infoText = `🎀 Nombre » *${charData.name}*
⚥ Género » *${character.gender || 'Desconocido'}*
✰ Valor » *${charData.value.toLocaleString()}*
♡ Estado » *${claimant ? 'Reclamado por ' + claimantName : 'Libre'}*${claimDate}
❖ Fuente » *${seriesName}*
❏ Puesto » */${rank}*
${lastVote}`;
                
                await conn.reply(m.chat, infoText, m);
                break;
            }
            
            case 'charimage':
            case 'wimage':
            case 'waifuimage':
            case 'cimage': {
                const tag = Array.isArray(character.tags) ? character.tags[0] : null;
                if (!tag) {
                    return m.reply(`🎀 El personaje *${character.name}* no tiene un tag válido para buscar imágenes.`);
                }
                
                const images = await buscarImagenDelirius(tag);
                if (!images.length) {
                    return m.reply(`🎀 No se encontraron imágenes para *${character.name}* con el tag *${tag}*.`);
                }
                
                const randomImage = images[Math.floor(Math.random() * images.length)];
                const seriesName = getSeriesNameByCharacter(charactersData, character.id);
                const caption = `🎀 El personaje *${character.name}*
⚥ Género » *${character.gender || 'Desconocido'}*
❖ Fuente » *${seriesName}*`;
                
                await conn.sendFile(m.chat, randomImage, `${character.name}.jpg`, caption, m);
                break;
            }
            
            case 'charvideo':
            case 'waifuvideo':
            case 'cvideo':
            case 'wvideo': {
                const tag = Array.isArray(character.tags) ? character.tags[0] : null;
                if (!tag) {
                    return m.reply(`🎀 El personaje *${character.name}* no tiene un tag válido para buscar videos.`);
                }
                
                const formattedTag = formatTag(tag);
                const apiUrls = [
                    `${global.APIs?.delirius?.url || 'https://api.delirius.cc'}/search/gelbooru?query=${formattedTag}`,
                    `https://danbooru.donmai.us/posts.json?tags=${formattedTag}`,
                    `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${formattedTag}`
                ];
                
                let videos = [];
                for (const url of apiUrls) {
                    try {
                        const response = await fetch(url, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0',
                                'Accept': 'application/json'
                            }
                        });
                        
                        const contentType = response.headers.get('content-type') || '';
                        if (!response.ok || !contentType.includes('application/json')) continue;
                        
                        const data = await response.json();
                        const posts = Array.isArray(data) ? data : data?.posts || data?.data || [];
                        
                        videos = posts.map(post => 
                            post?.file_url || 
                            post?.large_file_url || 
                            post?.sample_url || 
                            post?.media_asset?.variants?.[0]?.url
                        ).filter(url => typeof url === 'string' && /\.(gif|mp4)$/i.test(url));
                        
                        if (videos.length) break;
                    } catch (error) {
                        console.error(`Error fetching videos from ${url}:`, error);
                    }
                }
                
                if (!videos.length) {
                    return m.reply(`🎀 No se encontraron videos para *${character.name}*.`);
                }
                
                const randomVideo = videos[Math.floor(Math.random() * videos.length)];
                const seriesName = getSeriesNameByCharacter(charactersData, character.id);
                const caption = `🎀 El personaje *${character.name}*
⚥ Género » *${character.gender || 'Desconocido'}*
❖ Fuente » *${seriesName}*`;
                
                const extension = randomVideo.endsWith('.mp4') ? 'mp4' : 'gif';
                await conn.sendFile(m.chat, randomVideo, `${character.name}.${extension}`, caption, m);
                break;
            }
            
            default:
                return m.reply(`Comando no reconocido: ${command}`);
        }
    } catch (error) {
        console.error('Error en handler:', error);
        await conn.reply(m.chat, `⚠️ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\nError: ${error.message}`, m);
    }
};

// Configuración del handler
handler.help = [
    'charinfo <personaje>',
    'winfo <personaje>', 
    'waifuinfo <personaje>',
    'charimage <personaje>',
    'wimage <personaje>',
    'waifuimage <personaje>',
    'cimage <personaje>',
    'charvideo <personaje>',
    'waifuvideo <personaje>',
    'cvideo <personaje>',
    'wvideo <personaje>'
];

handler.tags = ['anime', 'búsqueda'];
handler.command = ['charinfo', 'winfo', 'waifuinfo', 'charimage', 'wimage', 'cimage', 'charvideo', 'cvideo', 'wvideo']

export default handler;