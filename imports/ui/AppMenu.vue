<script setup>
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';

let user = autorun(() =>  Meteor.user()).result

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
      <span class="mr-4 text-green-700 hover:cursor-pointer hover:underline">{{ user.username}}</span>
      <span class="mr-4 text-green-700 hover:cursor-pointer hover:underline" @click="Meteor.logout()">Logout</span>
    </template>
  </nav>
</template>
