const { Client, Collection, Events, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const profileModel = require('../models/profileSchema');
const ownedCardsModel = require('../models/ownedCardsSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('card') // Name must be lowercase
        .setDescription('User can roll for cards 10 times and claim 1 per day'), // Description is required
    category: 'Magic The Gathering',
    async execute(interaction, profileData) {
        return await interaction.reply("This command is not currently working. To prevent crashes, it is disabled.")
        const { rollLastUsed, cardDailyLeft, cardDailyClaimed } = profileData;
        const { username, id } = interaction.user;
        let specificInteraction = interaction;
        
        const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format 
        // cooldown is up?
        if (rollLastUsed !== today) {
            // if cooldown is finished, 10 rolls are available
            try {
                await profileModel.findOneAndUpdate(
                    { userId: id },
                    {
                        $set: {
                            cardDailyLeft: 10,
                            cardDailyClaimed: false,
                            rollLastUsed: today,
                        },
                    }
                )
                console.log(`${username}'s rolls have been reset to 10`);
            } catch (err) {
                console.log(err);
            }
        }
        // no rolls
        if (cardDailyLeft < 1) {
            await interaction.deferReply();
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
        
            const timeDifference = tomorrow.getTime() - now.getTime();
            const hours = Math.floor(timeDifference / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            console.log(`${username} tried to roll, but still has a cooldown`);
            return await interaction.editReply(`No rolls left.\nRoll again in ${hours} hours ${minutes} minutes`);
        } else {
            // if rolls available, you can roll
            const url = `https://api.scryfall.com/cards/random`;
            
            // fetch card
            try {

                // check if card is found
                const response = await fetch(url);
                if (!response.ok) {
                    return interaction.reply('Card not found. Please try a different name.');
                } 

                // create embed for card
                const cardData = await response.json();
                const embed = new EmbedBuilder().setColor('LuminousVividPink').setURL(cardData.scryfall_uri || 'https://scryfall.com');
                const embed2 = new EmbedBuilder()
                    .setColor('LuminousVividPink')
                    .setTitle('Card Claimed');

                let isEnabled = true;
                if (cardDailyClaimed == true) {
                    isEnabled = false
                }
                // if card has two faces
                if (cardData.card_faces) {
                    await interaction.deferReply();
                    const face1 = cardData.card_faces[0];
                    const face2 = cardData.card_faces[1];
                    const card = {
                        id : cardData.id,
                        name : face1.name,
                        owner : interaction.user.username,
                        ownerId : interaction.user.id,
                        printing : cardData.collector_number,
                        price : cardData.prices.usd
                    }

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
                                .setCustomId(`claim`)
                                .setLabel('Claim Card')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(!isEnabled),
                            new ButtonBuilder()
                                .setCustomId(`prev`)
                                .setEmoji('◀️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId(`next`)
                                .setEmoji('▶️')
                                .setStyle(ButtonStyle.Primary)
                    );
                    const message = interaction.editReply({ embeds: [pages[currentPage]], components: [row], withResponse: true });
                    const filter = (i) => {
                        if (i.message.id != message.id ) {
                            return false;
                        }
                        return i.user.id === interaction.user.id && i.message.id === message.id;
                    }
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });
                    
                    // receive button presses and update embed
                    collector.on('collect', async i => {
                        if (i.customId === `prev` && currentPage > 0) {
                            currentPage--;
                        } else if (i.customId === `next` && currentPage < pages.length - 1) {
                            currentPage++;
                        } else if (i.customId === `claim`) {
                            if (cardDailyClaimed == true) {
                                collector.stop();
                            } else {
                                try {
                                    await ownedCardsModel.findOneAndUpdate(
                                        { serverId: interaction.guild.id },
                                        {
                                            $push: {
                                                cards: card,
                                            }
                                        }
                                    )
                                    console.log(`${username} claimed their card for today`);
                                } catch (err) {
                                    console.log(err);
                                }
                                try {
                                    await profileModel.findOneAndUpdate(
                                        { userId: interaction.user.id },
                                        {
                                            $set: {
                                                cardDailyClaimed: true,
                                            },
                                            $push: {
                                                ownedCards: card,
                                            }
                                        }
                                    )
                                    console.log(`${username} claimed their card for today`);
                                } catch (err) {
                                    console.log(err);
                                }
                                collector.stop();
                                return await specificInteraction.editReply({ embeds: [embed2]});
                            }
                        }
            
                        row.components[0].setDisabled(currentPage === 0);
                        row.components[1].setDisabled(currentPage === pages.length - 1);
            
                        await specificInteraction.editReply({ embeds: [pages[currentPage]], components: [row] });
                    });

                } else {
                    await interaction.deferReply();
                    const card = {
                        id : cardData.id,
                        name : cardData.name,
                        owner : interaction.user.username,
                        ownerId : interaction.user.id,
                        printing : cardData.collector_number,
                        price : cardData.prices.usd
                    }
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
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`claim`)
                            .setLabel('Claim Card')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(!isEnabled)
                    );
                    interaction.editReply({ embeds: [embed], components: [row]  });
                    const filter = (i) => {
                        if (i.message.id != message.id ) {
                            return false;
                        }
                        return i.user.id === interaction.user.id && i.message.id === message.id;
                    }
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

                    // receive button presses and update embed
                    collector.on('collect', async i => {
                        if (i.customId === `claim`) {
                            if (cardDailyClaimed == true) {
                                collector.stop();
                            } else {
                                try {
                                    await ownedCardsModel.findOneAndUpdate(
                                        { serverId: interaction.guild.id },
                                        {
                                            $push: {
                                                cards: card,
                                            }
                                        }
                                    )
                                    await profileModel.findOneAndUpdate(
                                        { userId: interaction.user.id },
                                        {
                                            $set: {
                                                cardDailyClaimed: true,
                                            },
                                            $push: {
                                                ownedCards: card,
                                            }
                                        }
                                    )
                                    console.log(`${username} claimed their card for today`);
                                } catch (err) {
                                    console.log(err);
                                }
                                collector.stop();
                            }
                        }
                        await specificInteraction.editReply({ embeds: [embed2]});
                    });
                }
            } catch (error) {

                // if url cannot be reached
                console.error(error);
                await interaction.editReply('An error occurred while fetching the card data.');
            }
            try {
                await profileModel.findOneAndUpdate(
                    { userId: id },
                    {
                        $inc: {
                            cardDailyLeft: -1,
                        }
                    }
                )
                console.log(`${username} has used a roll. They have ${cardDailyLeft - 1} left`);
            } catch (err) {
                console.log(err);
            }
        }
    },
};