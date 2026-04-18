import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '../components/Layout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import UserList from '../views/UserList.vue'
import NoteList from '../views/NoteList.vue'
import AlbumList from '../views/AlbumList.vue'
import CommentList from '../views/CommentList.vue'
import RoleList from '../views/RoleList.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'users', name: 'Users', component: UserList },
      { path: 'notes', name: 'Notes', component: NoteList },
      { path: 'albums', name: 'Albums', component: AlbumList },
      { path: 'comments', name: 'Comments', component: CommentList },
      { path: 'roles', name: 'Roles', component: RoleList },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
