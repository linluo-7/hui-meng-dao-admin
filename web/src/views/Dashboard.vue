<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon :size="40"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon note-icon">
              <el-icon :size="40"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalNotes }}</div>
              <div class="stat-label">帖子总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon album-icon">
              <el-icon :size="40"><FolderOpened /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalAlbums }}</div>
              <div class="stat-label">企划总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon active-icon">
              <el-icon :size="40"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeUsers }}</div>
              <div class="stat-label">活跃用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>今日数据</span>
          </template>
          <div class="today-stats">
            <div class="today-item">
              <span class="today-label">今日新增用户</span>
              <span class="today-value">{{ stats.todayUsers }}</span>
            </div>
            <el-divider />
            <div class="today-item">
              <span class="today-label">今日新增帖子</span>
              <span class="today-value">{{ stats.todayNotes }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>热门帖子</span>
          </template>
          <el-table :data="hotPosts" max-height="200">
            <el-table-column prop="title" label="标题" show-overflow-tooltip />
            <el-table-column prop="likes" label="点赞" width="80" />
            <el-table-column prop="author" label="作者" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, Document, FolderOpened, TrendCharts } from '@element-plus/icons-vue'
import api from '../utils/api'

const stats = ref({
  totalUsers: 0,
  totalNotes: 0,
  totalAlbums: 0,
  todayUsers: 0,
  todayNotes: 0,
  activeUsers: 0,
})

const hotPosts = ref([])

onMounted(async () => {
  await fetchStats()
  await fetchHotPosts()
})

const fetchStats = async () => {
  try {
    const res = await api.get('/dashboard/stats')
    stats.value = res.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchHotPosts = async () => {
  try {
    const res = await api.get('/dashboard/hot', { params: { type: 'notes' } })
    hotPosts.value = res.data
  } catch (error) {
    console.error('获取热门帖子失败:', error)
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.user-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
.note-icon { background: linear-gradient(135deg, #f093fb, #f5576c); }
.album-icon { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.active-icon { background: linear-gradient(135deg, #43e97b, #38f9d7); }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.today-stats {
  padding: 10px 0;
}

.today-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.today-label {
  color: #666;
}

.today-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}
</style>
