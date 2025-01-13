<script setup>
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import { useRouter } from 'vue-router';

let user = autorun(() => Meteor.user()).result;
const router = useRouter(); // Accéder au routeur Vue

function handleLogout() {
  Meteor.logout(() => {
    router.push({ name: 'home' }); // Redirige vers la page d'accueil
  });
}

</script>
<template>
  <nav class="flex items-center">
    <router-link :to="{ name: 'home' }" class="mr-4 text-green-700 hover:underline">Home</router-link>
    <router-link :to="{ name: 'about' }" class="mr-4 text-green-700 hover:underline">About</router-link>
    <router-link :to="{ name: 'Garden' }" class="mr-4 text-green-700 hover:underline">Garden</router-link>
    <template v-if="!user">
      <router-link :to="{ name: 'login' }" class="mr-4 text-green-700 hover:underline">Login</router-link>
      <router-link :to="{ name: 'signup' }" class="mr-4 text-green-700 hover:underline">Sign up</router-link>
    </template>
    <template v-else>
      <router-link :to="{ name: 'gardens' }" class="mr-4 text-green-700 hover:underline">Gardens</router-link>
      <span class="mr-4 text-green-700 hover:cursor-pointer hover:underline">{{ user.username}}</span>
      <span class="mr-4 text-green-700 hover:cursor-pointer hover:underline" @click="handleLogout">Logout</span>
    </template>
  </nav>
</template>
