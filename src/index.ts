import { getAccessToken } from "./authClient"
import * as dotenv from "dotenv";
import { graphClient } from './graphQLClient';
import { getActors, getPulls } from "./queries/commonQueries";
import { discordClient, sendMessage } from "./discordClient"
import { sendZealotDamage } from "./queries/zealotBurst";
import { sendHeraldEvents } from "./queries/heraldShieldDamage";
import { AnalysisType, executeAnalysis } from "./analysisCommandOrchestrator";

let previousPullIds: number[] = [];

const fetchDataAndSend = async (reportId: string, analysisType: AnalysisType) => {
    try {
        console.log("Fetching pulls")
        const pullIds = await getPulls(reportId);
        const players = await getActors(reportId);

        if (previousPullIds.length !== pullIds.length) {
            const lastPull = pullIds[pullIds.length - 1]
            console.log(`pull ${lastPull} looks new, doing analysis`)
            await executeAnalysis({
                type: analysisType,
                actors: players,
                fightId: lastPull,
                messageCallbackFunc: sendMessage,
                reportId
            })
        } else {
            console.log(`Poll for new pulls (lol) did not return something new. Old: ${previousPullIds.length} - new ${pullIds.length}`)
        }
        previousPullIds = pullIds
    } catch (e) {
        console.error('Error occurred:', e);
    }
}

(async () => {
    dotenv.config()
    const token = await getAccessToken();
    graphClient.setHeader("authorization", `Bearer ${token}`)
    discordClient.login(process.env.DISCORD_BOT_TOKEN);
    const reportId = process.env.REPORT_ID;
    // const reportId2 = process.env.REPORT_ID2;
    setInterval(() => fetchDataAndSend(reportId, AnalysisType.Herald), 30 * 1000); //Red
    // setInterval(() => fetchDataAndSend(reportId2, AnalysisType.Zealot), 30 * 1000); //Blue
})();

