<template>
  <div class="borrow-detail-page">
    <van-nav-bar
      title="借阅详情"
      left-arrow
      @click-left="onClickLeft"
    />

    <div v-if="loading" class="loading-container">
      <van-loading size="24px" vertical>加载中...</van-loading>
    </div>

    <div v-else-if="borrowInfo" class="detail-content">
      <van-cell-group inset title="图书信息">
        <van-cell :title="'书名'" :value="borrowInfo.title || '-'" />
        <van-cell :title="'ISBN'" :value="borrowInfo.isbn || '-'" />
        <van-cell :title="'作者'" :value="borrowInfo.author || '-'" />
        <van-cell :title="'出版社'" :value="borrowInfo.publisher || '-'" />
      </van-cell-group>

      <van-cell-group inset title="借阅信息">
        <van-cell :title="'借阅状态'">
          <template #value>
            <van-tag :type="getStatusType(borrowInfo.status)">
              {{ getStatusText(borrowInfo.status) }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell :title="'借阅时间'" :value="formatDate(borrowInfo.borrow_date)" />
        <van-cell :title="'应还时间'">
          <template #value>
            <div>
              {{ formatDate(borrowInfo.due_date) }}
              <van-tag v-if="isOverdue(borrowInfo.due_date)" type="danger" size="small">已逾期</van-tag>
            </div>
          </template>
        </van-cell>
        <van-cell v-if="borrowInfo.return_date" :title="'实际归还时间'" :value="formatDate(borrowInfo.return_date)" />
        <van-cell :title="'借阅编号'" :value="borrowInfo.id || '-'" />
        <van-cell :title="'读者编号'" :value="borrowInfo.reader_id || '-'" />
      </van-cell-group>

      <div class="action-buttons" v-if="borrowInfo.status === 'borrowed'">
        <van-button 
          round 
          block 
          type="primary" 
          size="large"
          @click="handleRenew"
        >
          续借
        </van-button>
      </div>
    </div>

    <div v-else class="empty-container">
      <van-empty description="借阅记录不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getBorrowDetail, renewBook } from '@/api/borrow'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

const borrowInfo = ref(null)
const loading = ref(true)

const onClickLeft = () => {
  router.back()
}

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const isOverdue = (dueDate) => {
  return dayjs().isAfter(dayjs(dueDate))
}

const getStatusType = (status) => {
  const map = {
    borrowed: 'primary',
    overdue: 'danger',
    returned: 'success'
  }
  return map[status] || 'default'
}

const getStatusText = (status) => {
  const map = {
    borrowed: '借阅中',
    overdue: '已逾期',
    returned: '已归还'
  }
  return map[status] || '未知'
}

const fetchBorrowDetail = async () => {
  loading.value = true
  try {
    const res = await getBorrowDetail(route.params.id)
    borrowInfo.value = res.data
  } catch (error) {
    console.error('获取借阅详情失败:', error)
    showToast('获取借阅详情失败')
  } finally {
    loading.value = false
  }
}

const handleRenew = async () => {
  try {
    await showConfirmDialog({
      title: '确认续借',
      message: '确定要续借这本书吗？'
    })
    
    await renewBook(borrowInfo.value.id)
    showToast({
      type: 'success',
      message: '续借成功'
    })
    // 重新获取借阅详情，更新应还日期
    fetchBorrowDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('续借失败:', error)
    }
  }
}

onMounted(() => {
  fetchBorrowDetail()
})
</script>

<style scoped>
.borrow-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}

.detail-content {
  padding: 10px;
}

.action-buttons {
  margin-top: 20px;
  padding: 0 10px;
}
</style>