import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'

var handler = m => m
handler.all = async function (m) { 
    global.d = new Date(new Date().getTime() + 3600000)
    global.locale = 'es'
    global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
    global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
    global.mes = d.toLocaleDateString('es', { month: 'long' })
    global.año = d.toLocaleDateString('es', { year: 'numeric' })
    global.tiempo = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })

    var canal = 'https://whatsapp.com/channel/0029VbBj5it3LdQMIxu7zP1l'  
    var comunidad = 'https://chat.whatsapp.com/Ei08xSmFnWJBS8rcrcYvP4'
    var git = 'https://github.com/Arlette-Xz/'
    var github = 'https://github.com/Arlette-Xz/Arlette-Bot' 
    var correo = ''
    global.redes = [canal, comunidad, git, github, correo].getRandom()

    global.nombre = m.pushName || 'Arlette-User'
    global.packsticker = `┊ Speed3xz Team\n⤷ https://github.com/speed3xz\n\n┊INFO 💗\n ⤷ speed3xz.bot.nu/discord`
    global.packsticker2 = `┊Bot 🎀\n┊⤷${botname} \n\n┊Usuario:\n┊⤷${nombre}`

    global.fkontak = { 
        key: { 
            participants: "0@s.whatsapp.net", 
            remoteJid: "status@broadcast", 
            fromMe: false, 
            id: "Halo" 
        }, 
        message: { 
            contactMessage: { 
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
            }
        }, 
        participant: "0@s.whatsapp.net" 
    }
}

export default handler
