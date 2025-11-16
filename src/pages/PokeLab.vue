<script setup lang="ts">
import { ref } from 'vue'
import type { Pokemon } from '../types/pokemon'
import { fetchPokemon } from '../service/pokemonApi'
import PokemonCard from '../components/PokemonCard.vue'

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
  <v-row justify="center">
    <v-col cols="12" md="8">
          <v-alert
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-6"
    >
      <p class="mb-0">
        Esta sección funciona como una Pokédex interactiva: puedes buscar un Pokémon por nombre o ID
        y consultar sus estadísticas base, tipos, habilidades e información visual apoyada con gráficas.
        Los datos se obtienen en tiempo real desde la PokéAPI para ayudarte a analizar fortalezas y
        debilidades de cada Pokémon de forma individual.
      </p>
    </v-alert>
      <v-card>
        <v-toolbar color="red-darken-2" dark>
          <v-toolbar-title>Pokédex by Manudev</v-toolbar-title>
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
<v-sheet
  class="pa-4 mb-6 mt-6"
  color="#0d0d0d"
  rounded="lg"
  elevation="3"
>
  <p class="mb-0" style="color: #cfcfcf;">
    Este proyecto es un laboratorio interactivo construido con 
    <strong style="color: #ffffff;">Vue 3</strong>, 
    <strong style="color: #ffffff;">TypeScript</strong> y 
    <strong style="color: #ffffff;">Vuetify</strong>. Utiliza 
    <strong style="color: #ffffff;">Vue Router</strong> para navegar entre vistas, 
    <strong style="color: #ffffff;">Chart.js</strong> para gráficas dinámicas y consume 
    información en tiempo real desde la <strong style="color: #ffffff;">PokéAPI</strong>.  
    Incluye buscador de Pokémon, comparador visual y un armador de equipos con análisis defensivo.  
    Un proyecto diseñado para practicar arquitectura moderna y buenas prácticas de desarrollo.
  </p>
</v-sheet>

    </v-col>
  </v-row>
</template>
