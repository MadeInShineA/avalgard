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

    <!-- Changer de mot de passe -->
    <div class="mb-8 bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Changer de mot de passe</h2>
      <form @submit.prevent="handleChangePassword">
        <!-- Ancien mot de passe -->
        <div class="mb-4">
          <label for="oldPassword" class="block text-gray-700">
            Ancien mot de passe
          </label>
          <input
            id="oldPassword"
            type="password"
            v-model="oldPassword"
            placeholder="Ancien mot de passe"
            class="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <!-- Nouveau mot de passe -->
        <div class="mb-4">
          <label for="newPassword" class="block text-gray-700">
            Nouveau mot de passe
          </label>
          <input
            id="newPassword"
            type="password"
            v-model="newPassword"
            placeholder="Nouveau mot de passe"
            class="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <!-- Confirmation du nouveau mot de passe -->
        <div class="mb-4">
          <label for="confirmPassword" class="block text-gray-700">
            Confirmer le nouveau mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            v-model="confirmPassword"
            placeholder="Confirmer le nouveau mot de passe"
            class="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="mb-4 text-red-500">
          {{ errorMessage }}
        </div>

        <!-- Message de succès -->
        <div v-if="successMessage" class="mb-4 text-green-500">
          {{ successMessage }}
        </div>

        <!-- Bouton de soumission -->
        <button
          type="submit"
          class="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors duration-200"
        >
          Changer le mot de passe
        </button>
      </form>
    </div>
    <!-- Suppression du compte -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-red-700">Supprimer le compte</h3>
      <form @submit.prevent="handleDeleteAccount">
        <!--
        <input
          v-model="deletePassword"
          type="password"
          placeholder="Votre mot de passe"
          class="w-full p-2 mb-3 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
          required
        /> -->
        <button
          type="submit"
          class="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
        >
          Supprimer mon compte
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

// États pour le changement de nom d'utilisateur
const newUsername = ref('');
const usernameMessage = ref('');
const usernameError = ref(false);

// États pour le changement de mot de passe
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');

// États pour la suppression du compte
const deletePassword = ref('');
const deleteMessage = ref('');
const deleteError = ref(false);

const updateUsername = async () => {
  try {
    await Meteor.callAsync('updateUsername', newUsername.value);
    usernameMessage.value = "Nom d'utilisateur mis à jour avec succès !";
    usernameError.value = false;
    newUsername.value = '';
  } catch (error) {
    usernameMessage.value = error.reason || "Erreur lors de la mise à jour";
    usernameError.value = true;
  }
};

function handleChangePassword() {
  // Réinitialiser les messages
  errorMessage.value = '';
  successMessage.value = '';

  // Vérifier que le nouveau mot de passe correspond à sa confirmation
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "Le nouveau mot de passe et sa confirmation ne correspondent pas.";
    return;
  }

  // Utiliser l'API de Meteor pour changer le mot de passe
  Accounts.changePassword(oldPassword.value, newPassword.value, (error) => {
    if (error) {
      errorMessage.value = error.reason || "Erreur lors du changement de mot de passe.";
    } else {
      successMessage.value = "Mot de passe changé avec succès.";
      // Réinitialiser les champs
      oldPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
    }
  });
}

const handleDeleteAccount = async () => {
  // Réinitialiser le message
  deleteMessage.value = "";
  deleteError.value = false;

  // Confirmation de la suppression
  if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
    return;
  }

  try {
    await Meteor.callAsync('deleteUserAccount', deletePassword.value);
    deleteMessage.value = "Compte supprimé avec succès.";
    // Déconnexion de l'utilisateur et redirection (ici vers la page d'accueil)
    Meteor.logout(() => {
      router.push('/');
    });
  } catch (error) {
    deleteMessage.value = error.reason || "Erreur lors de la suppression du compte.";
    deleteError.value = true;
  }
};
</script>
