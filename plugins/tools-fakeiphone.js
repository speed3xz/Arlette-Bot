import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  try {
    // Verificar si se proporcionó texto
    if (!text) {
      return await conn.reply(m.chat, 
        `📱 *Crear Captura iPhone WhatsApp*\n\n` +
        `💡 *Uso:* /fakewspp <texto>\n` +
        `📝 *Ejemplo:* /fakewspp Hola, ¿cómo estás?\n\n` +
        `🕒 *Hora automática:* Se detecta tu zona horaria`,
        m, ctxWarn
      )
    }

    await conn.reply(m.chat, '🎀 Creando captura de iPhone...', m, ctxOk)

    // Detectar país y zona horaria del usuario
    let userTimeZone = 'America/Mexico_City' // Por defecto
    
    try {
      // Intentar detectar desde el número del usuario
      if (m.sender) {
        const countryCode = m.sender.split('@')[0].slice(0, 3)
        
        // Mapeo de códigos de país a zonas horarias
        const timeZones = {
          '521': 'America/Mexico_City',    // México
          '521': 'America/Mexico_City',    // México
          '549': 'America/Argentina/Buenos_Aires', // Argentina
          '541': 'America/Argentina/Buenos_Aires', // Argentina
          '593': 'America/Guayaquil',      // Ecuador
          '591': 'America/La_Paz',         // Bolivia
          '573': 'America/Bogota',         // Colombia
          '507': 'America/Panama',         // Panamá
          '506': 'America/Costa_Rica',     // Costa Rica
          '503': 'America/El_Salvador',    // El Salvador
          '502': 'America/Guatemala',      // Guatemala
          '501': 'America/Belize',         // Belize
          '505': 'America/Managua',        // Nicaragua
          '504': 'America/Tegucigalpa',    // Honduras
          '598': 'America/Montevideo',     // Uruguay
          '595': 'America/Asuncion',       // Paraguay
          '562': 'America/Santiago',       // Chile
          '511': 'America/Lima',           // Perú
          '51': 'America/Lima',            // Perú
          '52': 'America/Mexico_City',     // México
          '53': 'America/Havana',          // Cuba
          '54': 'America/Argentina/Buenos_Aires', // Argentina
          '55': 'America/Sao_Paulo',       // Brasil
          '56': 'America/Santiago',        // Chile
          '57': 'America/Bogota',          // Colombia
          '58': 'America/Caracas',         // Venezuela
          '34': 'Europe/Madrid',           // España
          '1': 'America/New_York',         // USA/Canada
          '44': 'Europe/London',           // UK
        }
        
        userTimeZone = timeZones[countryCode] || 'America/Mexico_City'
      }
    } catch (e) {
      userTimeZone = 'America/Mexico_City'
    }

    // Obtener hora actual según la zona horaria detectada
    let horaUsuario = new Date().toLocaleTimeString('es-ES', { 
      timeZone: userTimeZone,
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })

    // Formatear hora en formato 12h (más natural para WhatsApp)
    let horaFormateada = new Date().toLocaleTimeString('es-ES', { 
      timeZone: userTimeZone,
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })

    // URL de la API con los parámetros corregidos
    let apiUrl = `https://api.zenzxz.my.id/api/maker/fakechatiphone?text=${encodeURIComponent(text)}&chatime=${encodeURIComponent(horaUsuario)}&statusbartime=${encodeURIComponent(horaUsuario)}`

    // Enviar la imagen
    await conn.sendFile(m.chat, apiUrl, 'fakewspp.jpg', 
      `📱 *Captura iPhone WhatsApp*\n\n` +
      `💬 *Mensaje:* ${text}\n` +
      `🕒 *Hora:* ${horaFormateada}\n` +
      `🌍 *Zona horaria detectada*\n\n` +
      `✨ *Captura generada exitosamente*`,
      m, ctxOk
    )

  } catch (error) {
    console.error('Error en fakewspp:', error)
    await conn.reply(m.chat, 
      `❌ *Error al crear captura*\n\n` +
      `🔧 *Detalle:* ${error.message}\n\n` +
      `💡 *Solución:* Intenta con un texto más corto o vuelve a intentarlo`,
      m, ctxErr
    )
  }
}

handler.help = ['fakewspp']
handler.tags = ['maker']
handler.command = ['fakewspp', 'fakeiphone', 'fakewhatsapp', 'iphonefake']

export default handler
