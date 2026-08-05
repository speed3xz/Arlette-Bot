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
    const claimCooldown = 30 * 60 * 1000;
    
    try {
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return m.reply('ꕥ Los comandos de *Gacha* estão desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
        }

        const currentUserData = global.db?.data?.users?.[m.sender] || {};
        const currentTime = Date.now();

        if (currentUserData.lastClaim && currentTime < currentUserData.lastClaim) {
            const remainingSeconds = Math.ceil((currentUserData.lastClaim - currentTime) / 1000);
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            
            let timeLeft = '';
            if (minutes > 0) timeLeft += minutes + ' minuto' + (minutes !== 1 ? 's' : '') + ' ';
            if (seconds > 0 || timeLeft === '') timeLeft += seconds + ' segundo' + (seconds !== 1 ? 's' : '');
            
            return m.reply('ꕥ Debes esperar *' + timeLeft.trim() + '* para usar *' + (usedPrefix + command) + '* de nuevo.');
        }

        const lastCharacterId = chatData.lastRolledCharacter?.id || '';
        
        const isValidQuoted = quoted?.id === chatData.lastRolledMsgId || 
                            quoted?.text?.includes(lastCharacterId);

        if (!isValidQuoted) {
            return m.reply('❀ Debes citar un personaje válido para reclamar.');
        }

        const characterId = chatData.lastRolledId;
        const charactersData = await loadCharacters();
        const characterData = getCharacterById(characterId, charactersData);

        if (!characterData) {
            return m.reply('ꕥ Personaje no encontrado en characters.json');
        }

        if (!global.db.data.characters) global.db.data.characters = {};
        if (!global.db.data.characters[characterId]) {
            global.db.data.characters[characterId] = {};
        }

        const dbCharacter = global.db.data.characters[characterId];
        
        dbCharacter.name = dbCharacter.name || characterData.name;
        dbCharacter.value = typeof dbCharacter.value === 'number' ? dbCharacter.value : characterData.value || 0;
        dbCharacter.votes = dbCharacter.votes || 0;

        const rollTime = chatData.lastRolledTime || 0;
        const rollUser = chatData.lastRolledUser || '';
        const protectionTime = 30 * 1000; // 30 segundos
        const expirationTimeLimit = 3 * 60 * 1000; // 3 minutos

        if (currentTime - rollTime > expirationTimeLimit) {
            return m.reply('ꕥ El personaje ha expirado porque nadie lo reclamó a tiempo.');
        }

        if (rollUser && rollUser !== m.sender && (currentTime - rollTime < protectionTime)) {
            const remainingProt = Math.ceil((rollTime + protectionTime - currentTime) / 1000);
            const getRollerName = async (userId) => {
                try {
                    return global.db?.data?.users?.[userId]?.name?.trim() || (await conn.getName(userId)) || userId.split('@')[0];
                } catch {
                    return userId.split('@')[0];
                }
            };
            const rollerName = await getRollerName(rollUser);
            return m.reply(`ꕥ Este personaje está protegido por *${rollerName}* durante *${remainingProt}s* más.`);
        }

        if (dbCharacter.user) {
            const getClaimantName = async (userId) => {
                try {
                    return global.db?.data?.users?.[userId]?.name?.trim() || 
                           (await conn.getName(userId)) || 
                           userId.split('@')[0];
                } catch {
                    return userId.split('@')[0];
                }
            };

            const claimantName = await getClaimantName(dbCharacter.user);
            return m.reply('ꕥ El personaje *' + dbCharacter.name + '* ya ha sido reclamado por *' + claimantName + '*');
        }

        dbCharacter.user = m.sender;
        dbCharacter.claimedAt = currentTime;
        
        currentUserData.lastClaim = currentTime + claimCooldown;

        if (!Array.isArray(currentUserData.characters)) {
            currentUserData.characters = [];
        }
        if (!currentUserData.characters.includes(characterId)) {
            currentUserData.characters.push(characterId);
        }

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

        const claimMessage = chatData.claimMessage ? 
            chatData.claimMessage
                .replace(/€user/g, '*' + currentUsername + '*')
                .replace(/€character/g, '*' + dbCharacter.name + '*') :
            '*' + dbCharacter.name + '* ha sido reclamado por *' + currentUsername + '*';

        await conn.reply(
            m.chat, 
            '❀ ' + claimMessage, 
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

handler.help = ['claim'];
handler.tags = ['gacha'];
handler.command = ['claim', 'c', 'reclamar'];
handler.group = true;

export default handler
