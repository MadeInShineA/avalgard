import { createRouter, createWebHistory } from 'vue-router';
import { Meteor } from 'meteor/meteor';
import Home from './Home.vue';
import About from './About.vue';
import LoginForm from './LoginForm.vue';
import SignupForm from './SignupForm.vue';
import Gardens from './Gardens.vue';

// Fonction pour vérifier si l'utilisateur est connecté
function requireAuth(to, from, next) {
  if (Meteor.userId()) {
    next(); // L'utilisateur est connecté, accès autorisé
  } else {
    next({ name: 'login' }); // Redirige vers la page de connexion
  }
}

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
      path: '/login',
      name: 'login',
      component: LoginForm,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupForm,
    },
    {
      path: '/gardens',
      name: 'gardens',
      component: Gardens,
      beforeEnter: requireAuth, // Guard pour sécuriser la route
    },
  ],
});
