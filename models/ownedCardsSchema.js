const mongoose = require("mongoose");

const ownedCardsSchema = new mongoose.Schema({
    cards: [{ type: Object, require: true}],
    serverId: { type: String, require: true}
});

const model = mongoose.model("ownedcards", ownedCardsSchema);

module.exports = model;