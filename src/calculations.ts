import { DamageEvent } from "./types";
import { ReportActor } from "./__generated__/graphql-types";

export const combinePlayerAndPetDamage = (actors: ReportActor[], damageEvents: DamageEvent[], valueSelector: (e: DamageEvent) => number) => {
    const damageMap = new Map<number, number>()
    const getActor = (id) => actors.find((actor) => actor.id === id);

    damageEvents.forEach((event) => {
        const damageOwner = getDamageOwner(actors, getActor(event.sourceID));
        const currentDamage = damageMap.get(damageOwner) || 0;
        damageMap.set(damageOwner, currentDamage + valueSelector(event));
    });

    const sortedArray: [string, number][] = Array
        .from(damageMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(x => [getActor(x[0]).name, x[1]]);
    const sortedMap = new Map<string, number>(sortedArray);
    return sortedMap
}

const getDamageOwner = (actors: ReportActor[], actor: ReportActor): number => {
    if (!actor.petOwner)
        return actor.id;

    return actors.find(x => x.id === actor.petOwner).id;
}