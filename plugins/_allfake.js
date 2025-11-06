import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) { 
global.canalIdM = ["120363402095978084@newsletter"]
global.canalNombreM = ["【 ✰ 】𝗦𝗽𝗲𝗲𝗱𝟯𝘅𝘇 𝗖𝗹𝘂𝗯 - 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 𝗖𝗵𝗮𝗻𝗻𝗲𝗹"]
global.channelRD = await getRandomChannel()

global.d = new Date(new Date + 3600000)
global.locale = 'es'
global.dia = d.toLocaleDateString(locale, {weekday: 'long'})
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'})
global.mes = d.toLocaleDateString('es', {month: 'long'})
global.año = d.toLocaleDateString('es', {year: 'numeric'})
global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})

var canal = 'https://whatsapp.com/channel/0029VbAmwbQBqbr587Zkni1a'  
var comunidad = 'https://chat.whatsapp.com/Ei08xSmFnWJBS8rcrcYvP4'
var git = 'https://github.com/speed3xz/'
var github = 'https://github.com/speed3xz/Arlette-Bot' 
var correo = ''
global.redes = [canal, comunidad, git, github, correo].getRandom()

global.nombre = m.pushName || 'Arlette-User'
global.packsticker = `┊ Speed3xz Team\n⤷ https://github.com/speed3xz\n\n┊INFO 💗\n ⤷ speed3xz.bot.nu/discord`;
global.packsticker2 = `┊Bot 🎀\n┊⤷${botname} \n\n┊Usuario:\n┊⤷${nombre}`

// Variables rcanal del primer código
   global.idchannel = '120363402095978084@newsletter'
    global.namechannel = '【 ✰ 】𝗦𝗽𝗲𝗲𝗱𝟯𝘅𝘇 𝗧𝗲𝗮𝗺 - 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 𝗖𝗵𝗮𝗻𝗲𝗹'
    global.iconorcanal = 'https://speed3xz.bot.nu/img/IMG_4580.jpeg'
    let icono = 'https://speed3xz.bot.nu/img/IMG_4580.jpeg'
    let iconoden = 'https://speed3xz.bot.nu/img/IMG_4580.jpeg'
    let iconodev = 'https://speed3xz.bot.nu/img/IMG_4580.jpeg'

    global.rcanalw = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.idchannel,
                serverMessageId: 100,
                newsletterName: global.namechannel,
            },
            externalAdReply: {
                title: '【 ✰ 】𝗦𝗽𝗲𝗲𝗱𝟯𝘅𝘇 𝗧𝗲𝗮𝗺 - 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 𝗖𝗵𝗮𝗻𝗲𝗹',
                body: '',
                mediaUrl: null,
                description: null,
                previewType: "PHOTO",
                thumbnailUrl: icono,
                mediaType: 1,
                renderLargerThumbnail: false,
            },
        },
    }

    global.rcanalden2 = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.idchannel,
                serverMessageId: 100,
                newsletterName: global.namechannel,
            },
        },
    }

    global.rcanalx = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.idchannel,
                serverMessageId: 100,
                newsletterName: global.namechannel,
            },
            externalAdReply: {
                title: '【 ✰ 】𝗦𝗽𝗲𝗲𝗱𝟯𝘅𝘇 𝗧𝗲𝗮𝗺 - 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 𝗖𝗵𝗮𝗻𝗲𝗹',
                body: '',
                mediaUrl: null,
                description: null,
                previewType: "PHOTO",
                thumbnailUrl: icono,
                mediaType: 1,
                renderLargerThumbnail: false,
            },
        },
    }

    global.rcanalr = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.idchannel,
                serverMessageId: 100,
                newsletterName: global.namechannel,
            },
            externalAdReply: {
                title: '【 ✰ 】𝗦𝗽𝗲𝗲𝗱𝟯𝘅𝘇 𝗧𝗲𝗮𝗺 - 𝗢𝗳𝗶𝗰𝗶𝗮𝗹 𝗖𝗵𝗮𝗻𝗲𝗹',
                body: '',
                mediaUrl: null,
                description: null,
                previewType: "PHOTO",
                thumbnailUrl: icono,
                mediaType: 1,
                renderLargerThumbnail: false,
            },
        },
    }

    global.rcanalden = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.idchannel,
                serverMessageId: 100,
                newsletterName: global.namechannel,
            },
            externalAdReply: {
                title: '🔓 𝗔𝗰𝗰𝘀𝗲𝘀𝗼 𝗡𝗼 𝗣𝗲𝗿𝗺𝗶𝘁𝗶𝗱𝗼',
                body: '',
                mediaUrl: null,
                description: null,
                previewType: "PHOTO",
                thumbnailUrl: iconoden,
                mediaType: 1,
                renderLargerThumbnail: false,
            },
        },
    }

    global.rcanaldev = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.idchannel,
                serverMessageId: 100,
                newsletterName: global.namechannel,
            },
            externalAdReply: {
                title: '🛠️ 𝗗𝗲𝘃',
                body: '',
                mediaUrl: null,
                description: null,
                previewType: 'PHOTO',
                thumbnailUrl: iconodev,
                mediaType: 1,
                renderLargerThumbnail: false,
            },
        },
    }
  
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

    global.rcanal = { 
        contextInfo: { 
            isForwarded: true, 
            forwardedNewsletterMessageInfo: { 
                newsletterJid: channelRD.id, 
                serverMessageId: '', 
                newsletterName: channelRD.name 
            }, 
            externalAdReply: { 
                title: nombreBot, 
                body: dev, 
                mediaUrl: null, 
                description: null, 
                previewType: "PHOTO", 
                thumbnail: await (await fetch(icono)).buffer(), 
                sourceUrl: redes, 
                mediaType: 1, 
                renderLargerThumbnail: false 
            }, 
            mentionedJid: null 
        }
    }
}

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
    let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
    let id = global.canalIdM[randomIndex]
    let name = global.canalNombreM[randomIndex]
    return { id, name }
}
