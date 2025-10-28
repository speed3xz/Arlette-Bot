/* Código creado por Félix ofc 
Github: https://github.com/FELIX-OFC
Instagram: felix.ofc3
Si te vas a robar el código y no dejas créditos entonces pagame :)
*/

import ws from 'ws'
import { join } from 'path'
import fs from 'fs'

let handler = async (m, { conn }) => {
  const mainBotConn = global.conn
  if (!global.conns || !Array.isArray(global.conns)) global.conns = []
  global.conns = global.conns.filter(subConn => {
    return subConn.user?.jid && subConn.ws?.socket?.readyState === ws.OPEN
  })

  let totalSubs = global.conns.length
  const totalPrincipales = 1
  const totalBots = totalPrincipales + totalSubs
  const sesiones = totalBots.toLocaleString()

  let botsEnGrupo = 0 // Session Inicial para saber cuantos bots hay en el grupo
  let botsEnGrupoDetalles = [] // Detalles para que muestre que no hay ninguno

  if (mainBotConn.chats && mainBotConn.chats[m.chat]) {
    botsEnGrupo++
    botsEnGrupoDetalles.push({
      jid: mainBotConn.user.jid,
      tipo: 'Principal'
    })
  }

  for (let subConn of global.conns) {
    if (subConn.chats && subConn.chats[m.chat]) {
      botsEnGrupo++
      botsEnGrupoDetalles.push({
        jid: subConn.user.jid,
        tipo: 'Sub'
      })
    }
  }

  let txt = `「✦」 Lista de bots activos (*${sesiones}* sesiones)\n\n❖ Principales » *${totalPrincipales}*\n✰ Subs » *${totalSubs}*\n\n`
  txt += `❏ En este grupo: *${botsEnGrupo}*\n`

  if (botsEnGrupo > 0) {
    for (let b of botsEnGrupoDetalles) {
      const numero = b.jid.split('@')[0]
      txt += `\t\t🜸 [${b.tipo} ${botname}] » @${numero}\n`
    }
  } else {
    txt += '\t\t🜸 Ningún bot principal/sub en este grupo\n'
  }

  const mentions = botsEnGrupoDetalles.map(b => b.jid)

  await conn.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
}

handler.command = ['sockets', 'bots']
handler.group = true
export default handler