const { Client, Collection, Events, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

// hero roster
const characters = [
    { name : "Captain America", role: "Vanguard", remark: "" },
    { name : "Doctor Strange", role: "Vanguard", remark: "" },
    { name : "Emma Frost", role: "Vanguard", remark: "" },
    { name : "Groot", role: "Vanguard", remark: "I AM GROOT!!!" },
    { name : "Hulk", role: "Vanguard", remark: "" },
    { name : "Magneto", role: "Vanguard", remark: "" },
    { name : "Peni Parker", role: "Vanguard", remark: "I didn't know you were into 14 year olds..." },
    { name : "The Thing", role: "Vanguard", remark: "" },
    { name : "Thor", role: "Vanguard", remark: "" },
    { name : "Venom", role: "Vanguard", remark: "" },
    { name : "Black Panther", role: "Duelist", remark: "" },
    { name : "Black Widow", role: "Duelist", remark: "" },
    { name : "Hawkeye", role: "Duelist", remark: "" },
    { name : "Hela", role: "Duelist", remark: "We get it, you know how to aim." },
    { name : "Human Torch", role: "Duelist", remark: "" },
    { name : "Iron Fist", role: "Duelist", remark: "" },
    { name : "Iron Man", role: "Duelist", remark: "I hope you have a Hulk on your team." },
    { name : "Magik", role: "Duelist", remark: "" },
    { name : "Mister Fantastic", role: "Duelist", remark: "What a stupid character." },
    { name : "Moon Knight", role: "Duelist", remark: "Just tell them you can't aim." },
    { name : "Namor", role: "Duelist", remark: "What are you doing? This is not BTD5!" },
    { name : "Psylocke", role: "Duelist", remark: "Too bad you'll never be as good as Andrew!" },
    { name : "Scarlet Witch", role: "Duelist", remark: "Can't play anyone else, can you?" },
    { name : "Spider-Man", role: "Duelist", remark: "You're not him, pal." },
    { name : "Squirrel Girl", role: "Duelist", remark: "Prepare to be called a furry." },
    { name : "Star-Lord", role: "Duelist", remark: "" },
    { name : "Storm", role: "Duelist", remark: "Watch out for The Punisher..." },
    { name : "The Punisher", role: "Duelist", remark: "" },
    { name : "Winter Soldier", role: "Duelist", remark: "AGAIN!!!" },
    { name : "Wolverine", role: "Duelist", remark: "" },
    { name : "Adam Warlock", role: "Strategist", remark: "You might as well stand to the side and just watch." },
    { name : "Cloak & Dagger", role: "Strategist", remark: "" },
    { name : "Invisible Woman", role: "Strategist", remark: "" },
    { name : "Jeff the Land Shark", role: "Strategist", remark: "" },
    { name : "Loki", role: "Strategist", remark: "" },
    { name : "Luna Snow", role: "Strategist", remark: "" },
    { name : "Mantis", role: "Strategist", remark: "" },
    { name : "Rocket Raccoon", role: "Strategist", remark: "" }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rivalsflip')
        .setDescription('Get a comp for up to 6 players')
        .addStringOption(opt => opt.setName('player1').setDescription('Player 1').setRequired(true))
        .addStringOption(opt => opt.setName('player2').setDescription('Player 2'))
        .addStringOption(opt => opt.setName('player3').setDescription('Player 3'))
        .addStringOption(opt => opt.setName('player4').setDescription('Player 4'))
        .addStringOption(opt => opt.setName('player5').setDescription('Player 5'))
        .addStringOption(opt => opt.setName('player6').setDescription('Player 6')),
    
    async execute(interaction) {
        // collect provided player names
        const players = [];
        for (let i = 1; i <= 6; i++) {
            const name = interaction.options.getString(`player${i}`);
            if (name) players.push(name);
        }

        // length checks
        if (players.length === 1) {
            await interaction.reply("Playing alone is sad. Here are your assigned characters:");
        } else if (players.length === 2) {
            await interaction.reply("Wow, that's cute. Here are your assigned characters:");
        } else {
            // for 3+ players we just proceed without a special intro
            await interaction.reply("Here are your assigned characters:");
        }

        // assign & shuffle
        let roster = assignCharacters();
        roster.splice(players.length, roster.length - players.length);
        roster = shuffle(roster);

        // build an embed with each pairing
        const embed = new EmbedBuilder()
            .setTitle('🦸‍♂️ Rivals Flip Results')
            .setColor(0x00AE86);

        players.forEach((p, i) => {
            const c = roster[i];
            embed.addFields({
                name: p,
                value: `**${c.name}**\n${c.remark || '_No remark._'}`,
                inline: true
            });
        });

        // follow up with embed
        await interaction.followUp({ embeds: [embed] });
    }
};

// get a random character not in any of the excluded roles
function getRandomCharacter(excludedRoles = []) {
    const available = characters.filter(c => !excludedRoles.includes(c.role));
    return available[Math.floor(Math.random() * available.length)];
}

// build your 6‐slot roster with the role requirements
function assignCharacters() {
    const assigned = [];
    const vanguard   = characters.filter(c => c.role === "Vanguard");
    const duelist    = characters.filter(c => c.role === "Duelist");
    const strategist = characters.filter(c => c.role === "Strategist");

    // first 2 any‐role
    while (assigned.length < 2) {
        const pick = getRandomCharacter();
        if (!assigned.some(c => c.name === pick.name)) assigned.push(pick);
    }
    // slot 3: at least 1 Duelist
    while (assigned.length < 3) {
        const pick = duelist[Math.floor(Math.random() * duelist.length)];
        if (!assigned.some(c => c.name === pick.name)) assigned.push(pick);
    }
    // slot 4: at least 1 Vanguard
    while (assigned.length < 4) {
        const pick = vanguard[Math.floor(Math.random() * vanguard.length)];
        if (!assigned.some(c => c.name === pick.name)) assigned.push(pick);
    }
    // slots 5+6: at least 2 Strategists
    while (assigned.length < 6) {
        const pick = strategist[Math.floor(Math.random() * strategist.length)];
        if (!assigned.some(c => c.name === pick.name)) assigned.push(pick);
    }

  return assigned;
}

// Fisher–Yates shuffle
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}