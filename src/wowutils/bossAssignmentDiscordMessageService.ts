import { CreateGallywixMessage } from './assignmentFormatter/gallywix';
import { WowUtilsCookieApiClient } from './wowUtilsCookieApiClient';
import { RaidAssignment } from './types';

export enum SupportedBoss {
  Gallywix = 'gallywix',
}

export type BossAssignmentParams = {
  boss: SupportedBoss;
};

export const getBossAssignments = async ({
  boss,
}: BossAssignmentParams): Promise<string> => {
  var client = new WowUtilsCookieApiClient();
  await client.loadCookies();

  switch (boss) {
    case SupportedBoss.Gallywix:
      var assignment = await client.get<RaidAssignment>(
        '/viserio-cooldowns/api//assignment/load/67f97823c7b79dd8192422a1',
      );
      return CreateGallywixMessage(assignment);

    default:
      const msg = `Unsupported boss ${boss}.`;
      console.log(msg);
      return null;
  }
};
