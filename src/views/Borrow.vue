<template>
  <div class="borrow-page">
    <van-tabs v-model="activeTab" sticky>
      <van-tab title="当前借阅" name="borrowing">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            :loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-empty v-if="list.length === 0" description="暂无借阅记录" />
            <van-card
              v-for="item in list"
              :key="item.id"
              :title="item.book_title"
              :desc="`借阅时间: ${formatDate(item.borrow_date)}`"
              :thumb="item.book_cover || 'https://picsum.photos/100'"
              @click="goToBorrowDetail(item.id)"
            >
              <template #tags>
                <van-tag :type="getStatusType(item.status)">
                  {{ getStatusText(item.status) }}
                </van-tag>
              </template>
              <template #footer>
                <div class="due-date">
                  <span>应还日期: {{ formatDate(item.due_date) }}</span>
                  <van-tag v-if="isOverdue(item.due_date)" type="danger" size="small">已逾期</van-tag>
                </div>
                <van-button 
                  v-if="item.status === 'borrowed'" 
                  size="mini" 
                  type="primary" 
                  @click="handleRenew(item.id)"
                >
                  续借
                </van-button>
              </template>
            </van-card>
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <van-tab title="历史借阅" name="history">
        <van-pull-refresh v-model="refreshingHistory" @refresh="onRefreshHistory">
          <van-list
            :loading="loadingHistory"
            :finished="finishedHistory"
            finished-text="没有更多了"
            @load="onLoadHistory"
          >
            <van-empty v-if="historyList.length === 0" description="暂无历史记录" />
            <van-card
              v-for="item in historyList"
              :key="item.id"
              :title="item.book_title"
              :desc="`借阅时间: ${formatDate(item.borrow_date)}`"
              :thumb="item.book_cover || 'https://picsum.photos/100'"
              @click="goToBorrowDetail(item.id)"
            >
              <template #tags>
                <van-tag type="success">已归还</van-tag>
              </template>
              <template #footer>
                <div class="return-date">
                  <span>归还时间: {{ formatDate(item.return_date) }}</span>
                </div>
              </template>
            </van-card>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBorrowList, renewBook } from '@/api/borrow'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const activeTab = ref('borrowing')
const router = useRouter()

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

const historyList = ref([])
const loadingHistory = ref(false)
const finishedHistory = ref(false)
const refreshingHistory = ref(false)
const pageHistory = ref(1)

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
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

const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    page.value = 1
    refreshing.value = false
  }

  try {
    const res = await getBorrowList({
      page: page.value,
      pageSize: pageSize.value,
      status: 'borrowed'
    })
    
    list.value = [...list.value, ...(res.data.list || [])]
    loading.value = false
    
    if (list.value.length >= res.data.total) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (error) {
    loading.value = false
    finished.value = true
  }
}

const onRefresh = () => {
  finished.value = false
  loading.value = true
  onLoad()
}

const onLoadHistory = async () => {
  if (refreshingHistory.value) {
    historyList.value = []
    pageHistory.value = 1
    refreshingHistory.value = false
  }

  try {
    const res = await getBorrowList({
      page: pageHistory.value,
      pageSize: pageSize.value,
      status: 'returned'
    })
    
    historyList.value = [...historyList.value, ...(res.data.list || [])]
    loadingHistory.value = false
    
    if (historyList.value.length >= res.data.total) {
      finishedHistory.value = true
    } else {
      pageHistory.value++
    }
  } catch (error) {
    loadingHistory.value = false
    finishedHistory.value = true
  }
}

const onRefreshHistory = () => {
  finishedHistory.value = false
  loadingHistory.value = true
  onLoadHistory()
}

const handleRenew = async (id) => {
  try {
    await showConfirmDialog({
      title: '确认续借',
      message: '确定要续借这本书吗？'
    })
    
    await renewBook(id)
    showToast({
      type: 'success',
      message: '续借成功'
    })
    onRefresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('续借失败:', error)
    }
  }
}

const goToBorrowDetail = (id) => {
  router.push(`/borrow/detail/${id}`)
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.borrow-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.van-card {
  margin: 10px;
  background: white;
  border-radius: 8px;
}

.due-date,
.return-date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}
</style>
