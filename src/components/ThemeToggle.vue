<script setup lang="ts">
import { onMounted, ref } from 'vue';

const dark = ref(false);

onMounted(() => {
  dark.value = document.documentElement.classList.contains('dark');
});

function toggle() {
  dark.value = !dark.value;
  document.documentElement.classList.toggle('dark', dark.value);
  localStorage.setItem('theme', dark.value ? 'dark' : 'light');
}
</script>

<template>
  <button
    type="button"
    aria-label="Toggle color theme"
    class="grid size-9 place-items-center rounded-full border border-ink-900/15 text-ink-500 transition-colors hover:border-seal-500 hover:text-seal-600 dark:border-parchment-100/20 dark:text-parchment-300 dark:hover:border-seal-400 dark:hover:text-seal-400"
    @click="toggle"
  >
    <svg
      v-if="dark"
      viewBox="0 0 24 24"
      class="size-4"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    >
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>
    </svg>
    <svg
      v-else
      viewBox="0 0 24 24"
      class="size-4"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"></path>
    </svg>
  </button>
</template>
