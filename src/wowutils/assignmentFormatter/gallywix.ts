import { RaidAssignment } from '../types';
import { generateAssignmentMarkdown } from './genericFormatter';

const MechanicBlockIds = {
  CannisterPos: '01-Gally-CannisterPos-Block',
  GigaBomb: '01-Gally-GigaBomb-Block',
  Sharpshot: '01-Gally-Sharpshot-Block',
  ScatterblastM: '00-Gally-ScatterblastM-Block',
  TotalDestruction: '01-Gally-TotalDestruction-Block',
} as const;

export function CreateGallywixMessage(assignment: RaidAssignment): string {
  const markdown = generateAssignmentMarkdown(assignment, {
    usePlayerColors: true,
    mechanicOrder: [
      MechanicBlockIds.CannisterPos,
      MechanicBlockIds.GigaBomb,
      MechanicBlockIds.Sharpshot,
      MechanicBlockIds.ScatterblastM,
      MechanicBlockIds.TotalDestruction,
    ],
    mechanicBlockConfig: {
      [MechanicBlockIds.TotalDestruction]: {
        assignmentName: 'Melee rundt om gally',
        assignmentGroupNames: [
          '1, 2, 3, 4, 5',
          '6, 7, 8, 9, 10',
          '11, 12, 13, 14, 15',
          '16, 17, 18, 19, 20',
        ],
      },
      [MechanicBlockIds.CannisterPos]: {
        assignmentName: 'Cannister positions',
        assignmentGroupNames: [
          'Cannister 1 (Længst inde mod midten)',
          'Cannister 2',
          'Cannister 3',
          'Cannister 4',
        ],
      },
      [MechanicBlockIds.GigaBomb]: {
        assignmentName: '💣 Bomber 💣',
        assignmentGroupNames: [
          'Bombe 1',
          'Bombe 2',
          'Wombo combo bombe',
          'Slowfall + Alter bombe',
          'Tank bombe',
        ],
      },
      [MechanicBlockIds.Sharpshot]: {
        skip: true,
        assignmentName: 'Intermission sentry kicks',
        seperator: ' ──►',
        assignmentGroupNames: ['Front', 'Mid', 'Back'],
      },
      [MechanicBlockIds.ScatterblastM]: {
        assignmentName: 'Cone soaks',
        assignmentGroupNames: ['Venstre soak', 'Højre soak'],
      },
    },
    images: [
      'https://wowutils.com/viserio-cooldowns/_next/image?url=%2Fviserio-cooldowns%2Fimages%2Fassignments%2Fchrome-king-gallywix%2Fpull-positions.png&w=640&q=75',
    ],
  });

  return markdown;
}
