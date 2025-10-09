import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!db.data.chats[m.chat].welcome && m.isGroup) {
        return m.reply(`✘ Para usar este comando debe activar las Bienvenidas con */welcome*`);
    }

    let chat = global.db.data.chats[m.chat];
    let mentions = text.trim();
    let who = mentions ? conn.parseMention(mentions) : [];

    if (!text) return conn.reply(m.chat, `✘ Menciona al usuario con @ para simular la bienvenida.`, m);

    let taguser = `@${who[0].split('@')[0]}`;
    let groupMetadata = await conn.groupMetadata(m.chat);

    const defaultImageUrl = 'https://files.catbox.moe/tj7jjy.png';
    let img;

    try {
        // Imagen personalizada si existe
        if (chat.customWelcomeImg) {
            img = Buffer.from(chat.customWelcomeImg, 'base64');
        } else {
            // Imagen de perfil del usuario si existe
            try {
                let pp = await conn.profilePictureUrl(who[0], 'image');
                img = await (await fetch(pp)).buffer();
            } catch {
                img = await (await fetch(defaultImageUrl)).buffer();
            }
        }
    } catch {
        img = await (await fetch(defaultImageUrl)).buffer();
    }

    const welcomeTextContent = chat.welcomeMessage || global.welcom1;

    let bienvenida = `✿ *Bienvenido* a ${groupMetadata.subject}
✰ ${taguser}

${welcomeTextContent}

> ✐ Puedes usar */help* para ver la lista de comandos.`;

    await conn.sendMessage(m.chat, {
        image: img,
        caption: bienvenida,
        mentions: who
    });
};

handler.help = ['testwelcome @user'];
handler.tags = ['group'];
handler.command = ['testwelcome'];
handler.admin = true;
handler.group = true;

export default handler;
