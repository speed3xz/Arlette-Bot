import { promises as fs } from 'fs';

const charactersFilePath = './menu/characters.json';
const haremFilePath = './menu/harem.json';

const cooldowns = {};

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('❀ No se pudo cargar el archivo characters.json.');
    }
}

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8');
    } catch (error) {
        throw new Error('❀ No se pudo guardar el archivo characters.json.');
    }
}

let handler = async (m, { conn }) => {
    const userId = m.sender;
    const now = Date.now();

    if (cooldowns[userId] && now < cooldowns[userId]) {
        const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000);
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        return await conn.reply(m.chat, `《✧》Debes esperar *${minutes} minutos y ${seconds} segundos* para usar *#c* de nuevo.`, m);
    }

    if (m.quoted && m.quoted.sender === conn.user.jid) {
        try {
            const characters = await loadCharacters();
            
            // Múltiples patrones para encontrar el ID
            const quotedText = m.quoted.text || '';
            let characterIdMatch = quotedText.match(/✦ ID: \*(.+?)\*/);
            
            // Si no encuentra con el primer patrón, busca otros formatos
            if (!characterIdMatch) {
                characterIdMatch = quotedText.match(/ID: \*(.+?)\*/);
            }
            if (!characterIdMatch) {
                characterIdMatch = quotedText.match(/✦ ID:\s*\*?(\d+)\*?/);
            }
            if (!characterIdMatch) {
                characterIdMatch = quotedText.match(/ID[\s:]*\*?(\d+)\*?/);
            }

            console.log('Texto citado:', quotedText); // Para debug
            console.log('Match encontrado:', characterIdMatch); // Para debug

            if (!characterIdMatch) {
                await conn.reply(m.chat, '《✧》No se pudo encontrar el ID del personaje en el mensaje citado. Asegúrate de citar un mensaje de personaje válido.', m);
                return;
            }

            const characterId = characterIdMatch[1].trim();
            const character = characters.find(c => c.id.toString() === characterId.toString());

            if (!character) {
                await conn.reply(m.chat, `《✧》No se encontró el personaje con ID: ${characterId}`, m);
                return;
            }

            if (character.user && character.user !== userId) {
                await conn.reply(m.chat, `《✧》El personaje ya ha sido reclamado por @${character.user.split('@')[0]}, inténtalo a la próxima :v.`, m, { mentions: [character.user] });
                return;
            }

            // Si el personaje ya fue reclamado por el mismo usuario
            if (character.user === userId) {
                await conn.reply(m.chat, `《✧》Ya tienes reclamado a *${character.name}*.`, m);
                return;
            }

            character.user = userId;
            // No modifiques el status si no existe esa propiedad
            if (character.status) {
                character.status = "Reclamado";
            }

            await saveCharacters(characters);

            await conn.reply(m.chat, `✦ Has reclamado a *${character.name}* con éxito.`, m);
            cooldowns[userId] = now + 30 * 60 * 1000;

        } catch (error) {
            console.error('Error en claim:', error);
            await conn.reply(m.chat, `✘ Error al reclamar el personaje: ${error.message}`, m);
        }

    } else {
        await conn.reply(m.chat, '《✧》Debes citar el mensaje del personaje que quieres reclamar.', m);
    }
};

handler.help = ['claim'];
handler.tags = ['gacha'];
handler.command = ['c', 'claim', 'reclamar'];
handler.group = true;

export default handler;