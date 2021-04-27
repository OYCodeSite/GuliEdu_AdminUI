<template>

  <div class="app-container">

    <h2 style="text-align: center;">发布新课程</h2>

    <el-steps :active="1" process-status="wait" align-center style="margin-bottom: 40px;">
      <el-step title="填写课程基本信息"/>
      <el-step title="创建课程大纲"/>
      <el-step title="提交审核"/>
    </el-steps>

    <el-form label-width="120px">

        <el-form-item label="课程标题">
            <el-input v-model="courseInfo.eduCourse.title" placeholder=" 示例：机器学习项目课：从基础到搭建项目视频课程。专业名称注意大小写"/>
        </el-form-item>

        <!-- 所属分类 TODO -->
        <!-- 一级分类 -->
        <el-form-item label="课程类别">
            <el-select
                @change="subjectLevelOneChanged"
                v-model="courseInfo.eduCourse.subjectParentId"
                placeholder="请选择">
                <el-option
                v-for="subject in subjectNestedList"
                :key="subject.id"
                :label="subject.title"
                :value="subject.id"/>
            </el-select>
            <!-- 二级分类 -->
            <el-select v-model="courseInfo.eduCourse.subjectId" placeholder="请选择">
            <el-option
                v-for="subject in subSubjectList"
                :key="subject.value"
                :label="subject.title"
                :value="subject.id"/>
            </el-select>
        </el-form-item>

        <!-- 课程讲师 TODO -->
        <!-- 课程讲师 -->
        <el-form-item label="课程讲师">
        <el-select
            v-model="courseInfo.eduCourse.teacherId"
            placeholder="请选择">
            <el-option
            v-for="teacher in teacherList"
            :key="teacher.id"
            :label="teacher.name"
            :value="teacher.id"/>
        </el-select>
        </el-form-item>

        <el-form-item label="总课时">
            <el-input-number :min="0" v-model="courseInfo.eduCourse.lessonNum" controls-position="right" placeholder="请填写课程的总课时数"/>
        </el-form-item>

        <!-- 课程简介 TODO -->
        <!-- 课程简介-->
        <el-form-item label="课程简介">
            <tinymce :height="300" v-model="courseInfo.courseDescription.description"/>
        </el-form-item>

        <!-- 课程封面 TODO -->
        <!-- 课程封面-->
        <el-form-item label="课程封面">

          <el-upload
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :action="BASE_API+'/oss/file/upload?host=cover'"
            class="avatar-uploader">
            <img :src="courseInfo.eduCourse.cover">
          </el-upload>

        </el-form-item>


        <el-form-item label="课程价格">
            <el-input-number :min="0" v-model="courseInfo.eduCourse.price" controls-position="right" placeholder="免费课程请设置为0元"/> 元
        </el-form-item>

        <el-form-item>
            <el-button :disabled="saveBtnDisabled" type="primary" @click="next">保存并下一步</el-button>
        </el-form-item>
    </el-form>
  </div>
</template>
<script>
import course from '@/api/edu/course'
import subject from '@/api/edu/subject'
import teacher from '@/api/edu/teacher'
import Tinymce from '@/components/Tinymce'

const eduCourse = {
  title: '',
  subjectId: '', // 课程的二级分类
  teacherId: '',
  lessonNum: 0,
  cover: process.env.OSS_PATH+'/cover/1.jpg',
  price: 0,
  subjectParentId:'' // 课程的一级分类

}
const courseDescription = {
    description:''
}

export default {
  components: { Tinymce },
  data() {
    return {
      courseInfo: {eduCourse, courseDescription},
      saveBtnDisabled: false, // 保存按钮是否禁用
      subjectNestedList: [], // 一级分类列表
      subSubjectList: [], // 二级分类列表
      teacherList:[] ,// 讲师列表
      BASE_API: process.env.BASE_API
    }
  },

  created() {
    console.log('info created')
    // 初始化
    this.init();
  },

  methods: {
    init(){
      // 1. 判断是否有参数
      if(this.$route.params && this.$route.params.id){
          this.courseInfo.eduCourse.id = this.$route.params.id;
          // 根据id获取课程的基本信息
          this.getCourseInfoById(this.courseInfo.eduCourse.id);
      }else{
          this.courseInfo = {eduCourse, courseDescription};
          // 3.没有那就是新增

          // 4. 课程分类一级列表
            // 初始化列表
          this.initSubjectList();
          this.initTeacherList();
      }
    
    },
    getCourseInfoById(id){
      course.getCourseInfoById(id)
        .then(response => {
            this.courseInfo = response.data.courseInfo;
            
            subject.getNestedTreeList()
              .then(response => {
                this.subjectNestedList = response.data.subjectList
                for(var i =0; i < this.subjectNestedList.length; i++){
                    if(this.subjectNestedList[i].id == this.courseInfo.eduCourse.subjectParentId){
                        // 给 二级列表赋值
                        this.subSubjectList = this.subjectNestedList[i].children
                        console.log(this.subSubjectList);
                    }
                }
              })
              // 获取讲师列表
              this.initTeacherList();
        })
        .catch((response) => {
          this.$message({
            type: 'error',
            message: "加载失败，请刷新页面"
          })
        })
    },
    initTeacherList(){
      teacher.getList()
        .then(response => {
          this.teacherList = response.data.items;
        })
    },
    // 初始化课程分类列表
    initSubjectList(){
        subject.getNestedTreeList()
        .then(response => {
          this.subjectNestedList = response.data.subjectList
        })
    },
    subjectLevelOneChanged(value){
      console.log("value值为："+value);
      for(let i =0; i < this.subjectNestedList.length; i++){
          if(this.subjectNestedList[i].id === value){
              this.subSubjectList = this.subjectNestedList[i].children;
              this.courseInfo.eduCourse.subjectId = ''
          }
      }
    },
    next() {
      console.log('next')
      if(!this.courseInfo.eduCourse.id){
          this.saveVo();
      }else{
        this.updateVo();
      }
    },
    saveVo(){
       course.saveVo(this.courseInfo)
        .then(response => {
           this.$message({
             type: 'success',
             message: "保存成功"
           })
          this.$router.push({ path: '/course/chapter/'+response.data.id})
        })
        .catch(response => {
          this.$message({
            type: 'error',
            message: "保存失败"
          })
        })
    },
    updateVo(){
      course.updateVo(this.courseInfo)
      .then(respones => {
          this.$message({
            type: 'success',
            message: "修改成功"
          })
          this.$router.push({ path: '/course/chapter/'+ this.courseInfo.eduCourse.id })
      })
      .catch(response => {
        this.$message({
          type: 'error',
          message: "修改失败"
        })
      })
    },
    // 上传封面后成功回调的方法
    handleAvatarSuccess(res, file){
      // 上传响应
      console.log(res);
      console.log(URL.createObjectURL(file.raw)); // base64编码
      if(res.success === true){
        this.$message({
          type: 'success',
          message: '图片上传成功'
        })
        this.courseInfo.eduCourse.cover = res.data.url;
      }else{
        this.$message({
          type: 'error',
          message: '图片上传失败'
        })
        this.courseInfo.eduCourse.cover = process.env.OSS_PATH+'/cover/1.jpg';
      }
    },
    // 上传封面之前校验的方法
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!(isJPG || isPNG)) {
        this.$message.error('上传头像图片只能是 JPG或PNG 格式!')
      }

      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return (isJPG || isPNG) && isLt2M
    }
  }
}
</script>
<style scoped>
.tinymce-container {
  line-height: 29px;
}
</style>