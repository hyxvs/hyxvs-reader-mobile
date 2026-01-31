<template>
  <div class="main-layout">
    <div class="content">
      <router-view />
    </div>
    <van-tabbar v-model="active" route safe-area-inset-bottom>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/books" icon="search">图书</van-tabbar-item>
      <van-tabbar-item to="/borrow" icon="todo-list-o">借阅</van-tabbar-item>
      <van-tabbar-item to="/reservation" icon="bookmark-o">预约</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)

// 初始化 active 值
const updateActive = () => {
  const path = route.path
  if (path === '/home') active.value = 0
  else if (path === '/books') active.value = 1
  else if (path === '/borrow') active.value = 2
  else if (path === '/reservation') active.value = 3
  else if (path === '/profile') active.value = 4
  else active.value = 0
}

// 监听路由变化
watch(() => route.path, () => {
  updateActive()
})

// 初始化
updateActive()
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 50px;
}
</style>
