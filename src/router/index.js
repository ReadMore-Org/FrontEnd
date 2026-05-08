import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ProdutoView from "@/views/ProdutoView.vue";
import OnBoardingView from "@/views/OnBoardingView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "onboarding",
      component: OnBoardingView,
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
    },
    {
      path: "/livro/:id",
      name: "livro",
      component: ProdutoView,
    },
  ],
});

export default router;
