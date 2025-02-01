<template>
  <div class="min-h-screen flex flex-col">
    <AppMenu />

    <main class="flex-grow dark:bg-gray-900">
      <router-view />
    </main>

    <!-- Bouton de retour en haut -->
    <button v-show="showScrollButton" @click="scrollToTop"
      class="fixed bottom-6 right-6 bg-green-600 text-white p-3 rounded-full shadow-md hover:bg-green-700 transition-opacity opacity-80 hover:opacity-100 transform hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#A7F4D0" class="size-6">
        <path fill-rule="evenodd"
          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
          clip-rule="evenodd" />
      </svg>
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
  const userId = Meteor.userId();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Empêche le déplacement du contenu quand la scrollbar apparaît */
html,
body {
  width: 100%;
  overflow-x: hidden;
  /* Empêche tout scrolling horizontal */
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
html,
body,
#app {
  min-height: 100vh;
}

/* Le contenu principal prend tout l'espace disponible */
.flex-grow {
  flex: 1;
}
</style>
