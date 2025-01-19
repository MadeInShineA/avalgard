<script setup>
import { ref, onMounted } from 'vue';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { useRouter } from 'vue-router';

const gardens = ref([]);
const userId = ref(null);
const showAddGardenModal = ref(false); // Controls Add Garden Modal visibility
const showUpdateGardenModal = ref(false); // Controls Update Garden Modal visibility
const showConfirmationModal = ref(false); // Controls Confirmation Modal visibility

  const newGarden = ref({ name: '', climateId: '', height: 10, width: 10 }); // Stores data for the new garden
  const updatedGarden = ref({ _id: '', name: '', climateId: '', height: 0, width: 0 }); // Stores data for the updated garden
  const MIN_SIDE_LENGTH = 1
  const MAX_SIDE_LENGTH = 15

const router = useRouter();

function fetchGardensWithoutAnimation() {
    userId.value = Meteor.userId();
    Meteor.call('gardens.findAll', userId.value, (error, result) => {
      if (!error) {
        gardens.value = result;
        const gardensList = gardens.value
        gardensList.forEach((garden, index) => {
          garden.visible = true;
        });
      } else {
        console.error('Error fetching gardens:', error);
      }
    });
  };

function fetchGardens() {
  userId.value = Meteor.userId();
  Meteor.call('gardens.findAll', userId.value, (error, result) => {
    if (!error) {
      gardens.value = result;
      displayGardensWithDelay(); // Start displaying gardens with delay after fetching
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
};

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
  };

  function editGarden(garden) {
    updatedGarden.value = { ...garden }; // Pre-fill modal with garden data
    showUpdateGardenModal.value = true;
  };

  function updateGarden() {
    Meteor.call('gardens.update', userId.value, updatedGarden.value._id, updatedGarden.value, (error) => {
      if (!error) {
        fetchGardensWithoutAnimation(); // Refresh gardens list after update
        showUpdateGardenModal.value = false; // Hide Update Garden Modal
      } else {
        console.error('Error updating garden:', error);
      }
    });
  };
function removeGarden(gardenId) {
  Meteor.call('gardens.remove', userId.value, gardenId, (error) => {
    if (!error) {
      gardens.value = gardens.value.filter(garden => garden._id !== gardenId); // Remove garden from list
    } else {
      console.error('Error removing garden:', error);
    }
  });
}

function viewGarden(gardenId) {
  router.push('/gardens/' + gardenId);
};

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

  function getClimates() {
    Meteor.call('climates.findAll', (error, result) => {
      if (!error) {
        climates.value = result
      } else {
        console.error('Error fetching climates:', error);
      }
    });
  }

  function getClimateName(climateId) {
    const climate = this.climates.find(c => c._id === climateId);
    return climate ? climate.name : 'Unknown';
  }

  function hideConfirmationModal() {
    showConfirmationModal.value = false
    newGarden.value = { name: '', climateId: '', height: 10, width: 10 }
  }

  function canSubmitForm(garden) {
    return garden.name.trim() &&
      garden.climateId &&
      garden.height >= MIN_SIDE_LENGTH &&
      garden.width >= MIN_SIDE_LENGTH &&
      garden.height <= MAX_SIDE_LENGTH &&
      garden.width <= MAX_SIDE_LENGTH
  }

// Function to simulate a delay when displaying gardens
async function displayGardensWithDelay() {
  const gardensList = gardens.value;
  gardensList.forEach((garden, index) => {
    setTimeout(() => {
      // Set the garden's visibility to true after the delay
      garden.visible = true;
    }, index * 500); // Delay each garden's visibility by 500ms
  });
}
</script>


<template>
  <div class="p-6">
    <button @click="addGarden" class="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600">Add Garden</button>

    <ul class="mt-6 space-y-4">
      <li v-for="garden in gardens" :key="garden._id" class="p-4 border rounded shadow flex justify-between items-center"
          :class="{'fade-in': garden.visible, 'invisible': !garden.visible}">
        <div>
          <h3 class="text-lg font-bold">{{ garden.name }}</h3>
          <p class="text-sm text-gray-600">Climate: {{ getClimateName(garden.climateId) }}</p>
          <p class="text-sm text-gray-600">Tasks: {{ garden.tasks.length }}</p>
          <p class="text-sm text-gray-600">Plants: {{ garden.plants.length }}</p>
        </div>
        <div class="flex space-x-2">
          <button @click="editGarden(garden)" class="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600">Edit</button>
          <button @click="removeGarden(garden._id)" class="bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600">Remove</button>
          <button @click="viewGarden(garden._id)" class="bg-gray-500 text-white px-3 py-1 rounded shadow hover:bg-gray-600">View</button>
        </div>
      </li>
    </ul>

    <!-- Add Garden Modal -->
    <div v-if="showAddGardenModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded shadow w-96">
        <h2 class="text-xl font-bold mb-4">Create a New Garden</h2>
        <label class="block mb-2">
          Name:
          <input v-model="newGarden.name" type="text" class="w-full border rounded px-2 py-1" placeholder="Enter garden name" />
        </label>
        <label class="block mb-4">
          Climate ID:
          <select v-model="newGarden.climateId" class="w-full border rounded px-2 py-1">
            <option value="" disabled>Select a climate</option>
            <option v-for="climate in climates" :key="climate._id" :value="climate._id">
              {{ climate.name }}
            </option>
          </select>
        </label>
        <div class="flex justify-end space-x-2">
          <button @click="createGarden" 
                  :disabled="!newGarden.name.trim() || !newGarden.climateId" 
                  :class="{'bg-gray-500': !newGarden.name.trim() || !newGarden.climateId, 'bg-green-500': newGarden.name.trim() && newGarden.climateId}" 
                  class="text-white px-4 py-2 rounded hover:bg-green-600">
            Create
          </button>
          <button @click="showAddGardenModal = false" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>


    <!-- Update Garden Modal -->
    <div v-if="showUpdateGardenModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded shadow w-96">
        <h2 class="text-xl font-bold mb-4">Update Garden</h2>
        <label class="block mb-2">
          Name:
          <input v-model="updatedGarden.name" type="text" class="w-full border rounded px-2 py-1" placeholder="Enter garden name" />
        </label>
        <label class="block mb-4">
          Climate:
          <select v-model="updatedGarden.climateId" class="w-full border rounded px-2 py-1">
            <option value="" disabled>Select a climate</option>
            <option v-for="climate in climates" :key="climate._id" :value="climate._id">
              {{ climate.name }}
            </option>
          </select>
        </label>
        <div class="flex justify-end space-x-2">
          <button @click="updateGarden" :disabled="!updatedGarden.name.trim() || !updatedGarden.climateId" 
                  class="text-white px-4 py-2 rounded hover:bg-blue-600 bg-blue-500">
            Update
          </button>
          <button @click="showUpdateGardenModal = false" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmationModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded shadow w-96">
        <h2 class="text-xl font-bold mb-4">Garden Created Successfully!</h2>
        <p><strong>Name:</strong> {{ newGarden.name }}</p>
        <p><strong>Climate:</strong> {{ getClimateName(newGarden.climateId) }}</p>
        <button @click="showConfirmationModal = false" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4">OK</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation fade-in */
.fade-in {
  animation: fadeInAnimation 1s ease-out forwards;
}

.invisible {
  visibility: hidden;
}

@keyframes fadeInAnimation {
  from {
    opacity: 0;
    transform: translateY(20px); /* Légèrement décalé vers le bas */
  }
  to {
    opacity: 1;
    transform: translateY(0); /* Position finale */
  }
}
</style>
