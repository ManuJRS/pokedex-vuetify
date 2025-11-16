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
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import type { Pokemon } from '../types/pokemon'

// Registrar módulos de Chart.js
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

// Tipo auxiliar para una stat individual del Pokémon
type PokemonStat = Pokemon['stats'][number]

// 👇 Desestructuramos para exponer `team` directamente
const { team } = defineProps<{
  team: Pokemon[]
}>()

// Labels: nombres de stats en mayúsculas
const labels = computed(() => {
  const first = team[0]

  // TS-safe: si no hay primer Pokémon o no tiene stats, devolvemos []
  if (!first || !first.stats || first.stats.length === 0) {
    return []
  }

  return first.stats.map((s: PokemonStat) => s.stat.name.toUpperCase())
})

// Promedio de stats del equipo
const avgStats = computed(() => {
  const teamSize = team.length
  if (teamSize === 0) return []
  const first = team[0]
    if (!first || !first.stats || first.stats.length === 0) {
        return []
    }
  const statsCount = first.stats.length
  const result: number[] = []

  for (let i = 0; i < statsCount; i++) {
    let sum = 0

    for (const p of team) {
      const stat = p.stats[i] as PokemonStat | undefined
      if (stat) {
        sum += stat.base_stat
      }
    }

    result.push(Math.round(sum / teamSize))
  }

  return result
})

const chartData = computed<ChartData<'radar'>>(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Promedio de stats del equipo',
      data: avgStats.value,
      fill: true,
      backgroundColor: 'rgba(76, 175, 80, 0.3)', // verde translúcido
      borderColor: 'rgba(76, 175, 80, 1)',
      pointBackgroundColor: 'rgba(76, 175, 80, 1)',
    },
  ],
}))

const options = computed<ChartOptions<'radar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      ticks: {
        stepSize: 20,
      },
    },
  },
  plugins: {
    legend: {
      position: 'top',
    },
  },
}))
</script>

<template>
  <Radar
    v-if="team.length"
    :data="chartData"
    :options="options"
  />
</template>
