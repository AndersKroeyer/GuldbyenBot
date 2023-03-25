export type DamageEvent = {
    timestamp: number;
    type: string;
    sourceID: number;
    targetID: number;
    targetInstance: number;
    abilityGameID: number;
    fight: number;
    buffs: string;
    hitType: number;
    amount: number;
    unmitigatedAmount: number;
};
