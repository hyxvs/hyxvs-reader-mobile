import request from '@/utils/request'

export function getReservationList(params) {
  return request({
    url: '/reader/reservation/list',
    method: 'get',
    params
  })
}

export function cancelReservation(id) {
  return request({
    url: `/reader/reservation/cancel/${id}`,
    method: 'post'
  })
}
