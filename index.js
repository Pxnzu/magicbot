/*
API DOCS ==> https://scryfall.com/docs/api
DISCORD.JS DOCS ==> https://discord.js.org/docs/packages/discord.js/14.18.0
To run bot ==> node index.js
*/


const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder } = require('discord.js');
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

	const ping = new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with pong!")

	const server = new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.')

	const user = new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.')
/*
	const randomCard = new SlashCommandBuilder()
		.setName('randomCard')
		.setDescription('Gives user random Magic card')
*/	
	const card = new SlashCommandBuilder()
		.setName('card')
		.setDescription('Get information about a Magic: The Gathering card')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name of the card')
				.setRequired(true))
	client.application.commands.create(ping);
	client.application.commands.create(server);
	client.application.commands.create(user);
	// client.application.commands.create(randomCard);
	client.application.commands.create(card);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if(interaction.commandName === "ping"){
		interaction.reply("pong!");
	}
	if(interaction.commandName === "server"){
		interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`)
	}
	if(interaction.commandName === "user"){
		interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`)
	}
	if(interaction.commandName === "randomCard"){
		const randomUrl = `https://api.scryfall.com/cards/random`;
	}
	if(interaction.commandName === "card"){
		const cardName = interaction.options.getString('name');
		const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`;
	
		try {
			const response = await fetch(url);
			if (!response.ok) {
				return interaction.reply('Card not found. Please try a different name.');
			} 
			const cardData = await response.json();
			const embed = new EmbedBuilder().setColor('LuminousVividPink').setURL(cardData.scryfall_uri || 'https://scryfall.com')
			if (cardData.card_faces) {
				const face1 = cardData.card_faces[0];
				const face2 = cardData.card_faces[1];

				embed
					.setTitle(`${face1.name} // ${face2.name}`)
					.setDescription('MarketPrice: $' + cardData.prices.usd + '\nFoil: $' + cardData.prices.usd_foil)
					.setImage(face1.image_uris.normal || '')
					.addFields(
                    	{ name: 'Set', value: cardData.set_name, inline: true }
				);
			
			} else {
				embed
					.setTitle(cardData.name)
					.setDescription('MarketPrice: $' + cardData.prices.usd + '\nFoil: $' + cardData.prices.usd_foil)
					.setImage(cardData.image_uris.normal || '')
					.addFields(
                    	{ name: 'Set', value: cardData.set_name, inline: true }
				);
			}
			interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			interaction.reply('An error occurred while fetching the card data.');
		}
	}
});

client.login(token);

/*
				.setURL(cardData.scryfall_uri)
*/