<template>
  <div class="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Account management</h2>

    <!-- Change user name -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Change user name</h3>
      <form @submit.prevent="updateUsername">
        <input
          v-model="newUsername"
          type="text"
          placeholder="New user name"
          class="w-full p-2 mb-3 border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
        >
          Update
        </button>
      </form>
      <p v-if="usernameMessage" class="mt-2 text-sm" :class="usernameError ? 'text-red-500' : 'text-green-500'">
        {{ usernameMessage }}
      </p>
    </div>

    <!-- Change password -->
    <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Change password</h3>
    <form @submit.prevent="handleChangePassword" class="mb-8">
      <div class="mb-4">
        <label for="oldPassword" class="block text-gray-700 dark:text-gray-300">
          Old password
        </label>
        <input
          id="oldPassword"
          type="password"
          v-model="oldPassword"
          placeholder="Old password"
          class="w-full px-3 py-2 border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-600"
          required
        />
      </div>

      <div class="mb-4">
        <label for="newPassword" class="block text-gray-700 dark:text-gray-300">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          v-model="newPassword"
          placeholder="New password"
          class="w-full px-3 py-2 border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-600"
          required
        />
      </div>

      <div class="mb-4">
        <label for="confirmPassword" class="block text-gray-700 dark:text-gray-300">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          v-model="confirmPassword"
          placeholder="Confirm new password"
          class="w-full px-3 py-2 border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-600"
          required
        />
      </div>

      <div v-if="errorMessage" class="mb-4 text-red-500">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="mb-4 text-green-500">
        {{ successMessage }}
      </div>

      <button
        type="submit"
        class="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors duration-200"
      >
        Change password
      </button>
    </form>

    <!-- Delete account -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-4 text-red-700 dark:text-red-400">Delete account</h3>
      <form @submit.prevent="handleDeleteAccount">
        <!-- Optionnel : si vous souhaitez demander un mot de passe pour confirmer la suppression, décommentez l'input suivant -->
        <!--
        <input
          v-model="deletePassword"
          type="password"
          placeholder="Your password"
          class="w-full p-2 mb-3 border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          required
        />
        -->
        <button
          type="submit"
          class="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
        >
          Delete my account
        </button>
      </form>
      <p v-if="deleteMessage" class="mt-2 text-sm" :class="deleteError ? 'text-red-500' : 'text-green-500'">
        {{ deleteMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { useRouter } from 'vue-router';

const router = useRouter();

const newUsername = ref('');
const usernameMessage = ref('');
const usernameError = ref(false);

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');

const deletePassword = ref('');
const deleteMessage = ref('');
const deleteError = ref(false);

const updateUsername = async () => {
  try {
    await Meteor.callAsync('updateUsername', newUsername.value);
    usernameMessage.value = "User name successfully updated!";
    usernameError.value = false;
    newUsername.value = '';
  } catch (error) {
    usernameMessage.value = error.reason || "Update error";
    usernameError.value = true;
  }
};

function handleChangePassword() {
  // Reset messages
  errorMessage.value = '';
  successMessage.value = '';

  // Check that the new password matches its confirmation
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "The new password and its confirmation do not match.";
    return;
  }

  // Use Meteor API to change the password
  Accounts.changePassword(oldPassword.value, newPassword.value, (error) => {
    if (error) {
      errorMessage.value = error.reason || "Error changing password.";
    } else {
      successMessage.value = "Password changed successfully.";
      // Reset fields
      oldPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
    }
  });
}

const handleDeleteAccount = async () => {
  // Reset messages
  deleteMessage.value = "";
  deleteError.value = false;

  // Confirm deletion
  if (!confirm("Are you sure you want to delete your account? This action is irreversible.")) {
    return;
  }

  try {
    await Meteor.callAsync('deleteUserAccount', deletePassword.value);
    deleteMessage.value = "Account successfully deleted.";
    // Logout and redirect (here to home)
    Meteor.logout(() => {
      router.push('/');
    });
  } catch (error) {
    deleteMessage.value = error.reason || "Account deletion error.";
    deleteError.value = true;
  }
};
</script>

<style scoped>
/* Vous pouvez ajouter ici d'autres styles complémentaires si nécessaire */
</style>
