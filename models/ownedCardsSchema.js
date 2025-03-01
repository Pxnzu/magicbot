const mongoose = require("mongoose");

const ownedCardsSchema = new mongoose.Schema({
    cardId: { type: String, require: true, unique: true },
    userId: { type: String, require: true, unique: true },
    serverId: { type: String, require: true}
});

const model = mongoose.model("ownedcards", ownedCardsSchema);

module.exports = model;