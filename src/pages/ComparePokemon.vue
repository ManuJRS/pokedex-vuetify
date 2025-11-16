<script setup lang="ts">
import { ref } from 'vue'
import type { Pokemon } from '../types/pokemon'
import { fetchPokemon } from '../service/pokemonApi'
import PokemonStatsCompareChart from '../components/PokemonStatsCompareChart.vue'
import { calculateOffensiveMultiplier } from '../service/TypeApi'

const searchA = ref<string>('pikachu')
const searchB = ref<string>('charizard')

const loadingA = ref(false)
const loadingB = ref(false)

const errorA = ref<string | null>(null)
const errorB = ref<string | null>(null)

const pokemonA = ref<Pokemon | null>(null)
const pokemonB = ref<Pokemon | null>(null)

// 👇 NUEVO: efectividad de tipos
const effectivenessAtoB = ref<number | null>(null)
const effectivenessBtoA = ref<number | null>(null)

const updateTypeEffectiveness = async () => {
  if (!pokemonA.value || !pokemonB.value) return

  const typesA = pokemonA.value.types.map((t) => t.type.name)
  const typesB = pokemonB.value.types.map((t) => t.type.name)

  effectivenessAtoB.value = await calculateOffensiveMultiplier(typesA, typesB)
  effectivenessBtoA.value = await calculateOffensiveMultiplier(typesB, typesA)
}

// Pequeño helper para mostrar texto bonito
const describeMultiplier = (m: number): string => {
  if (m === 0) return 'sin efecto (x0)'
  if (m < 1) return `poco efectivo (x${m})`
  if (m === 1) return 'normal (x1)'
  if (m > 1 && m < 2) return `algo efectivo (x${m})`
  if (m === 2) return 'muy efectivo (x2)'
  if (m > 2) return `súper efectivo (x${m})`
  return `x${m}`
}

const fetchSide = async (side: 'A' | 'B') => {
  const search = side === 'A' ? searchA : searchB
  const loading = side === 'A' ? loadingA : loadingB
  const error = side === 'A' ? errorA : errorB
  const pokemon = side === 'A' ? pokemonA : pokemonB

  error.value = null

  if (!search.value) {
    error.value = 'Escribe el nombre o ID de un Pokémon'
    pokemon.value = null
    return
  }

  loading.value = true
  pokemon.value = null

  try {
    pokemon.value = await fetchPokemon(search.value)

    // 👇 si ya tenemos A y B, actualizamos efectividad de tipos
    if (pokemonA.value && pokemonB.value) {
      await updateTypeEffectiveness()
    }
  } catch (err: any) {
    error.value = err?.message ?? 'Error buscando Pokémon'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
        <v-alert
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-6"
    >
      <p class="mb-0">
        El comparador te permite enfrentar dos Pokémon lado a lado. Podrás ver sus estadísticas base,
        tipos y una gráfica comparativa que muestra sus puntos fuertes y débiles de un vistazo.
        Además, se calcula la efectividad entre sus tipos para ayudarte a entender quién tiene ventaja
        en combate y cómo se complementan dentro de un equipo.
      </p>
    </v-alert>
            <v-toolbar color="red-darken-2" dark>
          <v-toolbar-title>Comparador de Pokémon</v-toolbar-title>
          <v-spacer />
          <v-icon>mdi-pokeball</v-icon>
        </v-toolbar>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            Pokémon A
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="searchA"
              label="Nombre o ID (ej: pikachu, 25)"
              variant="outlined"
              density="comfortable"
              @keyup.enter="fetchSide('A')"
            />

            <v-btn
              class="mt-2"
              color="red-darken-2"
              :loading="loadingA"
              @click="fetchSide('A')"
            >
              Buscar
            </v-btn>

            <v-alert
              v-if="errorA"
              type="error"
              class="mt-3"
              density="comfortable"
            >
              {{ errorA }}
            </v-alert>

            <v-skeleton-loader
              v-if="loadingA"
              type="card-avatar"
              class="mt-3"
            />

            <template v-if="pokemonA && !loadingA">
              <div class="d-flex align-center mt-4">
                <v-avatar size="80" class="mr-4">
                  <v-img
                    :src="(pokemonA.sprites as any).other?.['official-artwork']?.front_default || pokemonA.sprites.front_default"
                    :alt="pokemonA.name"
                  />
                </v-avatar>

                <div>
                  <h2 class="text-h5 text-capitalize">
                    {{ pokemonA.name }}
                  </h2>
                  <div class="d-flex flex-wrap ga-2 mt-1">
                    <v-chip
                      v-for="t in pokemonA.types"
                      :key="t.type.name"
                      size="small"
                      color="blue-darken-2"
                      text-color="white"
                      label
                      class="text-capitalize"
                    >
                      {{ t.type.name }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <!-- Tabla de stats -->
              <v-table class="mt-4" density="compact">
                <thead>
                  <tr>
                    <th>Stat</th>
                    <th class="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in pokemonA.stats" :key="s.stat.name">
                    <td class="text-capitalize">
                      {{ s.stat.name }}
                    </td>
                    <td class="text-right">
                      {{ s.base_stat }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            Pokémon B
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="searchB"
              label="Nombre o ID (ej: charizard, 6)"
              variant="outlined"
              density="comfortable"
              @keyup.enter="fetchSide('B')"
            />

            <v-btn
              class="mt-2"
              color="indigo-darken-2"
              :loading="loadingB"
              @click="fetchSide('B')"
            >
              Buscar
            </v-btn>

            <v-alert
              v-if="errorB"
              type="error"
              class="mt-3"
              density="comfortable"
            >
              {{ errorB }}
            </v-alert>

            <v-skeleton-loader
              v-if="loadingB"
              type="card-avatar"
              class="mt-3"
            />

            <template v-if="pokemonB && !loadingB">
              <div class="d-flex align-center mt-4">
                <v-avatar size="80" class="mr-4">
                  <v-img
                    :src="(pokemonB.sprites as any).other?.['official-artwork']?.front_default || pokemonB.sprites.front_default"
                    :alt="pokemonB.name"
                  />
                </v-avatar>

                <div>
                  <h2 class="text-h5 text-capitalize">
                    {{ pokemonB.name }}
                  </h2>
                  <div class="d-flex flex-wrap ga-2 mt-1">
                    <v-chip
                      v-for="t in pokemonB.types"
                      :key="t.type.name"
                      size="small"
                      color="blue-darken-2"
                      text-color="white"
                      label
                      class="text-capitalize"
                    >
                      {{ t.type.name }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <v-table class="mt-4" density="compact">
                <thead>
                  <tr>
                    <th>Stat</th>
                    <th class="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in pokemonB.stats" :key="s.stat.name">
                    <td class="text-capitalize">
                      {{ s.stat.name }}
                    </td>
                    <td class="text-right">
                      {{ s.base_stat }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row
  v-if="
    pokemonA &&
    pokemonB &&
    effectivenessAtoB !== null &&
    effectivenessBtoA !== null
  "
  class="mt-6"
>
  <v-col cols="12" md="6">
    <v-card>
      <v-card-title>
        {{ pokemonA.name }} atacando a {{ pokemonB.name }}
      </v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" density="comfortable">
          <strong class="text-capitalize">{{ pokemonA.name }}</strong>
          es
          <strong>{{ describeMultiplier(effectivenessAtoB!) }}</strong>
          contra
          <strong class="text-capitalize">{{ pokemonB.name }}</strong>
          según sus tipos.
        </v-alert>

        <div class="mt-2">
          Tipos de {{ pokemonA.name }}:
          <v-chip
            v-for="t in pokemonA.types"
            :key="t.type.name"
            size="small"
            class="ml-1 text-capitalize"
          >
            {{ t.type.name }}
          </v-chip>
        </div>

        <div class="mt-1">
          Tipos de {{ pokemonB.name }}:
          <v-chip
            v-for="t in pokemonB.types"
            :key="t.type.name"
            size="small"
            class="ml-1 text-capitalize"
          >
            {{ t.type.name }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </v-col>

  <v-col cols="12" md="6">
    <v-card>
      <v-card-title>
        {{ pokemonB.name }} atacando a {{ pokemonA.name }}
      </v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" density="comfortable">
          <strong class="text-capitalize">{{ pokemonB.name }}</strong>
          es
          <strong>{{ describeMultiplier(effectivenessBtoA!) }}</strong>
          contra
          <strong class="text-capitalize">{{ pokemonA.name }}</strong>
          según sus tipos.
        </v-alert>

        <div class="mt-2">
          Tipos de {{ pokemonB.name }}:
          <v-chip
            v-for="t in pokemonB.types"
            :key="t.type.name"
            size="small"
            class="ml-1 text-capitalize"
          >
            {{ t.type.name }}
          </v-chip>
        </div>

        <div class="mt-1">
          Tipos de {{ pokemonA.name }}:
          <v-chip
            v-for="t in pokemonA.types"
            :key="t.type.name"
            size="small"
            class="ml-1 text-capitalize"
          >
            {{ t.type.name }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </v-col>
    </v-row>

    <v-row v-if="pokemonA && pokemonB" class="mt-8">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Comparación de estadísticas
          </v-card-title>
          <v-card-text>
            <PokemonStatsCompareChart
              :pokemon-a="pokemonA"
              :pokemon-b="pokemonB"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
