<template>
  <div class="profile-page">
    <div class="user-header">
      <div class="avatar-container" @click="handleAvatarClick">
        <van-image
          round
          width="80"
          height="80"
          :src="userAvatar"
        />
        <div class="avatar-overlay">
          <van-icon name="camera-o" size="20" />
        </div>
      </div>
      <input
        ref="avatarInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleAvatarChange"
      />
      <div class="user-info">
        <h3>{{ userInfo ? userInfo.name : '读者' }}</h3>
        <p>{{ userInfo ? userInfo.reader_no : '' }}</p>
      </div>
    </div>

    <van-cell-group inset title="个人信息">
      <van-cell title="读者编号" :value="userInfo ? userInfo.reader_no : '-'" />
      <van-cell title="真实姓名" :value="userInfo ? userInfo.name : '-'" />
      <van-cell title="性别" :value="userInfo ? getGenderText(userInfo.gender) : '-'" />
      <van-cell title="身份证号" :value="userInfo ? (userInfo.id_card || '未设置') : '未设置'" />
      <van-cell title="电子邮箱" :value="userInfo ? (userInfo.email || '未设置') : '未设置'" />
      <van-cell title="信用状态">
        <template #value>
          <van-tag :type="userInfo && userInfo.credit_status === 'normal' ? 'success' : 'danger'">
            {{ userInfo ? getCreditStatusText(userInfo.credit_status) : '-' }}
          </van-tag>
        </template>
      </van-cell>
      <van-cell title="欠费金额">
        <template #value>
          <span :style="{ color: userInfo && Number(userInfo.arrears_amount) > 0 ? '#ff4444' : '#07c160' }">
            {{ userInfo ? `¥${Number(userInfo.arrears_amount || 0).toFixed(2)}` : '¥0.00' }}
          </span>
        </template>
      </van-cell>
      <van-cell title="注册时间" :value="userInfo ? formatDate(userInfo.create_time) : '-'" />
    </van-cell-group>

    <van-cell-group inset title="借阅统计">
      <van-cell title="累计借阅" :value="statistics ? statistics.totalBorrow : '0'" />
      <van-cell title="当前借阅" :value="statistics ? statistics.currentBorrow : '0'" />
      <van-cell title="累计预约" :value="statistics ? statistics.totalReservation : '0'" />
      <van-cell title="历史逾期" :value="statistics ? statistics.totalOverdue : '0'" />
    </van-cell-group>

    <van-cell-group inset title="我的服务">
      <van-cell title="我的借阅" is-link to="/borrow" icon="todo-list-o" />
      <van-cell title="我的预约" is-link to="/reservation" icon="bookmark-o" />
      <van-cell title="图书查询" is-link to="/books" icon="search" />
    </van-cell-group>

    <van-cell-group inset title="系统设置">
      <van-cell title="编辑个人信息" is-link @click="showEditDialog = true" icon="edit" />
      <van-cell title="修改密码" is-link @click="showPasswordDialog = true" icon="lock" />
      <van-cell title="关于系统" is-link @click="showAboutDialog = true" icon="info-o" />
    </van-cell-group>

    <div class="logout-btn">
      <van-button round block type="danger" @click="handleLogout">
        退出登录
      </van-button>
    </div>

    <van-dialog :show="showEditDialog" title="编辑个人信息" show-cancel-button @confirm="handleEditProfile">
      <van-field
        v-model="editForm.name"
        label="真实姓名"
        placeholder="请输入真实姓名"
      />
      <van-field
        v-model="editForm.gender"
        label="性别"
        placeholder="请选择性别"
        readonly
        is-link
        @click="showGenderPicker = true"
      />
      <van-field
        v-model="editForm.email"
        label="电子邮箱"
        placeholder="请输入电子邮箱"
      />
    </van-dialog>

    <van-popup :show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genderOptions"
        @confirm="onGenderConfirm"
        @cancel="showGenderPicker = false"
      />
    </van-popup>

    <van-dialog :show="showPasswordDialog" title="修改密码" show-cancel-button @confirm="handleChangePassword">
      <van-field
        v-model="passwordForm.oldPassword"
        type="password"
        label="原密码"
        placeholder="请输入原密码"
      />
      <van-field
        v-model="passwordForm.newPassword"
        type="password"
        label="新密码"
        placeholder="请输入新密码"
      />
      <van-field
        v-model="passwordForm.confirmPassword"
        type="password"
        label="确认密码"
        placeholder="请再次输入新密码"
      />
    </van-dialog>

    <van-dialog :show="showAboutDialog" title="关于系统">
      <div class="about-content">
        <p>图书馆读者系统 v1.1.0</p>
        <p>移动端版本</p>
        <p>© 2026 All Rights Reserved</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { logout, getUserInfo, updateUserProfile, getUserStatistics, changePassword, uploadAvatar } from '@/api/auth'
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const userInfo = ref(null)
const statistics = ref(null)
const loading = ref(false)
const avatarInput = ref(null)

const userAvatar = computed(() => {
  if (userInfo.value && userInfo.value.avatar) {
    return `http://localhost:3000${userInfo.value.avatar}`
  }
  return 'https://picsum.photos/80'
})

const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const showAboutDialog = ref(false)
const showGenderPicker = ref(false)

const editForm = ref({
  name: '',
  gender: '',
  email: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const genderOptions = [
  { text: '男', value: 'male' },
  { text: '女', value: 'female' }
]

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

const getGenderText = (gender) => {
  const map = {
    male: '男',
    female: '女'
  }
  return map[gender] || '未知'
}

const getCreditStatusText = (status) => {
  const map = {
    normal: '正常',
    frozen: '冻结',
    warning: '警告'
  }
  return map[status] || '未知'
}

const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo()
    userInfo.value = res.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const fetchStatistics = async () => {
  try {
    const res = await getUserStatistics()
    statistics.value = res.data
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

const onGenderConfirm = ({ selectedOptions }) => {
  editForm.value.gender = selectedOptions[0].value
  showGenderPicker.value = false
}

const handleEditProfile = async () => {
  if (!editForm.value.name) {
    showToast('请输入真实姓名')
    return false
  }
  if (!editForm.value.gender) {
    showToast('请选择性别')
    return false
  }
  
  try {
    await updateUserProfile(editForm.value)
    showToast({
      type: 'success',
      message: '修改成功'
    })
    showEditDialog.value = false
    fetchUserInfo()
  } catch (error) {
    console.error('修改个人信息失败:', error)
    return false
  }
  return true
}

const handleAvatarClick = () => {
  if (avatarInput.value) {
    avatarInput.value.click()
  }
}

const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件')
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过5MB')
    return
  }
  
  const loadingToast = showLoadingToast({
    message: '上传中...',
    forbidClick: true,
    duration: 0
  })
  
  try {
    const res = await uploadAvatar(file)
    closeToast(loadingToast)
    showToast({
      type: 'success',
      message: '头像上传成功'
    })
    fetchUserInfo()
  } catch (error) {
    closeToast(loadingToast)
    console.error('上传头像失败:', error)
    showToast('头像上传失败')
  }
}

const handleChangePassword = async () => {
  if (!passwordForm.value.oldPassword) {
    showToast('请输入原密码')
    return false
  }
  if (!passwordForm.value.newPassword) {
    showToast('请输入新密码')
    return false
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showToast('两次输入的密码不一致')
    return false
  }
  
  try {
    await changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    showToast({
      type: 'success',
      message: '密码修改成功'
    })
    showPasswordDialog.value = false
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    return false
  }
  return true
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？'
    })
    
    await logout()
    userStore.logout()
    showToast({
      type: 'success',
      message: '退出成功'
    })
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出失败:', error)
    }
  }
}

onMounted(() => {
  fetchUserInfo()
  fetchStatistics()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.avatar-container {
  position: relative;
  cursor: pointer;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-info h3 {
  margin: 0 0 5px;
  font-size: 20px;
}

.user-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.logout-btn {
  margin: 20px 16px;
}

.about-content {
  padding: 20px;
  text-align: center;
  color: #666;
}

.about-content p {
  margin: 8px 0;
}
</style>
