const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);

module.exports = async (client) => {
    try {
        const SlashsArray = [];

        const folders = await readdir('./src/slash');
        for (const subfolder of folders) {
            const files = await readdir(`./src/slash/${subfolder}/`);
            for (const file of files) {
                if (!file.endsWith('.js')) continue;
                const command = require(`../slash/${subfolder}/${file}`);
                if (!command.name) continue;
                client.slashCommands.set(command.name, command);
                SlashsArray.push(command);
            }
        }

        client.on("ready", async () => {
            await client.application.commands.set(SlashsArray);
            console.log('Slash commands have been registered globally.');
        });

    } catch (error) {
        console.error('Error loading slash commands', error);
    }

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error, origin) => {
        console.error('Uncaught Exception:', error);
        console.error('Origin:', origin);
    });

    process.on('uncaughtExceptionMonitor', (error, origin) => {
        console.error('Uncaught Exception (MONITOR):', error);
        console.error('Origin:', origin);
    });
};
