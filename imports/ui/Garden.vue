<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { useRoute, useRouter } from 'vue-router';
import VueDraggableResizable from 'vue-draggable-resizable';

const garden = ref(null);
const climate = ref();
const userId = ref(null);
const gardenId = ref(null);
const plants = ref([]);
const draggablePlants = ref([]); // Store draggable plants for the garden
const route = useRoute();
const router = useRouter();
const maxPlants = 10; // Maximum number of plants allowed in the garden
const isGardenFull = computed(() => draggablePlants.value.length >= maxPlants); // Check if garden is full

const searchQuery = ref(''); // Search query for the plant search bar

const showConfirmPlantModal = ref(false); // Popup to confirm an incompatible plant
const incompatiblePlant = ref(null); //Store the incompatible plant

// Watch for changes in the searchQuery and trigger the search function
watch(searchQuery, (newQuery) => {
  searchPlant(newQuery);
});

function fetchGarden() {
  console.log('Fetching garden...');
  Meteor.call('gardens.find', userId.value, gardenId.value, (error, result) => {
    if (!error && result) {
      garden.value = result;
      initializeGardenGrid()

      // Fetch the climate only if `climateId` exists
      if (result.climateId) {
        fetchClimate(result.climateId);
      } else {
        console.warn('No climate ID in garden data');
        climate.value = { name: 'Not specified' }; // Fallback
      }
    } else {
      console.error('Error fetching garden:', error);
    }
  });
}

function initializeGardenGrid() {
  console.log(garden.value);
  let plantsToPlace = garden.value.plants;

  plantsToPlace.forEach((plantToPlace) => {
    Meteor.call('plants.findById', plantToPlace.plantId, (error, dbPlant) => {
      if (error) {
        console.error(`Error fetching plant by ID: ${plantToPlace.plantId}`, error);
        return;
      }

      console.log(dbPlant)
      draggablePlants.value.push({
        id: Random.id(),
        plantId: plantToPlace.plantId,
        name: dbPlant.name,
        x: plantToPlace.position.x,
        y: plantToPlace.position.y,
        w: plantToPlace.width,
        h: plantToPlace.height,
      });
    });
  });
}

function fetchClimate(climateId) {
  if (!climateId) {
    console.error('Invalid climate ID:', climateId);
    return;
  }

  console.log('Fetching climate...');
  Meteor.call('climates.findById', climateId, (error, result) => {
    if (!error && result) {
      console.log('Climate found:', result.name);
      climate.value = result; // Store the climate data
    } else {
      console.error('Error fetching climate:', error);
      climate.value = { name: 'Unknown' }; // Default value in case of an error
    }
  });
}

function fetchPlants() {
  console.log('Fetching plants...');
  Meteor.call('plants.findAll', (error, result) => {
    if (!error) {
      console.log('Plants found:', result);
      plants.value = result;
    } else {
      console.error('Error fetching plants:', error);
    }
  });
}

function searchPlant(query) {
  // Filter plants based on the search query
  if (!query) {
    fetchPlants(); // If query is empty, fetch all plants
    return;
  }
  // Perform a search with the query
  Meteor.call('plants.search', query, (error, result) => {
    console.log(result);
    plants.value = result || []; // Update the plants list with the search results
  });
}

const addPlantToGarden = (plant, compatible) => {
  if (!compatible) {
    incompatiblePlant.value = plant;
    showConfirmPlantModal.value = true;
    return;
  }
  
  const gardenWidth = 600; // Match the garden's actual width
  const gardenHeight = 600; // Match the garden's actual height
  const cellSize = 20; // The grid cell size for positioning
  const plantWidth = 100; // Default width of a plant
  const plantHeight = 100; // Default height of a plant

  const occupiedPositions = draggablePlants.value.map((p) => ({
    x: Math.floor(p.x / cellSize),
    y: Math.floor(p.y / cellSize),
  }));

  const findFirstAvailablePosition = () => {
    const cols = Math.floor(gardenWidth / cellSize);  // Calculer le nombre de colonnes basé sur la taille de la grille
    const rows = Math.floor(gardenHeight / cellSize); // Calculer le nombre de rangées basé sur la taille de la grille

    // Parcours de chaque cellule dans la grille
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Calculer la position (x, y) de la plante dans la grille
        const x = col * cellSize;
        const y = row * cellSize;

        // Vérifier si la plante s'adapte dans la grille
        const fitsInBounds = x + plantWidth <= gardenWidth && y + plantHeight <= gardenHeight;

        // Vérifier si la position est déjà occupée par une autre plante
        const isOccupied = draggablePlants.value.some((otherPlant) => {
          // Comparer les positions et les tailles des autres plantes
          return (
            x < otherPlant.x + otherPlant.w &&
            x + plantWidth > otherPlant.x &&
            y < otherPlant.y + otherPlant.h &&
            y + plantHeight > otherPlant.y
          );
        });

        // Si la position est valide et non occupée, retourner la position
        if (fitsInBounds && !isOccupied) {
          return { x, y };
        }
      }
    }

    console.warn('No free position found!');
    return { x: -1, y: -1 }; // Retourner une position par défaut si aucune position libre n'est trouvée
  };

  const { x, y } = findFirstAvailablePosition();
  
  if (x >= 0 && y >= 0) {
    // Add the plant to the garden with the new x and y coordinates
    draggablePlants.value.push({
      id: Random.id(),
      plantId: plant._id,
      name: plant.name,
      x,
      y,
      w: plantWidth,
      h: plantHeight,
    });
  }
  
  showConfirmPlantModal.value = false;
};

const onDrag = (x, y, plant) => {
  if (!plant) return;

  const isOverlapping = draggablePlants.value.some((otherPlant) => {
    if (otherPlant.id === plant.id) return false; // Ignore la plante elle-même
    return (
      x < otherPlant.x + otherPlant.w &&
      x + plant.w > otherPlant.x &&
      y < otherPlant.y + otherPlant.h &&
      y + plant.h > otherPlant.y
    );
  });

  if (!isOverlapping) {
    // Mettre à jour la position de la plante si pas de chevauchement
    plant.x = x;
    plant.y = y;
    return true; // Permet le déplacement
  }

  return false; // Si chevauchement, empêche le déplacement
};

function saveDraggablePlants() {

  console.log(draggablePlants.value)
  Meteor.call('gardens.savePlants', userId.value, garden.value._id, draggablePlants.value)
}

function handlePlantResize(x, y, w, h, plant){

  const isOverlapping = draggablePlants.value.some((otherPlant) => {
    if (otherPlant.id === plant.id) return false; // Ignore la plante elle-même
    return (
      x < otherPlant.x + otherPlant.w &&
      x + w > otherPlant.x &&
      y < otherPlant.y + otherPlant.h &&
      y + h > otherPlant.y
    );
  });

  if (!isOverlapping) {
    // Mettre à jour la position de la plante si pas de chevauchement
    plant.w = w
    plant.h = h
    plant.x = x
    plant.y = y
    return true; // Permet le déplacement
  }

  return false;

}

onMounted(() => {
  console.log('onMounted: Garden');
  gardenId.value = route.params.id_garden;
  console.log('gardenId:', gardenId.value);
  userId.value = Meteor.userId();

  if (gardenId.value) {
    if (userId.value) {
      fetchGarden();
      fetchPlants();
    } else {
      console.error('User not logged in');
      router.push('/'); // Redirect if the user is not logged in
    }
  } else {
    console.error('No garden ID found in route.');
    router.push('/'); // Redirect if no garden ID is found
  }
});

function isPlantClimateCompatible(plant) {
  if (!climate.value || climate.value.name === 'Unknown') {
    return false;
  }

  const plantTempMin = plant.temperatureRange.min;
  const plantTempMax = plant.temperatureRange.max;
  const climateTempMin = climate.value.temperatureRange.min;
  const climateTempMax = climate.value.temperatureRange.max;

  if (plantTempMin > climateTempMax || plantTempMax < climateTempMin) {
    return false;
  }
  else {
    return true;
  }
}

// TODO Fix the plant's available positions (can't go up but more down)
</script>

<template>
  <div class="container mx-auto p-6">
    <!-- Garden Details -->
    <template v-if="garden">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-2xl font-bold mb-4">{{ garden.name }}</h1>
        <p class="text-gray-600 mb-2">
          <strong>Climate:</strong> {{ climate?.name || 'Loading...' }}
        </p>
        <p class="text-gray-600 mb-2">
          <strong>Tasks:</strong> {{ garden.tasks.length }}
        </p>
        <p class="text-gray-600 mb-2">
          <strong>Plants:</strong> {{ garden.plants.length }}
        </p>
        <div class="mt-4">
          <button @click="saveDraggablePlants()" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Save
          </button>
        </div>

        <!-- Draggable Garden Area -->
        <div :style="{
          position: 'relative',
          backgroundColor: '#808080',
          background: 'linear-gradient(-90deg, rgba(0, 0, 0, .1) 1px, transparent 1px), linear-gradient(rgba(0, 0, 0, .1) 1px, transparent 1px)',
          backgroundSize: '20px 20px, 20px 20px',
          backgroundPosition: '10px 10px',
          height: '100vh', // Full height
          width: '100%', // Full width
          border: '1px solid blue',
          boxSizing: 'border-box',
        }" class="mt-6">
          <vue-draggable-resizable v-for="(plant, index) in draggablePlants" :key="plant._id" :x="plant.x" :y="plant.y"
            :w="plant.w" :h="plant.h" :parent="true" :grid="[20, 20]" :on-drag="(x, y) => onDrag(x, y, plant)" :on-resize="(dragHandle, x, y, w, h) => handlePlantResize(x,y,w,h, plant)"
            :style="{ backgroundColor: 'red', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }">
            <p>{{ plant.name }}</p>
          </vue-draggable-resizable>
        </div>

        <!-- Show a message if the garden is full -->
        <p v-if="isGardenFull" class="text-red-500 mt-4">
          The garden is full! Remove a plant to add a new one.
        </p>
      </div>

      <!-- Plants Search -->
      <div class="mt-8">
        <h2 class="text-xl font-bold mb-4">Available Plants</h2>
        <input v-model="searchQuery" type="text" class="p-2 border border-gray-300 rounded-lg mb-4 w-full"
          placeholder="Search plants..." />

          <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <li 
              v-for="plant in plants" 
              :key="plant._id"
              :class="[
                'p-4 shadow rounded-lg cursor-pointer',
                isPlantClimateCompatible(plant) 
                  ? 'bg-gray-100 hover:bg-gray-200' 
                  : 'bg-red-200 hover:bg-red-300'
              ]" 
              @click="addPlantToGarden(plant, isPlantClimateCompatible(plant))"
            >
              <p class="font-bold">{{ plant.name }}</p>
            </li>
          </ul>
      </div>
    </template>

    <!-- Confirm incompatible plant modal -->
    <div v-if="showConfirmPlantModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded shadow w-150">
          <h2 class="text-xl font-bold mb-4 flex justify-center">Are you sure to add this plant ?</h2>
          <p class="text-gray-600 mb-4 flex justify-center">This plant is not compatible with your climate. You can still add it to your garden, but it may not grow well.</p>
          <div class="flex justify-center space-x-2">
            <button @click="addPlantToGarden(incompatiblePlant, true)" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Add
            </button>
            <button @click="showConfirmPlantModal = false"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      </div>

    <!-- Loader -->
    <div v-else class="text-center py-10">
      <p class="text-gray-500">Loading garden details...</p>
    </div>
  </div>
</template>

<style>
@import "vue-draggable-resizable/style.css";

.vdr {
  position: absolute
}
</style>
