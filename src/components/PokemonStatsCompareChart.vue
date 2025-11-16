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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

interface Props {
  pokemonA: Pokemon
  pokemonB: Pokemon
}

const props = defineProps<Props>()

const labels = computed(() =>
  props.pokemonA.stats.map((s) => s.stat.name.toUpperCase()),
)

const dataA = computed(() => props.pokemonA.stats.map((s) => s.base_stat))
const dataB = computed(() => props.pokemonB.stats.map((s) => s.base_stat))

const chartData = computed<ChartData<'radar'>>(() => ({
  labels: labels.value,
  datasets: [
    {
      label: props.pokemonA.name,
      data: dataA.value,
      fill: true,
      backgroundColor: 'rgba(244, 67, 54, 0.3)', // rojo
      borderColor: 'rgba(244, 67, 54, 1)',
      pointBackgroundColor: 'rgba(244, 67, 54, 1)',
    },
    {
      label: props.pokemonB.name,
      data: dataB.value,
      fill: true,
      backgroundColor: 'rgba(63, 81, 181, 0.3)', // azul
      borderColor: 'rgba(63, 81, 181, 1)',
      pointBackgroundColor: 'rgba(63, 81, 181, 1)',
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
    tooltip: {
      enabled: true,
    },
  },
}))
</script>

<template>
  <div style="height: 400px;">
    <Radar
      :data="chartData"
      :options="options"
    />
  </div>
</template>
