let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`❌ Por favor, proporciona una bienvenida para el bot.\nEjemplo: /setwelcome Hola user`);

  // Guardar mensaje de bienvenida personalizado solo para el grupo actual
  const chat = global.db.data.chats[m.chat];
  chat.welcomeMessage = text.trim();

  m.reply(`✅ La bienvenida del bot para este grupo ha sido cambiada a:\n\n${chat.welcomeMessage}`);
};

handler.help = ['setwelcome'];
handler.tags = ['tools'];
handler.command = ['setwelcome'];
handler.admin = true;

export default handler;
