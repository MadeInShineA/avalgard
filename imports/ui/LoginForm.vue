<script setup>
import { ref } from 'vue';
import { Meteor } from 'meteor/meteor';
import { useRouter } from 'vue-router';

const router = useRouter();

const username = ref('');
const password = ref('');

const loginFeedback = ref({ message: '', success: false });

const handleSubmit = () => {
  const callback = (error) => {
    if (error) {
      loginFeedback.value.message = error.reason;
      loginFeedback.value.success = false;
    } else {
      console.log("Login successful!");
      loginFeedback.value.message = 'Login successful';
      loginFeedback.value.success = true;
      router.push('/');
    }
  };

  Meteor.loginWithPassword(username.value, password.value, callback);
};
</script>

<template>
  <form
    class="flex flex-col items-center justify-center h-full space-y-4"
    @submit.prevent="handleSubmit"
  >
    <div class="w-full max-w-sm">
      <label for="username" class="block font-bold mb-1">Username</label>
      <input
        id="username"
        name="username"
        type="text"
        placeholder="Username"
        required
        v-model="username"
        class="w-full px-4 py-2 border border-gray-400 rounded focus:outline-none focus:ring focus:ring-blue-300"
      />
    </div>

    <div class="w-full max-w-sm">
      <label for="password" class="block font-bold mb-1">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="Password"
        required
        v-model="password"
        class="w-full px-4 py-2 border border-gray-400 rounded focus:outline-none focus:ring focus:ring-blue-300"
      />
    </div>

    <div
      v-if="loginFeedback.message"
      :class="loginFeedback.success ? 'text-green-400' : 'text-red-400'"
      class="text-sm"
    >
      {{ loginFeedback.message }}
    </div>

    <div class="w-full max-w-sm">
      <button
        type="submit"
        class="w-full py-2 px-4 bg-teal-500 text-white font-bold rounded hover:bg-teal-600 focus:outline-none focus:ring focus:ring-teal-300"
      >
        Log In
      </button>
    </div>
  </form>
</template>
