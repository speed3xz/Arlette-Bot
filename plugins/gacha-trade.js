import { promises as fs } from 'fs';

let pendingTrade = {};

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
    const currency = '¥';
    
    try {
        // Verificar si los comandos de gacha están activados en el grupo
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        // Validar argumentos
        if (!args.length || !text.includes('/')) {
            return m.reply('❀ Debes especificar dos personajes para intercambiarlos.\n> ✐ Ejemplo: *' + (usedPrefix + command) + ' PersonajeA / PersonajeB*\n> Donde "PersonajeA" es el personaje que quieres intercambiar y "PersonajeB" es el personaje que quieres recibir.');
        }

        // Procesar nombres de personajes
        const tradeText = text.slice(text.indexOf(' ') + 1).trim();
        const [characterAGive, characterBGet] = tradeText.split('/').map(name => name.trim().toLowerCase());

        // Buscar personajes en la base de datos
        const characters = global.db?.data?.characters || {};
        const characterAId = Object.keys(characters).find(id => 
            (characters[id]?.name || '').toLowerCase() === characterAGive && 
            characters[id]?.user === m.sender
        );
        
        const characterBId = Object.keys(characters).find(id => 
            (characters[id]?.name || '').toLowerCase() === characterBGet
        );

        // Validar existencia de personajes
        if (!characterAId || !characterBId) {
            const missingChar = !characterAId ? characterAGive : characterBGet;
            return m.reply('ꕥ No se ha encontrado al personaje *' + missingChar + '*.');
        }

        const characterA = characters[characterAId];
        const characterB = characters[characterBId];
        const characterAValue = typeof characterA.value === 'number' ? characterA.value : 0;
        const characterBValue = typeof characterB.value === 'number' ? characterB.value : 0;

        // Validaciones de intercambio
        if (characterB.user === m.sender) {
            return m.reply('ꕥ El personaje *' + characterB.name + '* ya está reclamado por ti.');
        }

        if (!characterB.user) {
            return m.reply('ꕥ El personaje *' + characterB.name + '* no está reclamado por nadie.');
        }

        if (!characterA.user || characterA.user !== m.sender) {
            return m.reply('ꕥ El personaje *' + characterA.name + '* no está reclamado por ti.');
        }

        const targetUser = characterB.user;

        // Obtener nombres de usuarios
        const getUserName = async (userId) => {
            try {
                return global.db?.data?.users?.[userId]?.name?.trim() || 
                       (await conn.getName(userId)) || 
                       userId.split('@')[0];
            } catch {
                return userId.split('@')[0];
            }
        };

        const senderName = await getUserName(m.sender);
        const targetName = await getUserName(targetUser);

        // Crear solicitud de intercambio
        pendingTrade[targetUser] = {
            from: m.sender,
            to: targetUser,
            chat: m.chat,
            give: characterAId,
            get: characterBId,
            timeout: setTimeout(() => {
                delete pendingTrade[targetUser];
            }, 60000) // 60 segundos
        };

        // Enviar solicitud
        await conn.reply(
            m.chat, 
            '「✿」 *' + targetName + '* puede aceptar la solicitud de intercambio.\n\n✦ [' + targetName + '] *' + characterB.name + '* (' + characterBValue + ')\n✦ [' + senderName + '] *' + characterA.name + '* (' + characterAValue + ')\n\n✐ Para aceptar el intercambio responde a este mensaje con "aceptar", la solicitud expira en 60 segundos.',
            m, 
            { mentions: [targetUser] }
        );

    } catch (error) {
        console.error('Error en handler de intercambio:', error);
        await conn.reply(m.chat, '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, m);
    }
};

// Handler para aceptar intercambios
handler.before = async (m, { conn }) => {
    try {
        if (m.text.trim().toLowerCase() !== 'aceptar') return;

        const tradeEntry = Object.entries(pendingTrade).find(([_, trade]) => trade.chat === m.chat);
        if (!tradeEntry) return;

        const [targetUser, tradeData] = tradeEntry;

        // Verificar que el que acepta es el destinatario correcto
        if (m.sender !== tradeData.to) {
            const targetName = await (async () => {
                try {
                    return global.db?.data?.users?.[tradeData.to]?.name?.trim() || 
                           (await conn.getName(tradeData.to)) || 
                           tradeData.to.split('@')[0];
                } catch {
                    return tradeData.to.split('@')[0];
                }
            })();
            return m.reply('ꕥ Solo *' + targetName + '* puede aceptar la solicitud.');
        }

        // Verificar que los personajes aún están disponibles
        const characters = global.db?.data?.characters || {};
        const characterGive = characters[tradeData.give];
        const characterGet = characters[tradeData.get];

        if (!characterGive || !characterGet || 
            characterGive.user !== tradeData.from || 
            characterGet.user !== tradeData.to) {
            delete pendingTrade[targetUser];
            return m.reply('⚠︎ Uno de los personajes ya no está disponible para el intercambio.');
        }

        // Realizar el intercambio
        characterGive.user = tradeData.to;
        characterGet.user = tradeData.from;

        // Actualizar listas de personajes de usuarios
        const senderUser = global.db?.data?.users?.[tradeData.from] || {};
        const targetUserData = global.db?.data?.users?.[tradeData.to] || {};

        // Inicializar arrays si no existen
        if (!Array.isArray(senderUser.characters)) senderUser.characters = [];
        if (!Array.isArray(targetUserData.characters)) targetUserData.characters = [];

        // Agregar nuevos personajes
        if (!targetUserData.characters.includes(tradeData.give)) {
            targetUserData.characters.push(tradeData.give);
        }
        if (!senderUser.characters.includes(tradeData.get)) {
            senderUser.characters.push(tradeData.get);
        }

        // Remover personajes intercambiados
        senderUser.characters = senderUser.characters.filter(id => id !== tradeData.give);
        targetUserData.characters = targetUserData.characters.filter(id => id !== tradeData.get);

        // Limpiar favoritos si es necesario
        if (senderUser.favorite === tradeData.give) delete senderUser.favorite;
        if (targetUserData.favorite === tradeData.get) delete targetUserData.favorite;

        // Limpiar la solicitud pendiente
        clearTimeout(tradeData.timeout);
        delete pendingTrade[targetUser];

        // Obtener nombres para el mensaje de confirmación
        const getTradeUserName = async (userId) => {
            try {
                return global.db?.data?.users?.[userId]?.name?.trim() || 
                       (await conn.getName(userId)) || 
                       userId.split('@')[0];
            } catch {
                return userId.split('@')[0];
            }
        };

        const senderTradeName = await getTradeUserName(tradeData.from);
        const targetTradeName = await getTradeUserName(tradeData.to);
        const characterGiveName = characterGive.name || 'PersonajeA';
        const characterGetName = characterGet.name || 'PersonajeB';

        // Mensaje de confirmación
        await m.reply(
            '「✿」Intercambio aceptado!\n\n✦ ' + targetTradeName + ' » *' + characterGiveName + 
            '*\n✦ ' + senderTradeName + ' » *' + characterGetName + '*'
        );

        return true;

    } catch (error) {
        console.error('Error en handler before:', error);
        await conn.reply(m.chat, '⚠︎ Se ha producido un problema.\n> Usa *report* para informarlo.\n\n' + error.message, m);
    }
};

// Configuración del handler
handler.help = ['trade <PersonajeA> / <PersonajeB>'];
handler.tags = ['gacha'];
handler.command = ['trade', 'intercambiar'];
handler.group = true;

export default handler;