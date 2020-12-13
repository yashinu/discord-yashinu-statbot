const { MessageEmbed } = require('discord.js');
const MemberStats = require('../Models/MemberStats.js');

/// Yashinu was here

module.exports.execute = async(client, message, args,ayar,emoji) => {
   // if(!message.member.roles.cache.array().some(rol => message.guild.roles.cache.get(ayar.staffrole).rawPosition <= rol.rawPosition)) return  message.reply("`Bu komut yetkililere özeldir.`");
    let kullanici = message.mentions.users.first() || client.users.cache.get(args[0]) || (args.length > 0 ? client.users.cache.filter(e => e.username.toLowerCase().includes(args.join(' ').toLowerCase())).first(): message.author) || message.author;
    let uye = message.guild.member(kullanici);
    const embed = new MessageEmbed().setColor("3f0000").setAuthor(kullanici.tag.replace('`', '')+` ( ` + message.author.id + ` )` , kullanici.avatarURL({dynamic: true, size: 2048})).setThumbnail(kullanici.avatarURL({dynamic: true, size: 2048}));
    MemberStats.findOne({ guildID: message.guild.id, userID: uye.id }, (err, data) => {
        if (!data) return global.send(message.channel, embed.setDescription('Belirtilen üyeye ait herhangi bir veri bulunamadı!'));
        let haftalikSesToplam = 0;
        data.voiceStats.forEach(c => haftalikSesToplam += c);
        let haftalikSesListe = '';
        data.voiceStats.forEach((value, key) => haftalikSesListe += ` \`● ${message.guild.channels.cache.has(key) ? message.guild.channels.cache.get(key).name : 'Bilinmeyen'}:\` ** ${client.convertDuration(value)}**\n`);
        let haftalikChatToplam = 0;
        data.chatStats.forEach(c => haftalikChatToplam += c);
        let haftalikChatListe = '';
        data.chatStats.forEach((value, key) => haftalikChatListe += `\`● ${message.guild.channels.cache.has(key) ? message.guild.channels.cache.get(key).name : 'Bilinmeyen'}:\`** ${value} mesaj**\n`);
        embed.addField('**Genel İstatistik**',`\`● Genel Toplam Ses:\` ** ${client.convertDuration(data.totalVoiceStats || 0)}**\n\`● Genel Toplam Chat:\` ** ${data.totalChatStats || 0} mesaj**`);
        embed.addField('Haftalık Ses',`\`● Toplam:\`  ** ${client.convertDuration(haftalikSesToplam)}** \n ${haftalikSesListe}`);
        embed.addField('Haftalık Chat',`\`● Toplam:\`  ** ${haftalikChatToplam} mesaj** \n ${haftalikChatListe}`);
    message.channel.send(embed)
    });
};
module.exports.configuration = {
    name: 'stat',
    aliases: ['stats', 'vinfo', 'cinfo'],
    usage: 'stat [üye]',
    description: 'Belirtilen üyenin tüm ses ve chat bilgilerini gösterir.',
    permLevel: 0
};