import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProdutoView from '@/views/ProdutoView.vue'

import SignUpView from '@/views/signUpView.vue'
import LogInView from '@/views/logInView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/livro/:id',
      name: 'livro',
      component: ProdutoView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
    ,
    {
      path: '/login',
      name: 'login',
      component: LogInView,
    },
  ],
})

export default router
