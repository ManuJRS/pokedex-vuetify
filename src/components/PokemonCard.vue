<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import type { Pokemon } from '../types/pokemon'
import PokemonStatsRadar from '../components/PokemonStatsRadar.vue'
import PokemonAttackSpeedBar from '../components/PokemonAttackSpeedBar.vue'
import { fetchWeaknesses } from '../service/PokemonType'
import {fetchAbilitiesDetails} from "../service/PokemonAbilities";
import type { PokemonAbilityWithEffect } from '../service/PokemonAbilities'
import { fetchEvolutionStagesByPokemon, type EvolutionStage, } from '../service/PokemonEvolutions'

const props = defineProps<{
  pokemon: Pokemon
}>()

const mainSprite = computed(() =>
  props.pokemon.sprites.other?.['official-artwork']?.front_default ||
  props.pokemon.sprites.front_default ||
  ''
)

const weaknesses = ref<string[]>([])
const abilities = ref<PokemonAbilityWithEffect[]>([])
const evolutions = ref<EvolutionStage[]>([])

watch(
  () => props.pokemon,
  async (newVal) => {
    if (newVal) {
      weaknesses.value = await fetchWeaknesses(newVal.types)
      abilities.value = await fetchAbilitiesDetails(newVal)
      evolutions.value = await fetchEvolutionStagesByPokemon(newVal)
    } else {
      weaknesses.value = []
      abilities.value = []
      evolutions.value = []
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

    <div class="d-flex justify-center align-center py-4">
      <v-img
        :src="mainSprite"
        :alt="pokemon.name"
        max-width="160"
        contain
      />
    </div>

    <v-divider />

    <v-card-text>
      <v-row>
        <v-col cols="12">
          <v-card-title class="text-h5 text-center">
            #{{ pokemon.id }} — {{ pokemon.name }}
          </v-card-title>

          <p><strong>Peso:</strong> {{ pokemon.weight }}</p>
          <p><strong>Altura:</strong> {{ pokemon.height }}</p>
          <p><strong>Total Stats:</strong> {{ totalStats }}</p>

          <p class="mt-3"><strong>Tipos:</strong></p>
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

          <v-divider class="my-4" />

          <p class="mb-2"><strong>Habilidades:</strong></p>
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

          <v-divider class="my-4" />

<div class="mb-4">
  <div v-if="evolutions.length">
    <p class="mt-4 mb-2"><strong>Cadena evolutiva:</strong></p>

    <div class="evolution-chain pa-4 rounded-lg">
      <div
        v-for="(stage, index) in evolutions"
        :key="stage.stage"
        class="d-flex align-center"
      >
        <div class="evolution-stage d-flex flex-column align-center">
          <div
            v-for="poke in stage.pokemons"
            :key="poke.id"
            class="text-center mb-3 mx-2"
          >
            <v-avatar size="64" class="mb-1">
              <v-img
                v-if="poke.sprite"
                :src="poke.sprite"
                :alt="poke.name"
              />
              <span v-else>?</span>
            </v-avatar>

            <div
              class="text-caption"
              :class="{ 'text-yellow-accent-3': poke.name === pokemon.name }"
            >
              #{{ poke.id }} {{ poke.name }}
              <span v-if="poke.name === pokemon.name"> (actual)</span>
            </div>

            <div
              v-if="poke.method && stage.stage > 1"
              class="text-caption mt-1 evolution-method"
            >
              <em>{{ poke.method }}</em>
            </div>
          </div>

          <v-icon
            v-if="index < evolutions.length - 1"
            icon="mdi-arrow-down"
            class="evolution-arrow-mobile d-flex d-sm-none mt-2"
          />
        </div>

        <v-icon
          v-if="index < evolutions.length - 1"
          icon="mdi-arrow-right"
          class="evolution-arrow d-none d-sm-flex mx-3"
        />
      </div>
    </div>
  </div>

  <p v-else class="text-body-2 mb-4">
    Este Pokémon no tiene cadena de evolución.
  </p>
</div>
          <v-divider class="my-4" />


          <PokemonStatsRadar :stats="pokemon.stats" />

                    <v-divider class="my-4" />

          <PokemonAttackSpeedBar :stats="pokemon.stats" />

        </v-col>
      </v-row>
    </v-card-text>

  </v-card>
</template>


<style scoped>
.evolution-chain {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background-color: rgba(255, 255, 255, 0.02);
}

.evolution-stage {
  text-align: center;
}

.evolution-method {
  opacity: 0.85;
}

/* Flechas desktop (ya se ocultan en mobile con las clases de Vuetify) */
.evolution-arrow {
  font-size: 28px;
}

/* Flechas mobile (debajo de la etapa) */
.evolution-arrow-mobile {
  font-size: 28px;
}

/* Extra: en pantallas pequeñas la cadena se apila en columna */
@media (max-width: 600px) {
  .evolution-chain {
    flex-direction: column;
  }
}



</style>