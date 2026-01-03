import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';

// MapLibre styles for 3D map
import 'maplibre-gl/dist/maplibre-gl.css';

createApp(App)
  .use(router)
  .mount('#app');
