<script setup>
import { autorun } from 'vue-meteor-tracker';
import Hello from './Hello.vue'
import { Meteor } from 'meteor/meteor';

let user = autorun(() => Meteor.user()).result

</script>

<template>
  <template v-if="user">
    <h1>Hello {{ user.username }}</h1>
  </template>
  <h1 class="text-3xl font-bold my-6">Welcome to Meteor!</h1>
  <Hello />
</template>
