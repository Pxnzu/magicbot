const { SlashCommandBuilder } = require('discord.js');

const responses = [
    "Yes.",
    "No.",
    "Maybe someday.",
    "Try again later.",
    "I don't think so.",
    "Definitely!",
    "Ask again… if you dare.",
    "It is uncertain.",
    "Absolutely not.",
    "Without a doubt!",
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('magicconch')
        .setDescription('Ask the magic conch a question and receive its wisdom!')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question for the magic conch')
                .setRequired(true)
        ),
    category: 'Fun',
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const response = responses[Math.floor(Math.random() * responses.length)];

        await interaction.reply(`🐚 You asked: **"${question}"**\n🔮 The Magic Conch says: **"${response}"**`);
    },
};
