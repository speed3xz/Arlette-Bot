import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

// Función para convertir un video a GIF temporalmente
async function convertVideoToGif(videoUrl) {
  const res = await fetch(videoUrl)
  const videoBuffer = await res.arrayBuffer()
  const tempVideoPath = path.join(process.cwd(), 'temp_video.mp4')
  const tempGifPath = path.join(process.cwd(), 'temp_gif.gif')

  // Guardar el video temporal
  fs.writeFileSync(tempVideoPath, Buffer.from(videoBuffer))

  return new Promise((resolve, reject) => {
    // Usa ffmpeg para convertirlo a gif (asegúrate que ffmpeg esté instalado en tu servidor)
    exec(`ffmpeg -t 5 -i ${tempVideoPath} -vf "fps=10,scale=320:-1:flags=lanczos" -y ${tempGifPath}`, (error) => {
      if (error) {
        console.error('Error al convertir el video a gif:', error)
        reject(error)
      } else {
        const gifBuffer = fs.readFileSync(tempGifPath)
        // Eliminar archivos temporales
        fs.unlinkSync(tempVideoPath)
        fs.unlinkSync(tempGifPath)
        resolve(gifBuffer)
      }
    })
  })
}

let handler = async (m, { conn, args }) => {
  try {
    let mentionedJid = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = Object.values(global.plugins).filter(v => v.help && v.tags).length

    const botname = global.botname || 'MiBot'
    const vs = global.vs || '1.0.0'
    const uptime = `${Math.floor(process.uptime() / 60)}m`
    
    // Lista de videos (para convertir en GIF)
    const videoUrls = [
      'https://files.catbox.moe/60kkig.mp4',
      'https://files.catbox.moe/w0y62q.mp4',
      'https://files.catbox.moe/ow33ku.mp4',
      'https://files.catbox.moe/m7xgkn.mp4'
    ]

    const randomVideo = videoUrls[Math.floor(Math.random() * videoUrls.length)]

    let txt = `
「🎀」 ¡Hola *@${mentionedJid.split('@')[0]}*,
Soy *${botname}*, aquí tienes la lista de comandos disponibles.

✧ *Usuarios:* ${totalreg}
✧ *Comandos:* ${totalCommands}
✧ *Versión:* ${vs}
✧ *Uptime:* ${uptime}
✧ *Modo:* Público
✧ *Baileys:* Multi Device

Usa /help o /menu para ver todos los comandos.`.trim()

    // Convertir video a gif
    const gifBuffer = await convertVideoToGif(randomVideo)

    // Reaccionar
    await conn.sendMessage(m.chat, {
      react: {
        text: '⭐',
        key: m.key
      }
    })

    // Enviar mensaje con el gif
    await conn.sendMessage(m.chat, {
      video: gifBuffer,
      gifPlayback: true,
      caption: txt,
      contextInfo: {
        mentionedJid: [mentionedJid],
        externalAdReply: {
          title: botname,
          body: 'Menú de comandos',
          mediaType: 1,
          thumbnailUrl: randomVideo,
          sourceUrl: 'https://github.com/' // Puedes cambiar este link
        }
      }
    })

  } catch (err) {
    console.error(err)
    m.reply('❌ Ocurrió un error al generar el menú.')
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'help', 'comandos']

export default handler
