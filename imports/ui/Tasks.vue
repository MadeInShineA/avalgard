<script setup>
import { ref, computed, watch } from 'vue'
import { subscribe, autorun } from 'vue-meteor-tracker'
import { Meteor } from "meteor/meteor";

// Subscribe to tasks publication
subscribe('tasks')

// Reactive references for user and tasks
const user = ref(null)
const tasks = ref([])

// TODO Get the garden id

Meteor.callAsync("addTask", Meteor.userId(),  'garden_id', String(Math.random()), "teest", new Date()).then((result) => {
    console.log(result)
})

// Track user reactivity
autorun(() => {
  user.value = Meteor.user()
})

if(user.value && user.value.profile.gardens){
    tasks.value = user.value.profile.gardens[0].tasks
}

// Watch for changes in user and update tasks
watch(() => user.value, (newUser) => {
    if (newUser && newUser.profile && newUser.profile.gardens) {
        tasks.value = newUser.profile.gardens[0]?.tasks || []
    }
  }
)

function deleteTask(userId, gardenId, taskId){
    console.log(userId, gardenId, taskId)
    Meteor.callAsync("removeTask", userId, gardenId, taskId).then((response) => {
        console.log(response)
    })
}

</script>

<template>
    
<!-- Add error display --> 
    <div v-if="user && user.profile.gardens">
        <template v-if="tasks.length > 0">
            <h2 class="text-xl my-6 font-semibold">Tasks</h2>
            <ul class="list-disc">
            <li v-for="task in tasks" :key="task._id">
                <div>Name: {{ task.name }}</div>
                <div>Description: {{ task.description }}</div>
                <button @click="deleteTask(user._id, user.profile.gardens[0]._id, task._id)">Delete</button>
            </li>
            </ul>
        </template>
        <template v-else>
            <h2 class="text-xl my-6 font-semibold">You don't have any task</h2>
        </template>
    </div>
    <div v-else-if="user">
        <p>You don't have any garden</p>
    </div>
    <div v-else>
        <p>Loading user data...</p>
    </div>
</template>
