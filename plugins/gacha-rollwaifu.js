import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const charactersFilePath = './menu/characters.json'
const haremFilePath = './menu/harem.json'

const cooldowns = {}

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        const characters = JSON.parse(data)
        
        if (!Array.isArray(characters) || characters.length === 0) {
            throw new Error('El archivo characters.json está vacío o no es un array válido')
        }
        
        return characters
    } catch (error) {
        console.error('Error loading characters:', error)
        throw new Error('❀ No se pudo cargar el archivo characters.json o está vacío.')
    }
}

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
    } catch (error) {
        throw new Error('❀ No se pudo guardar el archivo characters.json.')
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        return []
    }
}

async function saveHarem(harem) {
    try {
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8')
    } catch (error) {
        throw new Error('❀ No se pudo guardar el archivo harem.json.')
    }
}

let handler = async (m, { conn }) => {
    const userId = m.sender
    const now = Date.now()

    if (cooldowns[userId] && now < cooldowns[userId]) {
        const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000)
        const minutes = Math.floor(remainingTime / 60)
        const seconds = remainingTime % 60
        return await conn.reply(m.chat, `《✧》Debes esperar *${minutes} minutos y ${seconds} segundos* para usar */rw* de nuevo.`, m)
    }

    try {
        const characters = await loadCharacters()
        
        if (!characters || characters.length === 0) {
            return await conn.reply(m.chat, '❀ No hay personajes disponibles en la base de datos.', m)
        }

        const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
        
        if (!randomCharacter || !randomCharacter.img || !Array.isArray(randomCharacter.img)) {
            console.error('Personaje inválido:', randomCharacter)
            return await conn.reply(m.chat, '❀ Error: Personaje con datos incompletos.', m)
        }

        const randomImage = randomCharacter.img[Math.floor(Math.random() * randomCharacter.img.length)]
        
        if (!randomImage) {
            return await conn.reply(m.chat, '❀ Error: No se encontró imagen para este personaje.', m)
        }

        const harem = await loadHarem()
        const userEntry = harem.find(entry => entry.characterId === randomCharacter.id)
        const statusMessage = randomCharacter.user 
            ? `Reclamado por @${randomCharacter.user.split('@')[0]}` 
            : 'Libre'

        const message = `❀ Nombre » *${randomCharacter.name || 'Desconocido'}*
⚥ Género » *${randomCharacter.gender || 'No especificado'}*
✰ Valor » *${randomCharacter.value || 'N/A'}*
♡ Estado » ${statusMessage}
❖ Fuente » *${randomCharacter.source || 'Desconocida'}*
✦ ID: *${randomCharacter.id || 'N/A'}*`

        const mentions = userEntry ? [userEntry.userId] : []
        
        // SOLUCIÓN: Enviar la imagen directamente desde la URL sin descargar
        await conn.sendMessage(m.chat, {
            image: { url: randomImage },
            caption: message,
            mentions: mentions
        }, { quoted: m })

        if (!randomCharacter.user) {
            await saveCharacters(characters)
        }

        cooldowns[userId] = now + 15 * 60 * 1000

    } catch (error) {
        console.error('Error en el handler:', error)
        
        // Mensaje de error más específico
        let errorMessage = `✘ Error al cargar el personaje: ${error.message}`
        if (error.message.includes('ENOENT')) {
            errorMessage = '✘ Error: Problema con el acceso a archivos temporales. Contacta al administrador.'
        }
        
        await conn.reply(m.chat, errorMessage, m)
    }
}

handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha']
handler.command = ['ver', 'rw', 'rollwaifu']
handler.group = true

export default handler
