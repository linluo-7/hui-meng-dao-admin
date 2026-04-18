<template>
  <div class="album-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>企划列表</span>
          <el-input
            v-model="keyword"
            placeholder="搜索标题/内容"
            style="width: 200px"
            clearable
            @clear="fetchAlbums"
            @keyup.enter="fetchAlbums"
          >
            <template #append>
              <el-button :icon="Search" @click="fetchAlbums" />
            </template>
          </el-input>
        </div>
      </template>
      <el-table :data="albums" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="author_name" label="作者" width="120" />
        <el-table-column prop="likes" label="点赞" width="80" />
        <el-table-column prop="comments_count" label="评论" width="80" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
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
          @current-change="fetchAlbums"
        />
      </div>
    </el-card>

    <!-- 企划详情弹窗 -->
    <el-dialog v-model="detailVisible" title="企划详情" width="600px">
      <el-descriptions :column="2" border v-if="currentAlbum">
        <el-descriptions-item label="企划ID" :span="2">{{ currentAlbum.id }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ currentAlbum.title }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentAlbum.author_name }}</el-descriptions-item>
        <el-descriptions-item label="点赞数">{{ currentAlbum.likes }}</el-descriptions-item>
        <el-descriptions-item label="评论数">{{ currentAlbum.comments_count }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentAlbum.created_at }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">
          <div style="max-height: 200px; overflow-y: auto">{{ currentAlbum.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../utils/api'

const albums = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailVisible = ref(false)
const currentAlbum = ref<any>(null)

onMounted(() => {
  fetchAlbums()
})

const fetchAlbums = async () => {
  loading.value = true
  try {
    const res = await api.get('/albums', {
      params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value },
    })
    albums.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取企划列表失败:', error)
  } finally {
    loading.value = false
  }
}

const showDetail = (row: any) => {
  currentAlbum.value = row
  detailVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除企划《${row.title}》吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await api.delete(`/albums/${row.id}`)
    ElMessage.success('删除成功')
    fetchAlbums()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}
</script>

<style scoped>
.album-list {
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
