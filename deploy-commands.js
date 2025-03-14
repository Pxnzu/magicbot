const { REST, Routes } = require('discord.js');
const { clientId, testClientId, guildId, token, testToken } = require('./config.json'); // Use your bot token and client ID
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON()); // Ensure .toJSON() is used
}

const rest = new REST({ version: '10' }).setToken(testToken); //                                    TOKEN

(async () => {
    try {
        console.log(`Refreshing ${commandFiles.length} application (/) commands...`);

        await rest.put(Routes.applicationCommands(testClientId), { body: commands }); //                CLIENTID

        console.log(`Successfully registered ${commandFiles.length} application commands.`);
    } catch (error) {
        console.error(error);
    }
})();