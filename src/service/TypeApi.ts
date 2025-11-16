// src/service/typeApi.ts
const API_BASE = 'https://pokeapi.co/api/v2'

export interface TypeRelationName {
    name: string
    url: string
}

export interface DamageRelations {
    double_damage_to: TypeRelationName[]
    half_damage_to: TypeRelationName[]
    no_damage_to: TypeRelationName[]
}

export interface TypeApiResponse {
    name: string
    damage_relations: DamageRelations
}

const typeCache = new Map<string, TypeApiResponse>()

export async function fetchType(name: string): Promise<TypeApiResponse> {
    const key = name.toLowerCase()

    if (typeCache.has(key)) {
        return typeCache.get(key)!
    }

    const res = await fetch(`${API_BASE}/type/${key}`)

    if (!res.ok) {
        throw new Error(`No se pudo cargar el tipo ${name}`)
    }

    const data = (await res.json()) as TypeApiResponse
    typeCache.set(key, data)
    return data
}

/**
 * Calcula el multiplicador ofensivo de uno o varios tipos atacando
 * contra uno o varios tipos defensores.
 *
 * Ejemplo: agua vs roca/tierra → 4x
 */
export async function calculateOffensiveMultiplier(
    attackerTypes: string[],
    defenderTypes: string[],
): Promise<number> {
    if (!attackerTypes.length || !defenderTypes.length) return 1

    let bestForAnyAttacker = 0

    for (const atk of attackerTypes) {
        const typeData = await fetchType(atk)
        let multiplierForThisAttacker = 1

        for (const def of defenderTypes) {
            if (typeData.damage_relations.no_damage_to.some((t) => t.name === def)) {
                multiplierForThisAttacker *= 0
            } else if (typeData.damage_relations.double_damage_to.some((t) => t.name === def)) {
                multiplierForThisAttacker *= 2
            } else if (typeData.damage_relations.half_damage_to.some((t) => t.name === def)) {
                multiplierForThisAttacker *= 0.5
            }
        }

        if (multiplierForThisAttacker > bestForAnyAttacker) {
            bestForAnyAttacker = multiplierForThisAttacker
        }
    }

    // Si por alguna razón todo fue 0 (inmunidad), devolvemos 0.
    return bestForAnyAttacker
}
