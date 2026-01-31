import request from '@/utils/request'

export function getBorrowList(params) {
  return request({
    url: '/reader/borrow/list',
    method: 'get',
    params
  })
}

export function renewBook(id) {
  return request({
    url: `/reader/borrow/renew/${id}`,
    method: 'post'
  })
}

export function borrowBook(data) {
  return request({
    url: '/reader/borrow/create',
    method: 'post',
    data
  })
}

export function getBorrowDetail(id) {
  return request({
    url: `/reader/borrow/detail/${id}`,
    method: 'get'
  })
}
