<script setup lang="ts">
defineProps<{ entries: readonly string[] }>();
</script>

<template>
  <details class="event-log">
    <summary>Under the hood</summary>
    <p>
      Events fired by the components, newest first. Payloads are not shown — they can hold patient
      details.
    </p>
    <ol reversed>
      <li v-for="(name, index) in entries" :key="index">
        <code>{{ name }}</code>
      </li>
    </ol>
  </details>
</template>
