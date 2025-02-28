const { SlashCommandBuilder } = require('discord.js');
const profileModel = require('../models/profileSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate') // Name must be lowercase
        .setDescription('Donate your coins to another user!') // Description is required
        .addUserOption((option) => 
            option
                .setName('user')
                .setDescription('The user you want to donate to')
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName('amount')
                .setDescription('The amount of coins you want to donate')
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction, profileData) {
        const receiveUser = interaction.options.getUser('user');
        const donateAmt = interaction.options.getInteger('amount');

        const { magicTokens } = profileData;
        await interaction.deferReply();
        if ( magicTokens < donateAmt ) {
            return await interaction.editReply(`You do not have ${donateAmt} tokens to donate`);
        } else {
            const receiveUserData = await profileModel.findOneAndUpdate(
                {
                    userId: receiveUser.id
                },
                {
                    $inc: {
                        magicTokens: donateAmt,
                    }
                }
            );
            if (!receiveUserData) {
                return await interaction.editReply(`${receiveUser.username} is not in the currency system.`)
            }
        }

        await profileModel.findOneAndUpdate(
            {
                userId: interaction.user.id
            },
            {
                $inc: {
                    magicTokens: -donateAmt
                }
            },
        );

        await interaction.editReply(`You have donated ${donateAmt} coins to ${receiveUser.username}`);
    },
};