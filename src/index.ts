import { getAccessToken } from "./authClient"
import * as dotenv from "dotenv";
import { graphClient } from './graphQLClient';
import { getActors, getPulls } from "./queries/commonQueries";
import { discordClient, sendMessage, updateSlashCommands } from "./discordClient"
import { AnalysisType, executeAnalysis } from "./analysisCommandOrchestrator";

let previousPullIds1: number[] = [];
let previousPullIds2: number[] = [];

const fetchDataAndSend = async (reportId: string, analysisType: AnalysisType, oldPulls: number[]) => {
    try {
        console.log("Fetching pulls")
        const pullIds = await getPulls(reportId);
        const players = await getActors(reportId);

        if (!pullIds)
            return;

        if (oldPulls.length !== pullIds.length) {
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
            console.log(`${oldPulls.length} Poll for new pulls (lol) did not return something new. Old: ${oldPulls.length} - new ${pullIds.length}`)
        }
        oldPulls = pullIds
    } catch (e) {
        console.error('Error occurred:', e);
    }
}

(async () => {
    dotenv.config()
    const token = await getAccessToken();
    graphClient.setHeader("authorization", `Bearer ${token}`)
    discordClient.login(process.env.DISCORD_BOT_TOKEN);
    const reportId = "jX9Rt3CrhQPJ6gnV";
    const reportId2 = "ZDg7dzkTL2x9KPMF";
    fetchDataAndSend(reportId, AnalysisType.Herald, previousPullIds1)
    fetchDataAndSend(reportId2, AnalysisType.Zealot, previousPullIds2)
    //setInterval(() => fetchDataAndSend(reportId, AnalysisType.Herald, previousPullIds1), 30 * 1000); //Red
    //setInterval(() => fetchDataAndSend(reportId2, AnalysisType.Zealot, previousPullIds2), 30 * 1000); //Blue
})();

