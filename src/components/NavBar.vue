<script setup lang="ts">
import { useRoute } from 'vue-router'

interface NavLink {
  name: string
  label: string
}

const route = useRoute()

const links: NavLink[] = [
  {
    name: 'pokedex',
    label: 'Pokedex',
  },
  {
    name: 'compare',
    label: 'Comparar Pokémon',
  },
  {
    name: 'build-team',
    label: 'Armar equipo',
  },
]
</script>

<template>
  <v-app-bar
    flat
    color="primary"
    density="comfortable"
  >
    <v-app-bar-title class="font-weight-bold">
      PokeLab
    </v-app-bar-title>

    <v-spacer />

    <v-btn
      v-for="link in links"
      :key="link.name"
      :to="{ name: link.name }"
      variant="text"
      class="text-none"
      :border="route.name === link.name ? 'sm' : undefined"
    >
      {{ link.label }}
    </v-btn>
  </v-app-bar>
</template>
