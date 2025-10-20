import { exec } from 'child_process';

let handler = async (m, { conn }) => {
  m.reply(`🌷 Actualizando Arlette-Bot desde GitHub...`);

  // Comandos para asegurar la actualización desde tu repositorio
  const comandos = [
    'git remote set-url origin https://github.com/speed3xz/Arlette-Bot.git',
    'git fetch origin',
    'git reset --hard origin/main', // o 'origin/master' dependiendo de tu rama
    'npm install' // para actualizar dependencias si es necesario
  ];

  exec(comandos.join(' && '), (err, stdout, stderr) => {
    if (err) {
      console.error('Error durante la actualización:', err);
      conn.reply(m.chat, `🍭 Error: No se pudo realizar la actualización.\nRazón: ${err.message}`, m);
      return;
    }

    if (stderr) {
      console.warn('Advertencia durante la actualización:', stderr);
    }

    if (stdout.includes('Already up to date.') || stdout.includes('Already up-to-date.')) {
      conn.reply(m.chat, `🌷 Arlette-Bot ya está actualizada con la última versión.`, m);
    } else {
      conn.reply(m.chat, `🍭 Actualización realizada con éxito!\n\nCambios aplicados desde: github.com/speed3xz/Arlette-Bot\n\n${stdout}`, m);
    }
  });
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'actualizar'];
handler.rowner = true;

export default handler;
