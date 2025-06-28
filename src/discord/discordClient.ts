import {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Events,
} from 'discord.js';
import { buildDiscordMessage } from '../bossAnalysis/buildAnalysisDiscordMessage';
import { AnalysisType } from '../bossAnalysis/analysisCommandOrchestrator';
import { SupportedBoss } from '../wowutils/supportedBoss';
import { getBossAssignments } from '../wowutils/bossAssignmentOrchestrator';

enum LogsCommandInput {
  AnalysisType = 'analysis_type',
  ReportId = 'report',
  FightId = 'pull',
}

enum AssignmentCommandInput {
  Boss = 'boss',
}

enum CommandName {
  Logs = 'logs',
  Assignments = 'assignments',
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

export const setupCommandListeners = () => {
  discordClient.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === CommandName.Logs) {
      await interaction.deferReply();
      const analysisType = interaction.options.getString(
        LogsCommandInput.AnalysisType,
      ) as AnalysisType;
      const reportId = interaction.options.getString(LogsCommandInput.ReportId);
      const fightId = interaction.options.getNumber(LogsCommandInput.FightId);

      var reply = await buildDiscordMessage(fightId, reportId, analysisType);

      interaction.editReply(reply);
    }

    if (interaction.commandName == CommandName.Assignments) {
      await interaction.deferReply();
      const boss = interaction.options.getString(
        AssignmentCommandInput.Boss,
      ) as SupportedBoss;

      var reply = await getBossAssignments({ boss });
      interaction.editReply(reply);
    }
  });
};

// manually invoke this to update slash commands
export const updateSlashCommands = async () => {
  // const data = new SlashCommandBuilder()
  //   .setName(CommandName.Logs)
  //   .setDescription('Analyse some warcraft logs')
  //   .addStringOption((option) =>
  //     option
  //       .setName(LogsCommandInput.AnalysisType)
  //       .setDescription('What should the bot look for in the logs?')
  //       .setRequired(true)
  //       .addChoices(
  //         { name: 'Herald shield damage', value: AnalysisType.Herald },
  //         { name: 'Zealot 2 burst in 10sec', value: AnalysisType.Zealot },
  //       ),
  //   )
  //   .addStringOption((option) =>
  //     option
  //       .setName(LogsCommandInput.ReportId)
  //       .setRequired(true)
  //       .setDescription('The id of the report'),
  //   )
  //   .addNumberOption((option) =>
  //     option
  //       .setName(LogsCommandInput.FightId)
  //       .setDescription('The pull which should be analyzed'),
  //   );

  const data = new SlashCommandBuilder()
    .setName(CommandName.Assignments)
    .setDescription('Post updated assignments from wowutils')
    .addStringOption((option) =>
      option
        .setName(AssignmentCommandInput.Boss)
        .setDescription('Which boss do you want assignments for?')
        .setRequired(true)
        .addChoices({ name: 'Gally', value: SupportedBoss.Gallywix }),
    );

  const rest = new REST({ version: '10' }).setToken(
    process.env.DISCORD_BOT_TOKEN,
  );

  const commands = [];
  commands.push(data.toJSON());

  const res = await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_BOT_CLIENT_ID,
      process.env.DISCORD_SERVER_ID,
    ),
    { body: commands },
  );

  console.log('updated slash commands', res);
};
