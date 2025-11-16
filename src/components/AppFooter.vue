<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <v-footer
    app
    height="56"
    class="d-flex align-center justify-center text-white"
    color="grey-darken-4"
  >
    <span class="text-body-2">
      Desarrollado por <strong>manuDev</strong> · {{year}}
    </span>
  </v-footer>
</template>

<style scoped>
</style>
