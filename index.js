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

});S



client.once(Events.ClientReady, c => {

	const ping = new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with pong!")

	const server = new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.')

	client.application.commands.create(ping);
	client.application.commands.create(server);
});

client.on(Events.InteractionCreate, interaction => {
	if(interaction.commandName === "ping"){
		interaction.reply("pong!");
	}
});

client.login(token);