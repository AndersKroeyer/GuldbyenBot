import { getAccessToken } from '../warcraftLogs/authClient';
import * as dotenv from 'dotenv';
import { graphClient } from '../warcraftLogs/graphQLClient';
import { getActors, getPulls } from './queries/commonQueries';
import {
  buildMessage,
  discordClient,
  sendChannelMessage,
  setupCommandListeners,
  updateSlashCommands,
} from '../discord/discordClient';
import { AnalysisType, executeAnalysis } from './analysisCommandOrchestrator';

let previousPullIds1: number[] = [];
let previousPullIds2: number[] = [];

const fetchDataAndSend = async (
  reportId: string,
  analysisType: AnalysisType,
  oldPulls: number[],
): Promise<number[]> => {
  try {
    console.log('Fetching pulls');
    const pullIds = await getPulls(reportId);
    const players = await getActors(reportId);

    if (!pullIds) return;

    if (oldPulls.length !== pullIds.length) {
      const lastPull = pullIds[pullIds.length - 1];
      console.log(`pull ${lastPull} looks new, doing analysis`);
      const analysisResult = await executeAnalysis({
        type: analysisType,
        actors: players,
        fightId: lastPull,
        reportId,
      });

      if (!analysisResult) return;

      const reply = analysisResult
        .map((x) => buildMessage(x.title, x.message))
        .join('\n');
      sendChannelMessage(reply);
    } else {
      console.log(
        `${oldPulls.length} Poll for new pulls (lol) did not return something new. Old: ${oldPulls.length} - new ${pullIds.length}`,
      );
    }
    return previousPullIds1;
  } catch (e) {
    console.error('Error occurred:', e);
  }
};

(async () => {
  dotenv.config();
  const token = await getAccessToken();
  graphClient.setHeader('authorization', `Bearer ${token}`);

  await setupCommandListeners();
  discordClient.login(process.env.DISCORD_BOT_TOKEN);
  const heraldReport = 'g8fcw6ZhrTvRd7aB';
  const zealotReport = 'Q6rwtLhWYjZHcB3J';

  // setInterval(async () => {
  //   previousPullIds1 = await fetchDataAndSend(
  //     heraldReport,
  //     AnalysisType.Herald,
  //     previousPullIds1,
  //   );
  // }, 30 * 1000);

  // setInterval(async () => {
  //   previousPullIds2 = await fetchDataAndSend(
  //     zealotReport,
  //     AnalysisType.Zealot,
  //     previousPullIds2,
  //   );
  // }, 30 * 1000);
})();
