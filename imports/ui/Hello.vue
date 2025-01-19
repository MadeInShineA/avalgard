<script setup>
import { ref } from 'vue'
import RippleButton from './RippleButton.vue';

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
    <RippleButton @click="increment">Click Me</RippleButton>
  <p>
    You've pressed the button <strong>{{ count }}</strong> times.
  </p>
</template>
