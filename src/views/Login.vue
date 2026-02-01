<template>
  <div class="login-page">
    <div class="login-header">
      <van-icon name="books-o" size="60" color="#1989fa" />
      <h1>图书馆读者系统</h1>
      <p>欢迎登录</p>
    </div>
    
    <van-tabs v-model="activeTab" background="transparent" line-width="40px">
      <van-tab title="登录" name="login">
        <van-form @submit="handleLogin">
          <van-cell-group inset>
            <van-field
              v-model="loginForm.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[{ required: true, message: '请输入用户名' }]"
              left-icon="user-o"
            />
            <van-field
              v-model="loginForm.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[{ required: true, message: '请输入密码' }]"
              left-icon="lock"
            />
          </van-cell-group>
          
          <div class="login-btn">
            <van-button round block type="primary" native-type="submit" :loading="loading">
              登录
            </van-button>
          </div>
        </van-form>
      </van-tab>
      
      <van-tab title="注册" name="register">
        <van-form @submit="handleRegister">
          <van-cell-group inset>
            <van-field
              v-model="registerForm.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[{ required: true, message: '请输入用户名' }]"
            />
            <van-field
              v-model="registerForm.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[{ required: true, message: '请输入密码' }]"
            />
            <van-field
              v-model="registerForm.confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              :rules="[
                { required: true, message: '请再次输入密码' },
                { validator: validatePassword }
              ]"
            />
            <van-field
              v-model="registerForm.realName"
              name="realName"
              label="真实姓名"
              placeholder="请输入真实姓名"
              :rules="[{ required: true, message: '请输入真实姓名' }]"
            />
            <van-field
              v-model="registerForm.idCard"
              name="idCard"
              label="身份证号"
              placeholder="请输入身份证号"
              :rules="[{ required: true, message: '请输入身份证号' }]"
            />
            <van-field
              v-model="registerForm.email"
              name="email"
              label="邮箱"
              type="email"
              placeholder="请输入邮箱"
              :rules="[{ required: true, message: '请输入邮箱' }]"
            />
          </van-cell-group>
          
          <div class="login-btn">
            <van-button round block type="primary" native-type="submit" :loading="loading">
              注册
            </van-button>
          </div>
        </van-form>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login, register } from '@/api/auth'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  idCard: '',
  email: ''
})

const validatePassword = (val) => {
  if (val !== registerForm.value.password) {
    return '两次输入的密码不一致'
  }
  return true
}

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await login(loginForm.value)
    if (res.data && res.data.token) {
      userStore.setToken(res.data.token)
      userStore.setUser(res.data.user)
      showToast({
        type: 'success',
        message: '登录成功'
      })
      router.push('/home')
    } else {
      throw new Error('登录失败：未获取到token')
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast({
      type: 'error',
      message: '登录失败，请检查用户名和密码'
    })
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  loading.value = true
  try {
    const { confirmPassword, ...data } = registerForm.value
    await register(data)
    showToast({
      type: 'success',
      message: '注册成功，请登录'
    })
    activeTab.value = 'login'
  } catch (error) {
    console.error('注册失败:', error)
    const errorMsg = error.response?.data?.msg || '注册失败，请检查输入信息'
    showToast({
      type: 'error',
      message: errorMsg
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px 20px;
}

.login-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  margin: 20px 0 10px;
}

.login-header p {
  font-size: 16px;
  opacity: 0.9;
}

.login-btn {
  margin-top: 30px;
  padding: 0 16px;
}
</style>
