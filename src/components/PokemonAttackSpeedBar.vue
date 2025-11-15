<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { PokemonStat } from '../types/pokemon'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const { stats } = defineProps<{
  stats: PokemonStat[]
}>()

const attack = computed(() => {
  const stat = stats.find((s) => s.stat.name === 'attack')
  return stat ? stat.base_stat : 0
})

const speed = computed(() => {
  const stat = stats.find((s) => s.stat.name === 'speed')
  return stat ? stat.base_stat : 0
})

const data = computed(() => ({
  labels: ['Attack', 'Speed'],
  datasets: [
    {
      label: 'Attack vs Speed',
      data: [attack.value, speed.value],
      backgroundColor: [
        'rgba(244, 67, 54, 0.6)',
        'rgba(33, 150, 243, 0.6)',
      ],
    },
  ],
}))

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Attack vs Speed',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}
</script>

<template>
  <div class="mt-4">
    <h3 class="text-subtitle-1 mb-2">Velocidad vs Ataque</h3>
    <Bar :data="data" :options="options" />
  </div>
</template>
