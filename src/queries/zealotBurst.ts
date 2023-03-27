import {
  ReportDataReportArgs,
  Query,
  ReportEventsArgs,
  EventDataType,
  ReportActor,
} from '../__generated__/graphql-types';
import { graphClient } from '../graphQLClient';
import { gql } from 'graphql-request';
import { DamageEvent } from '../types';
import { combinePlayerAndPetDamage } from '../calculations';
import { AnalysisResultMessage } from 'src/analysisCommandOrchestrator';

type getZealotEventsParams = {
  code: string;
  fightId: number;
  zealotId: number;
};
const getZealotEvents = async ({
  code,
  fightId,
  zealotId,
}: getZealotEventsParams): Promise<DamageEvent[]> => {
  const reportArgs: ReportDataReportArgs = { code };
  const eventArgs: ReportEventsArgs = {
    fightIDs: [fightId],
    dataType: EventDataType.DamageDone,
    targetID: zealotId,
  };
  const data = await graphClient.request<Query>(
    gql`
      query ($code: String, $fightIDs: [Int], $targetID: Int) {
        reportData {
          report(code: $code) {
            events(
              fightIDs: $fightIDs
              targetID: $targetID
              dataType: DamageDone
              targetInstanceID: 2
              limit: 1000
            ) {
              nextPageTimestamp
              data
            }
          }
        }
      }
    `,
    { ...reportArgs, ...eventArgs },
  );

  const eventsData = data.reportData.report.events.data;
  if (eventsData.length == 0) {
    return [];
  }
  const earliestEventTimestamp = eventsData[0].timestamp;
  const cutoffTimestamp = earliestEventTimestamp + 10000;

  return data.reportData.report.events.data.filter(
    (x) => x.timestamp <= cutoffTimestamp,
  );
};

export const sendZealotDamage = async (
  reportCode: string,
  pullId: number,
  actors: ReportActor[],
): Promise<AnalysisResultMessage[]> => {
  const zealotEvents = await getZealotEvents({
    code: reportCode,
    fightId: pullId,
    zealotId: actors.find((x) => x.name === 'Frostforged Zealot').id,
  });
  const output = combinePlayerAndPetDamage(
    actors,
    zealotEvents,
    (e) => e.amount,
  );

  const entries = Array.from(output.entries());
  if (entries.length === 0) return;

  const message = entries
    .map((x) => `${x[0].padEnd(12, ' ')} - ${x[1]} \n`)
    .join('');
  const title = `[report ${reportCode}, pull ${pullId}] - 10sec burst damage on the second zealot`;
  return [{ title, message }];
};
