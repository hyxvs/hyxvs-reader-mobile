<template>
  <div class="books-page">
    <van-search
      v-model="searchForm.keyword"
      placeholder="搜索书名、作者、ISBN"
      show-action
      shape="round"
      @search="handleSearch"
    >
      <template #action>
        <div @click="handleSearch">搜索</div>
      </template>
    </van-search>

    <van-dropdown-menu>
      <van-dropdown-item v-model="searchForm.category_id" :options="categoryOptions" @change="handleSearch" />
      <van-dropdown-item v-model="searchForm.status" :options="statusOptions" @change="handleSearch" />
    </van-dropdown-menu>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        :loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-card
          v-for="book in list"
          :key="book.id"
          :title="book.title"
          :desc="book.author"
          :thumb="book.cover ? `http://localhost:3000${book.cover}` : 'https://picsum.photos/100'"
          @click="goToBookDetail(book.id)"
        >
          <template #tags>
            <van-tag type="primary" size="small">{{ book.category_name }}</van-tag>
            <van-tag :type="book.available_count > 0 ? 'success' : 'warning'" size="small">
              {{ book.available_count > 0 ? '可借' : '已借完' }}
            </van-tag>
          </template>
          <template #footer>
            <van-button size="mini" type="primary" @click.stop="handleReserve(book)" :disabled="book.available_count <= 0">
              {{ book.available_count > 0 ? '预约' : '已借完' }}
            </van-button>
          </template>
        </van-card>
      </van-list>
    </van-pull-refresh>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBooksList, reserveBook } from '@/api/books'
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'

const router = useRouter()

const searchForm = ref({
  keyword: '',
  category_id: '',
  status: ''
})

const categoryOptions = ref([
  { text: '全部分类', value: '' },
  { text: '文学', value: 1 },
  { text: '科技', value: 2 },
  { text: '历史', value: 3 }
])

const statusOptions = ref([
  { text: '全部状态', value: '' },
  { text: '可借', value: 'available' },
  { text: '已借完', value: 'empty' }
])

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    page.value = 1
    refreshing.value = false
  }

  try {
    const res = await getBooksList({
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm.value
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

const handleSearch = () => {
  list.value = []
  page.value = 1
  finished.value = false
  onLoad()
}

const goToBookDetail = (id) => {
  router.push(`/books/${id}`)
}

const handleReserve = async (book) => {
  try {
    await showConfirmDialog({
      title: '确认预约',
      message: `确定要预约《${book.title}》吗？`
    })
    
    await reserveBook({
      book_id: book.id
    })
    
    showToast({
      type: 'success',
      message: '预约成功'
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('预约失败:', error)
    }
  }
}



onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.books-page {
  padding-bottom: 60px;
}

.van-card {
  margin: 10px;
  background: white;
  border-radius: 8px;
}
</style>
