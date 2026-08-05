import fetch from 'node-fetch'
import { resolveLidToPnJid, normalizeNumber } from '../handler.js'

const fetchReactions = async (cat) => {
    try {
        const response = await fetch('https://cdn.ryuzei.xyz/files/reactions.json')
        if (!response.ok) return null
        const data = await response.json()
        return data[cat] || null
    } catch {
        return null
    }
}

const fetchTenor = async (query) => {
    try {
        const res = await fetch(`${global.APIs.delirius.url}/search/tenor?q=${query}`)
        if (!res.ok) return null
        const json = await res.json()
        return json.data || null
    } catch {
        return null
    }
}

let handler = async (m, { conn, command, usedPrefix, args }) => {
    const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.msg?.contextInfo
    const q = args[0]
    let rawtarget = (m.mentionedJid && m.mentionedJid.length > 0) ? m.mentionedJid : contextInfo?.mentionedJid

    let targetRaw = m.quoted?.sender || rawtarget?.[0] || contextInfo?.participant || (q ? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender)

    const resolvedJid = await resolveLidToPnJid(conn, m.chat, targetRaw)
    const normalized = normalizeNumber(resolvedJid)
    let userId = normalized ? normalized + '@s.whatsapp.net' : targetRaw

    let senderResolved = await resolveLidToPnJid(conn, m.chat, m.sender)
    let senderNormalized = normalizeNumber(senderResolved)
    let senderJid = senderNormalized ? senderNormalized + '@s.whatsapp.net' : m.sender

    let from = await (async () => global.db.data.users[senderJid]?.name || (async () => { try { const n = await conn.getName(senderJid); return typeof n === 'string' && n.trim() ? n : senderJid.split('@')[0] } catch { return senderJid.split('@')[0] } })())()
    let whoName = await (async () => global.db.data.users[userId]?.name || (async () => { try { const n = await conn.getName(userId); return typeof n === 'string' && n.trim() ? n : userId.split('@')[0] } catch { return userId.split('@')[0] } })())()

    let who = userId
    let str, query, category

    switch (command) {
        case 'angry': case 'enojado':
            str = senderJid === who ? `\`${from}\` está enojado/a! 凸ಠ益ಠ)凸` : `\`${from}\` está enojado/a con \`${whoName}\`! 凸ಠ益ಠ)凸`
            query = 'anime angry'
            category = 'angry'
            break
        case 'bath': case 'bañarse':
            str = senderJid === who ? `\`${from}\` se está bañando! ٩(ˊᗜˋ )و` : `\`${from}\` está bañando a \`${whoName}\`! ٩(ˊᗜˋ )و`
            query = 'anime bath'
            category = 'bath'
            break
        case 'bite': case 'morder':
            str = senderJid === who ? `\`${from}\` se mordió a sí mismo/a! ≽^•⩊•^≼` : `\`${from}\` mordió a \`${whoName}\`! ≽^•⩊•^≼`
            query = 'anime bite'
            category = 'bite'
            break
        case 'bleh': case 'lengua':
            str = senderJid === who ? `\`${from}\` saca la lengua! (｡╹ω╹｡)` : `\`${from}\` le sacó la lengua a \`${whoName}\`! (｡╹ω╹｡)`
            query = 'anime bleh'
            category = 'bleh'
            break
        case 'blush': case 'sonrojarse':
            str = senderJid === who ? `\`${from}\` se sonrojó! ( ˶o˶˶o˶)` : `\`${from}\` se sonrojó por \`${whoName}\`! ( ˶o˶˶o˶)`
            query = 'anime blush'
            category = 'blush'
            break
        case 'bored': case 'aburrido':
            str = senderJid === who ? `\`${from}\` está aburrido/a! ( ¬_¬)` : `\`${from}\` está aburrido/a de \`${whoName}\`! ( ¬_¬)`
            query = 'anime bored'
            category = 'bored'
            break
        case 'clap': case 'aplaudir':
            str = senderJid === who ? `\`${from}\` está aplaudiendo! (୨୧•͈ᴗ•͈)` : `\`${from}\` está aplaudiendo por \`${whoName}\`! (୨୧•͈ᴗ•͈)`
            query = 'anime clap'
            category = 'clap'
            break
        case 'coffee': case 'cafe': case 'café':
            str = senderJid === who ? `\`${from}\` está tomando café! ٩(●ᴗ●)۶` : `\`${from}\` está tomando café con \`${whoName}\`! ٩(●ᴗ●)۶`
            query = 'anime coffee'
            category = 'coffee'
            break
        case 'cry': case 'llorar':
            str = senderJid === who ? `\`${from}\` está llorando! (╥_╥)` : `\`${from}\` está llorando por \`${whoName}\`! (╥_╥)`
            query = 'anime cry'
            category = 'cry'
            break
        case 'cuddle': case 'acurrucarse':
            str = senderJid === who ? `\`${from}\` se acurrucó con sí mismo/a! ꒰ঌ(˶ˆᗜˆ˵)໒꒱` : `\`${from}\` se acurrucó con \`${whoName}\`! ꒰ঌ(˶ˆᗜˆ˵)໒꒱`
            query = 'anime cuddle'
            category = 'cuddle'
            break
        case 'dance': case 'bailar':
            str = senderJid === who ? `\`${from}\` está bailando! (ﾉ^ヮ^)ﾉ*:・ﾟ✧` : `\`${from}\` está bailando con \`${whoName}\`! (ﾉ^ヮ^)ﾉ*:・ﾟ✧`
            query = 'anime dance'
            category = 'dance'
            break
        case 'drunk': case 'borracho':
            str = senderJid === who ? `\`${from}\` está borracho! (⸝⸝๑﹏๑⸝⸝)` : `\`${from}\` está borracho con \`${whoName}\`! (⸝⸝๑﹏๑⸝⸝)`
            query = 'anime drunk'
            category = 'drunk'
            break
        case 'eat': case 'comer':
            str = senderJid === who ? `\`${from}\` está comiendo! (っ˘ڡ˘ς)` : `\`${from}\` está comiendo con \`${whoName}\`! (っ˘ڡ˘ς)`
            query = 'anime eat'
            category = 'eat'
            break
        case 'facepalm': case 'palmada':
            str = senderJid === who ? `\`${from}\` se da una palmada en la cara! (ভ_ ভ) ރ` : `\`${from}\` se frustra y se da una palmada en la cara por \`${whoName}\`! (ভ_ ভ) ރ`
            query = 'anime facepalm'
            category = 'facepalm'
            break
        case 'happy': case 'feliz':
            str = senderJid === who ? `\`${from}\` está feliz! ٩(˶ˆᗜˆ˵)و` : `\`${from}\` está feliz por \`${whoName}\`! ٩(˶ˆᗜˆ˵)و`
            query = 'anime happy'
            category = 'happy'
            break
        case 'hug': case 'abrazar':
            str = senderJid === who ? `\`${from}\` se abrazó a sí mismo/a! (づ˶•༝•˶)づ♡` : `\`${from}\` abrazó a \`${whoName}\`! (づ˶•༝•˶)づ♡`
            query = 'anime hug'
            category = 'hug'
            break
        case 'kill': case 'matar':
            str = senderJid === who ? `\`${from}\` se mató a sí mismo/a! ( ⚆ _ ⚆ )` : `\`${from}\` mató a \`${whoName}\`! ( ⚆ _ ⚆ )`
            query = 'anime kill'
            category = 'kill'
            break
        case 'kiss': case 'muak':
            str = senderJid === who ? `\`${from}\` se besó a sí mismo/a! ( ˘ ³˘)♥` : `\`${from}\` besó a \`${whoName}\`! ( ˘ ³˘)♥`
            query = 'anime kiss'
            category = 'kiss'
            break
        case 'laugh': case 'reirse':
            str = senderJid === who ? `\`${from}\` se ríe! (≧▽≦)` : `\`${from}\` se está riendo de \`${whoName}\`! (≧▽≦)`
            query = 'anime laugh'
            category = 'laugh'
            break
        case 'lick': case 'lamer':
            str = senderJid === who ? `\`${from}\` se lamió a sí mismo/a!（＾ω＾）` : `\`${from}\` lamió a \`${whoName}\`!（＾ω＾）`
            query = 'anime lick'
            category = 'lick'
            break
        case 'slap': case 'bofetada':
            str = senderJid === who ? `\`${from}\` se golpeó a sí mismo/a! ᕙ(⇀‸↼‵‵)ᕗ` : `\`${from}\` le dio una bofetada a \`${whoName}\`! ᕙ(⇀‸↼‵‵)ᕗ`
            query = 'anime slap'
            category = 'slap'
            break
        case 'sleep': case 'dormir':
            str = senderJid === who ? `\`${from}\` está durmiendo profundamente! (∪｡∪)｡｡｡zzz` : `\`${from}\` duerme junto a \`${whoName}\`! (∪｡∪)｡｡｡zzz`
            query = 'anime sleep'
            category = 'sleep'
            break
        case 'smoke': case 'fumar':
            str = senderJid === who ? `\`${from}\` está fumando! (￣ー￣)_旦~` : `\`${from}\` está fumando con \`${whoName}\`! (￣ー￣)_旦~`
            query = 'anime smoke'
            category = 'smoke'
            break
        case 'spit': case 'escupir':
            str = senderJid === who ? `\`${from}\` se escupió a sí mismo/a! ٩(๑˘^˘๑)۶` : `\`${from}\` escupió a \`${whoName}\`! ٩(๑˘^˘๑)۶`
            query = 'anime spit'
            category = 'spit'
            break
        case 'step': case 'pisar':
            str = senderJid === who ? `\`${from}\` se pisó a sí mismo/a! ಥ_ಥ` : `\`${from}\` pisó a \`${whoName}\` sin piedad!`
            query = 'anime step'
            category = 'step'
            break
        case 'think': case 'pensar':
            str = senderJid === who ? `\`${from}\` está pensando! (⸝⸝╸-╺⸝⸝)` : `\`${from}\` está pensando en \`${whoName}\`! (⸝⸝╸-╺⸝⸝)`
            query = 'anime think'
            category = 'think'
            break
        case 'love': case 'enamorado': case 'enamorada':
            str = senderJid === who ? `\`${from}\` está enamorado/a de sí mismo/a! (≧◡≦) ♡` : `\`${from}\` está enamorado/a de \`${whoName}\`! (≧◡≦) ♡`
            query = 'anime love'
            category = 'love'
            break
        case 'pat': case 'palmadita':
            str = senderJid === who ? `\`${from}\` se da palmaditas de autoapoyo! ଘ(੭ˊᵕˋ)੭` : `\`${from}\` acaricia suavemente a \`${whoName}\`! ଘ(੭ˊᵕˋ)੭`
            query = 'anime pat'
            category = 'pat'
            break
        case 'poke': case 'picar':
            str = senderJid === who ? `\`${from}\` se da un toque curioso! (,,◕.◕,,)` : `\`${from}\` da un golpecito a \`${whoName}\`! (,,◕.◕,,)`
            query = 'anime poke'
            category = 'poke'
            break
        case 'pout': case 'pucheros':
            str = senderJid === who ? `\`${from}\` hace pucheros! (๑•́ ₃ •̀๑)` : `\`${from}\` está haciendo pucheros por \`${whoName}\`! (๑•́ ₃ •̀๑)`
            query = 'anime pout'
            category = 'pout'
            break
        case 'punch': case 'pegar': case 'golpear':
            str = senderJid === who ? `\`${from}\` se golpeó a sí mismo/a! (ദി˙ᗜ˙)` : `\`${from}\` golpea a \`${whoName}\` con todas sus fuerzas! (ദ്ദി˙ᗜ˙)`
            query = 'anime punch'
            category = 'punch'
            break
        case 'preg': case 'preñar': case 'embarazar':
            str = senderJid === who ? `\`${from}\` se embarazó solito/a... misterioso! (¬ω¬)` : `\`${from}\` le regaló 9 meses de espera a \`${whoName}\`! (¬ω¬)`
            query = 'anime preg'
            category = 'preg'
            break
        case 'run': case 'correr':
            str = senderJid === who ? `\`${from}\` está haciendo cardio... o eso dice! ┗(＾0＾)┓` : `\`${from}\` sale disparado/a al ver a \`${whoName}\` acercarse! ┗(＾0＾)┓`
            query = 'anime run'
            category = 'run'
            break
        case 'sad': case 'triste':
            str = senderJid === who ? `\`${from}\` contempla la lluvia con expresión triste! (｡•́︿•̀｡)` : `\`${from}\` mira por la ventana y piensa en \`${whoName}\`! (｡•́︿•̀｡)`
            query = 'anime sad'
            category = 'sad'
            break
        case 'scared': case 'asustada': case 'asustado':
            str = senderJid === who ? `\`${from}\` se asusta! (꒪ཀ꒪)` : `\`${from}\` está aterrorizado/a de \`${whoName}\`! (꒪ཀ꒪)`
            query = 'anime scared'
            category = 'scared'
            break
        case 'seduce': case 'seducir':
            str = senderJid === who ? `\`${from}\` susurra versos de amor al aire! ( ͡° ͜ʖ ͡°)` : `\`${from}\` lanza una mirada que derrite a \`${whoName}\`! ( ͡° ͜ʖ ͡°)`
            query = 'anime seduce'
            category = 'seduce'
            break
        case 'shy': case 'timido': case 'timida':
            str = senderJid === who ? `\`${from}\` no sabe cómo actuar... se pone rojo/a! (⸝⸝⸝-﹏-⸝⸝⸝)` : `\`${from}\` baja la mirada tímidamente frente a \`${whoName}\`! (⸝⸝⸝-﹏-⸝⸝⸝)`
            query = 'anime shy'
            category = 'shy'
            break
        case 'walk': case 'caminar':
            str = senderJid === who ? `\`${from}\` pasea! ┌( ಠ‿ಠ)┘` : `\`${from}\` está caminando con \`${whoName}\`! ┌( ಠ‿ಠ)┘`
            query = 'anime walk'
            category = 'walk'
            break
        case 'dramatic': case 'drama':
            str = senderJid === who ? `\`${from}\` está montando un show digno de un Oscar! (┬┬﹏┬┬)` : `\`${from}\` está actuando dramáticamente por \`${whoName}\`! (┬┬﹏┬┬)`
            query = 'anime dramatic'
            category = 'dramatic'
            break
        case 'kisscheek':
            str = senderJid === who ? `\`${from}\` se besó la mejilla con cariño! (˶ ˘ ³˘)` : `\`${from}\` besó la mejilla de \`${whoName}\` con ternura! (˶ ˘ ³˘)`
            query = 'anime kiss cheek'
            category = 'kisscheek'
            break
        case 'wink': case 'guiñar':
            str = senderJid === who ? `\`${from}\` se guiñó el ojo a sí mismo/a en el espejo! (⸝⸝> ᴗ•⸝⸝)` : `\`${from}\` le guiñó el ojo a \`${whoName}\`! (⸝⸝> ᴗ•⸝⸝)`
            query = 'anime wink'
            category = 'wink'
            break
        case 'cringe': case 'avergonzarse':
            str = senderJid === who ? `\`${from}\` siente cringe! (ᇂ_ᇂ|||)` : `\`${from}\` siente cringe por \`${whoName}\`! (ᇂ_ᇂ|||)`
            query = 'anime cringe'
            category = 'cringe'
            break
        case 'smug': case 'presumir':
            str = senderJid === who ? `\`${from}\` está presumiendo mucho últimamente! convention(๑•ᴗ•๑)ଓ` : `\`${from}\` está presumiendo a \`${whoName}\`! ପ(๑•ᴗ•๑)ଓ`
            query = 'anime smug'
            category = 'smug'
            break
        case 'smile': case 'sonreir':
            str = senderJid === who ? `\`${from}\` está sonriendo! ( ˶ˆᗜˆ˵ )` : `\`${from}\` le sonrió a \`${whoName}\`! ( ˶ˆᗜˆ˵ )`
            query = 'anime smile'
            category = 'smile'
            break
        case 'highfive': case '5':
            str = senderJid === who ? `\`${from}\` se chocó los cinco frente al espejo! (•̀o•́)ง` : `\`${from}\` chocó los 5 con \`${whoName}\`! (•̀o•́)ง٩(ˊᗜˋ)`
            query = 'anime highfive'
            category = 'highfive'
            break
        case 'handhold': case 'mano':
            str = senderJid === who ? `\`${from}\` se dio la mano consigo mismo/a! (∩•̀ω•́)⊃` : `\`${from}\` le agarró la mano a \`${whoName}\`! (∩•̀ω•́)⊃`
            query = 'anime handhold'
            category = 'handhold'
            break
        case 'bullying': case 'bully':
            str = senderJid === who ? `\`${from}\` se hace bullying solo… alguien abrácelo! ༼ ಠДಠ ༽` : `\`${from}\` le está haciendo bullying a \`${whoName}\`! ༼ ಠДಠ ༽`
            query = 'anime bullying'
            category = 'bullying'
            break
        case 'wave': case 'hola': case 'ola':
            str = senderJid === who ? `\`${from}\` se saludó a sí mismo/a en el espejo! (๑˃̵ᴗ˂̵)و` : `\`${from}\` está saludando a \`${whoName}\`! (๑˃̵ᴗ˂̵)و`
            query = 'anime wave'
            category = 'wave'
            break
    }

    if (!m.isGroup) return

    try {
        let videoUrl = null

        const reactionsData = await fetchReactions(category)
        if (reactionsData && reactionsData.length > 0) {
            const randomItem = reactionsData[Math.floor(Math.random() * reactionsData.length)]
            videoUrl = randomItem.url
        }

        if (!videoUrl) {
            const gifs = await fetchTenor(query)
            if (gifs && gifs.length > 0) {
                videoUrl = gifs[Math.floor(Math.random() * gifs.length)].mp4
            }
        }

        if (!videoUrl) return m.reply('ꕥ No se encontraron resultados.')

        await conn.sendMessage(m.chat, { video: { url: videoUrl }, gifPlayback: true, caption: str, mentions: [who] }, { quoted: m })
    } catch (e) {
        return m.reply(`⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`)
    }
}

handler.help = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'facepalm', 'palmada', 'happy', 'feliz', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'poke', 'picar', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'ola', 'wave', 'hola']
handler.tags = ['anime']
handler.command = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'facepalm', 'palmada', 'happy', 'feliz', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'poke', 'picar', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'ola', 'wave', 'hola']
handler.group = true

export default handler
