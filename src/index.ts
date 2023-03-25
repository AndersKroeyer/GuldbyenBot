import { getAccessToken } from "./authClient"
import * as dotenv from "dotenv";
import { graphClient } from './graphQLClient';
import { getActors, getPulls } from "./queries/commonQueries";
import { discordClient, sendMessage } from "./discordClient"
import { sendZealotDamage } from "./queries/zealotBurst";
import { sendHeraldEvents } from "./queries/heraldShieldDamage";

(async () => {
    dotenv.config()

    const token = await getAccessToken();
    graphClient.setHeader("authorization", `Bearer ${token}`)
    const reportId = process.env.REPORT_ID as string;
    const pullId = parseInt(process.env.PULL_ID);
    discordClient.login(process.env.DISCORD_BOT_TOKEN);
    try {
        // const pulls = await getPulls(reportId);
        const players = await getActors(reportId);

        await sendHeraldEvents(reportId, pullId, players)
        // await sendZealotDamage(reportId, pullId, players);
    } catch (error) {
        console.error('Error occurred:', error);
        return null;
    }
})();