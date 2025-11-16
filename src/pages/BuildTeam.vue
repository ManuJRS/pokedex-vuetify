<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Pokemon } from '../types/pokemon'
import { fetchPokemon } from '../service/pokemonApi'
import TeamStatsRadarChart from '../components/TeamStatsRadarChart.vue'
import { calculateTeamWeaknesses } from '../service/TypeApi'


const searchTerm = ref<string>('')
const loading = ref(false)
const error = ref<string | null>(null)
const team = ref<Pokemon[]>([])
const teamWeaknesses = ref<string[] | null>(null)
const loadingWeaknesses = ref(false)
const weaknessesError = ref<string | null>(null)

const updateTeamWeaknesses = async () => {
  if (!team.value.length) {
    teamWeaknesses.value = null
    return
  }

  loadingWeaknesses.value = true
  weaknessesError.value = null

  try {
    const typesMatrix = team.value.map((p) =>
      p.types.map((t) => t.type.name),
    )

    teamWeaknesses.value = await calculateTeamWeaknesses(typesMatrix)
  } catch (e) {
    weaknessesError.value = 'No se pudo calcular la cobertura de tipos.'
    teamWeaknesses.value = null
  } finally {
    loadingWeaknesses.value = false
  }
}

const MAX_TEAM_SIZE = 6

const isTeamFull = computed(() => team.value.length >= MAX_TEAM_SIZE)

const onAddToTeam = async () => {
  error.value = null

  if (!searchTerm.value) {
    error.value = 'Escribe el nombre o ID de un Pokémon'
    return
  }

  if (isTeamFull.value) {
    error.value = `Tu equipo ya tiene ${MAX_TEAM_SIZE} Pokémon`
    return
  }

  loading.value = true

  try {
    const pokemon = await fetchPokemon(searchTerm.value.trim().toLowerCase())

    const alreadyInTeam = team.value.some(
      (p) => p.id === pokemon.id,
    )

    if (alreadyInTeam) {
      error.value = 'Este Pokémon ya está en tu equipo'
      return
    }

    team.value.push(pokemon)
    await updateTeamWeaknesses()
    searchTerm.value = ''
  } catch (err: any) {
    error.value = err?.message ?? 'Error buscando Pokémon'
  } finally {
    loading.value = false
  }
}

const removeFromTeam = (index: number) => {
  team.value.splice(index, 1)
    void updateTeamWeaknesses()

}

const getSprite = (pokemon: Pokemon): string =>
  pokemon.sprites.other?.['official-artwork']?.front_default ||
  pokemon.sprites.front_default ||
  ''

const totalTeamPower = computed(() => {
  if (!team.value.length) return 0

  return team.value.reduce((acc, p) => {
    const sumStats = p.stats.reduce((s, stat) => s + stat.base_stat, 0)
    return acc + sumStats
  }, 0)
})
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
        El análisis de cobertura defensiva evalúa las debilidades de tu equipo en función de sus tipos.
        Se identifica qué tipos de ataque son más peligrosos analizando cuántos miembros del equipo reciben
        daño aumentado (x2 o más) y verificando si el equipo cuenta con resistencias o inmunidades que
        reduzcan esa amenaza. El resultado te muestra a qué tipos tu equipo es especialmente vulnerable
        para ayudarte a mejorar su balance defensivo.
      </p>
    </v-alert>
            <v-toolbar color="red-darken-2" dark>
          <v-toolbar-title>Armador de Equipos</v-toolbar-title>
          <v-spacer />
          <v-icon>mdi-pokeball</v-icon>
        </v-toolbar>
    <v-row>
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title>
            Agregar Pokémon al equipo
          </v-card-title>

          <v-card-text>
            <p class="mb-3 text-body-2">
              Busca Pokémon por nombre o ID y arma un equipo de hasta 6 miembros.
            </p>

            <v-text-field
              v-model="searchTerm"
              label="Nombre o ID (ej: gengar, 94)"
              variant="outlined"
              density="comfortable"
              @keyup.enter="onAddToTeam"
            />

            <v-btn
              class="mt-2"
              color="red-darken-2"
              :loading="loading"
              :disabled="isTeamFull"
              @click="onAddToTeam"
            >
              Agregar al equipo
            </v-btn>

            <v-alert
              v-if="error"
              class="mt-3"
              type="error"
              density="comfortable"
            >
              {{ error }}
            </v-alert>

            <v-alert
              v-else-if="isTeamFull"
              class="mt-3"
              type="info"
              variant="tonal"
              density="comfortable"
            >
              Tu equipo está completo ({{ team.length }}/{{ MAX_TEAM_SIZE }}).
            </v-alert>

            <v-skeleton-loader
              v-if="loading"
              type="list-item-two-line"
              class="mt-3"
            />

            <div class="mt-4">
              <h2 class="text-subtitle-1 mb-2">
                Tu equipo ({{ team.length }}/{{ MAX_TEAM_SIZE }})
              </h2>

              <v-alert
                v-if="!team.length && !loading"
                type="info"
                variant="tonal"
                density="comfortable"
              >
                Aún no tienes Pokémon en tu equipo.
              </v-alert>

              <v-list
                v-else
                density="comfortable"
              >
                <v-list-item
                  v-for="(p, index) in team"
                  :key="p.id"
                >
                  <template #prepend>
                    <v-avatar size="48">
                      <v-img
                        :src="getSprite(p)"
                        :alt="p.name"
                      />
                    </v-avatar>
                  </template>

                  <v-list-item-title class="text-capitalize">
                    {{ p.name }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <v-chip
                      v-for="t in p.types"
                      :key="t.type.name"
                      size="x-small"
                      class="mr-1 text-capitalize"
                      color="blue-darken-2"
                      text-color="white"
                      label
                    >
                      {{ t.type.name }}
                    </v-chip>
                  </v-list-item-subtitle>

                  <template #append>
                    <v-btn
                      icon
                      variant="text"
                      color="red"
                      @click="removeFromTeam(index)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            Resumen del equipo
            <span class="text-body-2">
              Poder total aproximado:
              <strong>{{ totalTeamPower }}</strong>
            </span>
          </v-card-title>

          <v-card-text>
            <v-alert
              v-if="!team.length"
              type="info"
              variant="tonal"
              density="comfortable"
            >
              Agrega al menos un Pokémon para ver el resumen de stats del equipo.
            </v-alert>

            <div
              v-else
              style="height: 380px;"
            >
              <TeamStatsRadarChart :team="team" />
            </div>
              <div class="mt-4">
    <v-skeleton-loader
      v-if="loadingWeaknesses"
      type="text"
    />

    <v-alert
      v-else-if="weaknessesError"
      type="error"
      variant="tonal"
      density="comfortable"
    >
      {{ weaknessesError }}
    </v-alert>

    <v-alert
      v-else-if="teamWeaknesses && teamWeaknesses.length"
      type="warning"
      variant="tonal"
      density="comfortable"
    >
      <div class="mb-1">
        Tu equipo es <strong>especialmente vulnerable</strong> a estos tipos:
      </div>
      <div>
        <v-chip
          v-for="type in teamWeaknesses"
          :key="type"
          class="mr-1 mb-1 text-capitalize"
          color="orange-darken-2"
          text-color="white"
          label
          size="small"
        >
          {{ type }}
        </v-chip>
      </div>
    </v-alert>

    <v-alert
      v-else-if="team.length"
      type="success"
      variant="tonal"
      density="comfortable"
    >
      Tu equipo tiene una <strong>buena cobertura defensiva</strong>.  
      No se detectaron debilidades claras a tipos concretos según la regla actual.
    </v-alert>
  </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
