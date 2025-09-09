import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import Board from '../views/Board.vue'
import AnalyticsView from '../views/Analytics.vue'
import TaskView from '../views/Task.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/boards', name: 'boards', component: Board },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsView,
      props: (route) => ({ boardId: route.query.boardId }),
    },
    { path: '/board/:boardId/task/:id', name: 'task', component: TaskView, props: true },
  ],
})

export default router
