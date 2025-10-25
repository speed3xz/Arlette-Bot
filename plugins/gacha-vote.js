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

function getSeriesNameByCharacter(charactersData, characterId) {
    return Object.values(charactersData).find(series => 
        Array.isArray(series.characters) && 
        series.characters.some(char => char.id === characterId)
    )?.name || 'Desconocido';
}

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
    const voteCooldown = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
    const dailyVoteLimit = 900; // Límite diario de votos por personaje
    
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Inicializar datos de personajes si no existen
        if (!global.db.data.characters) global.db.data.characters = {};

        const userData = global.db.data.users[m.sender] || {};
        const currentTime = Date.now();

        // Verificar cooldown de voto del usuario
        if (userData.lastVote && currentTime < userData.lastVote) {
            const remainingSeconds = Math.ceil((userData.lastVote - currentTime) / 1000);
            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor(remainingSeconds % 3600 / 60);
            const seconds = remainingSeconds % 60;
            
            let timeLeft = '';
            if (hours > 0) timeLeft += hours + ' hora' + (hours !== 1 ? 's' : '') + ' ';
            if (minutes > 0) timeLeft += minutes + ' minuto' + (minutes !== 1 ? 's' : '') + ' ';
            if (seconds > 0 || timeLeft === '') timeLeft += seconds + ' segundo' + (seconds !== 1 ? 's' : '');
            
            return m.reply('ꕥ Debes esperar *' + timeLeft.trim() + '* para usar *' + (usedPrefix + command) + '* de nuevo.');
        }

        // Validar argumentos
        const characterName = args.join(' ').trim();
        if (!characterName) {
            return m.reply('❀ Debes especificar un personaje para votarlo.');
        }

        // Buscar el personaje
        const charactersData = await loadCharacters();
        const allCharacters = flattenCharacters(charactersData);
        const character = allCharacters.find(char => 
            char.name.toLowerCase() === characterName.toLowerCase()
        );

        if (!character) {
            return m.reply('ꕥ Personaje no encontrado. Asegúrate de que el nombre esté correcto.');
        }

        // Inicializar datos del personaje si no existen
        if (!global.db.data.characters[character.id]) {
            global.db.data.characters[character.id] = {};
        }

        const characterData = global.db.data.characters[character.id];

        // Inicializar valores del personaje
        if (typeof characterData.value !== 'number') {
            characterData.value = Number(character.value || 0);
        }
        if (typeof characterData.votes !== 'number') {
            characterData.votes = 0;
        }
        if (!characterData.name) {
            characterData.name = character.name;
        }

        // Verificar cooldown del personaje (2 horas)
        if (characterData.lastVotedAt && currentTime < characterData.lastVotedAt + voteCooldown) {
            const remainingTime = characterData.lastVotedAt + voteCooldown - currentTime;
            const remainingSeconds = Math.ceil(remainingTime / 1000);
            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor(remainingSeconds % 3600 / 60);
            const seconds = remainingSeconds % 60;
            
            let timeLeft = '';
            if (hours > 0) timeLeft += hours + ' hora' + (hours !== 1 ? 's' : '') + ' ';
            if (minutes > 0) timeLeft += minutes + ' minuto' + (minutes !== 1 ? 's' : '') + ' ';
            if (seconds > 0 || timeLeft === '') timeLeft += seconds + ' segundo' + (seconds !== 1 ? 's' : '');
            
            return m.reply('ꕥ *' + characterData.name + '* ha sido votada recientemente.\n> Debes esperar *' + timeLeft.trim() + '* para votarla de nuevo.');
        }

        // Inicializar registro diario de incrementos
        if (!characterData.dailyIncrement) {
            characterData.dailyIncrement = {};
        }

        // Verificar límite diario de votos
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const todayIncrement = characterData.dailyIncrement[today] || 0;

        if (todayIncrement >= dailyVoteLimit) {
            return m.reply('ꕥ *' + characterData.name + '* ya tiene el valor máximo.');
        }

        // Calcular incremento aleatorio (50-300)
        const increment = Math.min(
            dailyVoteLimit - todayIncrement,
            Math.floor(Math.random() * 251) + 50
        );

        // Aplicar el voto
        characterData.value += increment;
        characterData.votes += 1;
        characterData.lastVotedAt = currentTime;
        characterData.dailyIncrement[today] = todayIncrement + increment;

        // Actualizar cooldown del usuario
        userData.lastVote = currentTime + voteCooldown;

        // Obtener nombre de la serie
        const seriesName = getSeriesNameByCharacter(charactersData, character.id);

        // Mensaje de confirmación
        await conn.reply(
            m.chat,
            '❀ Votaste por *' + characterData.name + '* (' + seriesName + ')\n> Su nuevo valor es *' + characterData.value.toLocaleString() + '*',
            m
        );

    } catch (error) {
        console.error('Error en handler de votos:', error);
        await conn.reply(
            m.chat,
            '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message,
            m
        );
    }
};

// Configuración del handler
handler.help = ['vote <personaje>'];
handler.tags = ['gacha'];
handler.command = ['vote', 'votar'];
handler.group = true;

export default handler;