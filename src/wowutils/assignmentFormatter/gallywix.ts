import { RaidAssignment } from '../types';
import { generateAssignmentMarkdown } from './genericFormatter';

export function CreateGallywixMessage(assignment: RaidAssignment): string {
  const markdown = generateAssignmentMarkdown(assignment, {
    usePlayerColors: true,
    mechanicBlockConfig: {
      '01-Gally-TotalDestruction-Block': { 
        assignmentName: 'Melee rundt om gally', 
        assignmentGroupNames: ["1, 2, 3, 4, 5", "6, 7, 8, 9, 10", "11, 12, 13, 14, 15", "16, 17, 18, 19, 20"] 
      },
      '01-Gally-CannisterPos-Block': { 
        assignmentName: 'Cannister positions',
        assignmentGroupNames: ["Cannister 1 (Længst inde mod midten)", "Cannister 2", "Cannister 3", "Cannister 4"]
      },
      '01-Gally-GigaBomb-Block': { 
        assignmentName: '💣 Bomber 💣',
        assignmentGroupNames: ["Bombe 1", "Bombe 2", "Wombo combo bombe", "Slowfall + Alter bombe", "Tank bombe"]
      },
      '01-Gally-Sharpshot-Block': {
        skip: true,
        assignmentName: 'Intermission sentry kicks',
        seperator: ' ──►',
        assignmentGroupNames: ["Front", "Mid", "Back"]
      },
      '00-Gally-ScatterblastM-Block': {
        assignmentName: "Cone soaks",
        assignmentGroupNames: ["Venstre soak", "Højre soak"]
       }
    },
    images: ["https://wowutils.com/viserio-cooldowns/_next/image?url=%2Fviserio-cooldowns%2Fimages%2Fassignments%2Fchrome-king-gallywix%2Fpull-positions.png&w=640&q=75"]
  });

  return markdown;
}