// Creado por Speed3xz
// Api by russellxz
import fetch from "node-fetch"
import yts from "yt-search"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const API_BASE = "https://api-sky.ultraplus.click"
const API_KEY = "Russellxz"

async function skyYT(url, format) {
  const response = await fetch(`${API_BASE}/api/download/yt.php?url=${encodeURIComponent(url)}&format=${format}`, {
    headers: { 
      Authorization: `Bearer ${API_KEY}`
    },
    timeout: 30000
  })
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  
  const data = await response.json()
  if (!data || data.status !== "true" || !data.data) throw new Error(data?.error || "Error en la API")
  
  return data.data
}

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `✧ 𝙃𝙚𝙮! Debes escribir *el nombre o link* del video/audio para descargar.`, m)
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key }})

    let videoIdToFind = text.match(youtubeRegexID)
    let searchResults = await yts(videoIdToFind ? "https://youtu.be/" + videoIdToFind[1] : text)
    
    let ytplay2 = searchResults.videos?.[0] || searchResults.all?.[0]
    if (!ytplay2) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
      return m.reply("⚠︎ No encontré resultados, intenta con otro nombre o link.")
    }

    let { title, thumbnail, timestamp, views, ago, url, author } = ytplay2
    const vistas = formatViews(views)
    const canal = author?.name || "Desconocido"

    const infoMessage = `
╭──❀ Detalles del contenido ❀──╮
🎀 Título » *${title}*  
🌸 Canal » *${canal}*  
🍃 Vistas » *${vistas}*  
⏳ Duración » *${timestamp}*  
🗓️ Publicado » *${ago}*  
🔗 Link » *${url}*  
╰──────────────────────╯

> 𐙚🌷 ｡･ﾟ✧ Preparando tu descarga... ˙𐙚🌸
    `.trim()

    // Enviar mensaje con imagen y detalles
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: infoMessage
    }, { quoted: m })

    // Descargar y enviar directamente
    if (["play", "ytaudio", "yta", "ytmp3", "mp3"].includes(command)) {
      try {
        const d = await skyYT(url, "audio")
        const mediaUrl = d.audio || d.video
        if (!mediaUrl) throw new Error("No se obtuvo URL de audio")
        
        await conn.sendMessage(m.chat, {
          audio: { url: mediaUrl },
          fileName: `${title}.mp3`,
          mimetype: "audio/mpeg",
          ptt: false
        }, { quoted: m })
        
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})
      } catch (error) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
        return conn.reply(m.chat, "✦ Error al descargar el audio. Intenta más tarde.", m)
      }
    }
    else if (["play2", "ytmp4", "ytv", "mp4"].includes(command)) {
      try {
        const d = await skyYT(url, "video")
        const mediaUrl = d.video || d.audio
        if (!mediaUrl) throw new Error("No se obtuvo URL de video")
        
        await conn.sendMessage(m.chat, {
          video: { url: mediaUrl },
          fileName: `${title}.mp4`,
          caption: `${title}`,
          mimetype: "video/mp4"
        }, { quoted: m })
        
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})
      } catch (error) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
        return conn.reply(m.chat, "✦ Error al descargar el video. Intenta más tarde.", m)
      }
    }

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
    return m.reply(`⚠︎ Error inesperado:\n\n${error.message}`)
  }
}

handler.command = handler.help = ["play", "ytaudio", "yta", "ytmp3", "mp3", "play2", "ytmp4", "ytv", "mp4"]
handler.tags = ["descargas"]

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k`
  return views.toString()
}
