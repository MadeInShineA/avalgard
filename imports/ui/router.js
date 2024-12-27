import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'
import About from './About.vue'
import Tasks from './Tasks.vue'


export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: Tasks,
    }
  ],
})
