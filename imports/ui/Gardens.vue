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

  const newGarden = ref({ name: '', climateId: '' }); // Stores data for the new garden
  const updatedGarden = ref({ _id: '', name: '', climateId: '' }); // Stores data for the updated garden

  const router = useRouter();

  function fetchGardens(){
    userId.value = Meteor.userId();
    Meteor.call('gardens.findAll', userId.value, (error, result) => {
      if (!error) {
        gardens.value = result;
      } else {
        console.error('Error fetching gardens:', error);
      }
    });
  };

  onMounted(() => {
    userId.value = Meteor.userId();
    if (userId.value) {
      fetchGardens();
    } else {
      console.error('User not logged in');
    }
    getClimates()
  });

  function addGarden(){
    showAddGardenModal.value = true;
  };

  function createGarden(){
    const gardenToAdd = {
      _id: Random.id(),
      name: newGarden.value.name,
      climateId: newGarden.value.climateId,
      tasks: [],
      plants: [],
    };

    Meteor.call('gardens.insert', userId.value, gardenToAdd, (error) => {
      if (!error) {
        fetchGardens(); // Refresh gardens list after addition
        showAddGardenModal.value = false; // Hide Add Garden Modal
        showConfirmationModal.value = true; // Show Confirmation Modal
      } else {
        console.error('Error adding garden:', error);
      }
    });
  };

  function editGarden(garden){
    updatedGarden.value = { ...garden }; // Pre-fill modal with garden data
    showUpdateGardenModal.value = true;
  };

  function updateGarden(){
    Meteor.call('gardens.update', userId.value, updatedGarden.value._id, updatedGarden.value, (error) => {
      if (!error) {
        fetchGardens(); // Refresh gardens list after update
        showUpdateGardenModal.value = false; // Hide Update Garden Modal
      } else {
        console.error('Error updating garden:', error);
      }
    });
  };

  function removeGarden(gardenId){
    Meteor.call('gardens.remove', userId.value, gardenId, (error) => {
      if (!error) {
        fetchGardens(); // Refresh gardens list after removal
      } else {
        console.error('Error removing garden:', error);
      }
    });
  };

  function viewGarden(gardenId){
    router.push('/gardens/' + gardenId);
  };

  const climates = ref([])

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

  </script>

  <template>
    <div class="p-6">
      <button @click="addGarden" class="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600">Add Garden</button>

      <ul class="mt-6 space-y-4">
        <li v-for="garden in gardens" :key="garden._id" class="p-4 border rounded shadow flex justify-between items-center">
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
            <input 
              v-model="newGarden.name" 
              type="text" 
              class="w-full border rounded px-2 py-1" 
              placeholder="Enter garden name" 
            />
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

          <!-- Validation Message -->
          <p 
            v-if="!newGarden.name.trim() || !newGarden.climateId" 
            class="text-red-500 text-sm mb-4"
          >
            Please fill in both the name and climate fields.
          </p>

          <div class="flex justify-end space-x-2">
            <button 
              @click="createGarden" 
              :disabled="!newGarden.name.trim() || !newGarden.climateId" 
              :class="{
                'bg-gray-500': !newGarden.name.trim() || !newGarden.climateId,
                'bg-green-500': newGarden.name.trim() && newGarden.climateId
              }" 
              class="text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Create
            </button>
            <button 
              @click="showAddGardenModal = false" 
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
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

        <p 
            v-if="!updatedGarden.name.trim() || !updatedGarden.climateId" 
            class="text-red-500 text-sm mb-4"
          >
            Please fill in both the name and climate fields.
          </p>

          <div class="flex justify-end space-x-2">
            <button 
              @click="updateGarden" 
              :disabled="!updatedGarden.name.trim() || !updatedGarden.climateId" 
              :class="{
                'bg-gray-500': !updatedGarden.name.trim() || !updatedGarden.climateId,
                'bg-blue-500': updatedGarden.name.trim() && updatedGarden.climateId
              }" 
              class="text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Update
            </button>
            <button 
              @click="showUpdateGardenModal = false" 
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
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