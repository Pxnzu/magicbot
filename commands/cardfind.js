const { Client, Collection, Events, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cardfind')
        .setDescription('Get information about a Magic: The Gathering card')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the card')
                .setRequired(true)),
    category: 'Magic The Gathering',
    async execute(interaction) {
        const cardName = interaction.options.getString('name');
        const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`;
        let specificInteraction = interaction;

        // fetch card
        try {

            // check if card is found
            const response = await fetch(url);
            if (!response.ok) {
                return interaction.reply('Card not found. Please try a different name.');
            } 

            // create embed for card
            const cardData = await response.json();
            const embed = new EmbedBuilder().setColor('LuminousVividPink').setURL(cardData.scryfall_uri || 'https://scryfall.com')

            // if card has two faces
            if (cardData.card_faces) {
                await interaction.deferReply();
                const face1 = cardData.card_faces[0];
                const face2 = cardData.card_faces[1];

                // multi-page embed
                const pages = [
                    new EmbedBuilder()
                        .setTitle(face1.name)
                        .setURL(cardData.scryfall_uri || 'https://scryfall.com')
                        .setDescription('On back: ' + face2.name)
                        .setImage(face1.image_uris.normal || '')
                        .addFields(
                            { name: '', value: 'Set: ' + cardData.set_name },
                            { name: '\u200B', value: '\u200B' },
                            { name: 'MarketPrice:', value: '$' + cardData.prices.usd, inline: true },
                            { name: 'Foil:', value: '$' + cardData.prices.usd_foil, inline: true }
                    ),
                    new EmbedBuilder()
                        .setTitle(face1.name)
                        .setURL(cardData.scryfall_uri || 'https://scryfall.com')
                        .setDescription('On back: ' + face2.name)
                        .setImage(face2.image_uris.normal || '')
                        .addFields(
                            { name: '', value: 'Set: ' + cardData.set_name },
                            { name: '\u200B', value: '\u200B' },
                            { name: 'MarketPrice:', value: '$' + cardData.prices.usd, inline: true },
                            { name: 'Foil:', value: '$' + cardData.prices.usd_foil, inline: true }
                    )
                        
                ];

                let currentPage = 0;

                // row of buttons at bottom
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`prev${interaction.id}`)
                            .setEmoji('◀️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId(`next${interaction.id}`)
                            .setEmoji('▶️')
                            .setStyle(ButtonStyle.Primary)
                    );

                const message = interaction.editReply({ embeds: [pages[currentPage]], components: [row], withResponse: true });
                const collector = interaction.channel.createMessageComponentCollector({ time: 120000 });
                
                // receive button presses and update embed
                collector.on('collect', async i => {
                    if (i.customId === `prev${interaction.id}` && currentPage > 0) {
                        currentPage--;
                    } else if (i.customId === `next${interaction.id}` && currentPage < pages.length - 1) {
                        currentPage++;
                    }
        
                    row.components[0].setDisabled(currentPage === 0);
                    row.components[1].setDisabled(currentPage === pages.length - 1);
                    
                    await specificInteraction.editReply({ embeds: [pages[currentPage]], components: [row] });
                });

            } else {

                // if card has one face
                embed
                    .setTitle(cardData.name)
                    .setImage(cardData.image_uris.normal || '')
                    .addFields(
                        { name: '', value: 'Set: ' + cardData.set_name },
                        { name: '\u200B', value: '\u200B' },
                        { name: 'MarketPrice:', value: '$' + cardData.prices.usd, inline: true },
                        { name: 'Foil:', value: '$' + cardData.prices.usd_foil, inline: true }
                );
                interaction.reply({ embeds: [embed] });
            }
        } catch (error) {

            // if url cannot be reached
            console.error(error);
            await interaction.reply('An error occurred while fetching the card data.');
        }
    },
};