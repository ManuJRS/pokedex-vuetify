<script setup lang="ts">
import { ref } from 'vue'
import type { Pokemon } from './types/pokemon'
import { fetchPokemon } from './service/pokemonApi'
import PokemonCard from './components/PokemonCard.vue'

const searchTerm = ref<string>('pikachu')
const loading = ref(false)
const error = ref<string | null>(null)
const pokemon = ref<Pokemon | null>(null)

const onSearch = async () => {
  error.value = null

  if (!searchTerm.value) {
    error.value = 'Escribe el nombre o ID de un Pokémon'
    pokemon.value = null
    return
  }

  loading.value = true
  pokemon.value = null

  try {
    pokemon.value = await fetchPokemon(searchTerm.value)
  } catch (err: any) {
    error.value = err.message ?? 'Error buscando Pokémon'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="py-8">
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card>
              <v-toolbar color="red-darken-2" dark>
                <v-toolbar-title>Pokédex Vuetify + TS</v-toolbar-title>
                <v-spacer />
                <v-icon>mdi-pokeball</v-icon>
              </v-toolbar>

              <v-card-text>
                <p class="mb-4">
                  Escribe el nombre o ID de un Pokémon y consulta sus datos desde la PokeAPI.
                </p>

                <v-text-field
                  v-model="searchTerm"
                  label="Buscar por nombre o ID (ej: pikachu, 25)"
                  variant="outlined"
                  @keyup.enter="onSearch"
                />

                <v-btn
                  class="mt-4"
                  color="red-darken-2"
                  @click="onSearch"
                  :loading="loading"
                >
                  Buscar
                </v-btn>

                <v-alert
                  v-if="error"
                  type="error"
                  class="mt-4"
                  density="comfortable"
                >
                  {{ error }}
                </v-alert>

                <v-skeleton-loader
                  v-if="loading"
                  type="card"
                  class="mt-4"
                />

                <PokemonCard
                  v-if="pokemon && !loading"
                  :pokemon="pokemon"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
