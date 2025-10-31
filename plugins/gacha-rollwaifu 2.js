import { promises as fs } from 'fs';
import fetch from 'node-fetch';

const FILE_PATH = './lib/characters.json';

async function loadCharacters() {
    try {
        await fs.access(FILE_PATH);
    } catch {
        await fs.writeFile(FILE_PATH, '{}');
    }
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(data);
}

function flattenCharacters(charactersData) {
    return Object.values(charactersData).flatMap(series => 
        Array.isArray(series.characters) ? series.characters : []
    );
}

function getSeriesNameByCharacter(charactersData, characterId) {
    return Object.entries(charactersData).find(([_, series]) => 
        Array.isArray(series.characters) && 
        series.characters.some(char => String(char.id) === String(characterId))
    )?.[1]?.name || 'Desconocido';
}

function formatTag(tag) {
    return String(tag).toLowerCase().trim().replace(/\s+/g, '_');
}

async function buscarImagenDelirius(tag) {
    const formattedTag = formatTag(tag);
    const apiUrls = [
        `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${formattedTag}`,
        `https://danbooru.donmai.us/posts.json?tags=${formattedTag}`,
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

let handler = async (m, { conn, usedPrefix, command }) => {
    const cooldownTime = 15 * 60 * 1000; // 15 minutos en milisegundos
    
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Inicializar datos del chat si no existen
        if (!chatData.characters) chatData.characters = {};
        if (!chatData.lastRolledId) chatData.lastRolledId = null;
        if (!chatData.lastRolledMsgId) chatData.lastRolledMsgId = null;

        // Verificar cooldown
        const userData = global.db?.data?.users?.[m.sender] || {};
        const currentTime = Date.now();
        
        if (userData.lastRoll && currentTime < userData.lastRoll + cooldownTime) {
            const remainingSeconds = Math.ceil((userData.lastRoll + cooldownTime - currentTime) / 1000);
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            
            let timeLeft = '';
            if (minutes > 0) timeLeft += minutes + ' minuto' + (minutes !== 1 ? 's' : '') + ' ';
            if (seconds > 0 || timeLeft === '') timeLeft += seconds + ' segundo' + (seconds !== 1 ? 's' : '');
            
            return m.reply('ꕥ Debes esperar *' + timeLeft.trim() + '* para usar *' + (usedPrefix + command) + '* de nuevo.');
        }

        // Cargar personajes y seleccionar uno aleatorio
        const charactersData = await loadCharacters();
        const allCharacters = flattenCharacters(charactersData);
        
        if (!allCharacters.length) {
            return m.reply('ꕥ No hay personajes disponibles en la base de datos.');
        }

        const randomCharacter = allCharacters[Math.floor(Math.random() * allCharacters.length)];
        const characterId = String(randomCharacter.id);
        const seriesName = getSeriesNameByCharacter(charactersData, randomCharacter.id);
        
        // Buscar imagen del personaje
        const characterTag = formatTag(randomCharacter.tags?.[0] || '');
        const images = await buscarImagenDelirius(characterTag);
        
        if (!images.length) {
            return m.reply('ꕥ No se encontró imágenes para el personaje *' + randomCharacter.name + '*.');
        }

        const randomImage = images[Math.floor(Math.random() * images.length)];

        // Inicializar datos del personaje en la base de datos
        const charactersDb = global.db?.data?.characters || {};
        if (!charactersDb[characterId]) {
            charactersDb[characterId] = {};
        }

        const characterDb = charactersDb[characterId];
        const existingData = charactersDb[characterId] || {};

        // Actualizar datos del personaje
        characterDb.name = String(randomCharacter.name || 'Sin nombre');
        characterDb.value = typeof existingData.value === 'number' ? existingData.value : Number(randomCharacter.value) || 100;
        characterDb.votes = Number(characterDb.votes || existingData.votes || 0);
        characterDb.user = m.sender; // Usuario que hizo el roll
        characterDb.reservedUntil = currentTime + 20000; // 20 segundos para reclamar
        characterDb.expiresAt = currentTime + 60000; // 1 minuto de expiración

        // Obtener nombre del usuario reclamador si existe
        const getClaimantName = async (userId) => {
            try {
                return global.db?.data?.users?.[userId]?.name?.trim() || 
                       (await conn.getName(userId)) || 
                       userId.split('@')[0];
            } catch {
                return userId.split('@')[0];
            }
        };

        const claimantName = await getClaimantName(characterDb.user);

        // Crear texto de información del personaje
        const infoText = '❀ Nombre » *' + characterDb.name +
                       '*\n⚥ Género » *' + (randomCharacter.gender || 'Desconocido') +
                       '*\n✰ Valor » *' + characterDb.value.toLocaleString() +
                       '*\n♡ Estado » *' + (characterDb.user ? 'Reclamado por ' + claimantName : 'Libre') +
                       '*\n❖ Fuente » *' + seriesName + '*';

        // Enviar imagen con información
        const sentMessage = await conn.sendFile(
            m.chat, 
            randomImage, 
            characterDb.name + '.jpg', 
            infoText, 
            m
        );

        // Guardar información del roll actual
        chatData.lastRolledId = characterId;
        chatData.lastRolledMsgId = sentMessage?.key?.id || null;
        chatData.lastRolledCharacter = {
            id: characterId,
            name: characterDb.name,
            media: randomImage
        };

        // Actualizar cooldown del usuario
        userData.lastRoll = currentTime;

    } catch (error) {
        console.error('Error en handler de roll:', error);
        await conn.reply(m.chat, '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, m);
    }
};

// Configuración del handler
handler.help = ['roll', 'rw', 'rollwaifu'];
handler.tags = ['gacha'];
handler.command = ['rollwaifu', 'rw', 'roll'];
handler.group = true;

export default handler;