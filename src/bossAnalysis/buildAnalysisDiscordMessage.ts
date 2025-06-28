import { AnalysisType, executeAnalysis } from './analysisCommandOrchestrator';
import { getActors } from './queries/commonQueries';

export async function buildDiscordMessage(fightId: number, reportId: string, analysisType: AnalysisType): Promise<string> {
    const players = await getActors(reportId);
      const resultMessages = await executeAnalysis({
        type: analysisType,
        actors: players,
        fightId,
        reportId,
      });
      return resultMessages
        .map((x) => buildMessage(x.title, x.message))
        .join('\n');
}

const buildMessage = (title: string, message: string): string => {
  return '**' + title + '**\n' + '```css\n' + message + '```\n';
};