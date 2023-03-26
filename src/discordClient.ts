import { REST, Routes, Client, GatewayIntentBits, Events, MessagePayload, SlashCommandBuilder } from 'discord.js'
import { AnalysisType, executeAnalysis } from './analysisCommandOrchestrator';
import { ReportActor } from './__generated__/graphql-types';

enum CommandInput {
    AnalysisType = "Analysis type",
    ReportId = "Report",
    FightId = "Pull"
}

export const discordClient: Client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

export const sendMessage = (title: string, message: string) => {
    const channel = discordClient.channels.cache.get('1089225613329580302') as any;
    channel.send(buildMessage(title, message));
}

export const buildMessage = (title: string, message: string): string => {
    return "**" + title + "**\n" + "```css\n" + message + "```\n"
}

export const setupCommandListeners = (players: ReportActor[]) => {
    discordClient.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'analyse') {
            const analysisType = interaction.options.getString(CommandInput.AnalysisType) as AnalysisType;
            const reportId = interaction.options.getString(CommandInput.ReportId);
            const fightId = interaction.options.getNumber(CommandInput.FightId);

            const replyFunc = (title, message) => interaction.reply(buildMessage(title, message))
            await executeAnalysis({
                type: analysisType,
                actors: players,
                messageCallbackFunc: replyFunc,
                fightId,
                reportId
            })
        }

        if (interaction.commandName === 'ping') {
            console.log(interaction)
            await interaction.reply('Wow much analytics');
        }
    });
    discordClient.login(process.env.DISCORD_BOT_TOKEN);
}

export const updateSlashCommands = async () => {
    const data = new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Analyse some warcraft logs')
        .addStringOption(option =>
            option.setName(CommandInput.AnalysisType.toString())
                .setDescription('What should the bot look for in the logs?')
                .setRequired(true)
                .addChoices(
                    { name: 'Herald shield damage', value: AnalysisType.Herald.toString() },
                    { name: 'Zealot 2 burst in 10sec', value: AnalysisType.Zealot.toString() },
                ))
        .addStringOption(option =>
            option.setName(CommandInput.ReportId.toString())
                .setRequired(true)
                .setDescription('The id of the report. For example when at warcraftlogs.com/reports/XYZ it is the text after the last /'))
        .addNumberOption(option =>
            option.setName(CommandInput.FightId.toString())
                .setDescription("The # pull which should be analyzed"))

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID),
        { body: data },
    );
}