<script setup lang="ts">
import type { SiteMode } from './config.ts';
import eye from './art/eye.svg';

defineProps<{ mode: SiteMode }>();
</script>

<template>
  <aside aria-label="Demo notice">
    <p class="demo-ribbon">
      {{ mode.mode === 'live' ? 'Live sandbox' : 'Demo mode — sample data, no real appointments' }}
      <template v-if="mode.warning"> · {{ mode.warning }}</template>
    </p>
  </aside>
  <header class="site-header">
    <RouterLink to="/" class="brand">
      <img :src="eye" alt="" width="48" height="48" />
      <span>Eye Caramba</span>
    </RouterLink>
    <nav aria-label="Main">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/frames">Frames</RouterLink>
      <RouterLink to="/book" class="cta">Book an Exam</RouterLink>
    </nav>
  </header>
  <main id="main">
    <RouterView />
  </main>
  <footer class="site-footer">
    <p>Eye Caramba Optometry · Now with 20% more 20/20</p>
    <p>
      Booking powered by
      <a href="https://www.zocdoc.com/?referrerType=demo-site&amp;component=eye-caramba">Zocdoc</a>
    </p>
  </footer>
</template>
