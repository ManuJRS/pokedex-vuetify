<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <v-app>    
    <v-main>
      <NavBar />
      <v-container class="py-8">
        <RouterView />
      </v-container>
    </v-main>
    <AppFooter />
  </v-app>
</template>
