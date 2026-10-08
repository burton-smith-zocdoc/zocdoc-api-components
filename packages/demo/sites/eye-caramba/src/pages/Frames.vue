<script setup lang="ts">
const FRAMES = [
  { name: 'The Monocle Pro Max', price: '$1,299', note: 'Half the lens. Twice the attitude.' },
  {
    name: 'Bifocals for Your Bifocals',
    price: '$420',
    note: 'For reading the fine print on your fine print.',
  },
  { name: 'The Night Driver 3000', price: '$88', note: 'Polarized against oncoming synthwave.' },
  { name: 'Aviator, But Make It Pharmacy', price: '$19.99', note: 'Comes clipped to a lanyard.' },
];
</script>

<template>
  <h1>Frames Gallery</h1>
  <p class="lede">Every frame is fictional. Our optometrists, however, are fixtures.</p>
  <ul class="frames">
    <li v-for="frame in FRAMES" :key="frame.name" class="frame">
      <h2>{{ frame.name }}</h2>
      <p class="price">{{ frame.price }}</p>
      <p>{{ frame.note }}</p>
    </li>
  </ul>
</template>
