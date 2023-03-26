import { sendHeraldEvents } from "./queries/heraldShieldDamage";
import { sendZealotDamage } from "./queries/zealotBurst";
import { ReportActor } from "./__generated__/graphql-types";

export enum AnalysisType {
    Herald = "HERALD",
    Zealot = "ZEALOT"
}

export type ExecuteAnalysisParams = {
    type: AnalysisType;
    reportId: string;
    fightId: number;
    actors: ReportActor[]
    messageCallbackFunc: (title: string, message: string) => void
}

export const executeAnalysis = async ({ type, reportId, fightId, actors, messageCallbackFunc }: ExecuteAnalysisParams) => {
    switch (type) {
        case AnalysisType.Herald:
            await sendHeraldEvents(reportId, fightId, actors, messageCallbackFunc)
            break;
        case AnalysisType.Zealot:
            await sendZealotDamage(reportId, fightId, actors, messageCallbackFunc)
            break;
        default:
            const msg = `Error when evaluating analysis type ${type}.`
            console.log(msg)
    }
}