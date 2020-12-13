const { MessageEmbed } = require("discord.js");
const MemberStats = require('../Models/MemberStats.js');

/// Yashinu was here


const sesli = new Map();

const client = global.client;
const sunucuAyar = global.sunucuAyar;
client.on("ready", async () => {
  client.guilds.cache.get(sunucuAyar.guildID).channels.cache.filter(e => e.type == "voice" && e.members.size > 0).forEach(channel => {
    channel.members.filter(member => !member.user.bot && !member.voice.selfDeaf).forEach(member => {
      sesli.set(member.id, {
	      channel: channel.parentID || channel.id,
	      duration: Date.now()
      });
    });
  });

  setInterval(() => {
    sesli.forEach((value, key) => {
      voiceInit(key, value.channel, getDuraction(value.duration));
      sesli.set(key, {
        channel: value.channel,
        duration: Date.now()
      });
    });
  }, 120000);
});

module.exports = (oldState, newState) => {
  if(oldState.member && (oldState.member.user.bot || newState.selfDeaf)) return;
  if (!oldState.channelID && newState.channelID) {
    sesli.set(oldState.id, {
      channel: newState.guild.channels.cache.get(newState.channelID).parentID || newState.channelID,
      duration: Date.now()
    });
  }
  if (!sesli.has(oldState.id))
    sesli.set(oldState.id, {
      channel: newState.guild.channels.cache.get(oldState.channelID || newState.channelID).parentID || newState.channelID,
      duration: Date.now()
    });

  let data = sesli.get(oldState.id);
  let duration = getDuraction(data.duration);
  if (oldState.channelID && !newState.channelID) {
    voiceInit(oldState.id, data.channel, duration);
    sesli.delete(oldState.id);
  } else if (oldState.channelID && newState.channelID) {
    voiceInit(oldState.id, data.channel, duration);
    sesli.set(oldState.id, {
      channel: newState.guild.channels.cache.get(newState.channelID).parentID || newState.channelID,
      duration: Date.now()
    });
  }
};

module.exports.configuration = {
  name: "voiceStateUpdate"
};

function getDuraction(ms) {
  return Date.now() - ms;
};

function voiceInit(memberID, categoryID, duraction) {
  MemberStats.findOne({guildID: sunucuAyar.guildID, userID: memberID}, (err, data) => {
    if (!data) {
      let voiceMap = new Map();
      let chatMap = new Map();
      voiceMap.set(categoryID, duraction);
      let newMember = new MemberStats({
        guildID: sunucuAyar.guildID,
        userID: memberID,
        voiceStats: voiceMap,
        totalVoiceStats: duraction,
        chatStats: chatMap,
        totalChatStats: 0
      });
      newMember.save();
    } else {
      let onceki = data.voiceStats.get(categoryID) || 0;
      data.voiceStats.set(categoryID, Number(onceki)+duraction);
      data.totalVoiceStats = Number(data.totalVoiceStats)+duraction;
      data.save();
    };
  });
};