<script setup lang="ts">
import type { Pokemon } from '../types/pokemon'
import PokemonStatsRadar from '../components/PokemonStatsRadar.vue'
import PokemonAttackSpeedBar from '../components/PokemonAttackSpeedBar.vue';
import { computed } from 'vue';

const totalStats = computed(() => {
  return props.pokemon.stats.reduce((sum, stat) => { 
    return sum + stat.base_stat
  }, 0);
});

const props = defineProps<{
  pokemon: Pokemon
}>()
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

          <!-- Gráfica de stats -->
          <PokemonStatsRadar :stats="pokemon.stats" />
          <PokemonAttackSpeedBar :stats="pokemon.stats" />
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>
