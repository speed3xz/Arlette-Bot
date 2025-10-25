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

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const cooldownTime = 8 * 60 * 60 * 1000; // 8 horas en milisegundos
    const robCooldown = 24 * 60 * 60 * 1000; // 24 horas entre robos al mismo usuario
    
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Obtener datos del usuario actual
        const currentUserData = global.db?.data?.users?.[m.sender] || {};
        if (!Array.isArray(currentUserData.characters)) {
            currentUserData.characters = [];
        }
        
        // Inicializar datos de robo si no existen
        if (currentUserData.robCooldown == null) {
            currentUserData.robCooldown = 0;
        }
        if (!currentUserData.robVictims) {
            currentUserData.robVictims = {};
        }

        const currentTime = Date.now();
        const nextRobTime = currentUserData.robCooldown + cooldownTime;

        // Verificar cooldown general
        if (currentUserData.robCooldown > 0 && currentTime < nextRobTime) {
            const remainingSeconds = Math.ceil((nextRobTime - currentTime) / 1000);
            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor(remainingSeconds % 3600 / 60);
            const seconds = remainingSeconds % 60;
            
            let timeLeft = '';
            if (hours > 0) timeLeft += hours + ' hora' + (hours !== 1 ? 's' : '') + ' ';
            if (minutes > 0) timeLeft += minutes + ' minuto' + (minutes !== 1 ? 's' : '') + ' ';
            if (seconds > 0 || timeLeft === '') timeLeft += seconds + ' segundo' + (seconds !== 1 ? 's' : '');
            
            return m.reply('ꕥ Debes esperar *' + timeLeft.trim() + '* para usar *' + (usedPrefix + command) + '* de nuevo.');
        }

        // Obtener usuario objetivo - CORRECCIÓN DEL ERROR
        let targetUser = null;
        
        // Método 1: Usuarios mencionados en el mensaje
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetUser = m.mentionedJid[0];
        }
        // Método 2: Mensaje citado
        else if (m.quoted) {
            targetUser = m.quoted.sender;
        }
        // Método 3: Buscar mención en el texto
        else if (text) {
            const mentionRegex = /@?(\d{5,}|[\w.-]+@[\w.-]+)/g;
            const matches = text.match(mentionRegex);
            if (matches && matches.length > 0) {
                // Si es un número de teléfono, agregar el dominio
                const potentialUser = matches[0].replace('@', '');
                if (potentialUser.includes('@')) {
                    targetUser = potentialUser;
                } else {
                    targetUser = potentialUser + '@s.whatsapp.net';
                }
            }
        }

        // Validar usuario objetivo
        if (!targetUser || typeof targetUser !== 'string' || !targetUser.includes('@')) {
            return m.reply('❀ Por favor, cita o menciona al usuario a quien quieras robarle una waifu.\n> Ejemplo: *' + usedPrefix + command + ' @usuario*');
        }

        // Verificar que no se robe a sí mismo
        if (targetUser === m.sender) {
            const currentUsername = await (async () => {
                try {
                    return currentUserData.name?.trim() || 
                           (await conn.getName(m.sender)) || 
                           m.sender.split('@')[0];
                } catch {
                    return m.sender.split('@')[0];
                }
            })();
            return m.reply('ꕥ No puedes robarte a ti mismo, *' + currentUsername + '*.');
        }

        // Verificar cooldown de robo a este usuario específico
        const lastRobTime = currentUserData.robVictims[targetUser];
        if (lastRobTime && currentTime - lastRobTime < robCooldown) {
            const targetUsername = await (async () => {
                try {
                    const targetData = global.db?.data?.users?.[targetUser] || {};
                    return targetData.name?.trim() || 
                           (await conn.getName(targetUser)) || 
                           targetUser.split('@')[0];
                } catch {
                    return targetUser.split('@')[0];
                }
            })();
            return m.reply('ꕥ Ya robaste a *' + targetUsername + '* hoy. Solo puedes robarle a alguien *una vez cada 24 horas*.');
        }

        // Obtener datos del usuario objetivo
        const targetUserData = global.db?.data?.users?.[targetUser] || {};
        if (!Array.isArray(targetUserData.characters)) {
            targetUserData.characters = [];
        }
        
        if (targetUserData.characters.length === 0) {
            const targetUsername = await (async () => {
                try {
                    return targetUserData.name?.trim() || 
                           (await conn.getName(targetUser)) || 
                           targetUser.split('@')[0];
                } catch {
                    return targetUser.split('@')[0];
                }
            })();
            return m.reply('ꕥ *' + targetUsername + '* no tiene waifus que puedas robar.');
        }

        // Probabilidad de éxito del robo (90%)
        const success = Math.random() < 0.9;

        // Actualizar cooldowns
        currentUserData.robCooldown = currentTime;
        currentUserData.robVictims[targetUser] = currentTime;

        // Si el robo falla
        if (!success) {
            const targetUsername = await (async () => {
                try {
                    return targetUserData.name?.trim() || 
                           (await conn.getName(targetUser)) || 
                           targetUser.split('@')[0];
                } catch {
                    return targetUser.split('@')[0];
                }
            })();
            return m.reply('ꕥ El intento de robo ha fallado. *' + targetUsername + '* defendió a su waifu heroicamente.');
        }

        // Robo exitoso - seleccionar personaje aleatorio
        const stolenCharacterId = targetUserData.characters[Math.floor(Math.random() * targetUserData.characters.length)];
        
        // Asegurar que exista el registro del personaje
        if (!global.db.data.characters) global.db.data.characters = {};
        const characterData = global.db.data.characters[stolenCharacterId] || {};
        
        const characterName = characterData.name || `ID:${stolenCharacterId}`;

        // Transferir propiedad del personaje
        characterData.user = m.sender;
        characterData.name = characterName; // Asegurar que tenga nombre

        // Remover del usuario objetivo y agregar al usuario actual
        targetUserData.characters = targetUserData.characters.filter(id => id !== stolenCharacterId);
        if (!currentUserData.characters.includes(stolenCharacterId)) {
            currentUserData.characters.push(stolenCharacterId);
        }

        // Limpiar ventas si existe
        if (currentUserData.sales?.[stolenCharacterId]?.user === targetUser) {
            delete currentUserData.sales[stolenCharacterId];
        }

        // Limpiar favoritos si es necesario
        if (targetUserData.favorite === stolenCharacterId) {
            delete targetUserData.favorite;
        }

        // Obtener nombres para el mensaje
        const getUsername = async (userId) => {
            try {
                const userData = global.db?.data?.users?.[userId] || {};
                return userData.name?.trim() || 
                       (await conn.getName(userId)) || 
                       userId.split('@')[0];
            } catch {
                return userId.split('@')[0];
            }
        };

        const currentUsername = await getUsername(m.sender);
        const targetUsername = await getUsername(targetUser);

        // Mensaje de éxito
        await m.reply('❀ *' + currentUsername + '* ha robado a *' + characterName + '* del harem de *' + targetUsername + '*.');

    } catch (error) {
        console.error('Error en handler de robo:', error);
        await conn.reply(m.chat, '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, m);
    }
};

// Configuración del handler
handler.help = ['robwaifu @usuario'];
handler.tags = ['gacha'];
handler.command = ['robwaifu', 'robarwaifu'];
handler.group = true;

export default handler;