<template>
  <div class="role-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>人设卡管理</span>
          <el-input
            v-model="keyword"
            placeholder="搜索人设卡名称/创建者"
            style="width: 200px"
            clearable
            @change="fetchList"
          />
        </div>
      </template>

      <div class="filter-bar">
        <el-radio-group v-model="status" @change="fetchList">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="public">公开</el-radio-button>
          <el-radio-button label="hidden">隐藏/私密</el-radio-button>
        </el-radio-group>
      </div>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="280" show-overflow-tooltip />
        <el-table-column label="人设卡" width="180">
          <template #default="{ row }">
            <div class="role-info">
              <el-avatar v-if="row.avatarUrl" :src="row.avatarUrl" :size="40" />
              <div v-else class="avatar-placeholder">无头像</div>
              <div class="role-name">{{ row.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="封面图" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrls && row.imageUrls.length > 0"
              :src="row.imageUrls[0]"
              :preview-src-list="row.imageUrls"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="创建者" width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar v-if="row.ownerAvatarUrl" :src="row.ownerAvatarUrl" :size="24" />
              <span>{{ row.ownerNickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="likesCount" label="点赞数" width="80" sortable />
        <el-table-column prop="followersCount" label="关注数" width="80" sortable />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isPublic && !row.isHidden ? 'success' : 'danger'" size="small">
              {{ row.isPublic && !row.isHidden ? '公开' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="showDetail(row)">详情</el-button>
            <el-button
              type="warning"
              size="small"
              link
              @click="toggleVisibility(row)"
            >
              {{ row.isHidden ? '显示' : '隐藏' }}
            </el-button>
            <el-popconfirm title="确定删除此人设卡？" @confirm="deleteRole(row)">
              <template #reference>
                <el-button type="danger" size="small" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="20"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="人设卡详情" width="700px">
      <div v-if="currentRole" class="role-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="名称">{{ currentRole.name }}</el-descriptions-item>
          <el-descriptions-item label="创建者">
            {{ currentRole.ownerNickname }}
          </el-descriptions-item>
          <el-descriptions-item label="点赞数">{{ currentRole.likesCount }}</el-descriptions-item>
          <el-descriptions-item label="关注数">{{ currentRole.followersCount }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentRole.isPublic && !currentRole.isHidden ? 'success' : 'danger'">
              {{ currentRole.isPublic && !currentRole.isHidden ? '公开' : '隐藏' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentRole.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="简介" :span="2">
            {{ currentRole.description || '无' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="images-section" v-if="currentRole.imageUrls && currentRole.imageUrls.length > 0">
          <h4>封面图片</h4>
          <div class="image-grid">
            <el-image
              v-for="(url, idx) in currentRole.imageUrls"
              :key="idx"
              :src="url"
              :preview-src-list="currentRole.imageUrls"
              fit="cover"
              class="detail-image"
            />
          </div>
        </div>

        <div class="timeline-section" v-if="currentRole.timeline && currentRole.timeline.length > 0">
          <h4>时间线</h4>
          <el-timeline>
            <el-timeline-item
              v-for="item in currentRole.timeline"
              :key="item.id"
              :timestamp="item.createdAt"
              placement="top"
            >
              <el-card>
                <h5>{{ item.title }}</h5>
                <p>{{ item.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { get, post } from '../utils/api'

const router = useRouter()
const list = ref([])
const loading = ref(false)
const keyword = ref('')
const status = ref('')
const page = ref(1)
const total = ref(0)

const detailVisible = ref(false)
const currentRole = ref(null)

async function fetchList() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.value,
      pageSize: 20,
    })
    if (keyword.value) params.append('keyword', keyword.value)
    if (status.value) params.append('status', status.value)

    const res = await get(`/roles?${params}`)
    list.value = res.list || []
    total.value = res.total || 0
  } catch (err) {
    ElMessage.error('获取人设卡列表失败')
  } finally {
    loading.value = false
  }
}

async function showDetail(row) {
  try {
    const res = await get(`/roles/${row.id}`)
    currentRole.value = res
    detailVisible.value = true
  } catch (err) {
    ElMessage.error('获取人设卡详情失败')
  }
}

async function toggleVisibility(row) {
  try {
    await post(`/roles/${row.id}/visibility`, { isHidden: !row.isHidden })
    ElMessage.success(row.isHidden ? '已显示' : '已隐藏')
    fetchList()
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

async function deleteRole(row) {
  try {
    await post(`/roles/${row.id}/delete`)
    ElMessage.success('删除成功')
    fetchList()
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  margin-bottom: 16px;
}

.role-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-name {
  font-weight: 500;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.role-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.images-section {
  margin-top: 20px;
}

.images-section h4 {
  margin-bottom: 12px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.detail-image {
  width: 100%;
  height: 150px;
  border-radius: 8px;
}

.timeline-section {
  margin-top: 20px;
}

.timeline-section h4 {
  margin-bottom: 12px;
}
</style>
