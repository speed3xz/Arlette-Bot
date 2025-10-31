import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  try {
    let timestamp = speed()
    await conn.reply(m.chat, '🎀 Calculando velocidad...', m, ctxOk)
    let latency = speed() - timestamp
    
    let ssd
    try {
      let stdout = execSync(`neofetch --stdout`).toString()
      ssd = stdout.replace(/Memory:/, "💾 RAM:")
        .replace(/OS:/, "🖥️ Sistema:")
        .replace(/Host:/, "🔧 Host:")
        .replace(/Kernel:/, "📦 Kernel:")
        .replace(/Uptime:/, "⏰ Activa:")
        .replace(/Shell:/, "🐚 Shell:")
        .replace(/Resolution:/, "🖼️ Resolución:")
        .replace(/Terminal:/, "💻 Terminal:")
        .replace(/CPU:/, "🚀 CPU:")
        .replace(/GPU:/, "🎮 GPU:")
        .replace(/Disk:/, "💿 Disco:")
    } catch (e) {
      ssd = `💾 RAM: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB\n🖥️ Sistema: ${process.platform} ${process.arch}`
    }

    let velocidad, emoji, estado
    if (latency < 200) {
      velocidad = '⚡ Rápida'
      emoji = '🎯'
      estado = '🟢 Óptima'
    } else if (latency < 500) {
      velocidad = '🔰 Estable' 
      emoji = '📊'
      estado = '🟡 Buena'
    } else {
      velocidad = '🐌 Lenta'
      emoji = '⏳'
      estado = '🔴 Regular'
    }

    let result = `
🌷 *Estado del Sistema*

📡 *Latencia:* ${latency.toFixed(4).split(".")[0]} ms
📈 *Velocidad:* ${velocidad}

${ssd}

✨ *Bot funcionando correctamente*
    `.trim()

    await conn.reply(m.chat, result, m, ctxOk)

  } catch (error) {
    console.error('Error en ping:', error)
    await conn.reply(m.chat, 
      `❌ *Error en el diagnóstico*\n\n` +
      `🔧 *Detalle:* ${error.message}\n\n` +
      `⚡ *Intenta nuevamente*`,
      m, ctxErr
    )
  }
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler
