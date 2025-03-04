const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping') // Name must be lowercase
        .setDescription('Replies with Pong!'), // Description is required
    category: 'Fun',
    async execute(interaction) {
        await interaction.reply('Pong?');
    },
};