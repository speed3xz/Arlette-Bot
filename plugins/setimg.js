let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants || [];
  const user = participants.find(p => p.id === m.sender);
  const isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin';

  if (!isAdmin && !m.isOwner)
    return m.reply('❌ Solo los administradores pueden usar este comando.');

  const chat = global.db.data.chats[m.chat];

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime || !mime.startsWith('image/')) {
    return m.reply('❌ Envía o responde a una imagen con el comando *setwelcimg* para establecerla como imagen de bienvenida.');
  }

  try {
    const buffer = await q.download();
    chat.customWelcomeImg = buffer.toString('base64');
    m.reply('✅ Imagen de bienvenida actualizada para este grupo.');
  } catch (e) {
    console.error('Error al guardar imagen:', e);
    m.reply('❌ Hubo un error al guardar la imagen.');
  }
};

handler.help = ['setwelcimg'];
handler.tags = ['group'];
handler.command = ['setwelcimg', 'setwelcomeimg', 'setimg', 'gpimg', 'gpwelcimg', 'setimagen', 'setimage'];
handler.group = true;

export default handler;
