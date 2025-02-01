<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-2xl font-bold text-green-600">Avalgard</h1>
          </div>
        </div>
        <!-- Liens de navigation -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <!-- Liens statiques -->
          <router-link 
            :to="{ name: 'home' }" 
            class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium"
          >
            Home
          </router-link>
          <router-link 
            :to="{ name: 'about' }" 
            class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium"
          >
            About
          </router-link>
          <router-link 
            :to="{ name: 'Garden' }" 
            class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium"
          >
            Garden
          </router-link>
          
          <!-- Liens dynamiques en fonction de l'état de l'utilisateur -->
          <template v-if="!user">
            <router-link 
              :to="{ name: 'login' }" 
              class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </router-link>
            <router-link 
              :to="{ name: 'signup' }" 
              class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign up
            </router-link>
          </template>
          <template v-else>
            <router-link 
              :to="{ name: 'gardens' }" 
              class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium"
            >
              Gardens
            </router-link>
            <span 
              class="text-green-700 hover:cursor-pointer hover:underline px-3 py-2 rounded-md text-sm font-medium"
            >
              {{ user.username }}
            </span>
            <span 
              class="text-green-700 hover:cursor-pointer hover:underline px-3 py-2 rounded-md text-sm font-medium"
              @click="handleLogout"
            >
              Logout
            </span>
          </template>
        </div>
        <!-- Menu mobile (optionnel) -->
        <!-- Vous pouvez ajouter un menu mobile ici si nécessaire -->
      </div>
    </div>
  </nav>
</template>

<script setup>
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

// Initialiser le routeur
const router = useRouter();

// Créer une référence réactive pour l'utilisateur
const user = ref(null);

// Surveiller les changements de l'utilisateur
autorun(() => {
  user.value = Meteor.user();
});

// Fonction de déconnexion
function handleLogout() {
  Meteor.logout(() => {
    router.push({ name: 'home' }); // Rediriger vers la page d'accueil après la déconnexion
  });
}
</script>

<style scoped>
/* Ajoutez ici des styles spécifiques au composant si nécessaire */
</style>
