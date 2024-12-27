<template>
  <nav class="flex items-center">
    <router-link :to="{ name: 'home' }" class="mr-4 text-green-700 hover:underline">Home</router-link>
    <router-link :to="{ name: 'about' }" class="mr-4 text-green-700 hover:underline">About</router-link>
    <router-link :to="{ name: 'tasks' }" class="mr-4 text-green-700 hover:underline">Tasks</router-link>
  </nav>
</template>
