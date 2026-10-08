<script setup lang="ts">
import { inject } from 'vue';
import BookingFlow from '../components/BookingFlow.vue';

const specialtyId = inject<string>('searchSpecialty', 'sp_153');
</script>

<template>
  <h1>Book an Eye Exam</h1>
  <p class="lede">
    This page builds the booking from individual components and wires them together in Vue. Open
    “Under the hood” to watch the events go by.
  </p>
  <BookingFlow zip-code="11201" :specialty-id="specialtyId" />
</template>
