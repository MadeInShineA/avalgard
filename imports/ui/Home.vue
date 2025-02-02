<!-- src/views/HomePage.vue -->
<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">

    <!-- Using the AppMenu component -->
    <AppMenu />

    <!-- Main Section (Hero) -->
    <header class="bg-green-600 dark:bg-green-800 py-16">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h2 class="text-white text-4xl sm:text-5xl font-extrabold mb-4">
          Manage Your Garden Effectively
        </h2>
        <p class="text-green-100 dark:text-green-200 text-lg sm:text-xl max-w-2xl mx-auto">
          Avalgard offers intuitive tools to plan, track, and fully enjoy your garden.
        </p>
        <div class="mt-8">
          <a
            href="#features"
            class="inline-block bg-white text-green-600 dark:bg-gray-100 dark:text-green-600 px-6 py-3 rounded-md shadow hover:bg-green-100 dark:hover:bg-green-200 font-semibold transition duration-300"
          >
            Discover Features
          </a>
        </div>
      </div>
    </header>

    <!-- Features Section -->
    <main class="flex-grow">
      <section id="features" class="py-12">
        <div class="max-w-7xl mx-auto px-4">
          <h3 class="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">
            Main Features
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Plant Database -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">Plant Database</h4>
              <p class="text-gray-700 dark:text-gray-300">
                Access a comprehensive list of plants by type, season, and growing conditions. Check planting and harvesting periods for each species.
              </p>
            </div>
            <!-- Drawing Tool -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">Drawing Tool</h4>
              <p class="text-gray-700 dark:text-gray-300">
                Visualize your garden with an interactive plan. Draw the boundaries and place your plants via drag and drop for optimal layout.
              </p>
            </div>
            <!-- Personalized Recommendations -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">Personalized Recommendations</h4>
              <p class="text-gray-700 dark:text-gray-300">
                Receive suggestions tailored to your local climate and the current season. Benefit from notifications for ideal planting periods.
              </p>
            </div>
            <!-- Planting and Harvest Tracking -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">Planting and Harvest Tracking</h4>
              <p class="text-gray-700 dark:text-gray-300">
                Use detailed timelines to monitor the progress of your plantings and receive automatic harvest reminders.
              </p>
            </div>
            <!-- Gardening Task List -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">Gardening Task List</h4>
              <p class="text-gray-700 dark:text-gray-300">
                Organize your gardening activities (watering, fertilizing, weeding) with a clear task list, accompanied by reminders and the ability to mark your progress.
              </p>
            </div>
            <!-- Bonus Feature: Weather Integration -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h4 class="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">Coming Soon: Weather Integration</h4>
              <p class="text-gray-700 dark:text-gray-300">
                Check real-time weather information and receive alerts in case of extreme conditions (frost, heavy rains, heatwaves).
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Call to Action (CTA) Section -->
    <section class="bg-green-600 dark:bg-green-800 py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="text-white text-2xl sm:text-3xl font-bold mb-4">
          Ready to Make Your Garden Bloom?
        </h3>
        <p class="text-green-100 dark:text-green-200 text-lg mb-6">
          Join Avalgard and enjoy a next-generation gardening experience.
        </p>
        <router-link
          :to="{ name: 'signup' }"
          class="inline-block bg-white text-green-600 dark:bg-gray-100 dark:text-green-600 px-6 py-3 rounded-md shadow hover:bg-green-100 dark:hover:bg-green-200 font-semibold transition duration-300"
        >
          Create an Account
        </router-link>
      </div>
    </section>
  </div>
</template>
