<template>
    <div class="test-page">
        <h1>Page de Test</h1>
        <p>Ceci est une nouvelle page de test.</p>
        <div
            :style="{
            position: 'relative',
            backgroundColor: '#808080',
            background: 'linear-gradient(-90deg, rgba(0, 0, 0, .1) 1px, transparent 1px), linear-gradient(rgba(0, 0, 0, .1) 1px, transparent 1px)',
            backgroundSize: '20px 20px, 20px 20px',
            backgroundPosition: '10px 10px',
            height: '400px',
            width: '400px',
            border: '1px solid blue',
            boxSizing: 'content-box',
            }">
            <vue-draggable-resizable
            :parent="true"
            :grid="[20, 20]"
            :x="10"
            :y="10"
            :h="100"
            :w="100"
        >
            <p>I am the first plant of the garden lol</p>
        </vue-draggable-resizable>
        </div>
    </div>
</template>

<script setup>
import VueDraggableResizable from 'vue-draggable-resizable'
</script>

<style scoped>
.test-page {
    text-align: center;
    margin-top: 50px;
}

.test-page h1 {
    font-size: 2em;
    color: #333;
}

.test-page p {
    font-size: 1.2em;
    color: #666;
}
</style>