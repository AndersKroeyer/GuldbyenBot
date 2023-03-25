import { graphClient } from './graphQLClient';
import { gql } from 'graphql-request';
import { ReportDataReportArgs, Query, ReportEventsArgs, EventDataType, ReportActor } from "./__generated__/graphql-types"
import { DamageEvent } from './types';

export const getPulls = async (code: string): Promise<number[]> => {
    const variables: ReportDataReportArgs = { code: code };

    const data = await graphClient.request<Query>(gql`
        query ($code: String) {
            reportData {
                report(code: $code) {
                    fights {
                        id
                    }
                }
            }
        }
    `, variables);

    return data.reportData.report.fights.map(x => x.id);
}


type getZealotEventsParams = {
    code: string;
    fightId: number;
}
export const getZealotEvents = async ({ code, fightId }: getZealotEventsParams): Promise<DamageEvent[]> => {
    const reportArgs: ReportDataReportArgs = { code };
    const eventArgs: ReportEventsArgs = { fightIDs: [fightId], dataType: EventDataType.DamageDone };
    console.log("fetching zealot data from fight ", fightId)
    const data = await graphClient.request<Query>(gql`
        query ($code: String, $fightIDs: [Int]) {
            reportData {
                report(code: $code) {
                    events(fightIDs: $fightIDs, targetID: 138, dataType: DamageDone, targetInstanceID: 2) {
                        nextPageTimestamp, data
                    }
                }
            }
        }
    `, { ...reportArgs, ...eventArgs });

    const eventsData = data.reportData.report.events.data
    console.log("raw event data count: ", eventsData.length)
    if (eventsData.length == 0) {
        return [];
    }
    const earliestEventTimestamp = eventsData[0].timestamp;
    const cutoffTimestamp = earliestEventTimestamp + 10000;

    return data.reportData.report.events.data.filter(x => x.timestamp <= cutoffTimestamp);
}

export const getPlayers = async (code: string): Promise<ReportActor[]> => {
    const variables: ReportDataReportArgs = { code: code };

    const data = await graphClient.request<Query>(gql`
        query ($code: String) {
            reportData {
                report(code: $code) {
                    masterData { actors {id, name, petOwner, type }}
                }
            }
        }
    `, variables);

    return data.reportData.report.masterData.actors;
}
