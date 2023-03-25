import { ReportDataReportArgs, Query, ReportEventsArgs, EventDataType, ReportActor } from "../__generated__/graphql-types"
import { graphClient } from '../graphQLClient';
import { gql } from 'graphql-request';
import { DamageEvent } from '../types';
import { combinePlayerAndPetDamage } from "../calculations";
import { sendMessage } from "../discordClient";

type getHeraldEventsParams = {
    code: string;
    fightId: number;
    heraldId: number;
}


export const getOneHeraldEvents = async (reportArgs: ReportDataReportArgs, eventArgs: ReportEventsArgs, heraldInstanceId: number): Promise<DamageEvent[]> => {
    eventArgs.targetInstanceID = heraldInstanceId;
    const data = await graphClient.request<Query>(gql`
        query ($code: String, $fightIDs: [Int], $targetID: Int, $targetInstanceID: Int) {
            reportData {
                report(code: $code) {
                    events(fightIDs: $fightIDs, targetID: $targetID, targetInstanceID: $targetInstanceID, dataType: DamageDone, limit: 1000) {
                        nextPageTimestamp, 
                        data
                    }
                }
            }
        }
    `, { ...reportArgs, ...eventArgs });

    const eventsData = data.reportData.report.events.data as DamageEvent[]
    if (eventsData.length == 0) {
        return [];
    }

    const shieldAmount = 1629000;

    const earliestEventTimestamp = eventsData[0].timestamp;
    const cutoffTimestamp = earliestEventTimestamp + 5500;
    const validDamage: DamageEvent[] = []
    let damageSoFar: number = 0
    eventsData
        .filter(x => x.timestamp >= cutoffTimestamp)
        .forEach(x => {
            if (damageSoFar < shieldAmount) {
                damageSoFar = damageSoFar + x.amount
                validDamage.push(x)
            }
        })

    //Før skjold: 250k, efter skjold 520k  ---- 280k skjold damage
    return validDamage;
}

const getHeraldEvents = async ({ code, fightId, heraldId }: getHeraldEventsParams): Promise<Map<number, DamageEvent[]>> => {
    const reportArgs: ReportDataReportArgs = { code };
    const eventArgs: ReportEventsArgs = { fightIDs: [fightId], dataType: EventDataType.DamageDone, targetID: heraldId };

    const heraldEventMap = new Map<number, DamageEvent[]>();
    for (var i = 1; i <= 3; i++) {
        heraldEventMap.set(i, (await getOneHeraldEvents(reportArgs, eventArgs, i)))
        heraldEventMap.set(i, (await getOneHeraldEvents(reportArgs, eventArgs, i)))
        heraldEventMap.set(i, (await getOneHeraldEvents(reportArgs, eventArgs, i)))
    }


    return heraldEventMap;
}

export const sendHeraldEvents = async (reportCode: string, pullId: number, actors: ReportActor[]) => {
    const events = await getHeraldEvents({ code: reportCode, fightId: pullId, heraldId: actors.find(x => x.name === "Flamesworn Herald").id })
    console.log(events.get(1).length)
    console.log(events.get(2).length)
    console.log(events.get(3).length)

    const mappedValues = {
        1: combinePlayerAndPetDamage(actors, events.get(1)),
        2: combinePlayerAndPetDamage(actors, events.get(2)),
        3: combinePlayerAndPetDamage(actors, events.get(3))
    }

    // for (var i = 1; i <= 3; i++) {
    //     const message = Array.from(mappedValues[i].entries())
    //         .map(x => `${x[0].padEnd(12, " ")} - ${x[1]} \n`)
    //         .join('')
    //     sendMessage(`[report ${reportCode}, pull ${pullId}] - herald ${i} shield damage`, message)
    // }
}
