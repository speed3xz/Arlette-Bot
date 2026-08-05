import fetch from 'node-fetch'

const categoryNames = new Map([
  ['main', '📌 Principal'],
  ['info', '📋 Información'],
  ['utilidades', '🛠️ Utilidades'],
  ['descargas', '📥 Descargas'],
  ['gacha', '🍡 Gacha'],
  ['bots', '🤖 Bots'],
  ['economia', '💸 Economía'],
  ['perfil', '👤 Perfil'],
  ['grupos', '👥 Grupos'],
  ['nsfw', '🍒 NSFW'],
  ['anime', '🌸 Anime'],
  ['misc', '🌀 Varios']
]);

function formatUptime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return (d > 0 ? `${d}d ` : '') + (h > 0 ? `${h}h ` : '') + (m > 0 ? `${m}m ` : '') + (s > 0 ? `${s}s` : '') || '0s';
}

let handler = async (m, { conn, args, usedPrefix }) => {
  let mentionedJid = await m.mentionedJid
  let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
  let totalreg = Object.keys(global.db?.data?.users || {}).length
  let totalCommands = Object.values(global.plugins || {}).filter((v) => v.help && v.tags).length
  let uptime = formatUptime(process.uptime())
  
  const memory = process.memoryUsage();
  const ramGB = (memory.rss / (1024 * 1024 * 1024)).toFixed(2);

  const botName = global.botname || 'Arepa Bot';
  let prefixUsed = usedPrefix || '.';

  const categorized = new Map();
  const processedCmds = new Set();
  const excludedTags = ['owner', 'creador', 'dev', 'developer'];

  for (const [_, plugin] of Object.entries(global.plugins || {})) {
    if (!plugin || !plugin.help || !plugin.tags || processedCmds.has(plugin)) continue;
    
    const tag = Array.isArray(plugin.tags) ? plugin.tags[0]?.toLowerCase() : String(plugin.tags).toLowerCase();
    
    if (excludedTags.includes(tag)) continue;
    
    processedCmds.add(plugin);
    if (!categorized.has(tag)) categorized.set(tag, []);
    categorized.get(tag).push(plugin);
  }

  const category = args[0]?.toLowerCase();
  
  if (category && (categoryNames.has(category) || categorized.has(category))) {
    const title = categoryNames.get(category) || `📁 ${category.toUpperCase()}`;
    const pluginList = categorized.get(category) || [];
    
    let subMenu = `🤖 *${botName}*\n`;
    subMenu += `👤 *Usuario:* @${userId.split('@')[0]}\n`;
    subMenu += `🔑 *Prefijo usado:* [ ${prefixUsed} ]\n`;
    subMenu += `⭐ *Usuarios:* ${totalreg.toLocaleString()}\n`;
    subMenu += `🍰 *Comandos:* ${totalCommands}\n`;
    subMenu += `⏱️ *Uptime:* ${uptime}\n`;
    subMenu += `💻 *RAM:* ${ramGB} GB\n\n`;
    subMenu += `*${title}*\n`;
    
    if (pluginList.length === 0) {
      subMenu += ` › No hay comandos disponibles.\n`;
    } else {
      for (const plugin of pluginList) {
        const helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help];
        for (const h of helps) {
          subMenu += ` › ${prefixUsed}${h}\n`;
        }
      }
    }

    let imageBuffer = null;
    try {
      const res = await fetch(global.banner);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
      }
    } catch {
      imageBuffer = null;
    }

    const messagePayload = imageBuffer ? {
      image: imageBuffer,
      caption: subMenu.trim(),
      mentions: [userId]
    } : {
      text: subMenu.trim(),
      mentions: [userId]
    };

    return await conn.sendMessage(m.chat, messagePayload, { quoted: m });
  }

  let fullMenuText = `🤖 *${botName}*\n`;
  fullMenuText += `👤 *Usuario:* @${userId.split('@')[0]}\n`;
  fullMenuText += `🔑 *Prefijo usado:* [ ${prefixUsed} ]\n`;
  fullMenuText += `⭐ Usuarios: ${totalreg.toLocaleString()}\n`;
  fullMenuText += `🍰 Comandos: ${totalCommands}\n`;
  fullMenuText += `⏱️ *Uptime:* ${uptime}\n`;
  fullMenuText += `💻 *RAM:* ${ramGB} GB\n`;

  for (const [tag, categoryTitle] of categoryNames.entries()) {
    if (categorized.has(tag) && !excludedTags.includes(tag)) {
      const pluginList = categorized.get(tag);
      fullMenuText += `\n*${categoryTitle}*\n`;
      
      for (const plugin of pluginList) {
        const helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help];
        for (const h of helps) {
          fullMenuText += ` › ${prefixUsed}${h}\n`;
        }
      }
    }
  }

  for (const [tag, pluginList] of categorized.entries()) {
    if (!categoryNames.has(tag) && !excludedTags.includes(tag)) {
      fullMenuText += `\n*📁 ${tag.toUpperCase()}*\n`;
      
      for (const plugin of pluginList) {
        const helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help];
        for (const h of helps) {
          fullMenuText += ` › ${prefixUsed}${h}\n`;
        }
      }
    }
  }

  let imageBuffer = null;
  try {
    const res = await fetch(global.banner);
    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuf);
    }
  } catch {
    imageBuffer = null;
  }

  const messagePayload = imageBuffer ? {
    image: imageBuffer,
    caption: fullMenuText.trim(),
    mentions: [userId]
  } : {
    text: fullMenuText.trim(),
    mentions: [userId]
  };

  await conn.sendMessage(m.chat, messagePayload, { quoted: m });
}

handler.help = ['menu', 'menú', 'help']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']

export default handler
