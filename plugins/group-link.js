import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args }) => {
    try {
        const from = m.chat
        const code = await conn.groupInviteCode(from).catch(() => null)
        
        if (!code) {
            return conn.reply(from, `✐ No se pudo generar el enlace de invitación.`, m)
        }

        const groupLink = `https://chat.whatsapp.com/${code}`
        const groupMetadata = await conn.groupMetadata(from).catch(() => ({}))
        const groupname = groupMetadata.subject || 'Grupo'
        
        const banner = await conn.profilePictureUrl(from, 'image').catch(() => null)
        
        let linkPreviewData = undefined
        
        if (banner) {
            try {
                const media = await prepareWAMessageMedia(
                    { image: { url: banner } },
                    { 
                        upload: conn.waUploadToServer, 
                        mediaTypeOverride: 'thumbnail-link' 
                    }
                )
                
                linkPreviewData = {
                    'canonical-url': groupLink,
                    'matched-text': groupLink,
                    title: groupname,
                    description: `🔗 Enlace de invitación al grupo`,
                    jpegThumbnail: media.imageMessage?.jpegThumbnail ? Buffer.from(media.imageMessage.jpegThumbnail) : undefined,
                    highQualityThumbnail: media.imageMessage || undefined
                }
            } catch (e) {
                console.error('Error preparando vista previa:', e)
            }
        }
        
        await conn.sendMessage(from, {
            text: `🔗 ${groupLink}`,
            linkPreview: linkPreviewData,
            contextInfo: {
                isForwarded: false
            }
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        await conn.reply(m.chat, `⚠️ Ocurrió un error al obtener el enlace del grupo.`, m)
    }
}

handler.help = ['link', 'enlace']
handler.tags = ['grupo']
handler.command = ['link', 'enlace', 'invitacion']
handler.group = true
handler.botAdmin = true

export default handler
