const { Client, IntentsBitField } = require ('discord.js');

const bot = new Client ({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

const TOKEN = process.env.BOT_TOKEN;
client.login(TOKEN);