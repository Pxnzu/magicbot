const { Client, Collection, Events, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const profileModel = require('../models/profileSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard') // Name must be lowercase
        .setDescription('Shows top 10 users with the most magic tokens!'), // Description is required
    async execute(interaction, profileData) {
        await interaction.deferReply();

        const { username, id } = interaction.user;
        const { magicTokens } = profileData;

        let leaderboardEmbed = new EmbedBuilder()
            .setTitle("**Top 10 Richest Users**")
            .setColor(0x45d6fd)
            .setFooter({ text: 'You are not ranked yet'});

        const members = await profileModel
            .find()
            .sort({magicTokens: -1})
            .catch((err) => console.log(err))

        const memberIdx = members.findIndex((member) => member.usedId === id);

        leaderboardEmbed.setFooter({text: `${username}, you're rank #${memberIdx + 2} with ${magicTokens}`});

        const topTen = members.slice(0, 10);

        let desc = "";
        for(let i=0; i< topTen.length; i++) {
            let {user} = await interaction.guild.members.fetch(topTen[i].userId);
            if(!user) return;
            let userBalance = topTen[i].magicTokens;
            desc += `**${i + 1}. ${user.username}:** ${userBalance} tokens\n`;
        }

        if(desc !== "") {
            leaderboardEmbed.setDescription(desc);
        }

        await interaction.editReply({embeds: [leaderboardEmbed] });
    },
};