/*
API DOCS ==> https://scryfall.com/docs/api
DISCORD.JS DOCS ==> https://discord.js.org/docs/packages/discord.js/14.18.0
To run bot ==> node index.js
EMBED LAYOUT ==> https://discordjs.guide/popular-topics/embeds.html#embed-preview
*/


const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { token, testToken } = require("./config.json");

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
				await interaction.deferReply();
				const face1 = cardData.card_faces[0];
				const face2 = cardData.card_faces[1];

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
						.setTitle(face2.name)
						.setURL(cardData.scryfall_uri || 'https://scryfall.com')
						.setDescription('On back: ' + face1.name)
						.setImage(face2.image_uris.normal || '')
						.addFields(
							{ name: '', value: 'Set: ' + cardData.set_name },
							{ name: '\u200B', value: '\u200B' },
							{ name: 'MarketPrice:', value: '$' + cardData.prices.usd, inline: true },
							{ name: 'Foil:', value: '$' + cardData.prices.usd_foil, inline: true }
					)
						
				];

				let currentPage = 0;

				const row = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('prev')
							.setEmoji('◀️')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId('next')
							.setEmoji('▶️')
							.setStyle(ButtonStyle.Primary)
					);
				const message = interaction.editReply({ embeds: [pages[currentPage]], components: [row], withResponse: true });

				const filter = i => i.user.id === interaction.user.id && ['prev', 'next'].includes(i.customId);
				const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

				collector.on('collect', async i => {
					if (i.customId === 'prev' && currentPage > 0) {
						currentPage--;
					} else if (i.customId === 'next' && currentPage < pages.length - 1) {
						currentPage++;
					}
		
					row.components[0].setDisabled(currentPage === 0);
					row.components[1].setDisabled(currentPage === pages.length - 1);
		
					await i.update({ embeds: [pages[currentPage]], components: [row] });
				});



			} else {
				embed
					.setTitle(cardData.name)
					.setDescription('On back: ' + cardData.name)
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
			console.error(error);
			interaction.reply('An error occurred while fetching the card data.');
		}
	}
});

client.login(token);

/*
				.setURL(cardData.scryfall_uri)
*/