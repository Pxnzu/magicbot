const { Client, GatewayIntentBits } = require ('discord.js');
const { BOT_TOKEN } = require("./config.json");

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
]});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

client.login(BOT_TOKEN);