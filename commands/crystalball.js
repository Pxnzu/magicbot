const { SlashCommandBuilder } = require('discord.js');

const secretMessages = [
    "The stars whisper your destiny.",
    "A great fortune awaits you… but at what cost?",
    "Beware of the one with a silver tongue.",
    "You will soon find what you have been seeking.",
    "A shadow from your past will return.",
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crystalball')
        .setDescription('Stare into the crystal ball and see what it reveals...'),
    
    async execute(interaction) {
        const chance = Math.random(); // Random chance (0 to 1)

        if (chance < 0.15) { // 15% chance to get a secret message
            const secretMessage = secretMessages[Math.floor(Math.random() * secretMessages.length)];
            await interaction.reply(`🔮 The crystal ball reveals: **"${secretMessage}"**`);
        } else {
            await interaction.reply("🔮 The crystal ball remains cloudy... Try again later.");
        }
    },
};
