<template>
  <div class="comment-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评论列表</span>
          <el-input
            v-model="keyword"
            placeholder="搜索评论内容"
            style="width: 200px"
            clearable
            @clear="fetchComments"
            @keyup.enter="fetchComments"
          >
            <template #append>
              <el-button :icon="Search" @click="fetchComments" />
            </template>
          </el-input>
        </div>
      </template>
      <el-table :data="comments" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="评论内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="author_name" label="评论者" width="120" />
        <el-table-column prop="post_title" label="所属帖子" min-width="150" show-overflow-tooltip />
        <el-table-column prop="created_at" label="评论时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchComments"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../utils/api'

const comments = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

onMounted(() => {
  fetchComments()
})

const fetchComments = async () => {
  loading.value = true
  try {
    const res = await api.get('/comments', {
      params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value },
    })
    comments.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取评论列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除这条评论吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await api.delete(`/comments/${row.id}`)
    ElMessage.success('删除成功')
    fetchComments()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}
</script>

<style scoped>
.comment-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
