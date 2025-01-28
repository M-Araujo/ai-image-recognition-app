<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <!-- Header -->
    <header class="bg-blue-600 text-white py-4">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold">My Tailwind Page</h1>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-blue-500 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold mb-4">Welcome to Tailwind CSS</h2>
        <p class="text-lg">This is a test page to verify that Tailwind is working correctly.</p>
      </div>
    </section>

    <!-- Content Grid -->
    <section class="py-10">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold mb-2">Card 1</h3>
            <p>This is a simple card to test styling.</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold mb-2">Card 2</h3>
            <p>This is another simple card to test responsiveness.</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold mb-2">Card 3</h3>
            <p>This card demonstrates the grid layout.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
/* Optional: Customize scrollbar for aesthetic purposes */
body::-webkit-scrollbar {
  width: 12px;
}

body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
}

body::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
