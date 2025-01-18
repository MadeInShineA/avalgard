<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { Meteor } from 'meteor/meteor';
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

// Watch for changes in the searchQuery and trigger the search function
watch(searchQuery, (newQuery) => {
  searchPlant(newQuery);
});

function fetchGarden() {
  console.log('Fetching garden...');
  Meteor.call('gardens.find', userId.value, gardenId.value, (error, result) => {
    if (!error && result) {
      garden.value = result;

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

const addPlantToGarden = (plant) => {
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
    const cols = Math.floor((gardenWidth - plantWidth) / cellSize);
    const rows = Math.floor((gardenHeight - plantHeight) / cellSize);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellSize;
        const y = row * cellSize;

        const fitsInBounds =
          x + plantWidth <= gardenWidth && y + plantHeight <= gardenHeight;
        const isOccupied = occupiedPositions.some(
          (pos) => pos.x === col && pos.y === row
        );

        if (fitsInBounds && !isOccupied) {
          // Ensure plant doesn't overlap the previously added plant
          return { x, y };
        }
      }
    }

    console.warn('No free position found!');
    return { x: 10, y: 10 }; // Fallback position
  };

  const { x, y } = findFirstAvailablePosition();

  // Add the plant to the garden with the new x and y coordinates
  draggablePlants.value.push({
    id: plant.id,
    name: plant.name,
    x,
    y,
    w: plantWidth,
    h: plantHeight,
  });
};

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
          <button
            @click="router.push('/')"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>

        <!-- Draggable Garden Area -->
        <div
          :style="{
            position: 'relative',
            backgroundColor: '#808080',
            background: 'linear-gradient(-90deg, rgba(0, 0, 0, .1) 1px, transparent 1px), linear-gradient(rgba(0, 0, 0, .1) 1px, transparent 1px)',
            backgroundSize: '20px 20px, 20px 20px',
            backgroundPosition: '10px 10px',
            height: '100vh', // Full height
            width: '100%', // Full width
            border: '1px solid blue',
            boxSizing: 'border-box',
          }"
          class="mt-6"
        >
          <vue-draggable-resizable
            v-for="(plant, index) in draggablePlants"
            :key="plant.id"
            :x="plant.x"
            :y="plant.y"
            :w="plant.w"
            :h="plant.h"
            :parent="true"
            :grid="[20, 20]"
          >
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
        <input
          v-model="searchQuery"
          type="text"
          class="p-2 border border-gray-300 rounded-lg mb-4 w-full"
          placeholder="Search plants..."
        />

        <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <li
            v-for="plant in plants"
            :key="plant.id"
            class="p-4 bg-gray-100 shadow rounded-lg cursor-pointer hover:bg-gray-200"
            @click="addPlantToGarden(plant)"
          >
            <p class="font-bold">{{ plant.name }}</p>
          </li>
        </ul>
      </div>
    </template>

    <!-- Loader -->
    <div v-else class="text-center py-10">
      <p class="text-gray-500">Loading garden details...</p>
    </div>
  </div>
</template>

<style>
.vdr {
  position: absolute
}
</style>
