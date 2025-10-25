import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

function getCharacterById(characterId, charactersData) {
    return Object.values(charactersData)
        .flatMap(series => series.characters || [])
        .find(character => character.id === characterId);
}

let handler = async (m, { conn, usedPrefix, command, quoted }) => {
    const claimCooldown = 30 * 60 * 1000; // 30 minutos en milisegundos
    
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Obtener datos del usuario actual
        const currentUserData = global.db?.data?.users?.[m.sender] || {};
        const currentTime = Date.now();

        // Verificar cooldown de claim
        if (currentUserData.lastClaim && currentTime < currentUserData.lastClaim) {
            const remainingSeconds = Math.ceil((currentUserData.lastClaim - currentTime) / 1000);
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            
            let timeLeft = '';
            if (minutes > 0) timeLeft += minutes + ' minuto' + (minutes !== 1 ? 's' : '') + ' ';
            if (seconds > 0 || timeLeft === '') timeLeft += seconds + ' segundo' + (seconds !== 1 ? 's' : '');
            
            return m.reply('ꕥ Debes esperar *' + timeLeft.trim() + '* para usar *' + (usedPrefix + command) + '* de nuevo.');
        }

        // Obtener el personaje del último roll
        const lastCharacterId = chatData.lastRolledCharacter?.id || '';
        
        // Verificar si el mensaje citado es válido
        const isValidQuoted = quoted?.id === chatData.lastRolledMsgId || 
                            quoted?.text?.includes(lastCharacterId);

        if (!isValidQuoted) {
            return m.reply('❀ Debes citar un personaje válido para reclamar.');
        }

        const characterId = chatData.lastRolledId;

        // Cargar datos del personaje
        const charactersData = await loadCharacters();
        const characterData = getCharacterById(characterId, charactersData);

        if (!characterData) {
            return m.reply('ꕥ Personaje no encontrado en characters.json');
        }

        // Inicializar datos del personaje en la base de datos
        if (!global.db.data.characters) global.db.data.characters = {};
        if (!global.db.data.characters[characterId]) {
            global.db.data.characters[characterId] = {};
        }

        const dbCharacter = global.db.data.characters[characterId];
        
        // Actualizar datos del personaje
        dbCharacter.name = dbCharacter.name || characterData.name;
        dbCharacter.value = typeof dbCharacter.value === 'number' ? dbCharacter.value : characterData.value || 0;
        dbCharacter.votes = dbCharacter.votes || 0;

        // Verificar si el personaje está reservado
        if (dbCharacter.reservedBy && dbCharacter.reservedBy !== m.sender && currentTime < dbCharacter.reservedUntil) {
            const getReserverName = async (userId) => {
                try {
                    const userData = global.db?.data?.users?.[userId] || {};
                    return userData.name?.trim() || 
                           (await conn.getName(userId)) || 
                           userId.split('@')[0];
                } catch {
                    return userId.split('@')[0];
                }
            };

            const reserverName = await getReserverName(dbCharacter.reservedBy);
            const remainingTime = Math.ceil((dbCharacter.reservedUntil - currentTime) / 1000);
            
            return m.reply('ꕥ Este personaje está protegido por *' + reserverName + '* durante *' + remainingTime + 's*');
        }

        // Verificar si el personaje ha expirado
        if (dbCharacter.expiresAt && currentTime > dbCharacter.expiresAt && 
            !dbCharacter.user && 
            !(dbCharacter.reservedBy && currentTime < dbCharacter.reservedUntil)) {
            
            const expiredTime = Math.ceil((currentTime - dbCharacter.expiresAt) / 1000);
            return m.reply('ꕥ El personaje ha expirado » *' + expiredTime + 's*');
        }

        // Verificar si el personaje ya está reclamado
        if (dbCharacter.user) {
            const getClaimantName = async (userId) => {
                try {
                    const userData = global.db?.data?.users?.[userId] || {};
                    return userData.name?.trim() || 
                           (await conn.getName(userId)) || 
                           userId.split('@')[0];
                } catch {
                    return userId.split('@')[0];
                }
            };

            const claimantName = await getClaimantName(dbCharacter.user);
            return m.reply('ꕥ El personaje *' + dbCharacter.name + '* ya ha sido reclamado por *' + claimantName + '*');
        }

        // Reclamar el personaje
        dbCharacter.user = m.sender;
        dbCharacter.claimedAt = currentTime;
        
        // Limpiar reservas
        delete dbCharacter.reservedBy;
        delete dbCharacter.reservedUntil;

        // Actualizar cooldown del usuario
        currentUserData.lastClaim = currentTime + claimCooldown;

        // Agregar a la lista de personajes del usuario
        if (!Array.isArray(currentUserData.characters)) {
            currentUserData.characters = [];
        }
        if (!currentUserData.characters.includes(characterId)) {
            currentUserData.characters.push(characterId);
        }

        // Obtener nombre del usuario actual
        const getCurrentUsername = async () => {
            try {
                return currentUserData.name?.trim() || 
                       (await conn.getName(m.sender)) || 
                       m.sender.split('@')[0];
            } catch {
                return m.sender.split('@')[0];
            }
        };

        const currentUsername = await getCurrentUsername();

        // Calcular tiempo de expiración si existe
        const expirationTime = typeof dbCharacter.expiresAt === 'number' ? 
            Math.ceil((currentTime - dbCharacter.expiresAt + 60000) / 1000) : '∞';

        // Crear mensaje de confirmación
        const claimMessage = chatData.claimMessage ? 
            chatData.claimMessage
                .replace(/€user/g, '*' + currentUsername + '*')
                .replace(/€character/g, '*' + dbCharacter.name + '*') :
            '*' + dbCharacter.name + '* ha sido reclamado por *' + currentUsername + '*';

        // Enviar mensaje de confirmación
        await conn.reply(
            m.chat, 
            '❀ ' + claimMessage + ' (' + expirationTime + 's)', 
            m
        );

    } catch (error) {
        console.error('Error en handler de claim:', error);
        await conn.reply(
            m.chat, 
            '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, 
            m
        );
    }
};

// Configuración del handler
handler.help = ['claim'];
handler.tags = ['gacha'];
handler.command = ['claim', 'c', 'reclamar'];
handler.group = true;

export default handler;