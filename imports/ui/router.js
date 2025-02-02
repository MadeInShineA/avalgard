import { createRouter, createWebHistory } from 'vue-router';
import { Meteor } from 'meteor/meteor';
import Home from './Home.vue';
import About from './About.vue';
import LoginForm from './LoginForm.vue';
import SignupForm from './SignupForm.vue';
import Gardens from './Gardens.vue';
import Garden from './Garden.vue';
import Account from './Account.vue';
import GardenTasks from './GardenTasks.vue';
import Tasks from './Tasks.vue';

// Fonction pour vérifier si l'utilisateur est connecté
function requireAuth(to, from, next) {
  if (Meteor.userId()) {
    next(); // L'utilisateur est connecté, accès autorisé
  } else {
    next({ name: 'login' }); // Redirige vers la page de connexion
  }
}

function createTasksAutomatically(to, from, next) {
  const userId = Meteor.userId()

  if(userId){
    Meteor.call('users.createTasksAutomatically', userId)
  }

  next()
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      beforeEnter: [createTasksAutomatically],
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      beforeEnter: [createTasksAutomatically],
    },
    {
      path: '/Garden',
      name: 'Garden',
      component: Garden,
      beforeEnter: [createTasksAutomatically],
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
      path: '/tasks',
      name: 'tasks',
      component: Tasks,
      beforeEnter: [requireAuth],
    },
    {
      path: '/gardens',
      name: 'gardens',
      component: Gardens,
      beforeEnter: [requireAuth,createTasksAutomatically],
    },
    {
      path: '/gardens/:id_garden',
      name: 'garden',
      component: Garden,
      beforeEnter: [requireAuth,createTasksAutomatically],
    },
    {
      path: '/account',
      name: 'account',
      component: Account,
      beforeEnter: [requireAuth,createTasksAutomatically],
    },
    {
      path: '/gardens/:id_garden/tasks',
      name: 'gardenTasks',
      component: GardenTasks,
      beforeEnter: [requireAuth, createTasksAutomatically],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    }
  ],
});
