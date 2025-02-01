<template>
  <div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Gestion du compte</h2>

    <!-- Modification du nom d'utilisateur -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Changer de nom d'utilisateur</h3>
      <form @submit.prevent="updateUsername">
        <input
          v-model="newUsername"
          type="text"
          placeholder="Nouveau nom d'utilisateur"
          class="w-full p-2 mb-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
        >
          Mettre à jour
        </button>
      </form>
      <p v-if="usernameMessage" class="mt-2 text-sm" :class="usernameError ? 'text-red-500' : 'text-green-500'">
        {{ usernameMessage }}
      </p>
    </div>

    <!-- Modification du mot de passe -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Changer le mot de passe</h3>
      <form @submit.prevent="updatePassword">
        <input
          v-model="passwordData.oldPassword"
          type="password"
          placeholder="Ancien mot de passe"
          class="w-full p-2 mb-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          v-model="passwordData.newPassword"
          type="password"
          placeholder="Nouveau mot de passe"
          class="w-full p-2 mb-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
        >
          Changer le mot de passe
        </button>
      </form>
      <p v-if="passwordMessage" class="mt-2 text-sm" :class="passwordError ? 'text-red-500' : 'text-green-500'">
        {{ passwordMessage }}
      </p>
    </div>

    <!-- Suppression du compte -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-red-600">Zone dangereuse</h3>
      <form @submit.prevent="deleteAccount">
        <input
          v-model="deletePassword"
          type="password"
          placeholder="Entrez votre mot de passe pour confirmer"
          class="w-full p-2 mb-3 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          class="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
        >
          Supprimer définitivement le compte
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
import { useRouter } from 'vue-router';

const router = useRouter();

// États pour le changement de nom d'utilisateur
const newUsername = ref('');
const usernameMessage = ref('');
const usernameError = ref(false);

// États pour le changement de mot de passe
const passwordData = ref({
  oldPassword: '',
  newPassword: ''
});
const passwordMessage = ref('');
const passwordError = ref(false);

// États pour la suppression du compte
const deletePassword = ref('');
const deleteMessage = ref('');
const deleteError = ref(false);

const updateUsername = async () => {
  try {
    await Meteor.callAsync('updateUsername', newUsername.value);
    usernameMessage.value = 'Nom d\'utilisateur mis à jour avec succès !';
    usernameError.value = false;
    newUsername.value = '';
  } catch (error) {
    usernameMessage.value = error.reason || 'Erreur lors de la mise à jour';
    usernameError.value = true;
  }
};

const updatePassword = async () => {
  try {
    await Meteor.callAsync('updatePassword', passwordData.value.oldPassword, passwordData.value.newPassword);
    passwordMessage.value = 'Mot de passe mis à jour avec succès !';
    passwordError.value = false;
    passwordData.value = { oldPassword: '', newPassword: '' };
  } catch (error) {
    passwordMessage.value = error.reason || 'Erreur lors du changement de mot de passe';
    passwordError.value = true;
  }
};

const deleteAccount = async () => {
  try {
    await Meteor.callAsync('deleteUser', deletePassword.value);
    deleteMessage.value = 'Compte supprimé. Redirection...';
    deleteError.value = false;
    setTimeout(() => router.push('/'), 2000);
  } catch (error) {
    deleteMessage.value = error.reason || 'Erreur lors de la suppression du compte';
    deleteError.value = true;
  }
};
</script>