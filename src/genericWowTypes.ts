export type PlayerClass = 
  | "Death Knight"
  | "Demon Hunter" 
  | "Druid"
  | "Evoker"
  | "Hunter"
  | "Mage"
  | "Monk"
  | "Paladin"
  | "Priest"
  | "Rogue"
  | "Shaman"
  | "Warlock"
  | "Warrior";

export type PlayerSpec = 
  | "Havoc" | "Vengeance" // Demon Hunter
  | "Demonology" | "Destruction" | "Affliction" // Warlock
  | "Protection" | "Retribution" | "Holy" // Paladin
  | "Fire" | "Frost" | "Arcane" // Mage
  | "Beast Mastery" | "Marksmanship" | "Survival" // Hunter
  | "Shadow" | "Discipline" | "Holy" // Priest
  | "Enhancement" | "Elemental" | "Restoration" // Shaman
  | "Feral" | "Balance" | "Guardian" | "Restoration" // Druid
  | "Arms" | "Fury" | "Protection" // Warrior
  | "Assassination" | "Outlaw" | "Subtlety" // Rogue
  | "Brewmaster" | "Mistweaver" | "Windwalker" // Monk
  | "Blood" | "Frost" | "Unholy" // Death Knight
  | "Devastation" | "Preservation" | "Augmentation"; // Evoker