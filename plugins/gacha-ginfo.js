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

function formatTime(ms) {
    if (ms <= 0) return 'Ahora';
    
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(hours + ' hora' + (hours !== 1 ? 's' : ''));
    if (minutes > 0 || hours > 0) parts.push(minutes + ' minuto' + (minutes !== 1 ? 's' : ''));
    parts.push(seconds + ' segundo' + (seconds !== 1 ? 's' : ''));
    
    return parts.join(' ');
}

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Obtener datos del usuario actual
        const userData = global.db?.data?.users?.[m.sender] || {};
        if (!Array.isArray(userData.characters)) {
            userData.characters = [];
        }

        const currentTime = Date.now();
        
        // Calcular tiempos de cooldown
        const rollCooldown = userData.lastRoll && currentTime < userData.lastRoll ? 
            userData.lastRoll - currentTime : 0;
        const claimCooldown = userData.lastClaim && currentTime < userData.lastClaim ? 
            userData.lastClaim - currentTime : 0;
        const voteCooldown = userData.lastVote && currentTime < userData.lastVote ? 
            userData.lastVote - currentTime : 0;

        // Cargar datos de personajes
        const charactersData = await loadCharacters();
        const allCharacters = flattenCharacters(charactersData);
        
        // Estadísticas generales
        const totalCharacters = allCharacters.length;
        const totalSeries = Object.keys(charactersData).length;
        
        // Personajes del usuario
        const userCharacterIds = Object.entries(global.db?.data?.characters || {})
            .filter(([_, charData]) => charData.user === m.sender)
            .map(([charId]) => charId);

        // Calcular valor total de los personajes del usuario
        const totalValue = userCharacterIds.reduce((sum, charId) => {
            const charDbData = global.db.data.characters[charId] || {};
            const charOriginal = allCharacters.find(char => char.id === charId);
            const charValue = typeof charDbData.value === 'number' ? 
                charDbData.value : charOriginal?.value || 0;
            return sum + charValue;
        }, 0);

        // Obtener nombre del usuario
        const getUsername = async (userId) => {
            try {
                return userData.name?.trim() || 
                       (await conn.getName(userId)) || 
                       userId.split('@')[0];
            } catch {
                return userId.split('@')[0];
            }
        };

        const username = await getUsername(m.sender);

        // Construir mensaje de información
        let infoMessage = '*❀ Usuario `<' + username + '>`*\n\n';
        infoMessage += 'ⴵ RollWaifu » *' + formatTime(rollCooldown) + '*\n';
        infoMessage += 'ⴵ Claim » *' + formatTime(claimCooldown) + '*\n';
        infoMessage += 'ⴵ Vote » *' + formatTime(voteCooldown) + '*\n\n';
        infoMessage += '♡ Personajes reclamados » *' + userCharacterIds.length + '*\n';
        infoMessage += '✰ Valor total » *' + totalValue.toLocaleString() + '*\n';
        infoMessage += '❏ Personajes totales » *' + totalCharacters + '*\n';
        infoMessage += '❏ Series totales » *' + totalSeries + '*';

        // Enviar mensaje
        await m.reply(infoMessage.trim());

    } catch (error) {
        console.error('Error en handler de información:', error);
        await conn.reply(
            m.chat,
            '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message,
            m
        );
    }
};

// Configuración del handler
handler.help = ['gachainfo'];
handler.tags = ['gacha'];
handler.command = ['gachainfo', 'ginfo', 'infogacha'];
handler.group = true;

export default handler;