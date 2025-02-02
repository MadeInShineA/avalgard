<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link :to="{ name: 'home' }"
              class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium">
              <h1 class="text-2xl font-bold text-green-600">Avalgard</h1>
            </router-link>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <router-link :to="{ name: 'home' }"
            class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium">
            Home
          </router-link>
          <template v-if="!user">
            <router-link :to="{ name: 'login' }"
              class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium">
              Login
            </router-link>
            <router-link :to="{ name: 'signup' }"
              class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium">
              Sign up
            </router-link>
          </template>
          <template v-else>
            <router-link :to="{ name: 'gardens' }"
              class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium">
              Gardens
            </router-link>
            <router-link 
              to="/tasks" 
              class="menu-item flex items-center justify-between"
            >
              <span class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium">
                Tasks
              </span>
              <span 
                v-if="unseenCount > 0"
                id="taskBubble"
                class="bg-red-500 text-white rounded-full text-[0.65rem] w-4 h-4 flex items-center justify-center"
              >
                {{ unseenCount }}
              </span>
            </router-link>
            <router-link :to="{ name: 'account' }"
              class="text-green-700 hover:underline px-3 py-2 rounded-md text-sm font-medium">
              {{ user.username }}
            </router-link>

            <span class="text-green-700 hover:cursor-pointer hover:underline px-3 py-2 rounded-md text-sm font-medium"
              @click="handleLogout">
              Logout
            </span>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { Tracker } from 'meteor/tracker';

const unseenCount = ref(0);

function fetchUnseenCount() {
  Meteor.call('tasks.countUnseen', Meteor.userId(), (error, count) => {
    if (!error) {
      unseenCount.value = count;
    }
    else {
      console.log(error)
    }
  });
}

onMounted(() => {
  Tracker.autorun(() => {
    if (Meteor.userId()) {
      fetchUnseenCount();
    }
  });
});

const router = useRouter();

const user = ref(null);

autorun(() => {
  user.value = Meteor.user();
});

function handleLogout() {
  Meteor.logout(() => {
    router.push({ name: 'home' });
  });
}
</script>
