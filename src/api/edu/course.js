import request from '@/utils/request'

const api_name = '/course'

export default{
    
    saveVo(courseInfo){
        return request({
            url:`${api_name}/saveVo`,
            method:"post",
            data: courseInfo
        })
    },
    getCourseInfoById(id){
        return request({
            url: `${api_name}/${id}`,
            method: "get"
        })
    },
    updateVo(courseInfo){
        return request({
            url: `${api_name}/updateVo`,
            method: "put",
            data: courseInfo
        })
    },
    getPageList(page,limit,searchObj){
        return request({
            url: `${api_name}/${page}/${limit}`,
            method: "post",
            data: searchObj
        })
    },
    removeById(id){
        return request({
            url: `${api_name}/${id}`,
            method: "delete"
        })
    },
    getCoursePublishVoById(id){
        return request({
            url: `${api_name}/vo/${id}`,
            get: 'get'
        })
    },
    updateStatusById(id){
        return request({
            url:`${api_name}/updateStatusById/${id}`,
            method:"get"
        })
   }
}