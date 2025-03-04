const { SlashCommandBuilder } = require('discord.js');
const profileModel = require('../models/profileSchema');
const { dailyMin, dailyMax } = require('../globalValues.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily') // Name must be lowercase
        .setDescription('Redeem free every day!'), // Description is required
    async execute(interaction, profileData) {
        const { id } = interaction.user;
        const { dailyLastUsed } = profileData;

        const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

        if (dailyLastUsed !== today) {
            await interaction.deferReply();
            const randomAmt = Math.floor(Math.random() * (dailyMax - dailyMin + 1) + dailyMin)
            try {
                await profileModel.findOneAndUpdate(
                    { userId: id },
                    {
                        $set: {
                            dailyLastUsed: today,
                        },
                        $inc: {
                            magicTokens: randomAmt,
                        }
                    }
                )
            } catch (err) {
                console.log(err)
            }
            return await interaction.editReply(`You redeemed ${randomAmt} tokens!`)
        }
        await interaction.deferReply();
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
    
        const timeDifference = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

        return await interaction.editReply(`Claim your next daily in ${hours} hours ${minutes} minutes.`);
    },
};