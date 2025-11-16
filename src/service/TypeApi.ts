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

    double_damage_from: TypeRelationName[]
    half_damage_from: TypeRelationName[]
    no_damage_from: TypeRelationName[]
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
 * Multiplicador ofensivo de un conjunto de tipos atacantes contra tipos defensores.
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

    return bestForAnyAttacker
}

/**
 * Calcula debilidades defensivas del equipo.
 * Devuelve una lista de tipos a los que el equipo es especialmente vulnerable.
 *
 * Regla simple:
 * - Contamos cuántos miembros son "débil x2" frente a cada tipo atacante.
 * - Si ese tipo también tiene alguien que lo resista (half/no_damage_from), se considera menos peligroso.
 * - Devolvemos los tipos con más miembros débiles y sin buenas resistencias.
 */
export async function calculateTeamWeaknesses(
    teamTypes: string[][],
): Promise<string[]> {
    if (!teamTypes.length) return []

    const weaknessCount = new Map<string, number>()
    const resistanceSet = new Set<string>()

    // Recorremos cada Pokémon del equipo
    for (const types of teamTypes) {
        for (const defType of types) {
            const typeData = await fetchType(defType)

            // Tipos que pegan x2 a este tipo
            for (const atk of typeData.damage_relations.double_damage_from) {
                weaknessCount.set(atk.name, (weaknessCount.get(atk.name) ?? 0) + 1)
            }

            // Resistencias o inmunidades a este tipo
            for (const atk of typeData.damage_relations.half_damage_from) {
                resistanceSet.add(atk.name)
            }
            for (const atk of typeData.damage_relations.no_damage_from) {
                resistanceSet.add(atk.name)
            }
        }
    }

    // Definimos umbral simple: tipos que afectan a al menos 2 miembros
    const threshold = 2
    const result: { type: string; count: number }[] = []

    weaknessCount.forEach((count, type) => {
        if (count >= threshold && !resistanceSet.has(type)) {
            result.push({ type, count })
        }
    })

    // Ordenamos por cantidad de miembros débiles desc
    result.sort((a, b) => b.count - a.count)

    return result.map((r) => r.type)
}
