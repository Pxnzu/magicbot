const mongoose = require("mongoose");

const ownedCardsSchema = new mongoose.Schema({
    cardId: { type: String, require: true, unique: true },
    userId: { type: String, require: true, unique: true }
});

const model = mongoose.model("magicbot", ownedCardsSchema);

module.exports = model;