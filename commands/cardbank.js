const { Client, Collection, Events, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const profileModel = require('../models/profileSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cardbank') // Name must be lowercase
        .setDescription('Shows the user their cards they own!'), // Description is required
    category: 'Magic The Gathering',
    async execute(interaction, profileData) {
        await interaction.deferReply();

        const { username, id } = interaction.user;
        const { ownedCards } = profileData;

        let cardbankEmbed = new EmbedBuilder()
            .setTitle('**My cards**')
            .setColor(0x45d6fd)
            .setFooter({ text: `You have ${ownedCards.length} cards`});

        const ownedcardslength = ownedCards;

        let desc = "";
        for(let i=0; i< ownedcardslength.length; i++) {
            const card = ownedCards[i];
            desc += `${i + 1}. ${card.name}                ${card.price} \n`;
        }

        if(desc !== "") {
            cardbankEmbed.setDescription(desc);
        }

        await interaction.editReply({embeds: [cardbankEmbed] });
    },
};