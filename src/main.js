import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import Toast from 'vue-toastification';
import router from './router';

import 'vue-toastification/dist/index.css';

import vue3GoogleLogin from 'vue3-google-login';

import './assets/css/global.css';
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App);

app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
});

const pinia = createPinia()

app.use(pinia)

app.use(router);

app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
})

app.mount('#app');