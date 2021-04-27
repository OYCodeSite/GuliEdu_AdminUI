<template>
  <div class="app-container">
    <el-input v-model="filterText" placeholder="Filter keyword" style="margin-bottom:30px;" />

    <el-button type="text" @click="dialogFormVisible = true">添加一级分类</el-button>

    <el-tree
      ref="subjectTree"
      :data="subjectList"
      :props="defaultProps"
      :filter-node-method="filterNode"
      :expand-on-click-node="false"
      class="filter-tree"
      default-expand-all
      node-key="id">
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>{{ node.label }}</span>
        <span>
          <!-- 使用Chrome的Vue插件调试 -->
          <el-button 
            v-if="node.level == 1" 
            type="text"
            size="mini"
            @click="() => {dialogFormVisible = true, subject.parentId = data.id}">添加</el-button>
            <!-- v-if="node.level == 2" -->
          <el-button
            type="text"
            size="mini"
            @click="() => remove(node, data)">删除</el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog :visible.sync="dialogFormVisible" title="添加分类">
        <el-form :model="subject" label-width="120px">
            <el-form-item label="分类标题">
                <el-input v-model="subject.title"/>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="append()">确 定</el-button>
        </div>
    </el-dialog>

  </div>
</template>

<script>
import subject from '@/api/edu/subject'


export default {
    data(){
        return {
            filterText: '',
            subjectList: [],
            defaultProps: {
                children: 'children',
                label: 'title'
            },
            dialogFormVisible: false,
            subject: {
                title: '',
                parentId: 0
            }
        }
 
    },
     watch: {
         filterText(val){
             this.$refs.subjectTree.filter(val);
         }
     },
     created() {
         this.fetchNodeList();
     },
     methods: {
         fetchNodeList(){
             subject.getNestedTreeList().then(response => {
                 if(response.success === true){
                     this.subjectList = response.data.subjectList;
                 }
             })
         },
         filterNode(value,data){
            if(!value){
                return true;
            }

            return data.title.toLowerCase().indexOf(value.toLowerCase()) !== -1;
        },
        remove(node,data){
            console.log(node);
            console.log(data);

            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                return subject.removeById(data.id);
            }).then(() => {
                // this.fetchNodeList()// 刷新列表
                this.$refs.subjectTree.remove(node) // 删除节点（效率高）
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                })
            }).catch( (response) => { // 失败
                if(response === 'cancel'){
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    })
                }else{
                    this.$message({
                        type: 'error',
                        message: (node.level === 1 ? '一级分类不为空,删除失败':'删除失败')
                    })
                }
            })
        },
        appendLevelOne(){
        subject.saveLevelOne(this.subject)
            .then(response => {
                this.dialogFormVisible = false
                this.$message({
                    type: 'success',
                    message: '添加一级分类成功'
                })
                //刷新页面
                this.fetchNodeList()
                this.subject.title = '' 
            })
            .catch(response => {
                //你们写：判断点击取消清空一下
                this.dialogFormVisible = false
                this.$message({
                    type: 'error',
                    message: '添加一级分类失败'
                })
                this.subject.title = '' 
            })
        },
        append(){
            if(this.subject.parentId == 0 ){
                this.appendLevelOne() // 一级分类的添加
            } else{
                this.appendLevelTwo() // 二级分类的添加
            }
        },
        appendLevelTwo(){
            subject.saveLevelTwo(this.subject)
                .then(response => {
                    // 1. 把文本框关闭
                    this.dialogFormVisible = false;
                    // 2. 提示成功
                    this.$message({
                        type: 'success',
                        message: '添加二级分类成功'
                    })

                    // 3. 刷新页面
                    this.fetchNodeList();
                    // 4. 把subject清空
                    this.subject.title = ''
                    this.subject.parentId = 0
                })
                .catch(response => {
                    //1. 把文本提示框关闭
                    this.dialogFormVisible = false;
                    // 2. 提示失败
                    this.$message({
                        type: 'error',
                        message: "添加二级分类失败"
                    })
                    // 3. 把subject清空
                    this.subject.title = ''
                    this.subject.parentId = 0
                })
        }
     },
}
</script>