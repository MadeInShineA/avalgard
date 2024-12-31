<template>
    <div class="gardens-container">
      <button @click="addGarden" class="add-garden-button">Add Garden</button>
      <ul class="gardens-list">
        <li v-for="garden in gardens" :key="garden._id" class="garden-item">
          <div class="garden-details">
            <h3>{{ garden.name }}</h3>
            <p>Owner: {{ garden.username }}</p>
            <p>Climate ID: {{ garden.climateId }}</p>
            <p>Tasks: {{ garden.tasks.length }}</p>
            <p>Plants: {{ garden.plants.length }}</p>
          </div>
          <div class="garden-actions">
            <button @click="removeGarden(garden._id)" class="remove-button">Remove</button>
            <button @click="updateGarden(garden._id, { ...garden, name: 'Updated Garden' })" class="update-button">Update</button>
            <button @click="viewGarden(garden._id)" class="view-button">View</button>
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { Meteor } from 'meteor/meteor';
  import { Random } from 'meteor/random';
  
  const gardens = ref([]);
  const userId = ref(null);
  
  const fetchGardens = () => {
    Meteor.call('gardens.findAll', (error, result) => {
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
  });
  
  const addGarden = () => {
    const newGarden = {
      _id: Random.id(),
      name: 'New Garden',
      climateId: 'someClimateId',
      tasks: [],
      plants: [],
    };
  
    Meteor.call('gardens.insert', userId.value, newGarden, (error, result) => {
      if (!error) {
        fetchGardens(); // Rafraîchir la liste des jardins après l'ajout
      } else {
        console.error('Error adding garden:', error);
      }
    });
  };
  
  const removeGarden = (gardenId) => {
    Meteor.call('gardens.remove', userId.value, gardenId, (error, result) => {
      if (!error) {
        fetchGardens(); // Rafraîchir la liste des jardins après la suppression
      } else {
        console.error('Error removing garden:', error);
      }
    });
  };
  
  const updateGarden = (gardenId, updatedGarden) => {
    Meteor.call('gardens.update', userId.value, gardenId, updatedGarden, (error, result) => {
      if (!error) {
        fetchGardens(); // Rafraîchir la liste des jardins après la mise à jour
      } else {
        console.error('Error updating garden:', error);
      }
    });
  };
  
  const viewGarden = (gardenId) => {
    if (!userId.value) {
      userId.value = Meteor.userId();
    }
  
    if (!userId.value || !gardenId) {
      console.error('User ID or Garden ID is missing');
      return;
    }
  
    Meteor.call('gardens.find', userId.value, gardenId, (error, result) => {
      if (!error) {
        console.log('Garden details:', result);
        // Vous pouvez afficher les détails du jardin ici
      } else {
        console.error('Error fetching garden:', error);
      }
    });
  };
  </script>
  
  <style scoped>
  .gardens-container {
    padding: 20px;
  }
  
  .add-garden-button {
    margin-bottom: 20px;
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .gardens-list {
    list-style-type: none;
    padding: 0;
  }
  
  .garden-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid #ddd;
    margin-bottom: 10px;
  }
  
  .garden-details {
    flex: 1;
  }
  
  .garden-actions {
    display: flex;
    gap: 10px;
  }
  
  .remove-button, .update-button, .view-button {
    padding: 5px 10px;
    border: none;
    cursor: pointer;
  }
  
  .remove-button {
    background-color: #f44336;
    color: white;
  }
  
  .update-button {
    background-color: #2196F3;
    color: white;
  }
  
  .view-button {
    background-color: #FFC107;
    color: white;
  }
  </style>