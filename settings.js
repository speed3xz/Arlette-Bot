import { watchFile, unwatchFile } from "fs"
import { fileURLToPath } from "url"
import fs from "fs"

global.botNumber = ""

global.owner = [
  "573114910796",
  "819095203873",
  "5216671548329"
]

global.suittag = ["573114910796"] 
global.prems = []

global.libreria = "Baileys Multi Device"
global.vs = "V2"
global.nameqr = "Arlette-Bot"
global.sessions = "Sessions/Principal"

global.botname = "Arlette-Bot"
global.textbot = "Arlette-Bot, made with love by Arlette Xz"
global.dev = "© powered by Arlette Xz"
global.author = "© made with love by Arlette Xz"
global.etiqueta = "Arlette Xz"
global.currency = "Coins 🍒"
global.banner = "https://raw.githubusercontent.com/speed3xz/Storage/main/Arlette-Bot/b859e5b0780d3eb3f3349f69ab524bcc.jpg"
global.icono = "https://files.evogb.win/XD8JxJ.jpg"

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log("Update 'settings.js'")
  import(`${file}?update=${Date.now()}`)
})
