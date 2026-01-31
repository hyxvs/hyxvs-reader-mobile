<template>
  <div class="book-detail-page">
    <van-nav-bar
      title="图书详情"
      left-arrow
      @click-left="onClickLeft"
    />

    <div v-if="loading" class="loading-container">
      <van-loading size="24px" vertical>加载中...</van-loading>
    </div>

    <div v-else-if="book" class="detail-content">
      <div class="book-cover">
        <van-image
          width="150"
          height="200"
          fit="cover"
          :src="book.cover ? `http://localhost:3000${book.cover}` : 'https://picsum.photos/150/200'"
        />
      </div>

      <van-cell-group inset title="基本信息">
        <van-cell title="书名" :value="book.title" />
        <van-cell title="作者" :value="book.author" />
        <van-cell title="ISBN" :value="book.isbn" />
        <van-cell title="出版社" :value="book.publisher" />
        <van-cell title="出版日期" :value="book.publish_date" />
        <van-cell title="分类" :value="book.category_name" />
        <van-cell title="价格" :value="`¥${book.price}`" />
        <van-cell title="馆藏位置" :value="book.location" />
        <van-cell title="库存状态">
          <template #value>
            <van-tag :type="book.available_count > 0 ? 'success' : 'warning'">
              {{ book.available_count > 0 ? `可借 ${book.available_count}本` : '已借完' }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="图书描述">
        <van-cell>
          <template #title>
            <div class="description">{{ book.description || '暂无描述' }}</div>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="action-buttons">
        <van-button 
          round 
          block 
          type="primary" 
          size="large"
          :disabled="book.status !== 1 && book.available_count <= 0"
          @click="handleReserve"
        >
          {{ book.status === 1 ? '立即借阅' : '立即预约' }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getBookDetail, reserveBook } from '@/api/books'
import { borrowBook } from '@/api/borrow'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()

const book = ref(null)
const loading = ref(true)

const onClickLeft = () => {
  router.back()
}

const fetchBookDetail = async () => {
  loading.value = true
  try {
    const res = await getBookDetail(route.params.id)
    book.value = res.data
  } catch (error) {
    console.error('获取图书详情失败:', error)
    showToast('获取图书详情失败')
  } finally {
    loading.value = false
  }
}

const handleReserve = async () => {
  try {
    await showConfirmDialog({
      title: book.value.status === 1 ? '确认借阅' : '确认预约',
      message: `确定要${book.value.status === 1 ? '借阅' : '预约'}《${book.value.title}》吗？`
    })
    
    if (book.value.status === 1) {
      await borrowBook({
        book_id: book.value.id
      })
      showToast({
        type: 'success',
        message: '借阅成功'
      })
    } else {
      await reserveBook({
        book_id: book.value.id
      })
      showToast({
        type: 'success',
        message: '预约成功'
      })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
    }
  }
}

onMounted(() => {
  fetchBookDetail()
})
</script>

<style scoped>
.book-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.book-cover {
  display: flex;
  justify-content: center;
  padding: 30px 0;
  background: white;
  margin-bottom: 10px;
}

.description {
  line-height: 1.6;
  color: #666;
}

.action-buttons {
  margin: 20px 16px;
}
</style>
