const ayar = global.sunucuAyar;
const client = global.client;
module.exports = () => {
  client.user.setPresence({ activity: { name: ayar.activity }, status: ayar.status });
  if (client.channels.cache.has(ayar.voicechannel)) client.channels.cache.get(ayar.voicechannel).join().catch();
}
module.exports.configuration = {
  name: "ready"
}


/// Yashinu was here
