import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.warn('localStorage访问失败:', e)
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.warn('localStorage写入失败:', e)
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.warn('localStorage删除失败:', e)
    }
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(safeLocalStorage.getItem('token') || '')
  const user = ref(JSON.parse(safeLocalStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    safeLocalStorage.setItem('token', newToken)
  }

  function setUser(newUser) {
    user.value = newUser
    safeLocalStorage.setItem('user', JSON.stringify(newUser))
  }

  function logout() {
    token.value = ''
    user.value = null
    safeLocalStorage.removeItem('token')
    safeLocalStorage.removeItem('user')
  }

  return {
    token,
    user,
    isLoggedIn,
    setToken,
    setUser,
    logout
  }
})
