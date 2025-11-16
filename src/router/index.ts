import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import PokeLab from '../pages/PokeLab.vue'
import ComparePokemon from '../pages/ComparePokemon.vue'
import BuildTeam from '../pages/BuildTeam.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/pokedex'
    },
    {
        path: '/pokedex',
        name: 'pokedex',
        component: PokeLab
    },
    {
        path: '/compare',
        name: 'compare',
        component: ComparePokemon
    },
    {
        path: '/build-team',
        name: 'build-team',
        component: BuildTeam
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

export default router
