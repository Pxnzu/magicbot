const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance') // Name must be lowercase
        .setDescription('Replies with user balance!'), // Description is required
    async execute(interaction, profileData) {
        const {magicTokens} = profileData;
        const username = interaction.user.username;

        await interaction.reply(`${username} has ${magicTokens} magic tokens!`);
    },
};