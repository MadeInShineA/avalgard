<script setup>
import { subscribe, autorun } from 'vue-meteor-tracker'
import { TasksCollection } from '../api/tasks/tasksCollection'

subscribe('tasks')
const tasks = autorun(() => TasksCollection.find({}).fetch()).result

</script>

<template>
    {{ tasks }}
    <h2 class="text-xl my-6 font-semibold">Tasks</h2>
    <ul class="list-disc underline">
        <li v-for="task in tasks" :key="task._id" class="hover:text-green-700">
            aa
            <div>Name: {{ task.name }}</div>
            <div>Description: {{ task.description }}</div>
        </li>
    </ul>
  
</template>
