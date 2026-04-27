<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-rose-100">
    <!-- 浮动爱心背景 -->
    <FloatingHearts />

    <div class="container mx-auto px-4 py-6 max-w-5xl relative z-10">
      <!-- 页面标题 -->
      <div class="text-center mb-8 pt-4">
        <div class="text-5xl mb-3">⚙️</div>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent mb-2">
          设置
        </h1>
        <p class="text-gray-600">配置数据存储地址</p>
      </div>

      <!-- 功能配置卡片 -->
      <UCard class="mb-6 rounded-3xl shadow-lg">
        <template #header>
          <div class="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <UIcon name="i-lucide-database" class="text-pink-500" />
            <span>数据存储配置</span>
          </div>
        </template>

        <div class="space-y-6">
          <p class="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <UIcon name="i-lucide-info" class="inline w-4 h-4 mr-1" />
            配置阿里云OSS或其他支持HTTP访问的存储服务URL。留空将使用默认值。
          </p>

          <!-- 时间表配置 -->
          <div class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-lucide-calendar" class="text-pink-500 w-5 h-5" />
              <span class="font-medium text-gray-800">时间表</span>
              <UBadge size="sm" variant="soft" color="primary">schedule</UBadge>
            </div>
            <UFormField label="存储URL">
              <UInput
                v-model="urls.schedule"
                placeholder="https://your-bucket.oss-cn-hangzhou.aliyuncs.com/wedding/时间表.json"
                icon="i-lucide-link"
                class="w-full"
              />
            </UFormField>
            <p class="text-xs text-gray-400 mt-1">默认: {{ defaultUrls.schedule || '未设置' }}</p>
          </div>

          <!-- 坐席配置 -->
          <div class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-lucide-users" class="text-purple-500 w-5 h-5" />
              <span class="font-medium text-gray-800">坐席</span>
              <UBadge size="sm" variant="soft" color="secondary">seating</UBadge>
            </div>
            <UFormField label="存储URL">
              <UInput
                v-model="urls.seating"
                placeholder="https://your-bucket.oss-cn-hangzhou.aliyuncs.com/wedding/坐席.json"
                icon="i-lucide-link"
                class="w-full"
              />
            </UFormField>
            <p class="text-xs text-gray-400 mt-1">默认: {{ defaultUrls.seating || '未设置' }}</p>
          </div>

          <!-- 预算配置 -->
          <div class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-lucide-wallet" class="text-green-500 w-5 h-5" />
              <span class="font-medium text-gray-800">预算</span>
              <UBadge size="sm" variant="soft" color="success">budget</UBadge>
            </div>
            <UFormField label="存储URL">
              <UInput
                v-model="urls.budget"
                placeholder="https://your-bucket.oss-cn-hangzhou.aliyuncs.com/wedding/预算.json"
                icon="i-lucide-link"
                class="w-full"
              />
            </UFormField>
            <p class="text-xs text-gray-400 mt-1">默认: {{ defaultUrls.budget || '未设置' }}</p>
          </div>

          <!-- 待办配置 -->
          <div class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-lucide-check-square" class="text-amber-500 w-5 h-5" />
              <span class="font-medium text-gray-800">待办</span>
              <UBadge size="sm" variant="soft" color="warning">todo</UBadge>
            </div>
            <UFormField label="存储URL">
              <UInput
                v-model="urls.todo"
                placeholder="https://your-bucket.oss-cn-hangzhou.aliyuncs.com/wedding/待办.json"
                icon="i-lucide-link"
                class="w-full"
              />
            </UFormField>
            <p class="text-xs text-gray-400 mt-1">默认: {{ defaultUrls.todo || '未设置' }}</p>
          </div>
        </div>

        <!-- 管理员权限控制 -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield" class="text-purple-500 w-5 h-5" />
              <span class="font-medium text-gray-800">管理员权限</span>
            </div>
            <UBadge
              :color="isAdmin ? 'success' : 'neutral'"
              variant="soft"
            >
              {{ isAdmin ? '已启用编辑' : '仅查看模式' }}
            </UBadge>
          </div>

          <!-- 密码输入区域 -->
          <div v-if="!isAdmin" class="space-y-3">
            <UFormField label="管理员密码">
              <UInput
                v-model="adminPassword"
                type="password"
                placeholder="请输入管理员密码"
                icon="i-lucide-lock"
                class="w-full"
                @keyup.enter="verifyAdminPassword"
              />
            </UFormField>
            <UButton
              color="primary"
              variant="solid"
              icon="i-lucide-unlock"
              @click="verifyAdminPassword"
            >
              验证密码
            </UButton>
          </div>

          <!-- 已登录状态 -->
          <div v-else class="space-y-3">
            <p class="text-sm text-green-600 flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
              您已获得编辑权限，可以添加、修改和删除数据
            </p>
            <UButton
              color="error"
              variant="soft"
              icon="i-lucide-log-out"
              @click="logoutAdmin"
            >
              退出编辑模式
            </UButton>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3 mt-6">
          <UButton
            color="primary"
            variant="solid"
            icon="i-lucide-save"
            :loading="saving"
            @click="saveSettings"
          >
            保存设置
          </UButton>
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-rotate-ccw"
            :loading="loading"
            @click="loadSettings"
          >
            重新加载
          </UButton>
          <UButton
            color="error"
            variant="soft"
            icon="i-lucide-trash-2"
            @click="clearSettings"
          >
            清除设置
          </UButton>
        </div>
      </UCard>

      <!-- 使用说明 -->
      <UCard class="mb-6 rounded-3xl shadow-lg">
        <template #header>
          <div class="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <UIcon name="i-lucide-help-circle" class="text-blue-500" />
            <span>使用说明</span>
          </div>
        </template>

        <div class="space-y-4 text-sm text-gray-600">
          <div class="flex gap-3">
            <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
            <p>在阿里云OSS控制台创建存储桶，并上传对应的JSON文件（如 时间表.json）</p>
          </div>
          <div class="flex gap-3">
            <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <p>设置存储桶为公共读权限，或生成带有有效期的签名URL</p>
          </div>
          <div class="flex gap-3">
            <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">3</div>
            <p>复制文件的访问URL，粘贴到上方对应的输入框中</p>
          </div>
          <div class="flex gap-3">
            <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">4</div>
            <p>点击"保存设置"，配置将保存在浏览器本地存储中</p>
          </div>
          <div class="flex gap-3">
            <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">5</div>
            <p>访问对应功能页面时，数据将从配置的URL加载和保存</p>
          </div>
        </div>
      </UCard>

      <!-- 返回首页 -->
      <div class="text-center">
        <UButton
          to="/"
          variant="soft"
          color="neutral"
          icon="i-lucide-home"
        >
          返回首页
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面元数据
useHead({
  title: '设置'
})

// 状态
const urls = ref({
  schedule: '',
  seating: '',
  budget: '',
  todo: ''
})

const defaultUrls = ref({
  schedule: '',
  seating: '',
  budget: '',
  todo: ''
})

const saving = ref(false)
const loading = ref(false)
const adminPassword = ref('')

const toast = useToast()

// 管理员权限
const { isAdmin, verifyPassword, logout } = useAdmin()

// 本地存储键名
const STORAGE_KEY = 'wedding-oss-config'

// 加载默认配置
async function loadDefaultConfig() {
  try {
    interface ConfigResponse {
      success: boolean
      data?: {
        features: {
          schedule: { defaultUrl: string }
          seating: { defaultUrl: string }
          budget: { defaultUrl: string }
          todo: { defaultUrl: string }
        }
      }
    }
    const response = await $fetch<ConfigResponse>('/api/config')
    if (response.success && response.data) {
      const features = response.data.features
      defaultUrls.value = {
        schedule: features.schedule?.defaultUrl || '',
        seating: features.seating?.defaultUrl || '',
        budget: features.budget?.defaultUrl || '',
        todo: features.todo?.defaultUrl || ''
      }
    }
  } catch (error) {
    console.error('加载默认配置失败:', error)
  }
}

// 从本地存储加载设置
function loadSettings() {
  loading.value = true
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      urls.value = {
        schedule: parsed.schedule || '',
        seating: parsed.seating || '',
        budget: parsed.budget || '',
        todo: parsed.todo || ''
      }
      toast.add({
        title: '加载成功',
        description: '已从本地存储加载配置',
        color: 'success'
      })
    } else {
      // 如果没有存储的配置，使用默认值
      urls.value = { ...defaultUrls.value }
      toast.add({
        title: '提示',
        description: '使用默认配置',
        color: 'info'
      })
    }
  } catch (error) {
    toast.add({
      title: '加载失败',
      description: '无法读取本地配置',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 保存设置到本地存储
function saveSettings() {
  saving.value = true
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls.value))
    toast.add({
      title: '保存成功',
      description: '配置已保存到本地存储',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: '保存失败',
      description: '无法写入本地存储',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// 清除设置
function clearSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    urls.value = {
      schedule: '',
      seating: '',
      budget: '',
      todo: ''
    }
    toast.add({
      title: '清除成功',
      description: '本地配置已清除，将使用默认值',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: '清除失败',
      description: '无法清除本地存储',
      color: 'error'
    })
  }
}

// 验证管理员密码
function verifyAdminPassword() {
  if (!adminPassword.value) {
    toast.add({
      title: '请输入密码',
      color: 'warning'
    })
    return
  }

  const success = verifyPassword(adminPassword.value)
  if (success) {
    toast.add({
      title: '验证成功',
      description: '已获得编辑权限',
      color: 'success'
    })
    adminPassword.value = ''
  } else {
    toast.add({
      title: '验证失败',
      description: '密码错误',
      color: 'error'
    })
  }
}

// 退出管理员模式
function logoutAdmin() {
  logout()
  toast.add({
    title: '已退出',
    description: '已切换到仅查看模式',
    color: 'info'
  })
}

// 初始化
onMounted(async () => {
  await loadDefaultConfig()
  loadSettings()
})
</script>
