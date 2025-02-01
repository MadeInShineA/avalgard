<template>
  <nav class="bg-white dark:bg-gray-800 shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link 
              :to="{ name: 'home' }" 
              class="text-green-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              <h1 class="text-2xl font-bold text-green-600">Avalgard</h1>
            </router-link>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <router-link 
            :to="{ name: 'home' }" 
            class="text-green-700 dark:text-green-200 hover:underline px-3 py-2 rounded-md text-sm font-medium"
          >
            Home
          </router-link>
          <template v-if="!user">
            <router-link 
              :to="{ name: 'login' }" 
              class="text-green-700 dark:text-green-200 hover:underline px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </router-link>
            <router-link 
              :to="{ name: 'signup' }" 
              class="text-green-700 dark:text-green-200 hover:underline px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign up
            </router-link>
          </template>
          <template v-else>
            <router-link 
              :to="{ name: 'gardens' }" 
              class="text-green-700 dark:text-green-200 hover:underline px-3 py-2 rounded-md text-sm font-medium"
            >
              Gardens
            </router-link>

            <router-link 
              to="/tasks" 
              class="menu-item flex items-center justify-between">
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
              class="text-green-700 dark:text-green-200 hover:underline px-3 py-2 rounded-md text-sm font-medium">
              {{ user.username }}
            </router-link>
            
            <span class="text-green-700 dark:text-green-200 hover:cursor-pointer hover:underline px-3 py-2 rounded-md text-sm font-medium"
                  @click="handleLogout">
              Logout
            </span>
          </template>
          <!-- Bouton switch pour le Dark Mode -->
          <button @click="toggleDarkMode"
                  class="relative inline-flex items-center h-6 w-11 mx-3 rounded-full transition-colors duration-200 focus:outline-none bg-gray-200 dark:bg-gray-600">
            <span class="sr-only">Toggle dark mode</span>
            <span :class="isDarkMode ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-flex items-center justify-center h-4 w-4 bg-white rounded-full transform transition-transform duration-200">
              <template v-if="isDarkMode">
                <svg class="w-3 h-3 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707 8.003 8.003 0 0 0 2 10a8 8 0 0 0 15.293 3.293z"/>
                </svg>
              </template>
              <template v-else>
                <svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-12a1 1 0 0 1 1-1h0a1 1 0 0 1-1 1H10zm0 12a1 1 0 0 1 1 1h0a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1 1h0a1 1 0 0 1-1-1zm-12 0a1 1 0 0 1 1 1h0a1 1 0 0 1-1-1zm8.536-4.536a1 1 0 1 1 1.414-1.414h0a1 1 0 1 1-1.414 1.414zM5.05 14.95a1 1 0 1 1 1.414-1.414h0a1 1 0 1 1-1.414 1.414zm9.9 0a1 1 0 1 1 1.414-1.414h0a1 1 0 1 1-1.414 1.414zm-9.9-9.9a1 1 0 1 1 1.414-1.414h0a1 1 0 1 1-1.414 1.414z"/>
                </svg>
              </template>
            </span>
          </button>
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
import Cookies from 'js-cookie';

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

const isDarkMode = ref(false);

onMounted(() => {
  const darkCookie = Cookies.get('darkMode');
  if (darkCookie === 'true') {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDarkMode.value = false;
    document.documentElement.classList.remove('dark');
  }
});

// Fonction pour basculer le mode sombre et sauvegarder le choix dans un cookie
function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  Cookies.set('darkMode', isDarkMode.value, { expires: 365 });
}
</script>
