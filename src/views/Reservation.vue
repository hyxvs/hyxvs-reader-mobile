<template>
  <div class="reservation-page">
    <van-tabs v-model="activeTab" sticky>
      <van-tab title="待处理" name="pending">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            :loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-empty v-if="list.length === 0" description="暂无预约记录" />
            <van-swipe-cell v-for="item in list" :key="item.id">
              <van-card
                :title="item.book_title"
                :desc="`预约时间: ${formatDate(item.appointment_date)}`"
                :thumb="item.book_cover || 'https://picsum.photos/100'"
                @click="goToBookDetail(item.book_id)"
              >
                <template #tags>
                  <van-tag type="primary">待处理</van-tag>
                </template>
                <template #footer>
                  <div class="expire-date">
                    <span>过期时间: {{ formatDate(item.expire_date) }}</span>
                  </div>
                </template>
              </van-card>
              <template #right>
                <van-button square text type="danger" style="height: 100%" @click="handleCancel(item.id)">
                  取消
                </van-button>
              </template>
            </van-swipe-cell>
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <van-tab title="已完成" name="completed">
        <van-pull-refresh v-model="refreshingCompleted" @refresh="onRefreshCompleted">
          <van-list
            :loading="loadingCompleted"
            :finished="finishedCompleted"
            finished-text="没有更多了"
            @load="onLoadCompleted"
          >
            <van-empty v-if="completedList.length === 0" description="暂无已完成记录" />
            <van-card
              v-for="item in completedList"
              :key="item.id"
              :title="item.book_title"
              :desc="`预约时间: ${formatDate(item.appointment_date)}`"
              :thumb="item.book_cover || 'https://via.placeholder.com/100'"
            >
              <template #tags>
                <van-tag type="success">已完成</van-tag>
              </template>
              <template #footer>
                <div class="complete-date">
                  <span>完成时间: {{ formatDate(item.updated_at) }}</span>
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
import { getReservationList, cancelReservation } from '@/api/reservation'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()

const activeTab = ref('pending')

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

const completedList = ref([])
const loadingCompleted = ref(false)
const finishedCompleted = ref(false)
const refreshingCompleted = ref(false)
const pageCompleted = ref(1)

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    page.value = 1
    refreshing.value = false
  }

  try {
    const res = await getReservationList({
      page: page.value,
      pageSize: pageSize.value,
      status: 'pending'
    })
    
    list.value = [...list.value, ...(res.data.list || [])]
    loading.value = false
    refreshing.value = false
    
    if (list.value.length >= res.data.total) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (error) {
    loading.value = false
    finished.value = true
    refreshing.value = false
  }
}

const onRefresh = () => {
  finished.value = false
  loading.value = true
  onLoad()
}

const onLoadCompleted = async () => {
  if (refreshingCompleted.value) {
    completedList.value = []
    pageCompleted.value = 1
    refreshingCompleted.value = false
  }

  try {
    const res = await getReservationList({
      page: pageCompleted.value,
      pageSize: pageSize.value,
      status: 'completed'
    })
    
    completedList.value = [...completedList.value, ...(res.data.list || [])]
    loadingCompleted.value = false
    refreshingCompleted.value = false
    
    if (completedList.value.length >= res.data.total) {
      finishedCompleted.value = true
    } else {
      pageCompleted.value++
    }
  } catch (error) {
    loadingCompleted.value = false
    finishedCompleted.value = true
    refreshingCompleted.value = false
  }
}

const onRefreshCompleted = () => {
  finishedCompleted.value = false
  loadingCompleted.value = true
  onLoadCompleted()
}

const goToBookDetail = (id) => {
  router.push(`/books/${id}`)
}

const handleCancel = async (id) => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消这个预约吗？'
    })
    
    await cancelReservation(id)
    showToast({
      type: 'success',
      message: '取消成功'
    })
    onRefresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消失败:', error)
    }
  }
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.reservation-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.van-card {
  margin: 10px;
  background: white;
  border-radius: 8px;
}

.expire-date,
.complete-date {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}
</style>
