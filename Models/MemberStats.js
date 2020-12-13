const mongoose = require("mongoose");

const Stats = mongoose.Schema({
    guildID: String,
    userID: String,
    voiceStats: Map,
    totalVoiceStats: Number,
    chatStats: Map,
    totalChatStats: Number
});

module.exports = mongoose.model("MemberStats", Stats);


/// Yashinu was here
