<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import type { Pokemon } from '../types/pokemon'
import PokemonStatsRadar from '../components/PokemonStatsRadar.vue'
import PokemonAttackSpeedBar from '../components/PokemonAttackSpeedBar.vue'
import { fetchWeaknesses } from '../service/PokemonType'
import {fetchAbilitiesDetails} from "../service/PokemonAbilities";
import type { PokemonAbilityWithEffect } from '../service/PokemonAbilities'

const props = defineProps<{
  pokemon: Pokemon
}>()

const weaknesses = ref<string[]>([])
const abilities = ref<PokemonAbilityWithEffect[]>([])

watch(
  () => props.pokemon,
  async (newVal) => {
    if (newVal) {
      weaknesses.value = await fetchWeaknesses(newVal.types)
      abilities.value = await fetchAbilitiesDetails(newVal)
    } else {
      weaknesses.value = []
      abilities.value = []
    }
  },
  { immediate: true }
)

const totalStats = computed(() => {
  return props.pokemon.stats.reduce((sum, stat) => {
    return sum + stat.base_stat
  }, 0)
})
</script>

<template>
  <v-card class="mt-6" variant="outlined">
    <v-row no-gutters>
      <v-col
        cols="12"
        sm="5"
        class="d-flex justify-center align-center py-4"
      >
        <v-img
          :src="pokemon.sprites.front_default"
          :alt="pokemon.name"
          max-width="160"
          contain
        />
      </v-col>

      <v-col cols="12" sm="7">
        <v-card-title class="text-h5">
          #{{ pokemon.id }} — {{ pokemon.name }}
        </v-card-title>

        <v-card-text>
          <p><strong>Peso:</strong> {{ pokemon.weight }}</p>
          <p><strong>Altura:</strong> {{ pokemon.height }}</p>
          <p><strong>Total stats:</strong> {{ totalStats }}</p>

          <p class="mt-2"><strong>Tipos:</strong></p>
          <div class="d-flex flex-wrap gap-2 mb-4">
            <v-chip
              v-for="t in pokemon.types"
              :key="t.slot"
              color="red-darken-2"
              text-color="white"
              size="small"
            >
              {{ t.type.name }}
            </v-chip>
          </div>

          <p class="mt-2"><strong>Debilidades:</strong></p>
          <div class="d-flex flex-wrap gap-2 mb-4">
            <v-chip
              v-for="weak in weaknesses"
              :key="weak"
              color="blue-darken-2"
              text-color="white"
              size="small"
            >
              {{ weak }}
            </v-chip>
          </div>

          <PokemonStatsRadar :stats="pokemon.stats" />
          <PokemonAttackSpeedBar :stats="pokemon.stats" />
        </v-card-text>
      </v-col>
      <v-table density="compact" class="mb-4">
    <thead>
      <tr>
        <th>Habilidad</th>
        <th>Descripción</th>
        <th>Oculta</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="ability in abilities" :key="ability.name">
        <td>{{ ability.name }}</td>
        <td>{{ ability.effect }}</td>
        <td>
          <v-chip
            :color="ability.is_hidden ? 'deep-purple-darken-2' : 'green-darken-2'"
            text-color="white"
            size="x-small"
          >
            {{ ability.is_hidden ? 'Sí' : 'No' }}
          </v-chip>
        </td>
      </tr>
    </tbody>
  </v-table>

    </v-row>
  </v-card>
</template>
