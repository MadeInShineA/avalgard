<template>
    <div class="container mx-auto p-6">
      <h1 class="text-2xl font-bold mb-4">Mon Compte</h1>
      <div v-if="user" class="bg-white p-4 rounded shadow-md">
        <p><strong>Nom d'utilisateur :</strong> {{ user.username }}</p>
        <p><strong>Nombre de jardins :</strong> {{ gardens.length }}</p>
        
        <button @click="showEditModal = true" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Modifier le compte
        </button>
        <button @click="deleteAccount" class="mt-4 ml-2 bg-red-500 text-white px-4 py-2 rounded">
          Supprimer le compte
        </button>
      </div>
  
      <h2 class="text-xl font-bold mt-6">Mes Jardins</h2>
      <ul v-if="gardens.length" class="mt-4">
        <li v-for="garden in gardens" :key="garden._id" class="bg-gray-100 p-2 mb-2 rounded">
          <p><strong>Nom :</strong> {{ garden.name }}</p>
          <p><strong>Climat ID :</strong> {{ garden.climateId }}</p>
          <button @click="goToEditGarden(garden._id)" class="mt-2 bg-green-500 text-white px-4 py-2 rounded">
            Modifier
          </button>
        </li>
      </ul>
      <p v-else>Aucun jardin trouvé.</p>
  
      <!-- Modal pour modifier le compte -->
      <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded shadow-lg w-96">
          <h2 class="text-xl font-bold">Modifier mon compte</h2>
          <input v-model="newUsername" placeholder="Nouveau nom d'utilisateur" class="w-full p-2 border mt-2" />
          <input v-model="newPassword" type="password" placeholder="Nouveau mot de passe" class="w-full p-2 border mt-2" />
          <div class="mt-4 flex justify-end">
            <button @click="updateAccount" class="bg-blue-500 text-white px-4 py-2 rounded">Enregistrer</button>
            <button @click="showEditModal = false" class="ml-2 bg-gray-500 text-white px-4 py-2 rounded">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { Meteor } from 'meteor/meteor';
  import { Tracker } from 'meteor/tracker';
  
  export default {
    data() {
      return {
        user: null,
        gardens: [],
        showEditModal: false,
        newUsername: '',
        newPassword: ''
      };
    },
    created() {
      Tracker.autorun(() => {
        this.user = Meteor.user();
        if (this.user) {
          this.fetchUserGardens();
        }
      });
    },
    methods: {
      async fetchUserGardens() {
        if (!this.user || !this.user._id) return;
        this.gardens = await Meteor.callAsync('gardens.findAll', this.user._id);
      },
      async updateAccount() {
        if (!this.newUsername && !this.newPassword) return;
        
        if (this.newUsername) {
          await Meteor.callAsync('users.updateUsername', this.user._id, this.newUsername);
        }
        if (this.newPassword) {
          await Meteor.callAsync('users.updatePassword', this.user._id, this.newPassword);
        }
        this.showEditModal = false;
        this.fetchUserGardens();
      },
      async deleteAccount() {
        if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) {
          await Meteor.callAsync('users.remove', this.user._id);
          Meteor.logout();
          this.$router.push('/');
        }
      },
      goToEditGarden(gardenId) {
        this.$router.push(`/gardens/edit/${gardenId}`);
      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
  }
  </style>
  