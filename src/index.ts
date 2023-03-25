import { getAccessToken } from "./authClient"
import * as dotenv from "dotenv";
import { ReportData, ReportDataReportArgs, Query } from "./__generated__/graphql-types"
import { request, gql, GraphQLClient } from 'graphql-request';
import { client } from './graphQLClient';
import { getPlayers, getPulls, getZealotEvents } from "./queries";
import { AddDamageEvents } from "./calculations";


(async () => {
    dotenv.config()
    const token = await getAccessToken();
    client.setHeader("authorization", `Bearer ${token}`)


    try {
        const reportCode = "Xq1HLafPrYvB7dMV";
        const pulls = await getPulls(reportCode);
        const players = await getPlayers(reportCode);
        const zealotEvents = await getZealotEvents({ code: reportCode, fightId: pulls[pulls.length - 2] })

        const output = AddDamageEvents(players, zealotEvents);

        console.log(output)
    } catch (error) {
        console.error('Error occurred:', error);
        return null;
    }
})();


