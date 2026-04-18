import { defineStore } from 'pinia'
import api from '../utils/api'

interface AdminInfo {
  id: number
  username: string
  role: string
  avatar: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    adminInfo: null as AdminInfo | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    async login(username: string, password: string) {
      const res = await api.post('/auth/login', { username, password })
      this.token = res.data.token
      this.adminInfo = res.data.adminInfo
      localStorage.setItem('admin_token', this.token)
      return res
    },

    async getInfo() {
      const res = await api.get('/auth/info')
      this.adminInfo = res.data
      return res
    },

    logout() {
      this.token = ''
      this.adminInfo = null
      localStorage.removeItem('admin_token')
    },
  },
})
