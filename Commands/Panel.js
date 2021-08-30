const { MessageEmbed } = require('discord.js');
const MemberStats = require('../Models/MemberStats.js');
const conf = require('../ayarlar.json');

/// Yashinu was here

module.exports.execute = async (client, message, args) => {
    if(!conf.botowner.includes(message.author.id))
        if((message.guild.ownerID != message.author.id)) return message.channel.send('**Bunu yapmak için yeterli yetkin yok!**');
    let secim = args[0];
    const embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true }));
    if (secim === 'sıfırla') {
        if (!args[1] || (args[1] !== 'ses' && args[1] !== 'chat' )) return message.channel.send(embed.setDescription('Sıfırlanacak veriyi belirtmelisin! (ses/chat/teyit)')).then(x => x.delete({timeout: 5000}));
        if (args[1] === 'ses') {
            let newData = new Map();
            await MemberStats.updateMany({ guildID: message.guild.id }, { voiceStats: newData });
        }

        if (args[1] === 'chat') {
            let newData = new Map();
            await MemberStats.updateMany({ guildID: message.guild.id }, { chatStats: newData });
        }
        return     message.channel.send( embed.setDescription('Başarıyla belirtilen istatistik verileri sıfırlandı!'));
    }
    if (!secim) return message.channel.send(embed.setDescription('Ses, chat veya teyit istatistiklerini sıfırlamak istiyorsan **sıfırla ses/chat/teyit** bir ayar yapmak istiyorsan aşağıdaki seçimleri kullanmalısın.'));
};

module.exports.configuration = {
    name: 'panel',
    aliases: ['ayar','ayarlar'],
    usage: 'panel [seçim] [ayar]',
    description: 'Sunucu ayarları.',
    permLevel: 0
};
