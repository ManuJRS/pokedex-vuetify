<script setup lang="ts">
import { computed } from 'vue'
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import type { PokemonStat } from '../types/pokemon'

// registrar componentes de Chart.js
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const props = defineProps<{
  stats: PokemonStat[]
}>()

const labels = computed(() => props.stats.map((s) => s.stat.name))
const values = computed(() => props.stats.map((s) => s.base_stat))

const data = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'stats base (PokeApi)',
      data: values.value,
      fill: true,
      // puedes dejar que Chart.js use colores por defecto o definirlos
      backgroundColor: 'rgba(244, 67, 54, 0.2)',
      borderColor: 'rgba(244, 67, 54, 1)',
      pointBackgroundColor: 'rgba(244, 67, 54, 1)',
    },
  ],
}))

const options = {
  responsive: true,
  scales: {
    r: {
      beginAtZero: true,
      ticks: {
        stepSize: 20,
      },
    },
  },
}
</script>

<template>
  <div class="mt-4">
    <h3 class="text-subtitle-1 mb-2">Stats de combate</h3>
    <Radar :data="data" :options="options" />
  </div>
</template>
