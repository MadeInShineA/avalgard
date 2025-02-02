<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { useRouter } from 'vue-router';
import RippleButton from './RippleButton.vue';


const gardens = ref([]);
const userId = ref(null);
const showAddGardenModal = ref(false);
const showUpdateGardenModal = ref(false);
const showConfirmationModal = ref(false);

const newGarden = ref({ name: '', climateId: '', height: 10, width: 10 }); // Stores data for the new garden
const updatedGarden = ref({ _id: '', name: '', climateId: '', height: 0, width: 0 }); // Stores data for the updated garden
const MIN_SIDE_LENGTH = 1;
const MAX_SIDE_LENGTH = 15;

const router = useRouter();

function fetchGardensWithoutAnimation() {
  userId.value = Meteor.userId();
  Meteor.call('gardens.findAll', userId.value, (error, result) => {
    if (!error) {
      gardens.value = result;
      gardens.value.forEach((garden) => {
        garden.visible = true;
      });
    } else {
      console.error('Error fetching gardens:', error);
    }
  });
}

function fetchGardens() {
  userId.value = Meteor.userId();
  Meteor.call('gardens.findAll', userId.value, (error, result) => {
    if (!error) {
      gardens.value = result;
      displayGardensWithDelay();
    } else {
      console.error('Error fetching gardens:', error);
    }
  });
}

onMounted(() => {
  userId.value = Meteor.userId();
  if (userId.value) {
    fetchGardens();
  } else {
    console.error('User not logged in');
  }
  getClimates();
});

function addGarden() {
  showAddGardenModal.value = true;
}

function createGarden() {
  const gardenToAdd = {
    _id: Random.id(),
    name: newGarden.value.name,
    climateId: newGarden.value.climateId,
    height: newGarden.value.height,
    width: newGarden.value.width,
    tasks: [],
    plants: [],
  };

  Meteor.call('gardens.insert', userId.value, gardenToAdd, (error) => {
    if (!error) {
      fetchGardensWithoutAnimation(); // Refresh gardens list after addition
      showAddGardenModal.value = false; // Hide Add Garden Modal
      showConfirmationModal.value = true; // Show Confirmation Modal
    } else {
      console.error('Error adding garden:', error);
    }
  });
}

function editGarden(garden) {
  updatedGarden.value = { ...garden };
  showUpdateGardenModal.value = true;
}

function updateGarden() {
  Meteor.call('gardens.update', userId.value, updatedGarden.value._id, updatedGarden.value, (error) => {
    if (!error) {
      fetchGardensWithoutAnimation();
      showUpdateGardenModal.value = false;
    } else {
      console.error('Error updating garden:', error);
    }
  });
}

function removeGarden(gardenId) {
  Meteor.call('gardens.remove', userId.value, gardenId, (error) => {
    if (!error) {
      gardens.value = gardens.value.filter(garden => garden._id !== gardenId);
    } else {
      console.error('Error removing garden:', error);
    }
  });
}

function viewGarden(gardenId) {
  router.push('/gardens/' + gardenId);
}

const climates = ref([]);

function getClimates() {
  Meteor.call('climates.findAll', (error, result) => {
    if (!error) {
      climates.value = result;
    } else {
      console.error('Error fetching climates:', error);
    }
  });
}

function getClimateName(climateId) {
  const climate = climates.value.find(c => c._id === climateId);
  return climate ? climate.name : 'Unknown';
}

function hideConfirmationModal() {
  showConfirmationModal.value = false;
  newGarden.value = { name: '', climateId: '', height: 10, width: 10 };
}

function canSubmitForm(garden) {
  return garden.name.trim() &&
    garden.climateId &&
    garden.height >= MIN_SIDE_LENGTH &&
    garden.width >= MIN_SIDE_LENGTH &&
    garden.height <= MAX_SIDE_LENGTH &&
    garden.width <= MAX_SIDE_LENGTH;
}

async function displayGardensWithDelay() {
  const gardensList = gardens.value;
  gardensList.forEach((garden, index) => {
    setTimeout(() => {
      garden.visible = true;
    }, index * 500);
  });
}
</script>

<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <!-- Add Garden Button -->
    <button @click="addGarden"
      class="bg-green-500 dark:bg-green-700 text-white px-4 py-2 rounded shadow hover:bg-green-600 dark:hover:bg-green-800">
      Add Garden
    </button>

    <!-- Gardens List -->
    <ul class="mt-6 space-y-4">
      <li v-for="garden in gardens" :key="garden._id"
        class="p-4 border rounded shadow flex justify-between items-center bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        :class="{ 'fade-in': garden.visible, 'invisible': !garden.visible }">
        <div>
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">{{ garden.name }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">Climate: {{ getClimateName(garden.climateId) }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-300">Height: {{ garden.height }} m</p>
          <p class="text-sm text-gray-600 dark:text-gray-300">Width: {{ garden.width }} m</p>
          <p class="text-sm text-gray-600 dark:text-gray-300">Tasks: {{ garden.tasks.length }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-300">Plants: {{ garden.plants.length }}</p>
        </div>
        <div class="flex space-x-2">
          <button @click="editGarden(garden)"
            class="bg-blue-500 dark:bg-blue-700 text-white px-3 py-1 rounded shadow hover:bg-blue-600 dark:hover:bg-blue-800">
            Edit
          </button>
          <button @click="removeGarden(garden._id)"
            class="bg-red-500 dark:bg-red-700 text-white px-3 py-1 rounded shadow hover:bg-red-600 dark:hover:bg-red-800">
            Remove
          </button>
          <button @click="viewGarden(garden._id)"
            class="bg-gray-500 dark:bg-gray-700 text-white px-3 py-1 rounded shadow hover:bg-gray-600 dark:hover:bg-gray-800">
            View
          </button>
        </div>
      </li>
    </ul>

    <!-- Add Garden Modal -->
    <div v-if="showAddGardenModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white dark:bg-gray-900 p-6 rounded shadow w-96">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Create a New Garden</h2>
        <label class="block mb-2 text-gray-800 dark:text-gray-200">
          Name:
          <input v-model="newGarden.name" type="text"
            class="w-full border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
            placeholder="Enter garden name" />
        </label>
        <label class="block mb-4 text-gray-800 dark:text-gray-200">
          Climate ID:
          <select v-model="newGarden.climateId"
            class="w-full border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700">
            <option value="" disabled>Select a climate</option>
            <option v-for="climate in climates" :key="climate._id" :value="climate._id">
              {{ climate.name }}
            </option>
          </select>
        </label>

        <label class="block mb-2 text-gray-800 dark:text-gray-200">
          Height (m):
          <input v-model="newGarden.height" type="number" :min="MIN_SIDE_LENGTH" :max="MAX_SIDE_LENGTH"
            class="w-full border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700" />
        </label>
        <p v-if="newGarden.height < MIN_SIDE_LENGTH || newGarden.height > MAX_SIDE_LENGTH"
          class="text-red-500 text-sm mb-4">
          The height should be between {{ MIN_SIDE_LENGTH }} and {{ MAX_SIDE_LENGTH }}
        </p>

        <label class="block mb-4 text-gray-800 dark:text-gray-200">
          Width (m):
          <input v-model="newGarden.width" type="number" :min="MIN_SIDE_LENGTH" :max="MAX_SIDE_LENGTH"
            class="w-full border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700" />
        </label>
        <p v-if="newGarden.width < MIN_SIDE_LENGTH || newGarden.width > MAX_SIDE_LENGTH"
          class="text-red-500 text-sm mb-4">
          The width should be between {{ MIN_SIDE_LENGTH }} and {{ MAX_SIDE_LENGTH }}
        </p>

        <!-- Validation Message -->
        <p v-if="!newGarden.name.trim() || !newGarden.climateId || !newGarden.height || !newGarden.width"
          class="text-red-500 text-sm mb-4">
          Please fill the fields.
        </p>

        <div class="flex justify-end space-x-2">
          <button @click="createGarden" :disabled="!canSubmitForm(newGarden)" :class="{
            'bg-gray-500 dark:bg-gray-600': !canSubmitForm(newGarden),
            'bg-green-500 dark:bg-green-700': canSubmitForm(newGarden)
          }" class="text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-800">
            Create
          </button>
          <RippleButton @click="showAddGardenModal = false"
            class="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700">
            Cancel
          </RippleButton>
        </div>
      </div>
    </div>

    <!-- Update Garden Modal -->
    <div v-if="showUpdateGardenModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white dark:bg-gray-900 p-6 rounded shadow w-96">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Update Garden</h2>
        <label class="block mb-2 text-gray-800 dark:text-gray-200">
          Name:
          <input v-model="updatedGarden.name" type="text"
            class="w-full border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
            placeholder="Enter garden name" />
        </label>
        <label class="block mb-4 text-gray-800 dark:text-gray-200">
          Climate:
          <select v-model="updatedGarden.climateId"
            class="w-full border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700">
            <option value="" disabled>Select a climate</option>
            <option v-for="climate in climates" :key="climate._id" :value="climate._id">
              {{ climate.name }}
            </option>
          </select>
        </label>

        <label class="block mb-2 text-gray-800 dark:text-gray-200">
          Height (m):
          <input v-model="updatedGarden.height" type="number" min="1"
            class="w-full border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700" />
        </label>
        <p v-if="updatedGarden.height < MIN_SIDE_LENGTH || updatedGarden.height > MAX_SIDE_LENGTH"
          class="text-red-500 text-sm mb-4">
          The height should be between {{ MIN_SIDE_LENGTH }} and {{ MAX_SIDE_LENGTH }}
        </p>

        <label class="block mb-4 text-gray-800 dark:text-gray-200">
          Width (m):
          <input v-model="updatedGarden.width" type="number" min="1"
            class="w-full border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700" />
        </label>
        <p v-if="updatedGarden.width < MIN_SIDE_LENGTH || updatedGarden.width > MAX_SIDE_LENGTH"
          class="text-red-500 text-sm mb-4">
          The width should be between {{ MIN_SIDE_LENGTH }} and {{ MAX_SIDE_LENGTH }}
        </p>

        <p v-if="!updatedGarden.name.trim() || !updatedGarden.climateId || !updatedGarden.height || !updatedGarden.width"
          class="text-red-500 text-sm mb-4">
          Please fill the fields.
        </p>

        <div class="flex justify-end space-x-2">
          <button @click="updateGarden" :disabled="!canSubmitForm(updatedGarden)" :class="{
            'bg-gray-500 dark:bg-gray-600': !canSubmitForm(updatedGarden),
            'bg-blue-500 dark:bg-blue-700': canSubmitForm(updatedGarden)
          }" class="text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800">
            Update
          </button>
          <button @click="showUpdateGardenModal = false"
            class="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Garden Creation -->
    <div v-if="showConfirmationModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white dark:bg-gray-900 p-6 rounded shadow w-96">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Garden Created Successfully!</h2>
        <p class="text-gray-800 dark:text-gray-200"><strong>Name:</strong> {{ newGarden.name }}</p>
        <p class="text-gray-800 dark:text-gray-200"><strong>Climate:</strong> {{ getClimateName(newGarden.climateId) }}</p>
        <p class="text-gray-800 dark:text-gray-200"><strong>Height:</strong> {{ newGarden.height }}</p>
        <p class="text-gray-800 dark:text-gray-200"><strong>Width:</strong> {{ newGarden.width }}</p>
        <button @click="hideConfirmationModal()"
          class="bg-green-500 dark:bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-800 mt-4">
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeInAnimation 1s ease-out forwards;
}

.invisible {
  visibility: hidden;
}

@keyframes fadeInAnimation {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
