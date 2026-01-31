import axios from 'axios'
import { showToast } from 'vant'

const service = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
})

service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
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
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  error => {
    showToast({
      message: error.message || '网络错误',
      position: 'top'
    })
    return Promise.reject(error)
  }
)

export default service
