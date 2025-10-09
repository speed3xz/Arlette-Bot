const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = (msg.key.participant || msg.key.remoteJid).replace(/[^0-9]/g, "");
  const isFromMe = msg.key.fromMe;

  const ownerPath = path.resolve("owner.json");
  const owners = fs.existsSync(ownerPath) ? JSON.parse(fs.readFileSync(ownerPath)) : [];
  const isOwner = owners.some(([id]) => id === senderId);

  if (!isOwner && !isFromMe) {
    await conn.sendMessage(chatId, {
      text: "⛔ *Solo los dueños del bot pueden usar este comando.*"
    }, { quoted: msg });
    return;
  }

  const commandName = args[0];
  if (!commandName) {
    await conn.sendMessage(chatId, {
      text: "📁 *Debes escribir el nombre del comando que quieres buscar.*\n\nEjemplo: *🩸git play*"
    }, { quoted: msg });
    return;
  }

  const rootDir = process.cwd();
  let encontrado = null;

  function buscarPorContenido(dir) {
    const archivos = fs.readdirSync(dir);
    for (const archivo of archivos) {
      const fullPath = path.join(dir, archivo);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const result = buscarPorContenido(fullPath);
        if (result) return result;
      } else if (archivo.endsWith(".js")) {
        const contenido = fs.readFileSync(fullPath, "utf-8");
        const match = contenido.match(/handler\.command\s*=\s*\[(.*?)\]/);
        if (match) {
          const comandos = match[1].replace(/['"`\s]/g, "").split(",");
          if (comandos.includes(commandName)) {
            return fullPath;
          }
        }
      }
    }
    return null;
  }

  encontrado = buscarPorContenido(rootDir);

  if (!encontrado) {
    await conn.sendMessage(chatId, {
      text: `❌ *No se encontró ningún archivo con el comando* \`${commandName}\``
    }, { quoted: msg });
    return;
  }

  await conn.sendMessage(chatId, {
    document: fs.readFileSync(encontrado),
    fileName: path.basename(encontrado),
    mimetype: "application/javascript"
  }, { quoted: msg });

  await conn.sendMessage(chatId, {
    react: { text: "📤", key: msg.key }
  });
};

handler.command = ["git"];
module.exports = handler;
