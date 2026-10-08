import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Frames from './pages/Frames.vue';
import Book from './pages/Book.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/frames', component: Frames },
    { path: '/book', component: Book },
  ],
});
