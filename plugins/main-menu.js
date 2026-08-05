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

const randomEmojis = ['🍓', '🌸', '🌷', '🦋', '🍨', '🍧', '🍡', '🎀', '🍒', '⭐', '💫', '🧸'];
const getRandomEmoji = () => randomEmojis[Math.floor(Math.random() * randomEmojis.length)];

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

  const menuHeader = (userId) => `
「🎀」 ¡Hola! Soy *${global.botname || 'Bot'}*
> Aquí tienes la lista de comandos.

╭┈ ↷
│❀ *Modo* » Público
│ᰔ *Tipo* » ${(conn.user.jid == global.conn?.user?.jid ? 'Principal 🎀' : 'Sub-Bot 💗')}
│✰ *Usuarios* » ${totalreg.toLocaleString()}
│⚘ *Versión* » ${global.vs || '1.0.0'}
│ꕥ *Comandos* » ${totalCommands}
│⏱️ *Uptime* » ${uptime}
│🜸 Baileys » Multi Device
╰─────────────────
`.trim()

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
    
    let subMenu = `₊ ‧  ꒰${getRandomEmoji()}꒱  — \`『 ${title.toUpperCase()} 』\` \n> Comandos de la categoría *${category}*.\n`;
    
    if (pluginList.length === 0) {
      subMenu += `\n> ⚠️ No hay comandos disponibles en esta categoría.`;
    } else {
      for (const plugin of pluginList) {
        const helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help];
        for (const h of helps) {
          subMenu += ` */${h}*\n> ⚘ Comando disponible.\n`;
        }
      }
    }

    const txt = `${menuHeader(userId)}\n\n${subMenu}\n\n> ✐ Powered By Speed3xz`;

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
      caption: txt,
      mentions: [userId]
    } : {
      text: txt,
      mentions: [userId]
    };

    return await conn.sendMessage(m.chat, messagePayload, { quoted: m });
  }

  let fullMenuText = `${menuHeader(userId)}\n`;

  for (const [tag, categoryTitle] of categoryNames.entries()) {
    if (categorized.has(tag) && !excludedTags.includes(tag)) {
      const pluginList = categorized.get(tag);
      fullMenuText += `\n₊ ‧  ꒰${getRandomEmoji()}꒱  — \`『 ${categoryTitle.toUpperCase()} 』\` \n`;
      
      for (const plugin of pluginList) {
        const helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help];
        for (const h of helps) {
          fullMenuText += ` */${h}*\n> ⚘ Comando disponible.\n`;
        }
      }
    }
  }

  for (const [tag, pluginList] of categorized.entries()) {
    if (!categoryNames.has(tag) && !excludedTags.includes(tag)) {
      fullMenuText += `\n₊ ‧  ꒰${getRandomEmoji()}꒱  — \`『 ${tag.toUpperCase()} 』\` \n`;
      
      for (const plugin of pluginList) {
        const helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help];
        for (const h of helps) {
          fullMenuText += ` */${h}*\n> ⚘ Comando disponible.\n`;
        }
      }
    }
  }

  fullMenuText += `\n\n> ✐ Powered By Speed3xz`;

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
