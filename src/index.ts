import { getAccessToken } from "./authClient"
import * as dotenv from "dotenv";
import { ReportData, ReportDataReportArgs, Query, ReportActor } from "./__generated__/graphql-types"
import { request, gql, GraphQLClient } from 'graphql-request';
import { graphClient } from './graphQLClient';
import { getPlayers, getPulls, getZealotEvents } from "./queries";
import { AddDamageEvents } from "./calculations";
import { discordClient, sendMessage } from "./discordClient"
import { REST, Routes } from 'discord.js'

(async () => {
    dotenv.config()

    const token = await getAccessToken();
    graphClient.setHeader("authorization", `Bearer ${token}`)
    const reportId = process.env.REPORT_ID as string;
    const pullId = parseInt(process.env.PULL_ID);

    try {
        const pulls = await getPulls(reportId);
        const players = await getPlayers(reportId);

        // await sendZealotDamage(reportId, pullId, players);
    } catch (error) {
        console.error('Error occurred:', error);
        return null;
    }
})();

const sendZealotDamage = async (reportCode: string, pullId: number, players: ReportActor[]) => {
    const zealotEvents = await getZealotEvents({ code: reportCode, fightId: pullId })
    const output = AddDamageEvents(players, zealotEvents);
    const message = Array.from(output.entries())
        .map(x => `${x[0].padEnd(12, " ")} - ${x[1]} \n`)
        .join('')
    sendMessage(`[report ${reportCode}, pull ${pullId}] - 10sec burst damage on the second zealot`, message)
}
