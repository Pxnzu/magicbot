const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const profileModel = require('../models/profileSchema');

let bets = []; // Stores all bets
let raceInProgress = false; // Prevents multiple races at once
let bettingOpen = false; // Controls betting window

module.exports = {
    data: new SlashCommandBuilder()
        .setName('horserace')
        .setDescription('Bet on horse racing! (Auto-starts in 30s)')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount to bet')
                .setRequired(true)
                .setMinValue(1)
        )
        .addIntegerOption(option =>
            option.setName('horse')
                .setDescription('Choose a horse (1-5)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(5)
        ),
    category: 'Economy',
    async execute(interaction, profileData) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const betAmount = interaction.options.getInteger('amount');
        const chosenHorse = interaction.options.getInteger('horse');

        const { magicTokens } = profileData;

        if (raceInProgress) {
            return interaction.reply({ content: '🚧 A race is already in progress! Please wait for the next one.', ephemeral: true });
        }
        
        // Start betting phase if first bet
        if (!bettingOpen) {
            bettingOpen = true;
            interaction.channel.send('📢 **Betting is now open!** You have **30 seconds** to place your bets. 🏇');
            
            // Auto-start race after 30s
            setTimeout(() => {
                if (bets.length > 0) {
                    startRace(interaction);
                } else {
                    interaction.channel.send('❌ **No bets were placed.** The race has been canceled.');
                    bettingOpen = false;
                }
            }, 30000);
        }
        
        if (betAmount > magicTokens) {
            return interaction.reply({ content: `❌ You don't have enough tokens to place this bet!`, ephemeral: true });
        }

        // Deduct the bet amount
        await profileModel.findOneAndUpdate(
            {
                userId: interaction.user.id
            },
            {
                $inc: {
                    magicTokens: -betAmount
                }
            },
        );
        
        bets.push({ userId, username, betAmount, chosenHorse });
        return interaction.reply({ content: `✅ **${username}** bet **${betAmount}** tokens on Horse ${chosenHorse}! 🏇`});
    }
};

async function startRace(interaction, profileData) {
    raceInProgress = true;
    bettingOpen = false;

    let raceTrack = [
        "🏇 1️⃣ |",
        "🏇 2️⃣ |",
        "🏇 3️⃣ |",
        "🏇 4️⃣ |",
        "🏇 5️⃣ |"
    ];
    let finishLineString = "**FINISH LINE** —————————————————|🏁";

    const raceEmbed = new EmbedBuilder()
        .setTitle('🏇 Horse Racing Begins! 🏇')
        .setColor('#FFD700')
        .setDescription(`The bets are locked in! **${bets.length} users** have placed their bets.\n\n${raceTrack.join("\n")}`);

    const raceMessage = await interaction.channel.send({ embeds: [raceEmbed] });

    let positions = [0, 0, 0, 0, 0];
    let raceFinished = false;
    const finishLine = 20;

    const updateRace = async () => {
        if (raceFinished) return;

        // Move horses forward randomly
        for (let i = 0; i < 5; i++) {
            positions[i] += Math.random() > 0.5 ? 1 : 0; // 50% chance to move
            if (positions[i] >= finishLine) raceFinished = true;
        }

        // Update race track
        raceTrack = raceTrack.map((line, index) => `🏇 ${index + 1}️⃣ |` + "—".repeat(positions[index]) + "🏇");

        raceEmbed.setDescription(`🏁 **The race is on!** 🏁\n\n${raceTrack.join("\n")}\n${finishLineString}`);
        await raceMessage.edit({ embeds: [raceEmbed] });

        if (!raceFinished) {
            setTimeout(updateRace, 1000); // Continue animation every second
        } else {
            // Determine winning horse
            const winningHorse = positions.indexOf(Math.max(...positions)) + 1;
            let resultMessage = `🏇 **Horse ${winningHorse} wins the race!**`;

            let winners = bets.filter(bet => bet.chosenHorse === winningHorse);
            if (winners.length > 0) {
                for (const winner of winners) {
                    const winnings = winner.betAmount * 3;
                    await profileModel.findOneAndUpdate(
                        {
                            userId: winner.userId
                        },
                        {
                            $inc: {
                                magicTokens: +winnings
                            }
                        },
                    );
                    resultMessage += `\n🎉 **${winner.username}** won **${winnings}** tokens! 💰`;
                }
            } else {
                resultMessage += `\n😢 No one bet on the winning horse. Better luck next time!`;
            }

            // Display final results
            raceEmbed.setTitle('🏆 Race Finished! 🏆')
                .setDescription(resultMessage)
                .setColor('#00FF00');

            await raceMessage.edit({ embeds: [raceEmbed] });

            // Reset for the next race
            bets = [];
            raceInProgress = false;
        }
    };

    // Start the race animation
    setTimeout(updateRace, 1000);
};
