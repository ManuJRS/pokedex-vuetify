<script setup lang="ts">
import { useRoute } from 'vue-router'

interface NavLink {
  to: string
  label: string
}

const route = useRoute()

const links: NavLink[] = [
  { 
    to: '/pokedex', 
    label: 'Pokedex'
},
  { 
    to: '/compare', 
    label: 'Comparar Pokémon'
},
  { to: '/build-team', 
  label: 'Armar equipo'
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
      :key="link.to"
      :to="link.to"
      variant="text"
      class="text-none"
      :border="route.path === link.to ? 'sm' : undefined"
    >
      {{ link.label }}
    </v-btn>
  </v-app-bar>
</template>
