import {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  Events,
  MessagePayload,
  SlashCommandBuilder,
} from 'discord.js';
import { AnalysisType, executeAnalysis } from './analysisCommandOrchestrator';
import { getActors } from './queries/commonQueries';

enum CommandInput {
  AnalysisType = 'analysis_type',
  ReportId = 'report',
  FightId = 'pull',
}

enum CommandName {
  Logs = 'logs',
}

export const discordClient: Client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

export const sendChannelMessage = (message: string) => {
  const channel = discordClient.channels.cache.get(
    '1089225613329580302',
  ) as any;
  channel.send(message);
};

export const buildMessage = (title: string, message: string): string => {
  return '**' + title + '**\n' + '```css\n' + message + '```\n';
};

export const setupCommandListeners = () => {
  discordClient.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === CommandName.Logs) {
      await interaction.deferReply();
      const analysisType = interaction.options.getString(
        CommandInput.AnalysisType,
      ) as AnalysisType;
      const reportId = interaction.options.getString(CommandInput.ReportId);
      const fightId = interaction.options.getNumber(CommandInput.FightId);
      const players = await getActors(reportId);
      const resultMessages = await executeAnalysis({
        type: analysisType,
        actors: players,
        fightId,
        reportId,
      });
      const reply = resultMessages
        .map((x) => buildMessage(x.title, x.message))
        .join('\n');
      interaction.editReply(reply);
    }
  });
};

export const updateSlashCommands = async () => {
  const data = new SlashCommandBuilder()
    .setName(CommandName.Logs)
    .setDescription('Analyse some warcraft logs')
    .addStringOption((option) =>
      option
        .setName(CommandInput.AnalysisType)
        .setDescription('What should the bot look for in the logs?')
        .setRequired(true)
        .addChoices(
          { name: 'Herald shield damage', value: AnalysisType.Herald },
          { name: 'Zealot 2 burst in 10sec', value: AnalysisType.Zealot },
        ),
    )
    .addStringOption((option) =>
      option
        .setName(CommandInput.ReportId)
        .setRequired(true)
        .setDescription('The id of the report'),
    )
    .addNumberOption((option) =>
      option
        .setName(CommandInput.FightId)
        .setDescription('The pull which should be analyzed'),
    );

  const rest = new REST({ version: '10' }).setToken(
    process.env.DISCORD_BOT_TOKEN,
  );
  const commands = [];
  commands.push(data.toJSON());
  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID),
    { body: commands },
  );
};
