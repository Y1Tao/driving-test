import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('../views/Practice.vue')
  },
  {
    path: '/mock-exam',
    name: 'MockExam',
    component: () => import('../views/MockExam.vue')
  },
  {
    path: '/wrong-questions',
    name: 'WrongQuestions',
    component: () => import('../views/WrongQuestions.vue')
  }
]

const router = createRouter({
  // 使用 createWebHashHistory 以兼容无需配置服务器的静态部署（如 Gitee Pages）
  // 相比 createWebHistory，hash 模式在 URL 中会带有 # 号，但部署最简单，不需要配置 rewrite
  history: createWebHashHistory(),
  routes
})

export default router
