export interface PokemonStat {
    base_stat: number;
    stat: {
        name: string;
        url: string;
    };
}

export interface PokemonType {
    slot: number;
    type: {
        name: string;
        url: string;
    };
}

export interface PokemonSprites {
    front_default: string | null;
    other?: {
        ['official-artwork']: {
            front_default: string | null;
        };
    }
}

export interface PokemonAbilityRef {
    ability: {
        name: string;
        url: string;
    };
    is_hidden: boolean;
    slot: number;
}

export interface Pokemon {
    id: number;
    name: string;
    height: number;
    weight: number;
    sprites: PokemonSprites;
    stats: PokemonStat[];
    types: PokemonType[];
    abilities: PokemonAbilityRef[];
}