import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ProdutoView from "@/views/ProdutoView.vue";
import OnBoardingView from "@/views/OnBoardingView.vue";

import SignUpView from "@/views/signUpView.vue";
import LogInView from "@/views/logInView.vue";

import ProfileView from "@/views/ProfileView.vue";
import EditProfileView from "@/views/EditProfileView.vue";

import AddBookView from "@/views/AddBookView.vue";
import ScanCodeView from "@/views/ScanCodeView.vue";
import ManualBookView from "@/views/ManualBookView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: LogInView,
    },
    {
      path: "/onboarding",
      name: "onboarding",
      component: OnBoardingView,
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
    },
    {
      path: "/profile/edit",
      name: "profile-edit",
      component: EditProfileView,
    },
    {
      path: "/livro/:id",
      name: "livro",
      component: ProdutoView,
    },
    {
      path: "/signup",
      name: "signup",
      component: SignUpView,
    },
    {
      path: '/login',
      name: 'login',
      component: LogInView,
    },
    ,
    {
      path: '/adicionar',
      name: 'adicionar',
      component: AddBookView,
    },
    {
      path: '/scan',
      name: 'scan',
      component: ScanCodeView,
    },
    {
      path: '/manual',
      name: 'manual',
      component: ManualBookView,
    },
  ],
});

export default router;
