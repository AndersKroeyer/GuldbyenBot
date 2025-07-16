import { WowUtilsCookieApiClient } from './wowutils/wowUtilsCookieApiClient';
import * as dotenv from 'dotenv';
import { RaidAssignment } from './wowutils/types';
import { getBossAssignments } from './wowutils/bossAssignmentDiscordMessageService';
import {
  discordClient,
  sendChannelMessage,
  setupCommandListeners,
  updateSlashCommands,
} from './discord/discordClient';
import { processFarmSetup } from './wowutils/farmHelper';
import { injectDataIntoAddon } from './raidtools/dataInjector';

(async () => {
  dotenv.config();

  const args = process.argv.slice(2);

  if (args.includes('--farm')) {
    var farmSetup = await processFarmSetup();
    await injectDataIntoAddon(farmSetup);
    process.exit(0);
  }

  // Set fresh cookies from browser if needed
  //await client.setCookiesFromBrowser('__Host-next-auth.csr......

  //var msg = await getBossAssignments({ boss: SupportedBoss.Gallywix });
  //console.log(msg)

  //await updateSlashCommands();

  await setupCommandListeners();
  discordClient.login(process.env.DISCORD_BOT_TOKEN);
})();
