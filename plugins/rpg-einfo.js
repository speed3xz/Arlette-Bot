import { promises as fs } from 'fs';

function formatTime(ms) {
    if (ms <= 0 || isNaN(ms)) return 'Ahora';
    
    const totalSeconds = Math.ceil(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds % 86400 / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (days) parts.push(days + ' día' + (days !== 1 ? 's' : ''));
    if (hours) parts.push(hours + ' hora' + (hours !== 1 ? 's' : ''));
    if (minutes || hours || days) parts.push(minutes + ' minuto' + (minutes !== 1 ? 's' : ''));
    parts.push(seconds + ' segundo' + (seconds !== 1 ? 's' : ''));
    
    return parts.join(' ');
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const currency = '¥'; // Moneda del sistema
    
    try {
        // Verificar si los comandos de economía están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.economy && m.isGroup) {
            return m.reply('꒰🎀꒱ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'economy on*');
        }

        // Obtener datos del usuario
        const userData = global.db?.data?.users?.[m.sender] || {};
        if (!userData) {
            return conn.reply(m.chat, 'ꕥ No se encontraron datos de economía para este usuario.', m);
        }

        const currentTime = Date.now();
        
        // Definir cooldowns de comandos de economía
        const cooldowns = {
            'Work': userData.lastwork,
            'Slut': userData.lastslut,
            'Crime': userData.lastcrime,
            'Steal': userData.lastrob,
            'Daily': userData.lastDaily,
            'Weekly': userData.lastweekly,
            'Monthly': userData.lastmonthly,
            'Cofre': userData.lastcofre,
            'Adventure': userData.lastAdventure,
            'Dungeon': userData.lastDungeon,
            'Fish': userData.lastFish,
            'Hunt': userData.lastHunt,
            'Mine': userData.lastmine
        };

        // Calcular tiempos restantes para cada comando
        const cooldownList = Object.entries(cooldowns).map(([commandName, lastTime]) => {
            const remainingTime = typeof lastTime === 'number' ? lastTime - currentTime : 0;
            return 'ⴵ ' + commandName + ' » *' + formatTime(remainingTime) + '*';
        });

        // Calcular riqueza total (coins + banco)
        const totalWealth = ((userData.coin || 0) + (userData.bank || 0)).toLocaleString();

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
        infoMessage += cooldownList.join('\n');
        infoMessage += '\n\n⛁ Coins totales » *' + totalWealth + ' ' + currency + '*';

        // Enviar mensaje
        await m.reply(infoMessage.trim());

    } catch (error) {
        console.error('Error en handler de economía:', error);
        await conn.reply(
            m.chat,
            '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message,
            m
        );
    }
};

// Configuración del handler
handler.help = ['economyinfo'];
handler.tags = ['economy'];
handler.command = ['economyinfo', 'einfo', 'infoeconomy'];
handler.group = true;

export default handler;