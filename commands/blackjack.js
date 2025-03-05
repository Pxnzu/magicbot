const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const profileModel = require('../models/profileSchema');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play a game of Blackjack!')
        .addIntegerOption(option =>
            option.setName('wager')
                .setDescription('How much you want to bet')
                .setRequired(true))
                .setMinValue(1),
    category: 'Economy',
    async execute(interaction, profileData) {
        let wagerAmt = interaction.options.getInteger('wager');
        const { magicTokens } = profileData;
        if ( magicTokens < wagerAmt ) {
            return await interaction.reply(`You do not have ${wagerAmt} tokens to wager`);
        } else {
            const deck = createDeck();
            let playerHand = [drawCard(deck), drawCard(deck)];
            let dealerHand = [drawCard(deck), drawCard(deck)];

            let isEnabled = false;
            if (magicTokens >= wagerAmt*2) {
                isEnabled = true;
            }
            
            const embed = new EmbedBuilder()
                .setTitle('Blackjack')
                .setDescription(`**Your hand:** ${handToString(playerHand)} (Total: ${calculateHand(playerHand)})\n**Dealer's hand:** ${cardToString(dealerHand[0])}, ??`)
                .setColor(0x00AE86)
                .addFields({ name: `${interaction.user.username}`, value : `Wagering ${wagerAmt} tokens...`});

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('hit')
                    .setLabel('Hit')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('stand')
                    .setLabel('Stand')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('doubledown')
                    .setLabel('Double Down')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!isEnabled)
            );
            
            await interaction.reply({ embeds: [embed], components: [row] });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'hit') {
                    playerHand.push(drawCard(deck));
                    if (calculateHand(playerHand) > 21) {
                        collector.stop('bust');
                    }
                } else if (i.customId === 'stand') {
                    collector.stop('stand');
                } else if (i.customId === 'doubledown') {
                    playerHand.push(drawCard(deck));
                    wagerAmt *= 2;
                    if (calculateHand(playerHand) > 21) {
                        collector.stop('bust');
                    }
                    collector.stop('doubledown');
                }
                await i.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Blackjack')
                            .setDescription(`**Your hand:** ${handToString(playerHand)} (Total: ${calculateHand(playerHand)})\n**Dealer's hand:** ${cardToString(dealerHand[0])}, ??`)
                            .setColor(0x00AE86)
                            .addFields({ name: `${interaction.user.username}`, value : `Wagering ${wagerAmt} tokens...`})
                    ],
                    components: [row]
                });
            });

            collector.on('end', async (_, reason) => {
                if (reason === 'bust') {
                    await interaction.followUp(`Bust! Your total is over 21. Dealer wins!`);
                    await profileModel.findOneAndUpdate(
                        {
                            userId: interaction.user.id
                        },
                        {
                            $inc: {
                                magicTokens: -wagerAmt
                            }
                        },
                    );
                    return;
                }

                while (calculateHand(dealerHand) < 17) {
                    dealerHand.push(drawCard(deck));
                }

                let playerTotal = calculateHand(playerHand);
                let dealerTotal = calculateHand(dealerHand);

                let result = `**Your hand:** ${handToString(playerHand)} (Total: ${playerTotal})\n**Dealer's hand:** ${handToString(dealerHand)} (Total: ${dealerTotal})\n`;
                if (dealerTotal > 21 || playerTotal > dealerTotal) {
                    result += '**You win!**';
                    result += `\n${interaction.user.username} won ${wagerAmt} tokens!`;
                    await profileModel.findOneAndUpdate(
                        {
                            userId: interaction.user.id
                        },
                        {
                            $inc: {
                                magicTokens: +wagerAmt
                            }
                        },
                    );
                } else if (dealerTotal === playerTotal) {
                    result += '**It\'s a tie!**';
                    result += `\n${interaction.user.username} kept their tokens!`;
                } else {
                    result += '**Dealer wins!**';
                    result += `\n${interaction.user.username} lost ${wagerAmt} tokens!`;
                    await profileModel.findOneAndUpdate(
                        {
                            userId: interaction.user.id
                        },
                        {
                            $inc: {
                                magicTokens: -wagerAmt
                            }
                        },
                    );
                }

                await interaction.followUp({
                    embeds: [new EmbedBuilder().setTitle('Game Over').setDescription(result).setColor(0xff0000)],
                    components: []
                });
            });
        }
    }
};

function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
}

function drawCard(deck) {
    return deck.pop();
}

function calculateHand(hand) {
    let sum = 0;
    let aceCount = 0;
    for (let card of hand) {
        if (card.value === 'A') {
            aceCount++;
            sum += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            sum += 10;
        } else {
            sum += parseInt(card.value);
        }
    }
    while (sum > 21 && aceCount > 0) {
        sum -= 10;
        aceCount--;
    }
    return sum;
}

function handToString(hand) {
    return hand.map(card => cardToString(card)).join(', ');
}

function cardToString(card) {
    return `${card.value}${card.suit}`;
}
