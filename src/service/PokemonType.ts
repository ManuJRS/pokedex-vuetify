import type { PokemonType } from '../types/pokemon'

interface DamageRelations {
    double_damage_from?: {
        name: string
        url: string
    }[]
    half_damage_from?: {
        name: string
        url: string
    }[]
    no_damage_from?: {
        name: string
        url: string
    }[]
}

interface TypeApiResponse {
    damage_relations?: DamageRelations
}

export async function fetchWeaknesses(pokemonTypes: PokemonType[]) {
    const weaknesses = new Set<string>()

    for (const t of pokemonTypes) {
        const url = t?.type?.url
        if (!url) continue

        const res = await fetch(url)
        if (!res.ok) {
            continue
        }

        const data = (await res.json()) as TypeApiResponse

        const doubleDamage =
            data.damage_relations?.double_damage_from ?? []

        for (const weak of doubleDamage) {
            if (weak?.name) {
                weaknesses.add(weak.name)
            }
        }
    }

    return Array.from(weaknesses)
}
