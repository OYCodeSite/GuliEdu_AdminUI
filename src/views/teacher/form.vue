<template>
  <div class="app-container">
    <el-form label-width="120px">
      <el-form-item label="讲师名称">
        <el-input v-model="teacher.name"/>
      </el-form-item>
      <el-form-item label="讲师排序">
        <el-input-number v-model="teacher.sort" controls-position="right" :min="0"/>
      </el-form-item>
      <el-form-item label="讲师头衔">
        <el-select v-model="teacher.level" clearable placeholder="请选择">
          <!--
            数据类型一定要和取出的json中的一致，否则没法回填
            因此，这里value使用动态绑定的值，保证其数据类型是number
          -->
          <el-option :value="1" label="高级讲师"/>
          <el-option :value="2" label="首席讲师"/>
        </el-select>
      </el-form-item>
      <el-form-item label="讲师资历">
        <el-input v-model="teacher.career"/>
      </el-form-item>
      <el-form-item label="讲师简介">
        <el-input v-model="teacher.intro" :rows="10" type="textarea"/>
      </el-form-item>

      <!-- 讲师头像：TODO -->
      <el-form-item label="讲师头像">

          <!-- 头衔缩略图 -->
          <pan-thumb :image="teacher.avatar"/>
          <!-- 文件上传按钮 -->
          <el-button type="primary" icon="el-icon-upload" @click="imagecropperShow=true">更换头像
          </el-button>

          <!--
      v-show：是否显示上传组件
      :key：类似于id，如果一个页面多个图片上传控件，可以做区分
      :url：后台上传的url地址
      @close：关闭上传组件
      @crop-upload-success：上传成功后的回调 -->
          <image-cropper
                        v-show="imagecropperShow"
                        :width="300"
                        :height="300"
                        :key="imagecropperKey"
                        :url="BASE_API+'/oss/file/upload'"
                        field="file"
                        @close="close"
                        @crop-upload-success="cropSuccess"/>

      </el-form-item>

      <el-form-item>
        <el-button :disabled="saveBtnDisabled" type="primary" @click="saveOrUpdate">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import teacher from '@/api/edu/teacher'
import ImageCropper from '@/components/ImageCropper'
import PanThumb from '@/components/PanThumb'

const defaultFrom = {
    name: '',
    sort: 0,
    level: 1,
    career: '',
    intro: '',
    avatar: 'https://oss.imoyt.top/ossTest/2021/03/06/a7cf5b39-8246-4f66-8a2e-415a11471273.gif'
}

export default {

  //声明一下这个插件
  components: {ImageCropper, PanThumb},

  data() {
    return {
      teacher: defaultFrom,
      saveBtnDisabled: false,// 保存按钮是否禁用
      BASE_API: process.env.BASE_API, // 接口API地址
      imagecropperShow: false, // 是否显示上传组件
      imagecropperKey: 0 // 上传组件id
    }
  },
  watch: {
    $route(to, from){
      console.log("watch $route");
      this.init();
    }
  },
  created() {
      console.log('created');
      this.init();
  },
  methods: {
    init(){
       if (this.$route.params && this.$route.params.id) {
        const id = this.$route.params.id
        this.selectById(id)
       }else{
         // 使用对象拓展运算符，拷贝对象，而不是引用
         // 否则新增一条记录后，defaultForm 就变成了之前的新增的 teacher 的值
         this.teacher = {...defaultFrom}
       }
    },
    saveOrUpdate(){
      this.saveBtsaveBtnDisabled = true;

      if(!this.teacher.id){
        this.saveData();
      }else{
        this.updateData();
      }
      
    },

    // 保存
    saveData(){
      teacher.save(this.teacher)
        .then( response => {
          return this.$message({
            type: 'success',
            message: '保存成功!'
          })
        }).then(response => {
          this.$router.push({path: '/teacher/list'})
        }).catch((response) => {
          // console.log(response)
          this.$message({
            type: 'error',
            message: '保存失败'
          })
        })
    },
    selectById(id){
        teacher.selectById(id)
          .then(response => {
             this.teacher = response.data.teacher
          }).catch(response => {
            this.$message({
              type:'error',
              message:"获取失败"
            })
        })
    },
    updateData(){
      this.saveBtsaveBtnDisabled = true;
      teacher.updateById(this.teacher)
        .then(resizeBy => {
          return this.$message({
            type: 'success',
            message: '修改成功!'
          });
        }).then(response => {
          this.$router.push({path: '/teacher/list'})
        }).catch((response) => {
          // console.log(respones)
          this.$message({
            type: 'error',
            message: '保存失败'
          })
        })
    },
    // 文件上传关闭
    close(){
      // 1.关闭这个上传图片框
      this.imagecropperShow = false; // 是否显示上传组件
      // 2.给框ID变化一次
      this.imagecropperKey = this.imagecropperKey + 1;
    },
    // 保存图片成功
    cropSuccess(data){
      this.teacher.avatar = data.url;
       // 1.关闭这个上传图片框
      this.imagecropperShow = false; // 是否显示上传组件
      // 2.给框ID变化一次
      this.imagecropperKey = this.imagecropperKey + 1;
    }
  },
}
</script>