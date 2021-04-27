import request from '@/utils/request'

const api_name = '/video'

export default {

    saveVideo(video){
        return request({
            url:`${api_name}/save`,
            method:'post',
            data:video
        })  
    },
    getVideoById(id){
        return request({
            url:`${api_name}/${id}`,
            method:'get'
        }) 
    },
    updateById(video){
        return request({
            url:`${api_name}/update`,
            method:'put',
            data:video
        }) 
    },
    removeVideoById(videoId){
        return request({
            url:`${api_name}/${videoId}`,
            method:'delete'
        }) 
    }
}