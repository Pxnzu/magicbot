const { REST, Routes } = require('discord.js');
const { testClientId, guildId, testToken } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(testToken);

(async () => {
    try {
        console.log('Removing all guild commands...');
        await rest.put(Routes.applicationGuildCommands(testClientId, guildId), { body: [] });
        console.log('Guild commands removed!');
    } catch (error) {
        console.error(error);
    }
})();