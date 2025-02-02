<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { useRoute, useRouter } from 'vue-router';
import VueDraggableResizable from 'vue-draggable-resizable';
import VueSlider from 'vue-3-slider-component';
import RippleButton from './RippleButton.vue';

const garden = ref(null)
const climate = ref()
const userId = ref(null)
const gardenId = ref(null)
const plants = ref([])
const route = useRoute()
const router = useRouter()
const isGardenFull = ref(false) 

const searchQuery = ref('') 
const ONE_METER_IN_PIXELS = 100
const CELL_SIZE = ONE_METER_IN_PIXELS / 5
const BORDER_SIZE = 3
const MIN_SIDE_LENGTH = 1
const MAX_SIDE_LENGTH = 15

const showConfirmPlantModal = ref(false) 
const incompatiblePlant = ref(null) 

const growthDurationRange = ref([0, 400]); 
const waterRequirementRange = ref([0, 5]); 
const selectedPlantType = ref(''); 

const gardenWidth = ref(0) 
const gardenHeight = ref(0) 


// Watch for changes in searchbar and sliders and trigger the search function
watch(searchQuery, searchAndFilterPlants);
watch(growthDurationRange, searchAndFilterPlants);
watch(waterRequirementRange, searchAndFilterPlants);
watch(selectedPlantType, searchAndFilterPlants);

function fetchGarden() {
  Meteor.call('gardens.find', userId.value, gardenId.value, (error, result) => {
    if (!error && result) {
      garden.value = result
      gardenHeight.value = result.height
      gardenWidth.value = result.width
      initializeGardenGrid()

      // Fetch the climate only if `climateId` exists
      if (result.climateId) {
        fetchClimate(result.climateId)
      } else {
        console.warn('No climate ID in garden data')
        climate.value = { name: 'Not specified' } // Fallback
      }
    } else {
      console.error('Error fetching garden:', error)
      router.push('/')
    }
  })
}

function initializeGardenGrid() {
  let plantsToPlace = garden.value.plants

  plantsToPlace.forEach((plantToPlace) => {
    Meteor.call('plants.findById', plantToPlace.plantId, (error, dbPlant) => {
      if (error) {
        console.error(`Error fetching plant by ID: ${plantToPlace.plantId}`, error)
        return
      }

      if(plantToPlace.x < garden.value.width * ONE_METER_IN_PIXELS && plantToPlace.y < garden.value.height * ONE_METER_IN_PIXELS){
        plantToPlace.isVisible = true
      }else{
        plantToPlace.isVisible = false
      }
      plantToPlace.name = dbPlant.name
      plantToPlace.sprite = dbPlant.sprite

    })
  })
}

function fetchClimate(climateId) {
  if (!climateId) {
    console.error('Invalid climate ID:', climateId)
    return
  }

  Meteor.call('climates.findById', climateId, (error, result) => {
    if (!error && result) {
      climate.value = result // Store the climate data
    } else {
      console.error('Error fetching climate:', error)
      climate.value = { name: 'Unknown' }
    }
  })
}

function fetchPlants() {
  Meteor.call('plants.findAll', (error, result) => {
    if (!error) {
      plants.value = result
    } else {
      console.error('Error fetching plants:', error)
    }
  })
}

function searchAndFilterPlants() {
  Meteor.call('plants.searchAndFilter', {
    searchQuery: searchQuery.value,
    minGrowthDuration: growthDurationRange.value[0],
    maxGrowthDuration: growthDurationRange.value[1],
    minWaterRequirement: waterRequirementRange.value[0],
    maxWaterRequirement: waterRequirementRange.value[1],
    plantType: selectedPlantType.value
  }, (error, result) => {
    plants.value = result || []; // Update the plants list with the filtered results
  });
}

const addPlantToGarden = (plant, compatible) => {
  if (!compatible) {
    incompatiblePlant.value = plant
    showConfirmPlantModal.value = true
    return
  }

  //TODO IMPORTANT CHANGER ATTENTION ERREUR 404
  
  const cellSize = CELL_SIZE 
  const plantWidth = ONE_METER_IN_PIXELS 
  const plantHeight = ONE_METER_IN_PIXELS 
  const gardenWidthInPixel = gardenWidth.value * ONE_METER_IN_PIXELS
  const gardenHeightInPixel = gardenHeight.value * ONE_METER_IN_PIXELS

  const occupiedPositions = garden.value.plants.map((p) => ({
    x: Math.floor(p.x / cellSize),
    y: Math.floor(p.y / cellSize),
  }))

  const findFirstAvailablePosition = () => {
    const cols = Math.floor(gardenWidthInPixel / cellSize)  
    const rows = Math.floor(gardenHeightInPixel / cellSize) 

    // Parcours de chaque cellule dans la grille
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Calculer la position (x, y) de la plante dans la grille
        const x = col * cellSize
        const y = row * cellSize

        // Vérifier si la plante s'adapte dans la grille
        const fitsInBounds = x + plantWidth <= gardenWidthInPixel && y + plantHeight <= gardenHeightInPixel

        // Vérifier si la position est déjà occupée par une autre plante
        const isOccupied = garden.value.plants.some((otherPlant) => {
          // Comparer les positions et les tailles des autres plantes
          return (
            x < otherPlant.x + otherPlant.w &&
            x + plantWidth > otherPlant.x &&
            y < otherPlant.y + otherPlant.h &&
            y + plantHeight > otherPlant.y
          )
        })

        // Si la position est valide et non occupée, retourner la position
        if (fitsInBounds && !isOccupied) {
          return { x, y }
        }
      }
    }

    isGardenFull.value = true
    console.warn('No free position found!')
    return { x: -1, y: -1 } // Retourner une position par défaut si aucune position libre n'est trouvée
  }

  const { x, y } = findFirstAvailablePosition()

  const dateObj = new Date();
  const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getUTCDate().toString().padStart(2, '0');
  const year = dateObj.getUTCFullYear();

  const date = getCurrentDate()

  if (x >= 0 && y >= 0) {
    let plantToPlace = {
      _id: Random.id(),
      plantId: plant._id,
      name: plant.name,
      x,
      y,
      w: ONE_METER_IN_PIXELS,
      h: ONE_METER_IN_PIXELS,
      lastHarvestDate: date,
      lastWateringDate: date,
      lastCutDate: date,
      sprite: plant.sprite,
      isVisible: true
    }
    // Add the plant to the garden with the new x and y coordinates
    garden.value.plants.push(plantToPlace)
  }
  showConfirmPlantModal.value = false
}

const getCurrentDate = () => {
  const dateObj = new Date();
  const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getUTCDate().toString().padStart(2, '0');
  const year = dateObj.getUTCFullYear();

  return year + "-" + month + "-" + day
}

const onDrag = (x, y, plant) => {
  if (!plant) return

  isGardenFull.value = false
  const isOverlapping = garden.value.plants.some((otherPlant) => {
    if (otherPlant._id === plant._id) return false // Ignore la plante elle-même
    return (
      x < otherPlant.x + otherPlant.w &&
      x + plant.w > otherPlant.x &&
      y < otherPlant.y + otherPlant.h &&
      y + plant.h > otherPlant.y
    )
  })

  if (!isOverlapping) {
    // Mettre à jour la position de la plante si pas de chevauchement
    plant.x = x
    plant.y = y
    return true // Permet le déplacement
  }

  return false // Si chevauchement, empêche le déplacement
}

const showSavingConfirmationModal = ref(false)
const showModificationModal = ref(false)
const selectedPlant = ref(null)

function saveGarden() {
  const plantsToSave = garden.value.plants.filter(plant => plant.isVisible)
  let gardenToSave = garden.value
  gardenToSave.plants = plantsToSave
  Meteor.call('gardens.update', userId.value, garden.value._id, gardenToSave, (error) => {
    if (!error) {
      showSavingConfirmationModal.value = true // Show Confirmation Modal
    } else {
      console.error('Error saving garden:', error)
    }
  })
}

function openModificationModal(plant) {
  selectedPlant.value = { ...plant }
  showModificationModal.value = true
}

function saveChanges() {
  console.log(selectedPlant.value)
  console.log(garden.value.plants)
  if (!selectedPlant.value || !garden.value.plants) return
  isGardenFull.value = false

  const plantIndex = garden.value.plants.findIndex(
    plant => plant._id === selectedPlant.value._id
  )

  if (plantIndex !== -1) {
    if (selectedPlant.value.lastHarvestDate > getCurrentDate()){
      selectedPlant.value.lastHarvestDate = getCurrentDate()
    }
    if (selectedPlant.value.lastWateringDate > getCurrentDate()){
      selectedPlant.value.lastWateringDate = getCurrentDate()
    }
    if (selectedPlant.value.lastCutDate > getCurrentDate()){
      selectedPlant.value.lastCutDate = getCurrentDate()
    }
    garden.value.plants[plantIndex].lastHarvestDate = selectedPlant.value.lastHarvestDate
    garden.value.plants[plantIndex].lastWateringDate = selectedPlant.value.lastWateringDate
    garden.value.plants[plantIndex].lastCutDate = selectedPlant.value.lastCutDate
  }

  showModificationModal.value = false
}

function deletePlant() {
  if (!selectedPlant.value || !garden.value.plants) return
  isGardenFull.value = false

  garden.value.plants = garden.value.plants.filter(plant => plant._id !== selectedPlant.value._id)
  showModificationModal.value = false
}

function handlePlantResize(x, y, w, h, plant) {
  isGardenFull.value = false
  const isOverlapping = garden.value.plants.some((otherPlant) => {
    if (otherPlant._id === plant._id) return false // Ignore la plante elle-même
    return (
      x < otherPlant.x + otherPlant.w &&
      x + w > otherPlant.x &&
      y < otherPlant.y + otherPlant.h &&
      y + h > otherPlant.y
    )
  })

  const min_length_size = CELL_SIZE * 4
  const isSizeOk = w >= min_length_size && h >= min_length_size

  if (!isOverlapping && isSizeOk) {
    // Mettre à jour la position de la plante si pas de chevauchement
    plant.w = w
    plant.h = h
    plant.x = x
    plant.y = y
    return true // Permet le déplacement
  }
  return false
}

onMounted(() => {
  gardenId.value = route.params.id_garden
  userId.value = Meteor.userId()

  if (gardenId.value) {
    if (userId.value) {
      fetchGarden()
      fetchPlants()
    } else {
      console.error('User not logged in')
      router.push('/') // Redirect if the user is not logged in
    }
  } else {
    console.error('No garden ID found in route.')
    router.push('/') // Redirect if no garden ID is found
  }
})

function getCurrentSeason() {
  const spring = new Date('2024-03-15').getMonth();
  const summer = new Date('2024-06-15').getMonth();
  const automn = new Date('2024-09-15').getMonth();
  const winter = new Date('2024-12-15').getMonth();
  const today = new Date().getMonth();

  const month = today;
  if (month >= 2 && month <= 4) {
    return 'spring';
  } else if (month >= 5 && month <= 7) {
    return 'summer';
  } else if (month >= 8 && month <= 10) {
    return 'autumn';
  } else {
    return 'winter';
  }
}

function getSeasonalTemperatureRange() {
  if (!climate.value || climate.value.name === 'Unknown') {
    return null;
  }

  const season = getCurrentSeason();
  return climate.value.seasonalTemperatureRange[season];
}

function isPlantClimateCompatible(plant) {
  const seasonalRange = getSeasonalTemperatureRange();
  if (!seasonalRange) {
    return false;
  }

  const plantTempMin = plant.temperatureRange.min;
  const plantTempMax = plant.temperatureRange.max;
  const climateTempMin = seasonalRange.min;
  const climateTempMax = seasonalRange.max;

  if (plantTempMin > climateTempMax || plantTempMax < climateTempMin) {
    return false;
  } else {
    return true;
  }
}

watch([gardenWidth, gardenHeight], ([newWidth, newHeight], [oldWidth, oldHeight]) => {
  if (garden.value) {
    garden.value.height = newHeight;
    garden.value.width = newWidth;
    isGardenFull.value = false
    

    garden.value.plants.forEach((plant) => {
      if(plant.x < newWidth * ONE_METER_IN_PIXELS && plant.y < newHeight * ONE_METER_IN_PIXELS){
        plant.isVisible = true
      }else{
        plant.isVisible = false
      }
    })

    // Déclencher l'événement resize après mise à jour
    nextTick(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }
})

function viewTasks() {
  router.push('/gardens/' + gardenId.value + '/tasks')
};

</script>

<template class="mt-6 space-y-6">
  <!-- Garden Details -->
  <template v-if="garden && garden.plants">
    <div class="p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <h1 class="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">{{ garden.name }}</h1>
      <p class="text-gray-800 dark:text-gray-300"><strong>Climate:</strong> {{ climate?.name || 'Loading...' }}</p>
      <p class="text-gray-800 dark:text-gray-300"><strong>Tasks:</strong> {{ garden.tasks.length }}</p>
      <p class="text-gray-800 dark:text-gray-300"><strong>Width:</strong> {{ garden.width }} m</p>
      <p class="text-gray-800 dark:text-gray-300"><strong>Height:</strong> {{ garden.height }} m</p>
      <p class="text-gray-800 dark:text-gray-300"><strong>Plants:</strong> {{ garden.plants.filter(plant => plant.isVisible).length }}</p>
      <button @click="viewTasks()"
        class="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out">
        View tasks
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mt-6 border border-gray-200 dark:border-gray-700 flex justify-center items-center flex-col">
      <!-- Draggable Garden Area -->
      <div class="flex flex-col items-center space-y-4 w-full">
        <!-- Garden size sliders -->
        <div class="z-1 flex items-center w-full space-x-4">
          <label class="font-bold w-20 text-right text-gray-800 dark:text-gray-200">Width:</label>
          <VueSlider v-model="gardenWidth" :min="MIN_SIDE_LENGTH" :max="MAX_SIDE_LENGTH" :step="1" class="flex-1" />
          <span class="font-medium w-12 text-gray-800 dark:text-gray-200">{{ gardenWidth }}m</span>
        </div>

        <div class="z-1 flex items-center w-full space-x-4">
          <label class="font-bold w-20 text-right text-gray-800 dark:text-gray-200">Height:</label>
          <VueSlider v-model="gardenHeight" :min="MIN_SIDE_LENGTH" :max="MAX_SIDE_LENGTH" :step="1" class="flex-1" />
          <span class="font-medium w-12 text-gray-800 dark:text-gray-200">{{ gardenHeight }}m</span>
        </div>
      </div>

      <div :style="{
        background: `
          radial-gradient(circle at 10% 20%, #8bc34a 0%, #7cb342 20%, transparent 30%),
          radial-gradient(circle at 30% 40%, #7cb342 0%, #8bc34a 15%, transparent 25%),
          radial-gradient(circle at 50% 60%, #8bc34a 0%, #7cb342 20%, transparent 35%),
          radial-gradient(circle at 70% 30%, #7cb342 0%, #8bc34a 15%, transparent 25%),
          radial-gradient(circle at 90% 50%, #8bc34a 0%, #7cb342 20%, transparent 30%),
          radial-gradient(circle at 20% 80%, #7cb342 0%, #8bc34a 15%, transparent 35%),
          radial-gradient(circle at 80% 90%, #8bc34a 0%, #7cb342 20%, transparent 25%)`,
        backgroundColor: '#7cb342',
        backgroundSize: '100% 100%',
        height: garden.height * ONE_METER_IN_PIXELS + 2 * BORDER_SIZE + 'px',
        width: garden.width * ONE_METER_IN_PIXELS + 2 * BORDER_SIZE + 'px',
        border: BORDER_SIZE + 'px solid green',
      }" class="relative rounded-xl overflow-hidden">
      
        <vue-draggable-resizable v-for="(plant, index) in garden.plants" :key="plant._id" :x="plant.x" :y="plant.y"
          :w="plant.w" :h="plant.h" :parent="true" :grid="[CELL_SIZE, CELL_SIZE]"
          :draggable="plant.isVisible"
          :resizable="plant.isVisible"
          :on-drag="(x, y) => onDrag(x, y, plant)"
          :on-resize="(dragHandle, x, y, w, h) => handlePlantResize(x, y, w, h, plant)"
          :style="{ background: 'none', border: 'none' }"
          >
          <div v-if="plant.isVisible" 
            :style="{position: 'absolute', inset: 0, backgroundColor: 'transparent', border: '3px solid black', 
            color: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }"
            >
          <img :src="'/plants_sprites/' + plant.sprite">
          <p v-if="plant.w > 5 * CELL_SIZE">{{ plant.name.charAt(0).toUpperCase() + plant.name.slice(1) }}</p>
          <button @click="openModificationModal(plant)"
            class="absolute top-0 right-0 text-white rounded-full w-6 h-6 flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="size-6">
              <path
                d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
              <path
                d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
            </svg>
          </button>
        </div>
        </vue-draggable-resizable>
      </div>

      <p v-if="isGardenFull" class="text-red-500 mt-4 text-center font-bold">
        The garden is full! Remove a plant to add a new one.
      </p>

      <!-- Save Garden Button -->
      <div class="mt-4 flex justify-center w-full space-x-4">
        <button @click="saveGarden()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md">
          Save
        </button>
        <button @click="garden.plants = []" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md">
          Clear
        </button>
      </div>
    </div>

    <!-- Plants Search -->
    <div class="mt-8 p-6 border border-gray-200 dark:border-gray-600 rounded-xl shadow-md bg-white dark:bg-gray-800">
      <h2 class="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Available Plants</h2>
      <input v-model="searchQuery" type="text" class="p-2 border border-gray-300 dark:border-gray-500 rounded-lg w-full mb-4 shadow-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        placeholder="Search plants..." />
      <div class="mb-4 z-1">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Filter by Plant Type</h2>
        <select v-model="selectedPlantType" class="p-2 border border-gray-300 dark:border-gray-500 rounded-lg w-full mb-4 shadow-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <option value="">All Types</option>
          <option value="vegetable">Vegetable</option>
          <option value="fruit">Fruit</option>
          <option value="fungus">Fungus</option>
        </select>
      </div>
      <div class="mb-4 z-1">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Filter by growth duration</h2>
        <VueSlider v-model="growthDurationRange" :min="0" :max="400" :step="10" />
        <p class="text-sm text-gray-600 dark:text-gray-300">
          {{ growthDurationRange[0] }} - {{ growthDurationRange[1] }} days
        </p>
      </div>

      <div class="mb-4 z-1">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Filter by water requirement</h2>
        <VueSlider v-model="waterRequirementRange" :min="0" :max="5" :step="1" />
        <p class="text-sm text-gray-600 dark:text-gray-300">
          {{ waterRequirementRange[0] }} - {{ waterRequirementRange[1] }}
        </p>
      </div>
      <ul class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <li v-for="plant in plants" :key="plant._id" class="w-full">
          <RippleButton 
            @click="addPlantToGarden(plant, isPlantClimateCompatible(plant))"
            :class="[
              'w-full font-bold shadow-md rounded-lg cursor-pointer text-center',
              isPlantClimateCompatible(plant)
                ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-900 dark:text-green-300'
                : 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-900 dark:text-red-300'
            ]">
            {{ plant.name.charAt(0).toUpperCase() + plant.name.slice(1) }}
          </RippleButton>
        </li>
      </ul>
    </div>
  </template>

  <!-- Loader -->
  <div v-else class="text-center py-10">
    <p class="text-gray-500 dark:text-gray-400">Loading garden details...</p>
  </div>
  
  <!-- Confirm incompatible plant modal -->
  <div v-if="showConfirmPlantModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white dark:bg-gray-800 p-6 rounded shadow w-150">
      <h2 class="text-xl font-bold mb-4 text-center dark:text-gray-100">Are you sure to add this plant?</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-4 text-center">
        This plant is not compatible with your climate and your season.
        You can still add it to your garden, but it may not grow well.
      </p>
      <div class="flex justify-center space-x-2">
        <button @click="addPlantToGarden(incompatiblePlant, true)"
          class="bg-red-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          Add
        </button>
        <button @click="showConfirmPlantModal = false"
          class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  </div>

  <!-- Saving confirmation modal -->
  <div v-if="showSavingConfirmationModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white dark:bg-gray-800 p-6 rounded shadow w-96 flex flex-col justify-center items-center">
      <h2 class="text-xl font-bold mb-4 text-center dark:text-gray-100">Garden Saved Successfully!</h2>
      <button @click="showSavingConfirmationModal = !showSavingConfirmationModal"
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-4">
        OK
      </button>
    </div>
  </div>

  <!-- Plant modification modal -->
  <div v-if="showModificationModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div class="bg-white dark:bg-gray-800 p-6 rounded shadow w-96">
      <h2 class="text-xl font-bold mb-4 dark:text-gray-100">Plant details</h2>

      <div class="mb-4">
        <label for="lastHarvested" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last harvest date</label>
        <input v-model="selectedPlant.lastHarvestDate" type="date" id="lastHarvestedDate" :max="getCurrentDate()"
          class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
      </div>

      <div class="mb-4">
        <label for="lastWatering" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last watering date</label>
        <input v-model="selectedPlant.lastWateringDate" type="date" id="lastWateringDate" :max="getCurrentDate()"
          class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
      </div>

      <div class="mb-4">
        <label for="lastCutDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last cut date</label>
        <input v-model="selectedPlant.lastCutDate" type="date" id="lastCutDate" :max="getCurrentDate()"
          class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
      </div>

      <div class="flex justify-between">
        <button @click="saveChanges()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          Save
        </button>
        <button @click="deletePlant()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
          Delete
        </button>
        <button @click="showModificationModal = false"
          class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  </div>
  
</template>


<style>
@import "vue-draggable-resizable/style.css";

.vdr {
  position: absolute
}

.vdr:hover {
  cursor: pointer
}
.vue-slider-process {
    position: absolute;
    z-index: 0;
}
.vue-slider-dot {
    position: absolute;
    transition: all 0s;
    z-index: 0;
}
</style>
