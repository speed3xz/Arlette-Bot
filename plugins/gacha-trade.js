import { promises as fs } from 'fs';

let pendingTrade = {};

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
    const ctxErr = (global.rcanalx || {});
    const ctxWarn = (global.rcanalw || {});
    const ctxOk = (global.rcanalr || {});
    
    const currency = '¥';
    
    try {
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return await conn.reply(m.chat, 'ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*', m, ctxWarn);
        }

        if (!args.length || !text.includes('/')) {
            return await conn.reply(m.chat, '❀ Debes especificar dos personajes para intercambiarlos.\n> ✐ Ejemplo: *' + (usedPrefix + command) + ' PersonajeA / PersonajeB*\n> Donde "PersonajeA" es el personaje que quieres intercambiar y "PersonajeB" es el personaje que quieres recibir.', m, ctxErr);
        }

        const tradeText = text.slice(text.indexOf(' ') + 1).trim();
        const [characterAGive, characterBGet] = tradeText.split('/').map(name => name.trim().toLowerCase());

        const characters = global.db?.data?.characters || {};
        
        // Búsqueda optimizada de personajes
        const characterEntries = Object.entries(characters);
        const characterAEntry = characterEntries.find(([id, char]) => 
            (char?.name || '').toLowerCase() === characterAGive && 
            char?.user === m.sender
        );
        
        const characterBEntry = characterEntries.find(([id, char]) => 
            (char?.name || '').toLowerCase() === characterBGet
        );

        if (!characterAEntry || !characterBEntry) {
            const missingChar = !characterAEntry ? characterAGive : characterBGet;
            return await conn.reply(m.chat, 'ꕥ No se ha encontrado al personaje *' + missingChar + '*.', m, ctxErr);
        }

        const [characterAId, characterA] = characterAEntry;
        const [characterBId, characterB] = characterBEntry;
        const characterAValue = typeof characterA.value === 'number' ? characterA.value : 0;
        const characterBValue = typeof characterB.value === 'number' ? characterB.value : 0;

        if (characterB.user === m.sender) {
            return await conn.reply(m.chat, 'ꕥ El personaje *' + characterB.name + '* ya está reclamado por ti.', m, ctxErr);
        }

        if (!characterB.user) {
            return await conn.reply(m.chat, 'ꕥ El personaje *' + characterB.name + '* no está reclamado por nadie.', m, ctxErr);
        }

        if (!characterA.user || characterA.user !== m.sender) {
            return await conn.reply(m.chat, 'ꕥ El personaje *' + characterA.name + '* no está reclamado por ti.', m, ctxErr);
        }

        const targetUser = characterB.user;

        const getUserName = async (userId) => {
            try {
                return global.db?.data?.users?.[userId]?.name?.trim() || 
                       (await conn.getName(userId)) || 
                       userId.split('@')[0];
            } catch {
                return userId.split('@')[0];
            }
        };

        const [senderName, targetName] = await Promise.all([
            getUserName(m.sender),
            getUserName(targetUser)
        ]);

        // Limpiar trade anterior si existe
        if (pendingTrade[targetUser]) {
            clearTimeout(pendingTrade[targetUser].timeout);
        }

        pendingTrade[targetUser] = {
            from: m.sender,
            to: targetUser,
            chat: m.chat,
            give: characterAId,
            get: characterBId,
            timestamp: Date.now(),
            timeout: setTimeout(() => {
                delete pendingTrade[targetUser];
            }, 60000)
        };

        await conn.reply(
            m.chat, 
            '「✿」 *' + targetName + '* puede aceptar la solicitud de intercambio.\n\n✦ [' + targetName + '] *' + characterB.name + '* (' + characterBValue + ')\n✦ [' + senderName + '] *' + characterA.name + '* (' + characterAValue + ')\n\n✐ Para aceptar el intercambio responde a este mensaje con "aceptar", la solicitud expira en 60 segundos.',
            m, 
            { mentions: [targetUser] },
            ctxOk
        );

    } catch (error) {
        console.error('Error en handler de intercambio:', error);
        await conn.reply(m.chat, '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, m, ctxErr);
    }
};

// Handler para aceptar intercambios
handler.before = async (m, { conn }) => {
    const ctxErr = (global.rcanalx || {});
    const ctxWarn = (global.rcanalw || {});
    const ctxOk = (global.rcanalr || {});
    
    try {
        if (m.text.trim().toLowerCase() !== 'aceptar') return;

        const tradeEntry = Object.entries(pendingTrade).find(([_, trade]) => 
            trade.chat === m.chat && Date.now() - trade.timestamp < 60000
        );
        
        if (!tradeEntry) return;

        const [targetUser, tradeData] = tradeEntry;

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
            return await conn.reply(m.chat, 'ꕥ Solo *' + targetName + '* puede aceptar la solicitud.', m, ctxWarn);
        }

        const characters = global.db?.data?.characters || {};
        const characterGive = characters[tradeData.give];
        const characterGet = characters[tradeData.get];

        if (!characterGive || !characterGet || 
            characterGive.user !== tradeData.from || 
            characterGet.user !== tradeData.to) {
            delete pendingTrade[targetUser];
            return await conn.reply(m.chat, '⚠︎ Uno de los personajes ya no está disponible para el intercambio.', m, ctxErr);
        }

        // Realizar intercambio de forma atómica
        const originalGiveUser = characterGive.user;
        const originalGetUser = characterGet.user;
        
        characterGive.user = tradeData.to;
        characterGet.user = tradeData.from;

        const senderUser = global.db?.data?.users?.[tradeData.from] || {};
        const targetUserData = global.db?.data?.users?.[tradeData.to] || {};

        if (!Array.isArray(senderUser.characters)) senderUser.characters = [];
        if (!Array.isArray(targetUserData.characters)) targetUserData.characters = [];

        // Actualizar arrays de personajes
        senderUser.characters = senderUser.characters.filter(id => id !== tradeData.give);
        targetUserData.characters = targetUserData.characters.filter(id => id !== tradeData.get);
        
        if (!targetUserData.characters.includes(tradeData.give)) {
            targetUserData.characters.push(tradeData.give);
        }
        if (!senderUser.characters.includes(tradeData.get)) {
            senderUser.characters.push(tradeData.get);
        }

        if (senderUser.favorite === tradeData.give) delete senderUser.favorite;
        if (targetUserData.favorite === tradeData.get) delete targetUserData.favorite;

        clearTimeout(tradeData.timeout);
        delete pendingTrade[targetUser];

        const getTradeUserName = async (userId) => {
            try {
                return global.db?.data?.users?.[userId]?.name?.trim() || 
                       (await conn.getName(userId)) || 
                       userId.split('@')[0];
            } catch {
                return userId.split('@')[0];
            }
        };

        const [senderTradeName, targetTradeName] = await Promise.all([
            getTradeUserName(tradeData.from),
            getTradeUserName(tradeData.to)
        ]);

        const characterGiveName = characterGive.name || 'PersonajeA';
        const characterGetName = characterGet.name || 'PersonajeB';

        await conn.reply(
            m.chat,
            '「✿」Intercambio aceptado!\n\n✦ ' + targetTradeName + ' » *' + characterGiveName + 
            '*\n✦ ' + senderTradeName + ' » *' + characterGetName + '*',
            m,
            ctxOk
        );

        return true;

    } catch (error) {
        console.error('Error en handler before:', error);
        await conn.reply(m.chat, '⚠︎ Se ha producido un problema.\n> Usa *report* para informarlo.\n\n' + error.message, m, ctxErr);
    }
};

handler.help = ['trade <PersonajeA> / <PersonajeB>'];
handler.tags = ['gacha'];
handler.command = ['trade', 'intercambiar'];
handler.group = true;

export default handler;
