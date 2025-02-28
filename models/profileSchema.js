const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userId: { type: String, require: true, unique: true },
    serverId: { type: String, require: true},
    magicTokens: { type: Number, default: 0 },
    dailyLastUsed : { type: Number, default: 0},
    cardDailyLeft : { type: Number, default: 10},
    ownedCards: { type: Array, require: true}
});

const model = mongoose.model("magicbot", profileSchema);

module.exports = model;