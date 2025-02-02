<script setup>
import { ref, onMounted, computed } from 'vue';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { useRouter } from 'vue-router';

const router = useRouter();
const gardens = ref([]);
const allTasks = ref([]);
const userId = ref(null);

const showAddTaskModal = ref(false);
const showUpdateTaskModal = ref(false);
const showConfirmationModal = ref(false);
const activeTab = ref('todo'); // 'todo', 'urgent', 'completed'

const newTask = ref({
  name: '',
  description: '',
  deadLine: new Date(),
  completed: false,
  gardenId: ''
});

const updatedTask = ref({
  _id: '',
  gardenId: '',
  name: '',
  description: '',
  deadLine: new Date(),
  completed: false
});

// Get all gardens and tasks
async function fetchAllGardensAndTasks() {
  userId.value = Meteor.userId();
  if (!userId.value) {
    router.push('/');
    return;
  }

  Meteor.call('gardens.findAll', userId.value, (error, result) => {
    if (!error) {
      gardens.value = result;
      // Merge tasks from all gardens into a single array
      allTasks.value = result.flatMap(garden => 
        (garden.tasks || []).map(task => ({
          ...task,
          gardenId: garden._id,
          gardenName: garden.name
        }))
      );
    }
  });
}

onMounted(() => {
  fetchAllGardensAndTasks();
  Meteor.call('tasks.markAllAsSeen', (error, result) => {
    if (error) {
        console.error('Error marking tasks:', error.reason);
    } else {
        console.log(`${result} tasks marked as seen`);
    }
  });
  const bubble = document.getElementById("taskBubble")
  if(bubble) {
    bubble.style.display = 'none';
  }
});

// Navigation to garden
function navigateToGarden(gardenId) {
  router.push(`/gardens/${gardenId}`);
}

// CRUD operations
function addTask() {
  showAddTaskModal.value = true;
}

function createTask() {
  const taskToAdd = {
    _id: Random.id(),
    name: newTask.value.name,
    description: newTask.value.description,
    deadLine: new Date(newTask.value.deadLine),
    completed: newTask.value.completed
  };

  Meteor.call('tasks.insert', 
    userId.value, 
    newTask.value.gardenId, // gardenId to add task to
    taskToAdd, 
    (error) => {
      fetchAllGardensAndTasks();
      showAddTaskModal.value = false;
      showConfirmationModal.value = true;
    }
  );
}

function toggleTaskCompletion(task) {
  Meteor.call('tasks.update', 
    userId.value, 
    task.gardenId, 
    task._id, 
    { completed: !task.completed }, 
    (error) => {
      if (!error) {
        fetchAllGardensAndTasks();
      }
    }
  );
}

function resetNewTaskForm() {
  newTask.value = {
    name: '',
    description: '',
    deadLine: new Date(),
    completed: false
  };
}

function editTask(task) {
  updatedTask.value = {
    ...task,
    deadLine: new Date(task.deadLine).toISOString().slice(0, 16)
  };
  showUpdateTaskModal.value = true;
}

function updateTask() {
  const taskToUpdate = {
    ...updatedTask.value,
    deadLine: new Date(updatedTask.value.deadLine)
  };

  Meteor.call('tasks.update', userId.value, updatedTask.value.gardenId, taskToUpdate._id, taskToUpdate, (error) => {
    if (!error) fetchAllGardensAndTasks();
    showUpdateTaskModal.value = false;
  });
}

function removeTask(task) {
  Meteor.call('tasks.remove', userId.value, task.gardenId, task._id, (error) => {
    if (!error) fetchAllGardensAndTasks();
  });
}

// Helpers
function formatDate(date) {
  return new Date(date).toLocaleString('fr-CH', { 
    dateStyle: 'short', 
    timeStyle: 'short' 
  });
}

function canSubmitTask(task) {
  return task.name.trim() && task.deadLine && task.gardenId;
}

function hideConfirmationModal() {
  showConfirmationModal.value = false;
  resetNewTaskForm();
}

// Filtres
const todoTasks = computed(() => {
  const now = new Date();
  return allTasks.value.filter(t => 
    !t.completed && new Date(t.deadLine) > now
  );
});

const urgentTasks = computed(() => {
  const now = new Date();
  return allTasks.value.filter(t => 
    !t.completed && new Date(t.deadLine) <= now
  );
});

const completedTasks = computed(() => {
  return allTasks.value.filter(t => t.completed);
});
</script>

<template>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">All Tasks</h1>
        <button @click="addTask" class="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600">
          Add Task
        </button>
      </div>
  
      <!-- Tabs -->
      <div class="flex space-x-4 mb-6 border-b">
        <button @click="activeTab = 'todo'" :class="{'border-b-2 border-blue-500': activeTab === 'todo'}" class="px-4 py-2">
          Todo ({{ todoTasks.length }})
        </button>
        <button @click="activeTab = 'urgent'" :class="{'border-b-2 border-red-500': activeTab === 'urgent'}" class="px-4 py-2">
          Urgent ({{ urgentTasks.length }})
        </button>
        <button @click="activeTab = 'completed'" :class="{'border-b-2 border-green-500': activeTab === 'completed'}" class="px-4 py-2">
          Completed ({{ completedTasks.length }})
        </button>
      </div>
  
      <!-- Task List -->
      <ul class="space-y-4">
        <li v-for="task in activeTab === 'todo' ? todoTasks : activeTab === 'urgent' ? urgentTasks : completedTasks" 
            :key="task._id" class="p-4 border rounded shadow flex justify-between items-center">
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-lg font-semibold">{{ task.name }}</h3>
                    <span
                    @click="navigateToGarden(task.gardenId)"
                    class="text-sm text-blue-500 cursor-pointer hover:underline"
                    >
                    ({{ task.gardenName }})
                    </span>
                </div>
                <p class="text-gray-600 text-sm mb-2">{{ task.description }}</p>
                <div class="flex gap-4 text-sm">
                    <span class="text-gray-500">
                    📅 {{ formatDate(task.deadLine) }}
                    </span>
                    <span 
                    :class="task.completed ? 'text-green-500' : 'text-red-500'"
                    class="font-medium"
                    >
                    {{ task.completed ? '✅ Completed' : '🕒 Pending' }}
                    </span>
                    
                    <svg v-if="task.isAutomatic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm6-4v2m-3 8v9m6-9v9M5 16l4-2m6 0l4 2M9 18h6M10 8v.01M14 8v.01"/></svg>
                </div>
            </div>
          <div class="flex space-x-2">
            <button @click="toggleTaskCompletion(task)" 
                    class="bg-green-500 text-white px-3 py-1 rounded shadow hover:bg-green-600">
              {{ task.completed ? 'Mark Pending' : 'Mark Completed' }}
            </button>
            <button @click="editTask(task)" class="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600">
              Edit
            </button>
            <button @click="removeTask(task)" class="bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600">
              Remove
            </button>
          </div>
        </li>
      </ul>
  
      <!-- Add Task Modal -->
      <div v-if="showAddTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded shadow w-96">
          <h2 class="text-xl font-bold mb-4">Create New Task</h2>
          
          <label class="block mb-2">
            Select Garden:
            <select v-model="newTask.gardenId" class="w-full border rounded px-2 py-1">
              <option value="" disabled>Select a garden</option>
              <option v-for="garden in gardens" :key="garden._id" :value="garden._id">
                {{ garden.name }}
              </option>
            </select>
          </label>
  
          <label class="block mb-2">
            Task Name:
            <input v-model="newTask.name" type="text" class="w-full border rounded px-2 py-1" placeholder="Enter task name" />
          </label>
  
          <label class="block mb-2">
            Description:
            <textarea v-model="newTask.description" class="w-full border rounded px-2 py-1" rows="3"></textarea>
          </label>
  
          <label class="block mb-2">
            Deadline:
            <input v-model="newTask.deadLine" type="datetime-local" class="w-full border rounded px-2 py-1" />
          </label>
  
          <label class="block mb-4 flex items-center">
            <input v-model="newTask.completed" type="checkbox" class="mr-2" />
            Completed
          </label>
  
          <div class="flex justify-end space-x-2">
            <button @click="createTask" :disabled="!canSubmitTask(newTask)"
              :class="{'bg-gray-500': !canSubmitTask(newTask), 'bg-green-500': canSubmitTask(newTask)}"
              class="text-white px-4 py-2 rounded hover:bg-green-600">
              Create
            </button>
            <button @click="showAddTaskModal = false" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      </div>
  
      <!-- Update Task Modal -->
      <div v-if="showUpdateTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded shadow w-96">
          <h2 class="text-xl font-bold mb-4">Update Task</h2>
  
          <p class="mb-2 text-sm">Garden: {{ gardens.find(g => g._id === updatedTask.gardenId)?.name }}</p>
  
          <label class="block mb-2">
            Task Name:
            <input v-model="updatedTask.name" type="text" class="w-full border rounded px-2 py-1" />
          </label>
  
          <label class="block mb-2">
            Description:
            <textarea v-model="updatedTask.description" class="w-full border rounded px-2 py-1" rows="3"></textarea>
          </label>
  
          <label class="block mb-2">
            Deadline:
            <input v-model="updatedTask.deadLine" type="datetime-local" class="w-full border rounded px-2 py-1" />
          </label>
  
          <label class="block mb-4 flex items-center">
            <input v-model="updatedTask.completed" type="checkbox" class="mr-2" />
            Completed
          </label>
  
          <div class="flex justify-end space-x-2">
            <button @click="updateTask" :disabled="!canSubmitTask(updatedTask)"
              :class="{'bg-gray-500': !canSubmitTask(updatedTask), 'bg-green-500': canSubmitTask(updatedTask)}"
              class="text-white px-4 py-2 rounded hover:bg-green-600">
              Update
            </button>
            <button @click="showUpdateTaskModal = false" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      </div>
  
      <!-- Confirmation Modal -->
      <div v-if="showConfirmationModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded shadow w-96">
          <h2 class="text-xl font-bold mb-4">Task Created Successfully!</h2>
          <p><strong>Name:</strong> {{ newTask.name }}</p>
          <p><strong>Garden:</strong> {{ gardens.find(g => g._id === newTask.gardenId)?.name }}</p>
          <p><strong>Due Date:</strong> {{ formatDate(newTask.deadLine) }}</p>
          <button @click="hideConfirmationModal"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4">
            OK
          </button>
        </div>
      </div>
    </div>
  </template>