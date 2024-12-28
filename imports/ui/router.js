import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'
import About from './About.vue'
<<<<<<< HEAD
import Tasks from './Tasks.vue'

=======
import LoginForm from './LoginForm.vue'
import SignupForm from './SignupForm.vue'
>>>>>>> 4b760ac (Added user login, register and logout (need to fix register error messages))

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
<<<<<<< HEAD
      path: '/tasks',
      name: 'tasks',
      component: Tasks,
=======
      path: '/login',
      name: 'login',
      component: LoginForm
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupForm
>>>>>>> 4b760ac (Added user login, register and logout (need to fix register error messages))
    }
  ],
})
