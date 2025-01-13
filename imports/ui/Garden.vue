<script setup>
import { ref, onMounted, computed } from 'vue';
import { Meteor } from 'meteor/meteor';
import { useRoute, useRouter } from 'vue-router';

const garden = ref(null);
const climateName = ref(''); // Pour stocker le nom du climat
const userId = ref(null);
const gardenId = ref(null);
const route = useRoute();
const router = useRouter();

function fetchGarden() {
  console.log('Fetching garden...');
  Meteor.call('gardens.find', userId.value, gardenId.value, (error, result) => {
    if (!error) {
      garden.value = result;

      // Récupérer le climat après avoir chargé le jardin
      fetchClimate(result.climateId);
    } else {
      console.error('Error fetching garden:', error);
    }
  });
}

function fetchClimate(climateId) {
  console.log('Fetching climate...');
  Meteor.call('climates.findById', climateId, (error, result) => {
    if (!error) {
      console.log('Climate found:', result.name);
      climateName.value = result.name; // Stocker le nom du climat
    } else {
      console.error('Error fetching climate:', error);
      climateName.value = 'Unknown'; // Valeur par défaut en cas d'erreur
    }
  });
}

onMounted(() => {
  console.log('onMounted: Garden');
  gardenId.value = route.params.id_garden;
  console.log('gardenId:', gardenId.value);
  userId.value = Meteor.userId();

  if (gardenId.value) {
    if (userId.value) {
      fetchGarden(); // Charger les données du jardin
    } else {
      console.error('User not logged in');
      router.push('/'); // Rediriger si l'utilisateur n'est pas connecté
    }
  } else {
    console.error('No garden ID found in route.');
    router.push('/'); // Rediriger si aucun ID de jardin n'est trouvé
  }
});
</script>



<template>
  <div class="container mx-auto p-6">
    <!-- Afficher les détails du jardin -->
    <div v-if="garden" class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold mb-4">{{ garden.name }}</h1>
      <p class="text-gray-600 mb-2">
        <strong>Climate:</strong> {{ climateName }}
      </p>
      <p class="text-gray-600 mb-2">
        <strong>Tasks:</strong> {{ garden.tasks.length }}
      </p>
      <p class="text-gray-600 mb-2">
        <strong>Plants:</strong> {{ garden.plants.length }}
      </p>
      <div class="mt-4">
        <button
          @click="router.push('/')"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Home
        </button>
      </div>
    </div>

    <!-- Loader si le jardin n'est pas encore chargé -->
    <div v-else class="text-center py-10">
      <p class="text-gray-500">Loading garden details...</p>
    </div>
  </div>
</template>
