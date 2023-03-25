import { REST, Routes, Client, GatewayIntentBits, Events, MessagePayload } from 'discord.js'

export const discordClient: Client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

export const sendMessage = (title: string, message: string) => {

    const channel = discordClient.channels.cache.get('1089225613329580302') as any;
    channel.send("**" + title + "**\n\n" + "```css\n" + message + "```");
}


export const setupCommandListeners = () => {
    discordClient.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'ping') {
            console.log(interaction)
            await interaction.reply('Wow much analytics');
        }
    });

    discordClient.login(process.env.DISCORD_BOT_TOKEN);
}