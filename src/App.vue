<script setup lang="ts">
import NavBar from './components/NavBar.vue'
</script>

<template>
  <v-app>
    <!-- Navbar global -->
    <NavBar />

    <!-- Aquí se dibuja la página según la ruta -->
    <v-main>
      <v-container class="py-8">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>
