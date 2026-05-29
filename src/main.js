import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import router from './router';

import vue3GoogleLogin from 'vue3-google-login';

import './assets/css/global.css';
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App);

const pinia = createPinia()

app.use(pinia)

app.use(router);

app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
})

app.mount('#app');