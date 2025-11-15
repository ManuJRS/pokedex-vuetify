import type { Pokemon, PokemonAbilityRef } from '../types/pokemon'

interface AbilityEffectEntry {
    effect: string
    short_effect: string
    language: {
        name: string
        url: string
    }
}

interface AbilityApiResponse {
    name: string
    effect_entries: AbilityEffectEntry[]
}

export interface PokemonAbilityWithEffect {
    name: string
    effect: string
    is_hidden: boolean
}

function mapAbilityEntry(
    abilityRef: PokemonAbilityRef,
    apiData: AbilityApiResponse
): PokemonAbilityWithEffect {
    const entryEn =
        apiData.effect_entries.find((e) => e.language.name === 'en') ??
        apiData.effect_entries[0]

    const effect =
        entryEn?.short_effect || entryEn?.effect || 'No hay descripcion disponible.'

    return {
        name: abilityRef.ability.name,
        effect,
        is_hidden: abilityRef.is_hidden,
    }
}

export async function fetchAbilitiesDetails(
    pokemon: Pokemon
): Promise<PokemonAbilityWithEffect[]> {
    const promises = pokemon.abilities.map(async (abilityRef) => {
        const res = await fetch(abilityRef.ability.url)
        if (!res.ok) {
            return {
                name: abilityRef.ability.name,
                effect: 'No se pudo cargar la descripción de la habilidad.',
                is_hidden: abilityRef.is_hidden,
            }
        }

        const data = (await res.json()) as AbilityApiResponse
        return mapAbilityEntry(abilityRef, data)
    })

    return Promise.all(promises)
}
