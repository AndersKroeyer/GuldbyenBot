import { ApiAssignmentResponse, ApiPlayer } from './types';
import { WowUtilsCookieApiClient } from './wowUtilsCookieApiClient';
import { RosterMember } from './types';

export interface FarmSetupResult {
  bench: string[];
  raiders: string[];
  bossSetups: Record<string, { raidersIn: string[]; raidersOut: string[] }>;
}

export const processFarmSetup = async (): Promise<FarmSetupResult> => {
  const client = new WowUtilsCookieApiClient();
  await client.loadCookies();

  const resetId = '67ec57dd22f2dcd7008b94d8';

  const data = await client.get<ApiAssignmentResponse>(
    `/viserio-cooldowns/api/resets/${resetId}/get`,
  );
  const setup = data.data.setups[0];

  const bench = getPlayersByActiveStatus(
    setup.roster,
    setup.activeStatus,
    false,
  );
  const raiders = getPlayersByActiveStatus(
    setup.roster,
    setup.activeStatus,
    true,
  );

  const bossSetups: Record<
    string,
    { raidersIn: string[]; raidersOut: string[] }
  > = {};

  for (const boss of Object.keys(setup.bossAssignments)) {
    const assignments = setup.bossAssignments[boss] ?? [];

    // Data contains duplicates for some reason :madge:
    const raidersIn = Array.from(
      new Set(assignments.map((entry) => entry.player.name)),
    );

    const raidersOut = raiders.filter(
      (name) => !raidersIn.includes(name),
    );
    bossSetups[boss] = {
      raidersIn,
      raidersOut,
    };
  }

  return {
    bench,
    raiders,
    bossSetups,
  };
};

function getPlayersByActiveStatus(
  roster: ApiPlayer[],
  activeStatus: Record<string, boolean>,
  isActive: boolean,
): string[] {
  return roster
    .filter((player) => {
      const slug = player.name.toLowerCase() + '-';
      return activeStatus[slug] === isActive;
    })
    .map((player) => player.name);
}