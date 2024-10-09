<script lang="ts" setup>
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()

const toggleDark = useToggle(isDark)

function toggleTheme() {
  toggleDark()
}
</script>

<template>
  <span :aria-label="isDark ? 'Dark Theme' : 'Light Theme'" nav-link dark:i-ri-moon-line i-ri-sun-line @click="toggleTheme" />
</template>
