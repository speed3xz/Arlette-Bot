import fetch from 'node-fetch';

export async function before(m, { conn, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  try {
    const chat = global.db.data.chats[m.chat];
    const defaultImageUrl = 'https://files.catbox.moe/tj7jjy.png';
    let img;

    // Si existe una imagen personalizada en base64, úsala. Si no, usa la por defecto desde URL
    if (chat.customWelcomeImg) {
      img = Buffer.from(chat.customWelcomeImg, 'base64');
    } else {
      img = await (await fetch(defaultImageUrl)).buffer();
    }

    const welcomeTextContent = chat.welcomeMessage || global.welcom1;
    const newUser = m.messageStubParameters[0];
    const welcomeText = `✿ *Bienvenido* a ${groupMetadata.subject}\n✰ @${newUser.split('@')[0]}\n\n${welcomeTextContent}\n\n> ✐ Puedes usar */help* para ver la lista de comandos.`;

    if (chat.welcome && m.messageStubType === 27) {
      await conn.sendMessage(m.chat, {
        image: img,
        caption: welcomeText,
        mentions: [newUser]
      }, { quoted: m });
    }
  } catch (e) {
    console.error('Error en la bienvenida:', e);
  }
}
