import { promises as fs } from 'fs';

let handler = async (m, { conn, args, command, usedPrefix, text }) => {
    const currency = '¥'; // Moneda del sistema
    
    const db = global.db?.data || {};
    const chatData = db.chats?.[m.chat] || {};
    
    // Inicializar datos si no existen
    if (!chatData.sales) chatData.sales = {};
    if (!db.characters) db.characters = {};
    if (!db.users?.[m.sender]) {
        if (!db.users) db.users = {};
        db.users[m.sender] = { coin: 0, characters: [] };
    }
    
    // Verificar si los comandos de gacha están activados en el grupo
    if (!chatData.gacha && m.isGroup) {
        return m.reply('ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*');
    }

    try {
        switch (command) {
            case 'vender':
            case 'sell': {
                if (args.length < 2) {
                    return m.reply('❀ Debes especificar un precio para subastar el personaje.\n> Ejemplo » *' + (usedPrefix + command) + ' 5000 nombre personaje*');
                }
                
                const price = parseInt(args[0]);
                if (isNaN(price) || price < 2000) {
                    return m.reply('ꕥ El precio mínimo para subastar un personaje es de *' + currency + '2,000*.');
                }
                
                const characterName = args.slice(1).join(' ').toLowerCase();
                const characterId = Object.keys(db.characters).find(id => 
                    (db.characters[id]?.name || '').toLowerCase() === characterName && 
                    db.characters[id]?.user === m.sender
                );
                
                if (!characterId) {
                    return m.reply('ꕥ No se ha encontrado al personaje *' + args.slice(1).join(' ') + '*.');
                }
                
                const character = db.characters[characterId];
                chatData.sales[characterId] = {
                    name: character.name,
                    user: m.sender,
                    price: price,
                    time: Date.now()
                };
                
                let sellerName = await (async () => {
                    try {
                        return db.users[m.sender]?.name?.trim() || 
                               (await conn.getName(m.sender)) || 
                               m.sender.split('@')[0];
                    } catch {
                        return m.sender.split('@')[0];
                    }
                })();
                
                m.reply('❀ *' + character.name + '* ha sido puesto a la venta!\n❀ Vendedor » *' + sellerName + 
                       '*\n⛁ Precio » *' + price.toLocaleString() + ' ' + currency + 
                       '*\nⴵ Expira en » *3 dias*\n> Puedes ver los personajes en venta usando *' + usedPrefix + 'wshop*');
                break;
            }
            
            case 'removesale':
            case 'removerventa': {
                if (!args.length) {
                    return m.reply('❀ Debes especificar un personaje para eliminar.\n> Ejemplo » *' + (usedPrefix + command) + ' nombre personaje*');
                }
                
                const characterName = args.join(' ').toLowerCase();
                const characterId = Object.keys(chatData.sales).find(id => 
                    (chatData.sales[id]?.name || '').toLowerCase() === characterName
                );
                
                if (!characterId || chatData.sales[characterId].user !== m.sender) {
                    return m.reply('ꕥ El personaje *' + args.join(' ') + '* no está a la venta por ti.');
                }
                
                delete chatData.sales[characterId];
                m.reply('❀ *' + args.join(' ') + '* ha sido eliminado de la lista de ventas.');
                break;
            }
            
            case 'wshop':
            case 'haremshop':
            case 'tiendawaifus': {
                const sales = Object.entries(chatData.sales || {});
                if (!sales.length) {
                    const groupName = await conn.groupMetadata(m.chat);
                    return m.reply('ꕥ No hay personajes en venta en *' + (groupName?.subject || 'este grupo') + '*');
                }
                
                const page = parseInt(args[0]) || 1;
                const itemsPerPage = 10;
                const totalPages = Math.ceil(sales.length / itemsPerPage);
                
                if (page < 1 || page > totalPages) {
                    return m.reply('ꕥ Página inválida. Solo hay *' + totalPages + '* página' + (totalPages > 1 ? 's' : '') + '.');
                }
                
                const salesList = [];
                for (const [characterId, saleData] of sales.slice((page - 1) * itemsPerPage, page * itemsPerPage)) {
                    const timeLeft = 3 * 24 * 60 * 60 * 1000 - (Date.now() - saleData.time);
                    const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
                    const hours = Math.floor(timeLeft % (24 * 60 * 60 * 1000) / (60 * 60 * 1000));
                    const minutes = Math.floor(timeLeft % (60 * 60 * 1000) / (60 * 1000));
                    const seconds = Math.floor(timeLeft % (60 * 1000) / 1000);
                    
                    const characterValue = typeof db.characters[characterId]?.value === 'number' ? 
                        db.characters[characterId].value : 0;
                    
                    let sellerName = await (async () => {
                        try {
                            return db.users[saleData.user]?.name?.trim() || 
                                   (await conn.getName(saleData.user)) || 
                                   saleData.user.split('@')[0];
                        } catch {
                            return saleData.user.split('@')[0];
                        }
                    })();
                    
                    salesList.push('❀ *' + saleData.name + 
                                 '*\n⛁ Valor » *' + characterValue + 
                                 '*\n💰 Precio » *' + saleData.price.toLocaleString() + ' ' + currency + 
                                 '*\n❖ Vendedor » *' + sellerName + 
                                 '*\nⴵ Expira en » *' + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's*');
                }
                
                m.reply('*☆ HaremShop `≧◠ᴥ◠≦`*\n' + 
                       '❏ Personajes en venta <' + sales.length + '>\n\n' + 
                       salesList.join('\n\n') + 
                       '\n\n> • Páginá *' + page + '* de *' + totalPages + '*');
                break;
            }
            
            case 'buyc':
            case 'buychar':
            case 'buycharacter': {
                if (!args.length) {
                    return m.reply('❀ Debes especificar un personaje para comprar.\n> Ejemplo » *' + (usedPrefix + command) + ' nombre personaje*');
                }
                
                const characterName = args.join(' ').toLowerCase();
                const characterId = Object.keys(chatData.sales).find(id => 
                    (chatData.sales[id]?.name || '').toLowerCase() === characterName
                );
                
                if (!characterId) {
                    return m.reply('ꕥ No se ha encontrado al personaje *' + args.join(' ') + '* en venta.');
                }
                
                const saleData = chatData.sales[characterId];
                if (saleData.user === m.sender) {
                    return m.reply('ꕥ No puedes comprar tu propio personaje.');
                }
                
                const buyer = db.users[m.sender];
                const buyerCoins = typeof buyer?.coin === 'number' ? buyer.coin : 0;
                
                if (buyerCoins < saleData.price) {
                    return m.reply('ꕥ No tienes suficientes *' + currency + 
                                 '* para comprar a *' + saleData.name + 
                                 '*\n> Necesitas *' + saleData.price.toLocaleString() + 
                                 ' ' + currency + '*');
                }
                
                const seller = db.users[saleData.user];
                if (!seller) {
                    db.users[saleData.user] = { coin: 0, characters: [] };
                }
                
                if (!Array.isArray(seller.characters)) {
                    seller.characters = [];
                }
                
                // Realizar la transacción
                buyer.coin -= saleData.price;
                seller.coin += saleData.price;
                
                // Transferir el personaje
                db.characters[characterId].user = m.sender;
                
                if (!buyer.characters.includes(characterId)) {
                    buyer.characters.push(characterId);
                }
                
                // Remover de la lista del vendedor
                seller.characters = seller.characters.filter(id => id !== characterId);
                
                // Si era favorito, removerlo
                if (seller.favorite === characterId) {
                    delete seller.favorite;
                }
                
                // Eliminar de la venta
                delete chatData.sales[characterId];
                
                let sellerName = await (async () => {
                    try {
                        return seller.name?.trim() || 
                               (await conn.getName(saleData.user)) || 
                               saleData.user.split('@')[0];
                    } catch {
                        return saleData.user.split('@')[0];
                    }
                })();
                
                let buyerName = await (async () => {
                    try {
                        return buyer.name?.trim() || 
                               (await conn.getName(m.sender)) || 
                               m.sender.split('@')[0];
                    } catch {
                        return m.sender.split('@')[0];
                    }
                })();
                
                m.reply('❀ *' + saleData.name + 
                       '* ha sido comprado por *' + buyerName + 
                       '*\n⛁ Se han transferido *' + saleData.price.toLocaleString() + 
                       ' ' + currency + '* a *' + sellerName + '*');
                break;
            }
        }
    } catch (error) {
        console.error('Error en handler de tienda:', error);
        await conn.reply(m.chat, '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, m);
    }
};

// Configuración del handler
handler.help = [
    'vender <precio> <personaje>',
    'removesale <personaje>', 
    'wshop [página]',
    'buyc <personaje>'
];

handler.tags = ['gacha'];
handler.command = [
    'vender', 'sell', 
    'removesale', 'removerventa', 
    'haremshop', 'tiendawaifus', 'wshop', 
    'buychar', 'buycharacter', 'buyc'
];
handler.group = true;

export default handler;