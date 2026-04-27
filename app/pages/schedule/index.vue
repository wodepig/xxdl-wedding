<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-rose-100">
    <!-- 浮动爱心背景 -->
    <FloatingHearts />

    <div class="container mx-auto px-4 py-6 max-w-5xl relative z-10">
      <!-- 页面标题 -->
      <div class="text-center mb-8 pt-4">
        <div class="text-5xl mb-3">💒</div>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent mb-2">
          婚礼时间表
        </h1>
        <p class="text-gray-600">规划您的完美婚礼日程</p>
        <div class="mt-3 flex justify-center gap-2 text-2xl">
          <span>💕</span>
          <span>💍</span>
          <span>🥂</span>
        </div>
      </div>

      <!-- 倒计时卡片 -->
      <CountdownCard v-if="weddingDate" :target-date="weddingDate" />

      <!-- 日期管理 -->
      <UCard class="mb-6 rounded-3xl shadow-lg">
        <template #header>
          <div class="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <UIcon name="i-lucide-calendar" class="text-pink-500" />
            <span>选择日期</span>
          </div>
        </template>

        <!-- 日期标签 -->
        <div class="flex flex-wrap gap-2 mb-4">
          <UButton
            v-for="schedule in schedules"
            :key="schedule.date"
            :variant="currentDate === schedule.date ? 'solid' : 'soft'"
            :color="currentDate === schedule.date ? 'primary' : 'neutral'"
            class="rounded-full transition-all duration-300"
            @click="selectDate(schedule.date)"
          >
            {{ formatDate(schedule.date) }}
            <UPopover
              v-if="isAdmin && schedules.length > 1"
              v-model:open="deleteDatePopover[schedule.date]"
            >
              <UIcon
                name="i-lucide-x"
                class="ml-1 w-4 h-4 hover:text-red-500 cursor-pointer"
                @click.stop="deleteDatePopover[schedule.date] = true"
              />
              <template #content>
                <div class="p-4 w-64">
                  <p class="text-sm text-gray-700 mb-3">
                    确定要删除 <strong>{{ formatDate(schedule.date) }}</strong> 的所有安排吗？
                  </p>
                  <div class="flex justify-end gap-2">
                    <UButton size="xs" variant="ghost" @click="deleteDatePopover[schedule.date] = false">
                      取消
                    </UButton>
                    <UButton size="xs" color="error" @click="deleteDate(schedule.date)">
                      删除
                    </UButton>
                  </div>
                </div>
              </template>
            </UPopover>
          </UButton>
        </div>

        <!-- 添加日期 -->
        <div v-if="isAdmin" class="flex gap-2 items-end">
          <UFormField label="添加新日期" class="flex-1">
            <UInputDate ref="newDateInputRef" v-model="newDateValue">
              <template #trailing>
                <UPopover :reference="newDateInputRef?.inputsRef[3]?.$el">
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="i-lucide-calendar"
                    aria-label="选择日期"
                    class="px-0"
                  />
                  <template #content>
                    <UCalendar v-model="newDateValue" class="p-2" />
                  </template>
                </UPopover>
              </template>
            </UInputDate>
          </UFormField>
          <UButton
            color="primary"
            variant="solid"
            icon="i-lucide-plus"
            @click="addDate"
          >
            添加
          </UButton>
        </div>
      </UCard>

      <!-- 当前日期的时间安排 -->
      <UCard v-if="currentSchedule" class="mb-6 rounded-3xl shadow-lg">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <UIcon name="i-lucide-clock" class="text-pink-500" />
              <span>{{ formatDate(currentDate) }} 安排</span>
            </div>
            <UBadge color="primary" variant="soft">
              {{ currentSchedule.timePoints.length }} 项安排
            </UBadge>
          </div>
        </template>

        <!-- 添加新安排表单 -->
        <div v-if="isAdmin" class="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mb-4 border border-pink-100">
          <h3 class="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
            <UIcon name="i-lucide-plus-circle" class="text-pink-500" />
            添加新安排
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <UFormField label="时间" class="md:col-span-3">
              <div class="flex gap-2">
                <USelect
                  v-model="newTimeHour"
                  :items="hourOptions"
                  placeholder="时"
                  class="w-20"
                />
                <span class="self-center text-gray-400">:</span>
                <USelect
                  v-model="newTimeMinute"
                  :items="minuteOptions"
                  placeholder="分"
                  class="w-20"
                />
              </div>
            </UFormField>
            <UFormField label="事项" class="md:col-span-4">
              <UInput
                v-model="newTimePoint.event"
                placeholder="例如：新娘化妆"
                icon="i-lucide-sparkles"
              />
            </UFormField>
            <UFormField label="备注" class="md:col-span-4">
              <UInput
                v-model="newTimePoint.note"
                placeholder="详细说明..."
                icon="i-lucide-file-text"
              />
            </UFormField>
            <div class="md:col-span-1 flex items-end">
              <UButton
                color="success"
                variant="solid"
                icon="i-lucide-check"
                class="w-full justify-center"
                @click="addTimePoint"
              />
            </div>
          </div>
        </div>

        <!-- 耗时显示控制 -->
        <div class="flex justify-end mb-3">
          <UButton
            variant="ghost"
            size="sm"
            :icon="showIntervals ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            @click="showIntervals = !showIntervals"
          >
            {{ showIntervals ? '隐藏耗时' : '显示耗时' }}
          </UButton>
        </div>

        <!-- 时间点列表 -->
        <div v-if="currentSchedule.timePoints.length > 0" class="space-y-2">
          <template v-for="(point, index) in currentSchedule.timePoints" :key="point.id">
            <!-- 安排项 -->
            <div
              class="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-pink-50/50"
              :class="{ 'bg-pink-50/30': index % 2 === 0 }"
            >
              <!-- 时间 -->
              <div class="text-lg font-bold text-pink-600 min-w-[70px]">
                {{ point.time }}
              </div>

              <!-- 事项 -->
              <div class="flex-1">
                <div class="font-medium text-gray-800">{{ point.event }}</div>
                <div v-if="point.note" class="text-sm text-gray-500">{{ point.note }}</div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-1">
                <UButton
                  color="success"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-check-circle"
                  @click="useTimeInCalculator(point.time)"
                />
                <template v-if="isAdmin">
                  <UButton
                    color="info"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-pencil"
                    @click="editTimePoint(point)"
                  />
                  <UPopover v-model:open="deleteTimePopover[point.id]">
                    <UButton
                      color="error"
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-trash-2"
                      @click="deleteTimePopover[point.id] = true"
                    />
                    <template #content>
                      <div class="p-4 w-56">
                        <p class="text-sm text-gray-700 mb-3">
                          确定要删除这个安排吗？
                        </p>
                        <div class="flex justify-end gap-2">
                          <UButton size="xs" variant="ghost" @click="deleteTimePopover[point.id] = false">
                            取消
                          </UButton>
                          <UButton size="xs" color="error" @click="deleteTimePoint(point.id)">
                            删除
                          </UButton>
                        </div>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </div>
            </div>

            <!-- 间隔时间 - 显示在两个安排项之间 -->
            <div
              v-if="showIntervals && index < currentSchedule.timePoints.length - 1 && currentSchedule.timePoints[index + 1]"
              class="flex justify-center py-0.5"
            >
              <div class="flex items-center gap-1.5 px-3 py-0.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full shadow-sm">
                <UIcon name="i-lucide-arrow-down" class="w-3.5 h-3.5 text-amber-500" />
                <span class="text-xs font-medium text-amber-700">
                  {{ calculateInterval(point.time, currentSchedule.timePoints[index + 1]!.time) }}
                </span>
              </div>
            </div>
          </template>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-8 text-gray-400">
          <UIcon name="i-lucide-calendar-x" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无安排，请添加时间点</p>
        </div>
      </UCard>

      <!-- 时间计算工具 -->
      <TimeCalculator ref="timeCalculatorRef" @apply-time="onApplyTimeFromCalculator" />
    </div>

    <!-- 编辑对话框 -->
    <UModal v-model:open="showEditModal" title="编辑安排">
      <template #body>
        <UFormField label="时间" class="mb-3">
          <div class="flex gap-2">
            <USelect
              v-model="editTimeHour"
              :items="hourOptions"
              placeholder="时"
              class="w-20"
            />
            <span class="self-center text-gray-400">:</span>
            <USelect
              v-model="editTimeMinute"
              :items="minuteOptions"
              placeholder="分"
              class="w-20"
            />
          </div>
        </UFormField>

        <UFormField label="事项" class="mb-3">
          <UInput
            v-model="editingPoint.event"
            placeholder="事项名称"
            icon="i-lucide-sparkles"
          />
        </UFormField>

        <UFormField label="备注">
          <UInput
            v-model="editingPoint.note"
            placeholder="备注说明"
            icon="i-lucide-file-text"
          />
        </UFormField>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showEditModal = false">取消</UButton>
          <UButton color="primary" @click="saveEdit">保存</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
// 类型定义
interface TimePoint {
  id: string
  time: string
  event: string
  note?: string
}

interface WeddingDaySchedule {
  date: string
  timePoints: TimePoint[]
}

interface WeddingSchedule {
  weddingDate?: string
  schedules: WeddingDaySchedule[]
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 页面元数据
useHead({
  title: '婚礼时间表'
})

// 状态
const schedules = ref<WeddingDaySchedule[]>([])
const weddingDate = ref<string>('')
const currentDate = ref<string>('')
const showIntervals = ref(true)
const showEditModal = ref(false)
const editingPoint = ref<Partial<TimePoint>>({})

// Popover 状态
const deleteDatePopover = ref<Record<string, boolean>>({})
const deleteTimePopover = ref<Record<string, boolean>>({})

// OSS URL 配置
const ossUrl = ref<string>('')

// UInputDate 使用的日期对象
const newDateValue = ref<any>(null)

// UInputDate 引用
const newDateInputRef = useTemplateRef('newDateInputRef')
const timeCalculatorRef = useTemplateRef('timeCalculatorRef')

// 时间选择器状态
const newTimeHour = ref<string>('')
const newTimeMinute = ref<string>('')
const editTimeHour = ref<string>('')
const editTimeMinute = ref<string>('')

// 时间选项
const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: String(i).padStart(2, '0')
}))

const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: String(i).padStart(2, '0')
}))

const newTimePoint = ref<Partial<TimePoint>>({
  time: '',
  event: '',
  note: ''
})

const toast = useToast()

// 管理员权限
const { isAdmin } = useAdmin()

// 将 DateValue 转换为字符串格式 YYYY-MM-DD
function calendarDateToString(date: any): string {
  if (!date) return ''
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

// 计算属性：当前选中的日程
const currentSchedule = computed(() => {
  return schedules.value.find((s: WeddingDaySchedule) => s.date === currentDate.value)
})

// 从本地存储加载 OSS URL
function loadOssUrl() {
  try {
    const stored = localStorage.getItem('wedding-oss-config')
    if (stored) {
      const parsed = JSON.parse(stored)
      ossUrl.value = parsed.schedule || ''
    }
  } catch (error) {
    console.error('加载OSS配置失败:', error)
  }
}

// 加载数据
async function loadData() {
  try {
    // 加载 OSS URL
    loadOssUrl()

    const response = await $fetch<ApiResponse<WeddingSchedule>>('/api/schedule', {
      query: ossUrl.value ? { url: ossUrl.value } : undefined
    })
    if (response.data) {
      schedules.value = response.data.schedules || []
      weddingDate.value = response.data.weddingDate || ''

      // 默认选中第一个日期
      if (schedules.value.length > 0 && !currentDate.value) {
        const firstSchedule = schedules.value[0]
        if (firstSchedule) {
          currentDate.value = firstSchedule.date
        }
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    toast.add({
      title: '加载失败',
      description: '无法加载时间表数据',
      color: 'error'
    })
  }
}

// 选择日期
function selectDate(date: string) {
  currentDate.value = date
}

// 添加日期
async function addDate() {
  if (!newDateValue.value) {
    toast.add({
      title: '请输入日期',
      color: 'warning'
    })
    return
  }

  const dateStr = calendarDateToString(newDateValue.value)

  try {
    const response = await $fetch<ApiResponse<WeddingSchedule>>('/api/schedule/date', {
      method: 'POST',
      body: { date: dateStr, url: ossUrl.value }
    })

    if (response.success && response.data) {
      schedules.value = response.data.schedules
      currentDate.value = dateStr
      newDateValue.value = null
      toast.add({
        title: '添加成功',
        color: 'success'
      })
    } else {
      toast.add({
        title: response.error || '添加失败',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: '添加失败',
      color: 'error'
    })
  }
}

// 删除日期
async function deleteDate(date: string) {
  try {
    const response = await $fetch<ApiResponse<WeddingSchedule>>(`/api/schedule/date/${date}`, {
      method: 'DELETE',
      query: ossUrl.value ? { url: ossUrl.value } : undefined
    })

    if (response.success && response.data) {
      schedules.value = response.data.schedules
      if (currentDate.value === date) {
        currentDate.value = schedules.value[0]?.date || ''
      }
      deleteDatePopover.value[date] = false
      toast.add({
        title: '删除成功',
        color: 'success'
      })
    } else {
      toast.add({
        title: response.error || '删除失败',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: '删除失败',
      color: 'error'
    })
  }
}

// 添加时间点
async function addTimePoint() {
  const timeStr = `${newTimeHour.value}:${newTimeMinute.value}`
  if (!currentDate.value || !newTimeHour.value || !newTimeMinute.value || !newTimePoint.value.event) {
    toast.add({
      title: '请填写完整信息',
      color: 'warning'
    })
    return
  }

  try {
    const response = await $fetch<ApiResponse<WeddingSchedule>>(`/api/schedule/date/${currentDate.value}/timepoint`, {
      method: 'POST',
      body: {
        ...newTimePoint.value,
        time: timeStr,
        url: ossUrl.value
      }
    })

    if (response.success && response.data) {
      schedules.value = response.data.schedules
      // 重置表单
      newTimePoint.value = { time: '', event: '', note: '' }
      newTimeHour.value = ''
      newTimeMinute.value = ''
      toast.add({
        title: '添加成功',
        color: 'success'
      })
    } else {
      toast.add({
        title: response.error || '添加失败',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: '添加失败',
      color: 'error'
    })
  }
}

// 编辑时间点
function editTimePoint(point: TimePoint) {
  editingPoint.value = { ...point }
  const [hour, minute] = point.time.split(':')
  editTimeHour.value = hour || ''
  editTimeMinute.value = minute || ''
  showEditModal.value = true
}

// 使用时间到计算器
function useTimeInCalculator(time: string) {
  if (timeCalculatorRef.value && currentDate.value) {
    timeCalculatorRef.value.setBaseTime(currentDate.value, time)
    // 滚动到时间计算器
    timeCalculatorRef.value.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    toast.add({
      title: '已设置基准时间',
      description: `基准时间已设为 ${time}`,
      color: 'success'
    })
  }
}

// 从计算器应用时间到添加事项
function onApplyTimeFromCalculator(time: string) {
  const [hour, minute] = time.split(':')
  newTimeHour.value = hour || ''
  newTimeMinute.value = minute || ''
  toast.add({
    title: '时间已应用',
    description: `添加事项时间已设为 ${time}`,
    color: 'success'
  })
}

// 保存编辑
async function saveEdit() {
  if (!currentDate.value || !editingPoint.value.id) return

  const timeStr = `${editTimeHour.value}:${editTimeMinute.value}`

  try {
    const response = await $fetch<ApiResponse<WeddingSchedule>>(`/api/schedule/date/${currentDate.value}/timepoint/${editingPoint.value.id}`, {
      method: 'PUT',
      body: {
        ...editingPoint.value,
        time: timeStr,
        url: ossUrl.value
      }
    })

    if (response.success && response.data) {
      schedules.value = response.data.schedules
      showEditModal.value = false
      toast.add({
        title: '更新成功',
        color: 'success'
      })
    } else {
      toast.add({
        title: response.error || '更新失败',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: '更新失败',
      color: 'error'
    })
  }
}

// 删除时间点
async function deleteTimePoint(id: string) {
  if (!currentDate.value) return

  try {
    const response = await $fetch<ApiResponse<WeddingSchedule>>(`/api/schedule/date/${currentDate.value}/timepoint/${id}`, {
      method: 'DELETE',
      query: ossUrl.value ? { url: ossUrl.value } : undefined
    })

    if (response.success && response.data) {
      schedules.value = response.data.schedules
      deleteTimePopover.value[id] = false
      toast.add({
        title: '删除成功',
        color: 'success'
      })
    } else {
      toast.add({
        title: response.error || '删除失败',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: '删除失败',
      color: 'error'
    })
  }
}

// 格式化日期显示
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  return `${month}月${day}日 ${weekDay}`
}

// 计算两个时间之间的间隔
function calculateInterval(time1: string, time2: string): string {
  const parts1 = time1.split(':').map(Number)
  const parts2 = time2.split(':').map(Number)

  const h1 = parts1[0] ?? 0
  const m1 = parts1[1] ?? 0
  const h2 = parts2[0] ?? 0
  const m2 = parts2[1] ?? 0

  const minutes1 = h1 * 60 + m1
  const minutes2 = h2 * 60 + m2
  const diff = minutes2 - minutes1

  if (diff < 0) return ''

  const hours = Math.floor(diff / 60)
  const mins = diff % 60

  if (hours > 0 && mins > 0) {
    return `${hours}小时${mins}分`
  } else if (hours > 0) {
    return `${hours}小时`
  } else {
    return `${mins}分钟`
  }
}

// 初始化
onMounted(() => {
  loadData()
})
</script>
