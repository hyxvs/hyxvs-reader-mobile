import axios from 'axios'
import { showToast } from 'vant'

const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.warn('localStorage访问失败:', e)
      return null
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

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000
})

service.interceptors.request.use(
  config => {
    const token = safeLocalStorage.getItem('token')
    if (token && token !== 'null') {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      showToast({
        message: res.msg || '请求失败',
        position: 'top'
      })
      if (res.code === 401) {
        safeLocalStorage.removeItem('token')
        safeLocalStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  error => {
    let errorMessage = '网络错误'
    
    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 400:
          errorMessage = '请求参数错误'
          break
        case 401:
          errorMessage = '登录已过期，请重新登录'
          safeLocalStorage.removeItem('token')
          safeLocalStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 403:
          errorMessage = '没有权限访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器错误'
          break
        case 502:
        case 503:
        case 504:
          errorMessage = '服务器暂时不可用'
          break
        default:
          errorMessage = error.response.data?.msg || '网络错误'
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请检查网络连接'
      } else {
        errorMessage = '网络连接失败，请检查网络设置'
      }
    } else {
      // 其他错误
      errorMessage = error.message || '网络错误'
    }
    
    showToast({
      message: errorMessage,
      position: 'top'
    })
    return Promise.reject(error)
  }
)

export default service
