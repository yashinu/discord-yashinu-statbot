const { Client, MessageEmbed, Collection } = require('discord.js');
const client = global.client = new Client({fetchAllMembers: true});
const mongoose = require('mongoose');
mongoose.connect('mongoconnecturl', {useNewUrlParser: true, useUnifiedTopology: true});
const moment = require('moment');
require('moment-duration-format');
require('moment-timezone');
moment.locale('tr');
const MemberStats = require('./Models/MemberStats.js');
const fs = require("fs");
const conf = require("./ayarlar.json");
global.conf = conf;
const sunucuAyar = global.sunucuAyar = require("./sunucuAyar.js");

const commands = global.commands = new Collection();
const aliases = global.aliases = new Collection();
global.client = client;
fs.readdir("./Commands", (err, files) => {
    if(err) return console.error(err);
    files = files.filter(file => file.endsWith(".js"));
    console.log(`${files.length} komut yüklenecek.`);
    files.forEach(file => {
        let prop = require(`./Commands/${file}`);
        if(!prop.configuration) return;
        if(typeof prop.onLoad === "function") prop.onLoad(client);
        commands.set(prop.configuration.name, prop);
        if(prop.configuration.aliases) prop.configuration.aliases.forEach(aliase => aliases.set(aliase, prop.configuration.name));
    });
});


fs.readdir("./Events", (err, files) => {
    if(err) return console.error(err);
    files.filter(file => file.endsWith(".js")).forEach(file => {
        let prop = require(`./Events/${file}`);
        if(!prop.configuration) return;
        client.on(prop.configuration.name, prop);
    });
});



var CronJob = require('cron').CronJob;
var resetStats = new CronJob('00 00 00 * * 1', async function() { // 1 = Pazartesi // 1 = Monday
  let guild = client.guilds.cache.get(sunucuAyar.guildID);
  let newData = new Map();
  await MemberStats.updateMany({ guildID: guild.id }, { voiceStats: newData, chatStats: newData });
  let stats = await MemberStats.find({ guildID: guild.id });
  stats.filter(s => !guild.members.cache.has(s.userID)).forEach(s => MemberStats.findByIdAndDelete(s._id));
  console.log('Haftalık istatistikler sıfırlandı!');
}, null, true, 'Europe/Istanbul');
resetStats.start();

let beklemeSuresi = new Set();

client.on("message", (message) => {
  if(message.author.bot || !message.content.startsWith(conf.prefix) || message.channel.type == "dm") return;
  if (message.content.toLowerCase().startsWith('!tag') || message.content.toLowerCase().startsWith('.tag') || message.content.toLowerCase().startsWith('?tag')) {
    if (beklemeSuresi.has(message.author.id+1)) return;
    message.channel.send(sunucuAyar.symbol);
    beklemeSuresi.add(message.author.id+1);
    setTimeout(() => { beklemeSuresi.delete(message.author.id+1); }, 15000);
    return;
  } else if (message.content.toLowerCase().startsWith('!link') || message.content.toLowerCase().startsWith('.link')) {
    if (beklemeSuresi.has(message.author.id+2)) return;
    message.channel.send(sunucuAyar.invitelink);
    beklemeSuresi.add(message.author.id+2);
    setTimeout(() => { beklemeSuresi.delete(message.author.id+2); }, 15000);
    return;
  }
  let args = message.content.split(" ").slice(1);
  let command = message.content.split(" ")[0].slice(conf.prefix.length);
  let bot = message.client;
  let ayar = sunucuAyar;
  let cmd = commands.get(command) || commands.get(aliases.get(command));
  if (cmd) {
    if (message.member.roles.cache.has(sunucuAyar.jailRolu) || sunucuAyar.teyitsizRolleri.some(rol => message.member.roles.cache.has(rol))) return;
    let permLevel = cmd.configuration.permLevel;
    if (permLevel == 1 && !message.member.roles.cache.has(sunucuAyar.ownerRole) && message.author.id !== message.guild.ownerID && !conf.sahip.some(x => message.author.id === x)) return message.react("❌");
    if (permLevel == 2 && !message.member.hasPermission("ADMINISTRATOR")) return message.react("❌");
    cmd.execute(bot, message, args, ayar);
  };
});



Date.prototype.toTurkishFormatDate = function () {
  return moment.tz(this, "Europe/Istanbul").format('LLL');
};

client.convertDuration = (date) => {
  return moment.duration(date).format('H [saat,] m [dakika]');
};

client.tarihHesapla = (date) => {
  const startedAt = Date.parse(date);
  var msecs = Math.abs(new Date() - startedAt);

  const years = Math.floor(msecs / (1000 * 60 * 60 * 24 * 365));
  msecs -= years * 1000 * 60 * 60 * 24 * 365;
  const months = Math.floor(msecs / (1000 * 60 * 60 * 24 * 30));
  msecs -= months * 1000 * 60 * 60 * 24 * 30;
  const weeks = Math.floor(msecs / (1000 * 60 * 60 * 24 * 7));
  msecs -= weeks * 1000 * 60 * 60 * 24 * 7;
  const days = Math.floor(msecs / (1000 * 60 * 60 * 24));
  msecs -= days * 1000 * 60 * 60 * 24;
  const hours = Math.floor(msecs / (1000 * 60 * 60));
  msecs -= hours * 1000 * 60 * 60;
  const mins = Math.floor((msecs / (1000 * 60)));
  msecs -= mins * 1000 * 60;
  const secs = Math.floor(msecs / 1000);
  msecs -= secs * 1000;

  var string = "";
  if (years > 0) string += `${years} yıl ${months} ay`
  else if (months > 0) string += `${months} ay ${weeks > 0 ? weeks+" hafta" : ""}`
  else if (weeks > 0) string += `${weeks} hafta ${days > 0 ? days+" gün" : ""}`
  else if (days > 0) string += `${days} gün ${hours > 0 ? hours+" saat" : ""}`
  else if (hours > 0) string += `${hours} saat ${mins > 0 ? mins+" dakika" : ""}`
  else if (mins > 0) string += `${mins} dakika ${secs > 0 ? secs+" saniye" : ""}`
  else if (secs > 0) string += `${secs} saniye`
  else string += `saniyeler`;

  string = string.trim();
  return `\`${string} önce\``;
};

client.wait = async function(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

Array.prototype.random = function () {
  return this[Math.floor((Math.random()*this.length))];
};

client.login(conf.token).then(x => console.log(`Bot ${client.user.tag} olarak giriş yaptı!`)).catch(err => console.error(`Bot ${client.user.tag} giriş yapamadı | Hata: ${err}`));
