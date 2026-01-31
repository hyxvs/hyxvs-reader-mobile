<template>
  <div class="home-page">
    <div class="header-banner">
      <van-swipe :autoplay="3000" indicator-color="white">
        <van-swipe-item>
          <div class="banner-item">
            <h2>欢迎来到图书馆</h2>
            <p>发现知识的海洋</p>
          </div>
        </van-swipe-item>
        <van-swipe-item>
          <div class="banner-item">
            <h2>热门图书推荐</h2>
            <p>精选好书等你来读</p>
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>

    <van-notice-bar
      left-icon="volume-o"
      text="欢迎使用图书馆读者系统，随时随地查询图书"
      background="#ecf9ff"
      color="#1989fa"
    />

    <div class="quick-actions">
      <van-grid :column-num="4" :border="false">
        <van-grid-item icon="search" text="图书查询" @click="router.push('/books')" />
        <van-grid-item icon="todo-list-o" text="我的借阅" @click="router.push('/borrow')" />
        <van-grid-item icon="bookmark-o" text="我的预约" @click="router.push('/reservation')" />
        <van-grid-item icon="user-o" text="个人中心" @click="router.push('/profile')" />
      </van-grid>
    </div>

    <div class="hot-books">
      <div class="section-header">
        <h3>热门图书</h3>
        <van-button type="primary" size="small" plain @click="router.push('/books')">查看更多</van-button>
      </div>
      <van-swipe :width="140" :loop="false">
        <van-swipe-item v-for="book in hotBooks" :key="book.id">
          <van-card
            :thumb="book.cover ? `http://localhost:3000${book.cover}` : 'https://picsum.photos/140'"
            :title="book.title"
            :desc="book.author"
            @click="goToBookDetail(book.id)"
          >
            <template #tags>
              <van-tag type="primary" size="small">{{ book.category_name }}</van-tag>
            </template>
            <template #footer>
              <van-tag :type="book.available_count > 0 ? 'success' : 'warning'">
                {{ book.available_count > 0 ? '可借' : '已借完' }}
              </van-tag>
            </template>
          </van-card>
        </van-swipe-item>
      </van-swipe>
    </div>

    <div class="my-stats">
      <van-cell-group title="我的统计" inset>
        <van-cell title="当前借阅" :value="`${stats.borrowing}本`" icon="todo-list-o" />
        <van-cell title="当前预约" :value="`${stats.reservation}本`" icon="bookmark-o" />
        <van-cell title="历史借阅" :value="`${stats.total}本`" icon="records-o" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBooksList } from '@/api/books'
import { getBorrowList } from '@/api/borrow'
import { getReservationList } from '@/api/reservation'

const router = useRouter()

const hotBooks = ref([])
const stats = ref({
  borrowing: 0,
  reservation: 0,
  total: 0
})

const fetchHotBooks = async () => {
  try {
    const res = await getBooksList({ page: 1, pageSize: 10, sort: 'borrow_count', order: 'desc' })
    hotBooks.value = res.data.list || []
  } catch (error) {
    console.error('获取热门图书失败:', error)
  }
}

const fetchMyStats = async () => {
  try {
    const borrowRes = await getBorrowList({ page: 1, pageSize: 1 })
    const reservationRes = await getReservationList({ page: 1, pageSize: 1 })
    
    stats.value.borrowing = borrowRes.data.total || 0
    stats.value.reservation = reservationRes.data.total || 0
    stats.value.total = borrowRes.data.total || 0
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const goToBookDetail = (id) => {
  router.push(`/books/${id}`)
}

onMounted(() => {
  fetchHotBooks()
  fetchMyStats()
})
</script>

<style scoped>
.home-page {
  padding-bottom: 60px;
}

.header-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.banner-item {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

.banner-item h2 {
  margin: 0 0 10px;
  font-size: 20px;
}

.banner-item p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.quick-actions {
  margin: 15px 0;
  background: white;
  padding: 15px 0;
}

.hot-books {
  margin: 15px 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 5px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
}

.van-card {
  margin: 0 5px;
  background: white;
  border-radius: 8px;
}

.my-stats {
  margin: 15px 0;
}
</style>
