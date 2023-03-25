import { getAccessToken } from "./authClient"
import * as dotenv from "dotenv";
import { ReportData, ReportDataReportArgs, Query } from "./__generated__/graphql-types"
import { request, gql, GraphQLClient } from 'graphql-request';
import { client } from './graphQLClient';
import { getPulls } from "./queries";


(async () => {
    dotenv.config()
    const token = await getAccessToken();
    client.setHeader("authorization", `Bearer ${token}`)


    try {
        const pulls = await getPulls("Xq1HLafPrYvB7dMV");
    } catch (error) {
        console.error('Error occurred:', error);
        return null;
    }
})();


