/*



*/


const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, SlashCommandBuilder, GatewayIntentBits } = require('discord.js');
const { token } = require("./config.json");

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
]});



client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

});



client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${client.user.tag}!`);

	const ping = new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with pong!")

	client.application.commands.create(ping);
});

client.on(Events.InteractionCreate, interaction => {
	if(interaction.commandName === "ping"){
		interaction.reply("pong!");
	}
});

client.login(token);