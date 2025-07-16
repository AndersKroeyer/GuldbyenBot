import { ApiAssignmentResponse } from './types';
import { WowUtilsCookieApiClient } from './wowUtilsCookieApiClient';

export interface FarmSetupResult {
  bench: string[];
  raiders: string[];
  bossSetups: Record<string, { raidersIn: string[]; raidersOut: string[] }>;
}

export const processFarmSetup = async (): Promise<FarmSetupResult> => {
  var client = new WowUtilsCookieApiClient();
  await client.loadCookies();

  var resetId = '67ec57dd22f2dcd7008b94d8';

  var data = await client.get<ApiAssignmentResponse>(
    `/viserio-cooldowns/api/resets/${resetId}/get`,
  );
  var setup = data.data.setups[0];

  const benchedPlayers = getPlayersByActiveStatus(
    setup.roster,
    setup.activeStatus,
    false,
  );
  const nonBenchedPlayers = getPlayersByActiveStatus(
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
    const raidersIn = Array.from(
      new Set(assignments.map((entry) => entry.player.name)),
    );
    const raidersOut = nonBenchedPlayers.filter(
      (name) => !raidersIn.includes(name),
    );
    bossSetups[boss] = {
      raidersIn,
      raidersOut,
    };
  }

  return {
    bench: benchedPlayers,
    raiders: nonBenchedPlayers,
    bossSetups,
  };
};

function getPlayersByActiveStatus(
  roster: { name: string }[],
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