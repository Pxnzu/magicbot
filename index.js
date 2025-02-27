/*
API DOCS ==> https://scryfall.com/docs/api
DISCORD.JS DOCS ==> https://discord.js.org/docs/packages/discord.js/14.18.0
To run bot ==> node index.js
EMBED LAYOUT ==> https://discordjs.guide/popular-topics/embeds.html#embed-preview
*/


const fs = require('node:fs');
const { Client, Collection, Events, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { token, testToken } = require("./config.json");

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
]});

// COMMANDS MUST BE DEPLOYED WHEN ADDED
// load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// log in console when bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

});

// call each command when triggered
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

//login
client.login(token);