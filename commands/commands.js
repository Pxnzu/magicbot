const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('Lists all slash commands sorted by type.'),
    category: 'Utility',
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const commands = interaction.client.commands;

            if (!commands || !commands.size) {
                return interaction.editReply('No commands found.');
            }

            const categorizedCommands = {};
            commands.forEach(cmd => {
                const category = cmd.category || 'Misc';
                if (!categorizedCommands[category]) {
                    categorizedCommands[category] = [];
                }
                categorizedCommands[category].push(`\`/${cmd.data.name}\` - ${cmd.data.description || 'No description'}`);
            });

            let response = '# Available Commands:\n';
            for (const [category, cmds] of Object.entries(categorizedCommands)) {
                response += `\n**${category} Commands:**\n${cmds.join('\n')}`;
            }

            await interaction.editReply(response);
        } catch (error) {
            console.error(error);
            await interaction.editReply('Error fetching commands.');
        }
    },
};