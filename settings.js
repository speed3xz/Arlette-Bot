import { watchFile, unwatchFile } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const global = {
  botNumber: "",
  prefix: ['.', '/'],
  owner: [
    "573114910796",
    "819095203873",
    "5216671548329"
  ],
  suittag: ["573114910796"],
  prems: [],
  libreria: "Baileys Multi Device",
  vs: "V2",
  nameqr: "Arlette-Bot",
  sessions: "Sessions/Principal",
  botname: "Arlette-Bot",
  textbot: "Arlette-Bot, made with love by Arlette Xz",
  dev: "© powered by Arlette Xz",
  author: "© made with love by Arlette Xz",
  etiqueta: "Arlette Xz",
  currency: "Coins 🍒",
  banner: "https://raw.githubusercontent.com/speed3xz/Storage/main/Arlette-Bot/b859e5b0780d3eb3f3349f69ab524bcc.jpg",
  icono: "https://files.evogb.win/XD8JxJ.jpg"
};

let file = __filename;
watchFile(file, () => {
  unwatchFile(file);
  console.log("Update 'settings.js'");
  import(`${file}?update=${Date.now()}`);
});

export default global;
