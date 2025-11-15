// src/services/pokeApi.ts
import type { Pokemon } from '../types/pokemon';

const API_URL = 'https://pokeapi.co/api/v2/pokemon';

export async function fetchPokemon(nameOrId: string): Promise<Pokemon> {
    const res = await fetch(`${API_URL}/${nameOrId.toLowerCase()}`);

    if (!res.ok) {
        throw new Error('Pokémon no encontrado');
    }

    const data = (await res.json()) as Pokemon;
    return data;
}
