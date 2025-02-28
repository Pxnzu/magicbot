const { SlashCommandBuilder } = require('discord.js');
const parseMilliseconds = require('parse-ms-2');
const profileModel = require('../models/profileSchema');
const { dailyMin, dailyMax } = require('../globalValues.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily') // Name must be lowercase
        .setDescription('Redeem free every day!'), // Description is required
    async execute(interaction, profileData) {
        const { id } = interaction.user;
        const { dailyLastUsed } = profileData;

        const cooldown = 86400000;
        const timeLeft = cooldown - (Date.now() - dailyLastUsed);

        if(timeLeft > 0) {
            await interaction.deferReply();
            const { hours, minutes, seconds } = parseMilliseconds(timeLeft);
            await interaction.editReply(`Claim your next daily in ${hours} hr ${minutes} min ${seconds} sec`);
        } else {
            await interaction.deferReply();

            const randomAmt = Math.floor(Math.random() * (dailyMax - dailyMin + 1) + dailyMin)

            try {
                await profileModel.findOneAndUpdate(
                    { userId: id },
                    {
                        $set: {
                            dailyLastUsed: Date.now(),
                        },
                        $inc: {
                            magicTokens: randomAmt,
                        }
                    }
                )
            } catch (err) {
                console.log(err)
            }

            await interaction.editReply(`You redeemed ${randomAmt} tokens!`)
        }
    },
};