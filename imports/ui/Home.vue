<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">

    <!-- Barre de navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-2xl font-bold text-green-600">Avalgard</h1>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <a href="#" class="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              Accueil
            </a>
            <a href="#" class="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              Fonctionnalités
            </a>
            <a href="#" class="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              À propos
            </a>
            <a href="#" class="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Section principale (Hero) -->
    <header class="bg-green-600 py-16">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h2 class="text-white text-4xl sm:text-5xl font-extrabold mb-4">
          Gérez votre jardin efficacement
        </h2>
        <p class="text-green-100 text-lg sm:text-xl max-w-2xl mx-auto">
          Avalgard vous propose des outils intuitifs pour planifier, suivre et profiter pleinement de votre jardin.
        </p>
        <div class="mt-8">
          <a
            href="#features"
            class="inline-block bg-white text-green-600 px-6 py-3 rounded-md shadow hover:bg-green-100 font-semibold transition duration-300"
          >
            Découvrir les fonctionnalités
          </a>
        </div>
      </div>
    </header>

    <!-- Section des fonctionnalités -->
    <main class="flex-grow">
      <section id="features" class="py-12">
        <div class="max-w-7xl mx-auto px-4">
          <h3 class="text-3xl font-bold text-gray-800 text-center mb-8">
            Fonctionnalités principales
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Base de données de plantes -->
            <div class="bg-white rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600">Base de données de plantes</h4>
              <p class="text-gray-700">
                Accédez à une liste complète de plantes par type, saison et conditions de croissance. Consultez les périodes de plantation et de récolte pour chaque espèce.
              </p>
            </div>
            <!-- Outil de dessin -->
            <div class="bg-white rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600">Outil de dessin</h4>
              <p class="text-gray-700">
                Visualisez votre jardin grâce à un plan interactif. Dessinez les contours et placez vos plantes par glisser-déposer pour un aménagement optimal.
              </p>
            </div>
            <!-- Recommandations personnalisées -->
            <div class="bg-white rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600">Recommandations personnalisées</h4>
              <p class="text-gray-700">
                Recevez des suggestions adaptées à votre climat local et à la saison en cours. Bénéficiez de notifications pour les périodes idéales de plantation.
              </p>
            </div>
            <!-- Suivi de plantation et de récolte -->
            <div class="bg-white rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600">Suivi de plantation et de récolte</h4>
              <p class="text-gray-700">
                Utilisez des chronologies détaillées pour surveiller l’évolution de vos plantations et recevez des rappels automatiques pour la récolte.
              </p>
            </div>
            <!-- Liste de tâches -->
            <div class="bg-white rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600">Liste de tâches pour le jardinage</h4>
              <p class="text-gray-700">
                Organisez vos activités de jardinage (arrosage, fertilisation, désherbage) avec une liste de tâches claire, accompagnée de rappels et de la possibilité de valider vos progrès.
              </p>
            </div>
            <!-- Option bonus : Intégration météo -->
            <div class="bg-white rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600">Option bonus : Intégration météo</h4>
              <p class="text-gray-700">
                Consultez des informations météorologiques en temps réel et recevez des alertes en cas de conditions extrêmes (gelées, pluies abondantes, canicules).
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Section d’appel à l’action (CTA) -->
    <section class="bg-green-600 py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="text-white text-2xl sm:text-3xl font-bold mb-4">
          Prêt à faire fleurir votre jardin ?
        </h3>
        <p class="text-green-100 text-lg mb-6">
          Rejoignez A Avalgard et profitez d’une expérience de jardinage nouvelle génération.
        </p>
        <a
          href="#"
          class="inline-block bg-white text-green-600 px-6 py-3 rounded-md shadow hover:bg-green-100 font-semibold transition duration-300"
        >
          Créer un compte
        </a>
      </div>
    </section>

    <!-- Pied de page -->
    <footer class="bg-gray-800 py-6">
      <div class="max-w-7xl mx-auto px-4 text-center text-gray-400">
        <p>&copy; 2025 A Avalgard. Tous droits réservés.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
/*
  Pas de logique spécifique pour cette page statique.
  Vous pouvez ajouter vos données ou des composables Vue ici
  si vous voulez gérer des états ou des interactions plus complexes.
*/
</script>

<!--
  Avec Tailwind, vous n'avez pas nécessairement besoin d'ajouter de style 
  personnalisé ici. Tout est géré par les classes utilitaires.
-->
<style scoped>
</style>
