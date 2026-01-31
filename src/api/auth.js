import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/reader/login',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/reader/register',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/reader/logout',
    method: 'post'
  })
}

export function getUserInfo() {
  return request({
    url: '/reader/user/info',
    method: 'get'
  })
}

export function updateUserProfile(data) {
  return request({
    url: '/reader/user/profile',
    method: 'put',
    data
  })
}

export function getUserStatistics() {
  return request({
    url: '/reader/user/statistics',
    method: 'get'
  })
}

export function changePassword(data) {
  return request({
    url: '/reader/user/change-password',
    method: 'post',
    data
  })
}

export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/reader/user/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
