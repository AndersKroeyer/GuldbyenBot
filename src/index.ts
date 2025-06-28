import { WowUtilsCookieApiClient } from './wowutils/wowUtilsCookieApiClient';
import * as dotenv from 'dotenv';
import { RaidAssignment } from './wowutils/types';
import { getBossAssignments } from './wowutils/bossAssignmentOrchestrator';
import { SupportedBoss } from './wowutils/supportedBoss';
import {
  discordClient,
  sendChannelMessage,
  setupCommandListeners,
  updateSlashCommands,
} from './discord/discordClient';

(async () => {
  dotenv.config();

  // Set fresh cookies from browser if needed
  //await client.setCookiesFromBrowser('__Host-next-auth.csr......

   //var msg = await getBossAssignments({ boss: SupportedBoss.Gallywix });
   //console.log(msg)

   //await updateSlashCommands();

   await setupCommandListeners();
   discordClient.login(process.env.DISCORD_BOT_TOKEN);

})();
