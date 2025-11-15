import type { Pokemon } from '../types/pokemon'

interface ChainLink {
    species: {
        name: string
        url: string
    }
    evolves_to: ChainLink[]
    evolution_details?: EvolutionDetail[]
}

interface EvolutionDetail {
    min_level?: number | null
    trigger?: {
        name: string
        url: string
    } | null
    item?: {
        name: string
        url: string
    } | null
    held_item?: {
        name: string
        url: string
    } | null
    min_happiness?: number | null
    time_of_day?: string
}

interface EvolutionChainResponse {
    chain: ChainLink
}

interface PokemonSpeciesResponse {
    evolution_chain: {
        url: string
    }
}

export interface EvolutionStagePokemon {
    id: number
    name: string
    sprite: string | null
    method: string | null
}

export interface EvolutionStage {
    stage: number
    pokemons: EvolutionStagePokemon[]
}


function describeEvolutionMethod(detail?: EvolutionDetail): string | null {
    if (!detail) return null

    const parts: string[] = []

    if (detail.min_level != null) {
        parts.push(`Sube de nivel al ${detail.min_level}`)
    }

    if (detail.item) {
        const itemName = detail.item.name.replace(/-/g, ' ')
        parts.push(`Usando ${itemName}`)
    }

    if (detail.held_item) {
        const heldName = detail.held_item.name.replace(/-/g, ' ')
        parts.push(`Con ${heldName} equipado`)
    }

    if (detail.trigger?.name === 'trade') {
        parts.push('Mediante intercambio')
    }

    if (detail.min_happiness != null) {
        parts.push(`Con alta amistad (${detail.min_happiness})`)
    }

    if (detail.time_of_day) {
        const label =
            detail.time_of_day === 'day'
                ? 'de día'
                : detail.time_of_day === 'night'
                    ? 'de noche'
                    : `durante ${detail.time_of_day}`
        parts.push(label)
    }

    if (!parts.length && detail.trigger?.name) {
        const trigger = detail.trigger.name.replace(/-/g, ' ')
        parts.push(`Método: ${trigger}`)
    }

    if (!parts.length) return null

    return parts.join(' + ')
}

function collectStagesAndMethods(
    chain: ChainLink,
    currentStage = 1,
    stages = new Map<number, string[]>(),
    methods = new Map<string, string | null>()
) {
    const list = stages.get(currentStage) ?? []
    list.push(chain.species.name)
    stages.set(currentStage, list)

    chain.evolves_to.forEach((child) => {
        const detail = child.evolution_details?.[0]
        const method = describeEvolutionMethod(detail)
        methods.set(child.species.name, method ?? null)

        collectStagesAndMethods(child, currentStage + 1, stages, methods)
    })

    return { stages, methods }
}


async function fetchPokemonBasicInfo(
    name: string
): Promise<Pick<EvolutionStagePokemon, 'id' | 'name' | 'sprite'> | null> {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    if (!res.ok) return null

    const data = await res.json()
    return {
        id: data.id,
        name: data.name,
        sprite: data.sprites?.front_default ?? null,
    }
}

export async function fetchEvolutionStagesByPokemon(
    pokemon: Pokemon
): Promise<EvolutionStage[]> {
    try {
        const speciesRes = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`
        )

        if (!speciesRes.ok) {
            return [
                {
                    stage: 1,
                    pokemons: [
                        {
                            id: pokemon.id,
                            name: pokemon.name,
                            sprite: pokemon.sprites.front_default ?? null,
                            method: null,
                        },
                    ],
                },
            ]
        }

        const speciesData = (await speciesRes.json()) as PokemonSpeciesResponse
        const evoUrl = speciesData.evolution_chain?.url
        if (!evoUrl) {
            return [
                {
                    stage: 1,
                    pokemons: [
                        {
                            id: pokemon.id,
                            name: pokemon.name,
                            sprite: pokemon.sprites.front_default ?? null,
                            method: null,
                        },
                    ],
                },
            ]
        }

        const evoRes = await fetch(evoUrl)
        if (!evoRes.ok) {
            return [
                {
                    stage: 1,
                    pokemons: [
                        {
                            id: pokemon.id,
                            name: pokemon.name,
                            sprite: pokemon.sprites.front_default ?? null,
                            method: null,
                        },
                    ],
                },
            ]
        }

        const evoData = (await evoRes.json()) as EvolutionChainResponse

        const { stages: stageNamesMap, methods: methodMap } =
            collectStagesAndMethods(evoData.chain)

        const stages: EvolutionStage[] = []

        for (const [stageNumber, names] of stageNamesMap.entries()) {
            const pokemons: EvolutionStagePokemon[] = []

            for (const name of names) {
                const info = await fetchPokemonBasicInfo(name)
                if (info) {
                    pokemons.push({
                        ...info,
                        method: methodMap.get(info.name) ?? null,
                    })
                }
            }

            stages.push({
                stage: stageNumber,
                pokemons,
            })
        }

        stages.sort((a, b) => a.stage - b.stage)

        return stages
    } catch (e) {
        return [
            {
                stage: 1,
                pokemons: [
                    {
                        id: pokemon.id,
                        name: pokemon.name,
                        sprite: pokemon.sprites.front_default ?? null,
                        method: null,
                    },
                ],
            },
        ]
    }
}
