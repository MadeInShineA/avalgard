<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { Accounts } from 'meteor/accounts-base';

const router = useRouter();
const username = ref('');
const password = ref('');

const registerFeedback = ref({ message: '', success: false });

const handleSubmit = () => {
  const callback = (error) => {
    if (error) {
      console.log(error);
      registerFeedback.value.message = error.reason;
      registerFeedback.value.success = false;
    } else {
      registerFeedback.value.message = 'Signup successful';
      registerFeedback.value.success = true;
      Meteor.loginWithPassword(user.username, user.password);
      router.push('/');
    }
  };

  const user = {
    username: username.value,
    password: password.value,
  };

  Meteor.call('createUserCustom', user, callback);
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
      v-if="registerFeedback.message"
      :class="registerFeedback.success ? 'text-green-400' : 'text-red-400'"
      class="text-sm"
    >
      {{ registerFeedback.message }}
    </div>

    <div class="w-full max-w-sm">
      <button
        type="submit"
        class="w-full py-2 px-4 bg-teal-500 text-white font-bold rounded hover:bg-teal-600 focus:outline-none focus:ring focus:ring-teal-300"
      >
        Sign Up
      </button>
    </div>
  </form>
</template>
