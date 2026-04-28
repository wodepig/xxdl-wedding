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
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-2">
            <UButton
              v-if="isAdmin && currentSchedule.timePoints.length > 0"
              color="warning"
              variant="soft"
              size="sm"
              icon="i-lucide-clock-arrow-up"
              @click="openBatchTimeModal"
            >
              批量调整时间
            </UButton>
            <UButton
              color="secondary"
              variant="soft"
              size="sm"
              icon="i-lucide-download"
              @click="exportSchedule"
            >
              导出配置
            </UButton>
            <UButton
              v-if="isAdmin"
              color="info"
              variant="soft"
              size="sm"
              icon="i-lucide-upload"
              @click="openImportModal"
            >
              导入配置
            </UButton>
          </div>
          <UButton
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-copy"
            @click="copyScheduleText"
          >
            复制当天流程
          </UButton>
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
              <div class="text-lg font-bold text-pink-600 min-w-[70px] text-center">
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

        <!-- 同步变动选项 -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <UCheckbox
            v-model="syncFollowingTime"
            label="同步调整后续事项时间"
            description="勾选后，当前事项之后的所有事项时间将同步增加或减少相同分钟数"
          />
          <div v-if="syncFollowingTime && editingPoint.originalTime" class="mt-2 text-sm text-amber-600">
            时间变动：{{ editingPoint.originalTime }} → {{ editTimeHour }}:{{ editTimeMinute }}
            ({{ calculateTimeDiff(editingPoint.originalTime, `${editTimeHour}:${editTimeMinute}`) }})
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showEditModal = false">取消</UButton>
          <UButton color="primary" @click="saveEdit">保存</UButton>
        </div>
      </template>
    </UModal>

    <!-- 批量调整时间对话框 -->
    <UModal v-model:open="showBatchTimeModal" title="批量调整时间">
      <template #body>
        <p class="text-sm text-gray-600 mb-4">
          将所有事项时间统一提前或延后
        </p>
        <UFormField label="调整分钟数" class="mb-3">
          <div class="flex items-center gap-3">
            <UButton
              color="error"
              variant="soft"
              @click="batchTimeAdjust = Math.max(-1440, batchTimeAdjust - 5)"
            >
              -5分钟
            </UButton>
            <UInput
              v-model="batchTimeAdjust"
              type="number"
              class="w-24 text-center"
            />
            <UButton
              color="success"
              variant="soft"
              @click="batchTimeAdjust = Math.min(1440, batchTimeAdjust + 5)"
            >
              +5分钟
            </UButton>
          </div>
        </UFormField>
        <p class="text-xs text-gray-500">
          正数表示延后，负数表示提前
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showBatchTimeModal = false">取消</UButton>
          <UButton color="warning" @click="applyBatchTimeAdjust">应用调整</UButton>
        </div>
      </template>
    </UModal>

    <!-- 导入配置对话框 -->
    <UModal v-model:open="showImportModal" title="导入配置">
      <template #body>
        <p class="text-sm text-gray-600 mb-4">
          选择JSON配置文件导入，将覆盖当前日期的所有事项
        </p>
        <UFormField label="选择文件" class="mb-3">
          <input
            ref="importFileInput"
            type="file"
            accept=".json"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            @change="onImportFileChange"
          />
        </UFormField>
        <div v-if="importPreview.length > 0" class="mt-4">
          <p class="text-sm font-medium text-gray-700 mb-2">预览 ({{ importPreview.length }} 项):</p>
          <div class="max-h-40 overflow-y-auto space-y-1 bg-gray-50 rounded-lg p-2">
            <div v-for="(item, idx) in importPreview.slice(0, 5)" :key="idx" class="text-sm text-gray-600">
              {{ item.time }} - {{ item.event }}
            </div>
            <div v-if="importPreview.length > 5" class="text-sm text-gray-400 italic">
              ...还有 {{ importPreview.length - 5 }} 项
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showImportModal = false">取消</UButton>
          <UButton color="info" :disabled="importPreview.length === 0" @click="applyImport">确认导入</UButton>
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

interface ImportItem {
  time: string
  event: string
  note?: string
}

// 页面元数据
useHead({
  title: '婚礼时间表'
})

// 状态
const schedules = ref<WeddingDaySchedule[]>([])
const weddingDate = ref<string>('')
const currentDate = ref<string>('')
const showBatchTimeModal = ref(false)
const batchTimeAdjust = ref(0)
const showIntervals = ref(true)
const showEditModal = ref(false)
const editingPoint = ref<Partial<TimePoint> & { originalTime?: string }>({})
const syncFollowingTime = ref(false)
const editingPointIndex = ref(-1)
const showImportModal = ref(false)
const importPreview = ref<ImportItem[]>([])
const importFileInput = ref<HTMLInputElement | null>(null)

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
  editingPoint.value = { ...point, originalTime: point.time }
  const [hour, minute] = point.time.split(':')
  editTimeHour.value = hour || ''
  editTimeMinute.value = minute || ''
  syncFollowingTime.value = false

  // 找到当前编辑项的索引
  if (currentSchedule.value) {
    editingPointIndex.value = currentSchedule.value.timePoints.findIndex(p => p.id === point.id)
  }

  showEditModal.value = true
}

// 计算时间差（分钟）
function calculateTimeDiff(time1: string, time2: string): string {
  const [h1, m1] = time1.split(':').map(Number)
  const [h2, m2] = time2.split(':').map(Number)
  const minutes1 = (h1 ?? 0) * 60 + (m1 ?? 0)
  const minutes2 = (h2 ?? 0) * 60 + (m2 ?? 0)
  const diff = minutes2 - minutes1

  if (diff === 0) return '无变动'
  if (diff > 0) return `+${diff}分钟`
  return `${diff}分钟`
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
  const originalTimeStr = editingPoint.value.originalTime || timeStr

  // 计算时间差
  const [origHour, origMin] = originalTimeStr.split(':').map(Number)
  const [newHour, newMin] = timeStr.split(':').map(Number)
  const origMinutes = (origHour ?? 0) * 60 + (origMin ?? 0)
  const newMinutes = (newHour ?? 0) * 60 + (newMin ?? 0)
  const timeDiff = newMinutes - origMinutes

  try {
    // 先更新当前事项
    const response = await $fetch<ApiResponse<WeddingSchedule>>(`/api/schedule/date/${currentDate.value}/timepoint/${editingPoint.value.id}`, {
      method: 'PUT',
      body: {
        ...editingPoint.value,
        time: timeStr,
        url: ossUrl.value
      }
    })

    if (!response.success) {
      toast.add({
        title: response.error || '更新失败',
        color: 'error'
      })
      return
    }

    // 如果勾选了同步变动，更新后续所有事项
    if (syncFollowingTime.value && timeDiff !== 0 && currentSchedule.value && editingPointIndex.value >= 0) {
      const followingPoints = currentSchedule.value.timePoints.slice(editingPointIndex.value + 1)

      for (const point of followingPoints) {
        const [ph, pm] = point.time.split(':').map(Number)
        const pointMinutes = (ph ?? 0) * 60 + (pm ?? 0) + timeDiff

        // 检查是否在有效范围内
        if (pointMinutes < 0 || pointMinutes >= 24 * 60) {
          toast.add({
            title: '时间超出范围',
            description: `${point.event} 调整后时间超出 00:00 - 23:59 范围`,
            color: 'warning'
          })
          continue
        }

        const adjustedHour = Math.floor(pointMinutes / 60)
        const adjustedMin = pointMinutes % 60
        const adjustedTimeStr = `${String(adjustedHour).padStart(2, '0')}:${String(adjustedMin).padStart(2, '0')}`

        await $fetch<ApiResponse<WeddingSchedule>>(`/api/schedule/date/${currentDate.value}/timepoint/${point.id}`, {
          method: 'PUT',
          body: {
            ...point,
            time: adjustedTimeStr,
            url: ossUrl.value
          }
        })
      }
    }

    // 重新加载数据
    await loadData()
    showEditModal.value = false

    if (syncFollowingTime.value && timeDiff !== 0) {
      toast.add({
        title: '更新成功',
        description: `已同步调整后续事项时间`,
        color: 'success'
      })
    } else {
      toast.add({
        title: '更新成功',
        color: 'success'
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

function copyScheduleText() {
  if (!currentSchedule.value || currentSchedule.value.timePoints.length === 0) {
    toast.add({
      title: '没有可复制的流程',
      color: 'warning'
    })
    return
  }

  const lines: string[] = []
  const points = currentSchedule.value.timePoints

  // 添加标题
  lines.push(`📅 ${formatDate(currentDate.value)} 婚礼流程`)
  lines.push('')

  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const nextPoint = points[i + 1]
    const startTime = point.time
    const endTime = nextPoint ? nextPoint.time : ''
    const duration = nextPoint ? calculateInterval(point.time, nextPoint.time) : ''

    // 事项序号
    lines.push(`${i + 1}. ${point.event}`)

    // 时间信息
    if (endTime && duration) {
      lines.push(`   ⏰ ${startTime} - ${endTime}（预计${duration}）`)
    } else {
      lines.push(`   ⏰ ${startTime} 开始`)
    }

    // 备注信息
    if (point.note) {
      lines.push(`   📝 ${point.note}`)
    }

    // 分隔线（最后一项除外）
    if (i < points.length - 1) {
      lines.push('')
    }
  }

  const text = lines.join('\n')

  navigator.clipboard.writeText(text).then(() => {
    toast.add({
      title: '复制成功',
      description: `已复制 ${points.length} 项流程`,
      color: 'success'
    })
  }).catch(() => {
    toast.add({
      title: '复制失败',
      color: 'error'
    })
  })
}

// 调整单个事项时间
async function adjustTime(point: TimePoint, minutes: number) {
  if (!currentDate.value) return

  const [hour, minute] = point.time.split(':').map(Number)
  const totalMinutes = (hour ?? 0) * 60 + (minute ?? 0) + minutes

  // 确保时间在 00:00 - 23:59 范围内
  if (totalMinutes < 0 || totalMinutes >= 24 * 60) {
    toast.add({
      title: '时间超出范围',
      description: '时间必须在 00:00 - 23:59 之间',
      color: 'warning'
    })
    return
  }

  const newHour = Math.floor(totalMinutes / 60)
  const newMinute = totalMinutes % 60
  const newTimeStr = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`

  try {
    const response = await $fetch<ApiResponse<WeddingSchedule>>(`/api/schedule/date/${currentDate.value}/timepoint/${point.id}`, {
      method: 'PUT',
      body: {
        ...point,
        time: newTimeStr,
        url: ossUrl.value
      }
    })

    if (response.success && response.data) {
      schedules.value = response.data.schedules
      toast.add({
        title: '时间调整成功',
        description: `${point.event}: ${point.time} → ${newTimeStr}`,
        color: 'success'
      })
    } else {
      toast.add({
        title: response.error || '调整失败',
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: '调整失败',
      color: 'error'
    })
  }
}

// 打开批量调整时间对话框
function openBatchTimeModal() {
  batchTimeAdjust.value = 0
  showBatchTimeModal.value = true
}

// 应用批量时间调整
async function applyBatchTimeAdjust() {
  if (!currentDate.value || !currentSchedule.value || batchTimeAdjust.value === 0) {
    showBatchTimeModal.value = false
    return
  }

  const adjustMinutes = batchTimeAdjust.value
  const timePoints = currentSchedule.value.timePoints

  // 检查所有时间是否在有效范围内
  for (const point of timePoints) {
    const [hour, minute] = point.time.split(':').map(Number)
    const totalMinutes = (hour ?? 0) * 60 + (minute ?? 0) + adjustMinutes
    if (totalMinutes < 0 || totalMinutes >= 24 * 60) {
      toast.add({
        title: '时间超出范围',
        description: `${point.event} 调整后时间超出 00:00 - 23:59 范围`,
        color: 'error'
      })
      return
    }
  }

  // 依次更新所有时间点
  let successCount = 0
  for (const point of timePoints) {
    const [hour, minute] = point.time.split(':').map(Number)
    const totalMinutes = (hour ?? 0) * 60 + (minute ?? 0) + adjustMinutes
    const newHour = Math.floor(totalMinutes / 60)
    const newMinute = totalMinutes % 60
    const newTimeStr = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`

    try {
      const response = await $fetch<ApiResponse<WeddingSchedule>>(`/api/schedule/date/${currentDate.value}/timepoint/${point.id}`, {
        method: 'PUT',
        body: {
          ...point,
          time: newTimeStr,
          url: ossUrl.value
        }
      })

      if (response.success) {
        successCount++
      }
    } catch (error) {
      console.error(`更新 ${point.event} 失败:`, error)
    }
  }

  // 重新加载数据
  await loadData()
  showBatchTimeModal.value = false

  if (successCount === timePoints.length) {
    toast.add({
      title: '批量调整成功',
      description: `已调整 ${successCount} 个事项的时间`,
      color: 'success'
    })
  } else {
    toast.add({
      title: '部分调整成功',
      description: `成功 ${successCount}/${timePoints.length} 个`,
      color: 'warning'
    })
  }
}

// 导出配置
function exportSchedule() {
  if (!currentSchedule.value) return

  const exportData = {
    date: currentDate.value,
    exportTime: new Date().toISOString(),
    timePoints: currentSchedule.value.timePoints.map(point => ({
      time: point.time,
      event: point.event,
      note: point.note || ''
    }))
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  // 生成文件名：婚礼时间表_2025-05-20_14-30-00.json
  const now = new Date()
  const dateStr = currentDate.value
  const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`
  link.download = `婚礼时间表_${dateStr}_${timeStr}.json`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.add({
    title: '导出成功',
    description: `已导出 ${currentSchedule.value.timePoints.length} 个事项`,
    color: 'success'
  })
}

// 打开导入对话框
function openImportModal() {
  importPreview.value = []
  if (importFileInput.value) {
    importFileInput.value.value = ''
  }
  showImportModal.value = true
}

// 处理导入文件选择
function onImportFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    importPreview.value = []
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const data = JSON.parse(content)

      // 验证数据结构
      if (data.timePoints && Array.isArray(data.timePoints)) {
        // 验证每个事项的时间格式
        const validItems: ImportItem[] = []
        for (const item of data.timePoints) {
          if (item.time && item.event && /^\d{2}:\d{2}$/.test(item.time)) {
            validItems.push({
              time: item.time,
              event: item.event,
              note: item.note || ''
            })
          }
        }

        if (validItems.length === 0) {
          toast.add({
            title: '文件格式错误',
            description: '未找到有效的事项数据',
            color: 'error'
          })
          importPreview.value = []
          return
        }

        // 按时间排序
        validItems.sort((a, b) => a.time.localeCompare(b.time))
        importPreview.value = validItems

        toast.add({
          title: '文件读取成功',
          description: `找到 ${validItems.length} 个有效事项`,
          color: 'success'
        })
      } else {
        toast.add({
          title: '文件格式错误',
          description: 'JSON文件缺少 timePoints 数组',
          color: 'error'
        })
        importPreview.value = []
      }
    } catch (error) {
      toast.add({
        title: '文件解析失败',
        description: '请确保上传的是有效的JSON文件',
        color: 'error'
      })
      importPreview.value = []
    }
  }
  reader.readAsText(file)
}

// 应用导入
async function applyImport() {
  if (!currentDate.value || importPreview.value.length === 0) return

  // 先删除当前日期的所有事项
  const currentPoints = currentSchedule.value?.timePoints || []

  // 删除现有事项
  for (const point of currentPoints) {
    try {
      await $fetch<ApiResponse<WeddingSchedule>>(`/api/schedule/date/${currentDate.value}/timepoint/${point.id}`, {
        method: 'DELETE',
        query: ossUrl.value ? { url: ossUrl.value } : undefined
      })
    } catch (error) {
      console.error(`删除 ${point.event} 失败:`, error)
    }
  }

  // 添加新的事项
  let successCount = 0
  for (const item of importPreview.value) {
    try {
      const response = await $fetch<ApiResponse<WeddingSchedule>>(`/api/schedule/date/${currentDate.value}/timepoint`, {
        method: 'POST',
        body: {
          time: item.time,
          event: item.event,
          note: item.note,
          url: ossUrl.value
        }
      })

      if (response.success) {
        successCount++
      }
    } catch (error) {
      console.error(`添加 ${item.event} 失败:`, error)
    }
  }

  // 重新加载数据
  await loadData()
  showImportModal.value = false
  importPreview.value = []
  if (importFileInput.value) {
    importFileInput.value.value = ''
  }

  if (successCount === importPreview.value.length) {
    toast.add({
      title: '导入成功',
      description: `成功导入 ${successCount} 个事项`,
      color: 'success'
    })
  } else {
    toast.add({
      title: '部分导入成功',
      description: `成功 ${successCount}/${importPreview.value.length} 个`,
      color: 'warning'
    })
  }
}

// 初始化
onMounted(() => {
  loadData()
})
</script>
