import request from '@/utils/request'

export function getBooksList(params) {
  return request({
    url: '/reader/books/search',
    method: 'get',
    params
  })
}

export function getBookDetail(id) {
  return request({
    url: `/reader/books/detail/${id}`,
    method: 'get'
  })
}

export function reserveBook(data) {
  return request({
    url: '/reader/reservation/create',
    method: 'post',
    data
  })
}

export function uploadBookCover(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/reader/books/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
