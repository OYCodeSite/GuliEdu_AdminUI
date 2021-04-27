import request from '@/utils/request'

export default{
  fetchList(){
    return request({
      url: '/eduorder/order/list',
      method: 'get',
    })
  }
}
