<template>
  <div class="min-h-screen flex flex-col">
    <AppMenu />

    <main class="flex-grow">
      <router-view />
    </main>

    <!-- Bouton de retour en haut -->
    <button 
      v-show="showScrollButton"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 bg-green-600 text-white p-3 rounded-full shadow-md hover:bg-green-700 transition-opacity opacity-80 hover:opacity-100 transform hover:scale-110"
    >
      ⬆️
    </button>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AppMenu from './AppMenu.vue';
import Footer from './Footer.vue';

// État pour afficher ou masquer le bouton
const showScrollButton = ref(false);

// Fonction pour remonter en haut de la page
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Fonction pour détecter le scroll et afficher le bouton si nécessaire
const handleScroll = () => {
  showScrollButton.value = window.scrollY > 300; // Afficher le bouton après 300px de scroll
};

// Ajouter et retirer l'écouteur d'événements au montage/démontage du composant
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Empêche le déplacement du contenu quand la scrollbar apparaît */
html, body {
  width: 100%;
  overflow-x: hidden; /* Empêche tout scrolling horizontal */
}

/* Utiliser `overflow: overlay` pour éviter le redimensionnement */
body {
  overflow-y: overlay;
}

/* Centre correctement le contenu */
#app {
  width: 100%;
  margin: 0 auto;
}

/* Assure que l'application prend toute la hauteur de l'écran */
html, body, #app {
  min-height: 100vh;
}

/* Le contenu principal prend tout l'espace disponible */
.flex-grow {
  flex: 1;
}
</style>

