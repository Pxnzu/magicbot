// To run bot ==> node index.js
// To redeploy commands ==> node deploy-commands.js

const fs = require('node:fs');
const { Client, Collection, Events, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { token, testToken, MONGODB: database } = require("./config.json");
const mongoose = require("mongoose");
const profileModel = require("./models/profileSchema");
const ownedCardsModel = require("./models/ownedCardsSchema");

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

    // get user db information and pass to command
    let profileData;
    try {
        profileData = await profileModel.findOne({userId: interaction.user.id})
        if(!profileData) {
            profileData = await profileModel.create({
                username: interaction.user.username,
                userId: interaction.user.id,
                serverId: interaction.guild.id,
                ownedCards:  []
            })
        }
    } catch (error) {
        console.log(error);
    }

    let ownedCardsData;
    try {
        ownedCardsData = await ownedCardsModel.findOne({serverId: interaction.guild.id})
        if(!ownedCardsData) {
            ownedCardsData = await ownedCardsModel.create({
                serverId: interaction.guild.id,
            })
        }
    } catch (error) {
        console.log(error);
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    // execute command
    try {
        await command.execute(interaction, profileData);
    } catch (error) {
        console.error(error);
        try {
            await interaction.reply({ content: 'There was an error executing this command!'});
        } catch (error) {
            
        }
        await interaction.editReply({ content: 'There was an error executing this command!'});
    }
});

// login to database
mongoose
    .connect(database, {
        
    }).then(() => {
        console.log("Connected to the database!")
    }).catch((err) => {
        console.log(err)
    })

//login
client.login(testToken);