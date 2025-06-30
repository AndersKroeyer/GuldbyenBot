import { AssignmentBlock, RaidAssignment } from '../types';

export interface BlockFormatConfig {
  skip?: boolean;
  assignmentName: string;
  seperator?: string;
  assignmentGroupNames: string[];
}

/**
 * Configuration options for markdown generation
 */
export interface MarkdownGeneratorOptions {
  usePlayerColors?: boolean;
  images: string[];
  mechanicBlockConfig: Record<string, BlockFormatConfig>;
  mechanicOrder?: string[];
}

/**
 * Default configuration
 */
const DEFAULT_OPTIONS: Required<MarkdownGeneratorOptions> = {
  usePlayerColors: false,
  images: [],
  mechanicBlockConfig: {},
  mechanicOrder: [],
};

/**
 * Generates a markdown string describing raid assignment blocks
 */
export function generateAssignmentMarkdown(
  assignment: RaidAssignment,
  options: MarkdownGeneratorOptions,
): string {
  const config = { ...DEFAULT_OPTIONS, ...options };

  for (const block of assignment.blocks) {
    block.blockId = removeTimestampByHyphens(block.blockId);
  }

  if (assignment.blocks.length > 0) {
    var assignments = generateAssignmentBlocks(
      assignment.blocks,
      config,
      config.mechanicOrder && config.mechanicOrder.length > 0
        ? config.mechanicOrder
        : undefined,
    );

    if (config.images && config.images.length > 0) {
      for (const img of config.images) assignments += `\n[Image](${img})`;
    }

    return assignments;
  } else {
    return '*No assignments configured yet.*';
  }
}

/**
 * Generates assignment blocks section
 */
function generateAssignmentBlocks(
  blocks: AssignmentBlock[],
  config: Required<MarkdownGeneratorOptions>,
  mechanicOrder?: string[],
): string {
  const sections: string[] = [];
  const groupedBlocks = groupBlocksByMechanic(blocks);

  // Determine order of mechanics
  let mechanics = Object.keys(groupedBlocks);
  if (mechanicOrder && mechanicOrder.length > 0) {
    // Use the provided order, and append any missing mechanics at the end
    mechanics = [
      ...mechanicOrder.filter((m) => mechanics.includes(m)),
      ...mechanics.filter((m) => !mechanicOrder.includes(m)),
    ];
  }

  for (const mechanic of mechanics) {
    const mechanicBlocks = groupedBlocks[mechanic];
    var mechanicDisplayName = formatBlockName(
      mechanic,
      config.mechanicBlockConfig,
    );
    var mechanicAssignments = [];
    for (const block of mechanicBlocks) {
      const blockContent = generateSingleBlock(block, config);
      if (
        config.mechanicBlockConfig[block.blockId] &&
        config.mechanicBlockConfig[block.blockId].skip
      ) {
        continue;
      }

      if (blockContent) {
        mechanicAssignments.push(blockContent);
      }
    }

    if (mechanicAssignments.length > 0) {
      sections.push(`> ## ${mechanicDisplayName}`);
      for (const assignment of mechanicAssignments) sections.push(assignment);
    }
  }

  return sections.join('\n');
}

/**
 * Groups blocks by mechanic name extracted from blockId
 */
function groupBlocksByMechanic(
  blocks: AssignmentBlock[],
): Record<string, AssignmentBlock[]> {
  return blocks.reduce((acc, block) => {
    const mechanic = block.blockId;
    if (!acc[mechanic]) acc[mechanic] = [];
    acc[mechanic].push(block);
    return acc;
  }, {} as Record<string, AssignmentBlock[]>);
}

/**
 * Generates content for a single assignment block
 */
function generateSingleBlock(
  block: AssignmentBlock,
  config: Required<MarkdownGeneratorOptions>,
): string {
  const nonEmptyRows = block.rows.filter((row) => row.cellValues.length > 0);

  if (nonEmptyRows.length === 0) {
    return '';
  }

  // Generate assignments
  const assignments: string[] = [];
  nonEmptyRows.forEach((row, index) => {
    if (row.cellValues.length > 0) {
      const playerList = row.cellValues.join(', ');
      const groupName = formatBlockGroupName(
        block.blockId,
        config.mechanicBlockConfig,
        index,
      );
      var seperator =
        config.mechanicBlockConfig[block.blockId].seperator ?? ':';
      assignments.push(`**${groupName}**${seperator} ${playerList}`);
    }
  });

  return assignments.join('  \n'); // Two spaces for line break in markdown
}

function formatBlockGroupName(
  blockId: string,
  customNames: Record<string, BlockFormatConfig>,
  index: number,
) {
  const groupNames = customNames[blockId].assignmentGroupNames;
  if (groupNames.length >= index) {
    return groupNames[index];
  }

  return `Group ${index}`;
}

/**
 * Formats block name, using custom names if provided
 */
function formatBlockName(
  blockId: string,
  customNames: Record<string, BlockFormatConfig>,
): string {
  if (customNames[blockId]) {
    return customNames[blockId].assignmentName;
  }

  return blockId;
}

function removeTimestampByHyphens(str) {
  const parts = str.split('-');
  if (parts.length >= 4) {
    // Remove last 3 parts (day, month, year) and rejoin
    return parts.slice(0, -3).join('-');
  }
  return str;
}
