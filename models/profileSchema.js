const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    username: { type: String, require: true },
    userId: { type: String, require: true, unique: true },
    serverId: { type: String, require: true},
    magicTokens: { type: Number, default: 0 },
    dailyLastUsed : { type: String},
    rollLastUsed : { type: String, default: 0},
    cardDailyLeft : { type: Number, default: 10},
    cardDailyClaimed: { type: Boolean, default: false},
    ownedCards: [{ type: Object, require: true}]
});

const model = mongoose.model("magicbot", profileSchema);

module.exports = model;