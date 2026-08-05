import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text.trim()) return await conn.reply(m.chat, '*Ingresa el nombre o enlace del video a descargar.*', m)
        
        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)
        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
        if (!result) throw 'No se encontraron resultados.'
        
        const { title, thumbnail, timestamp, views, ago, url, author, seconds } = result
        if (seconds > 1800) throw 'El contenido supera el límite de duración.'
        
        const vistas = formatViews(views)
        const canal = author.name
        const info = `🎵 *Detalles de Descarga*

📌 *Título:* ${title}
👤 *Canal:* ${canal}
👁️ *Vistas:* ${vistas}
⏱️ *Duración:* ${timestamp}
📅 *Publicado:* ${ago}
🔗 *Enlace:* ${url}

Ejemplo: *${usedPrefix + command} ${text}*`
        
        const thumb = (await conn.getFile(thumbnail)).data
        
        const [_, mediaResult] = await Promise.all([
            conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m }),
            getMediaUrl(url)
        ])
        
        if (!mediaResult) throw 'No se pudo obtener el contenido.'
        
        if (['play', 'yta', 'ytmp3', 'playaudio', 'ytaudio'].includes(command)) {
            await conn.sendMessage(m.chat, { 
                audio: { url: mediaResult }, 
                fileName: `${title}.mp3`, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m })
        } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
            await conn.sendFile(m.chat, mediaResult, `${title}.mp4`, title, m)
        }
        
    } catch (e) {
        return await conn.reply(m.chat, typeof e === 'string' ? e : 'Ocurrió un error: ' + e.message, m)
    }
}

async function getMediaUrl(url) {
    try {
        const res = await fetch(`https://api.sventy.store/api/ytdl?url=${encodeURIComponent(url)}`).then(r => r.json())
        return res.data?.download || null
    } catch {
        return null
    }
}

function formatViews(views) {
    if (views === undefined) return "No disponible"
    if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
    return views.toString()
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4', 'ytaudio']
handler.tags = ['descargas']
handler.group = true

export default handler
