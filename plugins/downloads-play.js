import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const ctxErr = (global.rcanalx || {})
    const ctxWarn = (global.rcanalw || {})
    const ctxOk = (global.rcanalr || {})
    
    try {
        if (!text.trim()) return await conn.reply(m.chat, `❀ Por favor, ingresa el nombre de la música a descargar.`, m, ctxErr)
        await m.react('🕒')
        
        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)
        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
        if (!result) throw 'ꕥ No se encontraron resultados.'
        
        const { title, thumbnail, timestamp, views, ago, url, author, seconds } = result
        if (seconds > 1800) throw '⚠ El contenido supera el límite de duración (10 minutos).'
        
        const vistas = formatViews(views)
        const canal = author.name
        const info = `╭──❀ Detalles del contenido ❀──╮
🎀 Título » *${title}*  
🌸 Canal » *${canal}*  
🍃 Vistas » *${vistas}*  
⏳ Duración » *${timestamp}*  
🗓️ Publicado » *${ago}*  
🔗 Link » *${url}*  
╰──────────────────────╯

> 𐙚🌷 ｡･ﾟ✧ Preparando tu descarga... ˙𐙚🌸`
        
        const thumb = (await conn.getFile(thumbnail)).data
        
        // Enviar información y procesar descarga en paralelo
        const [_, mediaResult] = await Promise.all([
            conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m }),
            processDownload(command, url, title)
        ])
        
        if (!mediaResult?.url) throw '⚠ No se pudo obtener el contenido.'
        
        if (['play', 'yta', 'ytmp3', 'playaudio', 'ytaudio'].includes(command)) {
            await conn.sendMessage(m.chat, { 
                audio: { url: mediaResult.url }, 
                fileName: `${title}.mp3`, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m })
        } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
            await conn.sendFile(m.chat, mediaResult.url, `${title}.mp4`, `> ❀ ${title}`, m)
        }
        
        await m.react('✔️')
        
    } catch (e) {
        await m.react('✖️')
        return await conn.reply(m.chat, typeof e === 'string' ? e : '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + e.message, m, ctxErr)
    }
}

// Función optimizada para procesar descargas
async function processDownload(command, url, title) {
    if (['play', 'yta', 'ytmp3', 'playaudio', 'ytaudio'].includes(command)) {
        return await getAud(url)
    } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
        return await getVid(url)
    }
    return null
}

// APIs optimizadas con timeout más agresivo para audio
async function getAud(url) {
    const apis = [
        { api: 'ZenzzXD', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download_url, timeout: 6000 },
        { api: 'ZenzzXD v2', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp3v2?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download_url, timeout: 6000 },
        { api: 'Yupra', endpoint: `${global.APIs.yupra.url}/api/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.result?.link, timeout: 6000 },
        { api: 'Vreden', endpoint: `${global.APIs.vreden.url}/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}&quality=128`, extractor: res => res.result?.download?.url, timeout: 6000 },
        { api: 'Vreden v2', endpoint: `${global.APIs.vreden.url}/api/v1/download/play/audio?query=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url, timeout: 6000 },
        { api: 'Xyro', endpoint: `${global.APIs.xyro.url}/download/youtubemp3?url=${encodeURIComponent(url)}`, extractor: res => res.result?.download, timeout: 6000 }
    ]
    return await fetchFromApisOptimized(apis)
}

async function getVid(url) {
    const apis = [
        { api: 'ZenzzXD', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp4?url=${encodeURIComponent(url)}&resolution=360p`, extractor: res => res.data?.download_url, timeout: 10000 },
        { api: 'ZenzzXD v2', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp4v2?url=${encodeURIComponent(url)}&resolution=360`, extractor: res => res.data?.download_url, timeout: 10000 },
        { api: 'Yupra', endpoint: `${global.APIs.yupra.url}/api/downloader/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.result?.formats?.[0]?.url, timeout: 10000 },
        { api: 'Vreden', endpoint: `${global.APIs.vreden.url}/api/v1/download/youtube/video?url=${encodeURIComponent(url)}&quality=360`, extractor: res => res.result?.download?.url, timeout: 10000 },
        { api: 'Vreden v2', endpoint: `${global.APIs.vreden.url}/api/v1/download/play/video?query=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url, timeout: 10000 },
        { api: 'Xyro', endpoint: `${global.APIs.xyro.url}/download/youtubemp4?url=${encodeURIComponent(url)}&quality=360`, extractor: res => res.result?.download, timeout: 10000 }
    ]
    return await fetchFromApisOptimized(apis)
}

// Función optimizada con timeouts más rápidos
async function fetchFromApisOptimized(apis) {
    const promises = apis.map(async ({ api, endpoint, extractor, timeout }) => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeout)
            const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
            clearTimeout(timeoutId)
            const link = extractor(res)
            if (link) return { url: link, api }
        } catch (e) {
            return null
        }
    })
    
    const results = await Promise.allSettled(promises)
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
            return result.value
        }
    }
    return null
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
