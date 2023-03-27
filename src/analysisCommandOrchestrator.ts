import { sendHeraldEvents } from './queries/heraldShieldDamage';
import { sendZealotDamage } from './queries/zealotBurst';
import { ReportActor } from './__generated__/graphql-types';

export enum AnalysisType {
  Herald = 'herald',
  Zealot = 'zealot',
}

export type ExecuteAnalysisParams = {
  type: AnalysisType;
  reportId: string;
  fightId: number;
  actors: ReportActor[];
};
export type AnalysisResultMessage = {
  title: string;
  message: string;
};

export const executeAnalysis = async ({
  type,
  reportId,
  fightId,
  actors,
}: ExecuteAnalysisParams): Promise<AnalysisResultMessage[]> => {
  switch (type) {
    case AnalysisType.Herald:
      return await sendHeraldEvents(reportId, fightId, actors);
    case AnalysisType.Zealot:
      return await sendZealotDamage(reportId, fightId, actors);
    default:
      const msg = `Error when evaluating analysis type ${type}.`;
      console.log(msg);
  }
};
