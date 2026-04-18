<template>
  <div class="note-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>帖子列表</span>
          <el-input
            v-model="keyword"
            placeholder="搜索标题/内容"
            style="width: 200px"
            clearable
            @clear="fetchNotes"
            @keyup.enter="fetchNotes"
          >
            <template #append>
              <el-button :icon="Search" @click="fetchNotes" />
            </template>
          </el-input>
        </div>
      </template>
      <el-table :data="notes" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="author_name" label="作者" width="120" />
        <el-table-column prop="post_type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.post_type || '普通' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞" width="80" />
        <el-table-column prop="comments_count" label="评论" width="80" />
        <el-table-column prop="created_at" label="发布时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showDetail(row)">详情</el-button>
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
          @current-change="fetchNotes"
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

const notes = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

onMounted(() => {
  fetchNotes()
})

const fetchNotes = async () => {
  loading.value = true
  try {
    const res = await api.get('/notes', {
      params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value },
    })
    notes.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取帖子列表失败:', error)
  } finally {
    loading.value = false
  }
}

const showDetail = (row: any) => {
  ElMessageBox.alert(row.content || '暂无内容', `帖子详情: ${row.title}`, {
    confirmButtonText: '关闭',
  })
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除帖子《${row.title}》吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await api.delete(`/notes/${row.id}`)
    ElMessage.success('删除成功')
    fetchNotes()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}
</script>

<style scoped>
.note-list {
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
