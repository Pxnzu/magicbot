const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('randomcard')
    .setDescription('Gives user random Magic card'),
    async execute(interaction) {
        await interaction.reply('WIP'); // temporary so the bot doesnt break
        const randomUrl = `https://api.scryfall.com/cards/random`;
    },
};