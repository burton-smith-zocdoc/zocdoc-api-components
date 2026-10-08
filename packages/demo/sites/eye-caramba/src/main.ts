import '@zocdoc/api-primitive-components/theme/all.css';
import './theme.css';
import './site.css';
import '@zocdoc/api-components';
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router.ts';
import { configureSite, searchSpecialty } from './config.ts';

const mode = configureSite();
createApp(App, { mode })
  .provide('searchSpecialty', searchSpecialty(mode))
  .use(router)
  .mount('#app');
