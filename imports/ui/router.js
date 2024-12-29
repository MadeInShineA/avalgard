import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'
import About from './About.vue'

import LoginForm from './LoginForm.vue'
import SignupForm from './SignupForm.vue'
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
      path: '/login',
      name: 'login',
      component: LoginForm
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupForm
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: Tasks,
    }
  ],
})
