<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100">
    <FloatingHearts />

    <div class="container mx-auto px-4 py-8 max-w-5xl relative z-10">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">✅</div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          待办事项
        </h1>
        <p class="text-gray-600 mt-2">婚礼筹备清单</p>
      </div>

      <!-- 日期管理 -->
      <UCard class="mb-6 rounded-3xl shadow-lg">
        <template #header>
          <div class="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <UIcon name="i-lucide-calendar" class="text-amber-500" />
            <span>选择日期</span>
          </div>
        </template>

        <!-- 日期标签 -->
        <div class="flex flex-wrap gap-2 mb-4">
          <UButton
            v-for="day in todoDays"
            :key="day.date"
            :variant="currentDate === day.date ? 'solid' : 'soft'"
            :color="currentDate === day.date ? 'primary' : 'neutral'"
            class="rounded-full transition-all duration-300"
            @click="selectDate(day.date)"
          >
            {{ formatDate(day.date) }}
            <UPopover
              v-if="isAdmin && todoDays.length > 1"
              v-model:open="deleteDatePopover[day.date]"
            >
              <UIcon
                name="i-lucide-x"
                class="ml-1 w-4 h-4 hover:text-red-500 cursor-pointer"
                @click.stop="deleteDatePopover[day.date] = true"
              />
              <template #content>
                <div class="p-4 w-64">
                  <p class="text-sm text-gray-700 mb-3">
                    确定要删除 <strong>{{ formatDate(day.date) }}</strong> 的所有待办吗？
                  </p>
                  <div class="flex justify-end gap-2">
                    <UButton size="xs" variant="ghost" @click="deleteDatePopover[day.date] = false">
                      取消
                    </UButton>
                    <UButton size="xs" color="error" @click="deleteDate(day.date)">
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

      <!-- 当前日期的待办列表 -->
      <UCard v-if="currentDay" class="mb-6 rounded-3xl shadow-lg">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <UIcon name="i-lucide-check-square" class="text-amber-500" />
              <span>{{ formatDate(currentDate) }} 待办</span>
            </div>
            <div class="flex items-center gap-2">
              <UBadge color="success" variant="soft">
                {{ completedCount }} 已完成
              </UBadge>
              <UBadge color="warning" variant="soft">
                {{ pendingCount }} 待完成
              </UBadge>
            </div>
          </div>
        </template>

        <!-- 添加新待办表单 -->
        <div v-if="isAdmin" class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-4 border border-amber-100">
          <h3 class="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
            <UIcon name="i-lucide-plus-circle" class="text-amber-500" />
            添加新待办
          </h3>
          <div class="space-y-3">
            <UFormField label="标题">
              <UInput
                v-model="newTodo.title"
                placeholder="例如：预订婚礼场地"
                icon="i-lucide-type"
              />
            </UFormField>
            <UFormField label="详情">
              <UTextarea
                v-model="newTodo.detail"
                placeholder="详细说明..."
                :rows="3"
              />
            </UFormField>
            <UFormField label="优先级">
              <USelect
                v-model="newTodo.priority"
                :items="priorityOptions"
                placeholder="选择优先级"
              />
            </UFormField>
            <UButton
              color="success"
              variant="solid"
              icon="i-lucide-check"
              class="w-full justify-center"
              @click="addTodo"
            >
              添加待办
            </UButton>
          </div>
        </div>

        <!-- 待办列表 -->
        <div v-if="currentDay.items.length > 0" class="space-y-3">
          <div
            v-for="todo in sortedTodos"
            :key="todo.id"
            class="p-4 rounded-xl transition-all duration-300"
            :class="getTodoCardClass(todo)"
          >
            <div class="flex items-start gap-3">
              <!-- 完成状态复选框 -->
              <div class="pt-1">
                <UCheckbox
                  :model-value="todo.completed"
                  @update:model-value="toggleTodo(todo)"
                />
              </div>

              <!-- 内容区域 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="font-medium text-lg"
                    :class="todo.completed ? 'line-through text-gray-400' : 'text-gray-800'"
                  >
                    {{ todo.title }}
                  </span>
                  <UBadge
                    :color="getPriorityColor(todo.priority)"
                    size="xs"
                    variant="soft"
                  >
                    {{ getPriorityLabel(todo.priority) }}
                  </UBadge>
                </div>
                <p
                  v-if="todo.detail"
                  class="mt-2 text-sm whitespace-pre-wrap"
                  :class="todo.completed ? 'text-gray-400 line-through' : 'text-gray-600'"
                >
                  {{ todo.detail }}
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  创建于 {{ formatTime(todo.createdAt) }}
                  <span v-if="todo.completedAt">· 完成于 {{ formatTime(todo.completedAt) }}</span>
                </p>
              </div>

              <!-- 操作按钮 -->
              <div v-if="isAdmin" class="flex gap-1">
                <UButton
                  color="info"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-pencil"
                  @click="editTodo(todo)"
                />
                <UPopover v-model:open="deleteTodoPopover[todo.id]">
                  <UButton
                    color="error"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-trash-2"
                    @click="deleteTodoPopover[todo.id] = true"
                  />
                  <template #content>
                    <div class="p-4 w-56">
                      <p class="text-sm text-gray-700 mb-3">
                        确定要删除这个待办吗？
                      </p>
                      <div class="flex justify-end gap-2">
                        <UButton size="xs" variant="ghost" @click="deleteTodoPopover[todo.id] = false">
                          取消
                        </UButton>
                        <UButton size="xs" color="error" @click="deleteTodo(todo.id)">
                          删除
                        </UButton>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-8 text-gray-400">
          <UIcon name="i-lucide-clipboard-list" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无待办事项</p>
        </div>
      </UCard>

      <!-- 没有日期时的提示 -->
      <UCard v-else class="rounded-3xl shadow-lg">
        <div class="text-center py-8 text-gray-400">
          <UIcon name="i-lucide-calendar-x" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>请先添加一个日期</p>
        </div>
      </UCard>
    </div>

    <!-- 编辑待办对话框 -->
    <UModal v-model:open="showEditModal" title="编辑待办">
      <template #body>
        <UFormField label="标题" class="mb-3">
          <UInput
            v-model="editingTodo.title"
            placeholder="待办标题"
            icon="i-lucide-type"
          />
        </UFormField>

        <UFormField label="详情" class="mb-3">
          <UTextarea
            v-model="editingTodo.detail"
            placeholder="详细说明..."
            :rows="4"
          />
        </UFormField>

        <UFormField label="优先级">
          <USelect
            v-model="editingTodo.priority"
            :items="priorityOptions"
            placeholder="选择优先级"
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
import type { TodoDay, TodoItem, TodoPriority } from '../../../shared/types/todo'

// 页面元数据
useHead({
  title: '待办事项'
})

// 状态
const todoDays = ref<TodoDay[]>([])
const currentDate = ref<string>('')
const showEditModal = ref(false)
const editingTodo = ref<Partial<TodoItem>>({})
const deleteDatePopover = ref<Record<string, boolean>>({})
const deleteTodoPopover = ref<Record<string, boolean>>({})
const ossUrl = ref<string>('')

// UInputDate 使用的日期对象
const newDateValue = ref<any>(null)
const newDateInputRef = useTemplateRef('newDateInputRef')

// 管理员权限
const { isAdmin } = useAdmin()
const toast = useToast()

// 新待办表单
const newTodo = reactive({
  title: '',
  detail: '',
  priority: 'medium' as TodoPriority
})

// 优先级选项
const priorityOptions = [
  { label: '🔴 高优先级', value: 'high' },
  { label: '🟡 中优先级', value: 'medium' },
  { label: '🟢 低优先级', value: 'low' }
]

// 计算属性：当前选中的日期数据
const currentDay = computed(() => {
  return todoDays.value.find((d: TodoDay) => d.date === currentDate.value)
})

// 计算属性：排序后的待办列表（未完成的在前，按优先级排序）
const sortedTodos = computed(() => {
  if (!currentDay.value) return []
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...currentDay.value.items].sort((a, b) => {
    // 先按完成状态排序
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // 再按优先级排序
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})

// 计算属性：已完成数量
const completedCount = computed(() => {
  return currentDay.value?.items.filter(i => i.completed).length || 0
})

// 计算属性：待完成数量
const pendingCount = computed(() => {
  return currentDay.value?.items.filter(i => !i.completed).length || 0
})

// 从本地存储加载 OSS URL
function loadOssUrl() {
  try {
    const stored = localStorage.getItem('wedding-oss-config')
    if (stored) {
      const parsed = JSON.parse(stored)
      ossUrl.value = parsed.todos || ''
    }
  } catch (error) {
    console.error('加载OSS配置失败:', error)
  }
}

// 加载数据
async function loadData() {
  try {
    loadOssUrl()

    interface TodoApiResponse {
      success: boolean
      data?: { days: TodoDay[] }
      error?: string
    }

    const response = await $fetch<TodoApiResponse>('/api/todos', {
      query: ossUrl.value ? { url: ossUrl.value } : undefined
    })

    if (response.data) {
      todoDays.value = response.data.days || []

      // 默认选中第一个日期
      if (todoDays.value.length > 0 && !currentDate.value) {
        currentDate.value = todoDays.value[0].date
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    toast.add({
      title: '加载失败',
      description: '无法加载待办数据',
      color: 'error'
    })
  }
}

// 保存数据
async function saveData() {
  try {
    interface TodoApiResponse {
      success: boolean
      message?: string
      error?: string
    }

    const response = await $fetch<TodoApiResponse>('/api/todos', {
      method: 'PUT',
      body: {
        days: todoDays.value,
        url: ossUrl.value
      }
    })

    if (!response.success) {
      throw new Error(response.error || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    toast.add({
      title: '保存失败',
      description: '无法保存到云端',
      color: 'error'
    })
  }
}

// 将 DateValue 转换为字符串格式 YYYY-MM-DD
function calendarDateToString(date: any): string {
  if (!date) return ''
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

// 格式化日期显示
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  })
}

// 格式化时间
function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 选择日期
function selectDate(date: string) {
  currentDate.value = date
}

// 添加日期
async function addDate() {
  const dateStr = calendarDateToString(newDateValue.value)
  if (!dateStr) {
    toast.add({
      title: '请选择日期',
      color: 'warning'
    })
    return
  }

  // 检查是否已存在
  if (todoDays.value.some((d: TodoDay) => d.date === dateStr)) {
    toast.add({
      title: '该日期已存在',
      color: 'warning'
    })
    return
  }

  // 添加新日期
  todoDays.value.push({
    date: dateStr,
    items: []
  })

  // 按日期排序
  todoDays.value.sort((a: TodoDay, b: TodoDay) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // 选中新添加的日期
  currentDate.value = dateStr
  newDateValue.value = null

  await saveData()
  toast.add({
    title: '添加成功',
    color: 'success'
  })
}

// 删除日期
async function deleteDate(date: string) {
  const index = todoDays.value.findIndex((d: TodoDay) => d.date === date)
  if (index >= 0) {
    todoDays.value.splice(index, 1)
    deleteDatePopover.value[date] = false

    // 如果删除的是当前选中的日期，切换到第一个
    if (currentDate.value === date && todoDays.value.length > 0) {
      currentDate.value = todoDays.value[0].date
    } else if (todoDays.value.length === 0) {
      currentDate.value = ''
    }

    await saveData()
    toast.add({
      title: '删除成功',
      color: 'success'
    })
  }
}

// 添加待办
async function addTodo() {
  if (!newTodo.title.trim()) {
    toast.add({
      title: '请输入待办标题',
      color: 'warning'
    })
    return
  }

  if (!currentDay.value) return

  const todo: TodoItem = {
    id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: newTodo.title.trim(),
    detail: newTodo.detail.trim() || undefined,
    completed: false,
    priority: newTodo.priority,
    createdAt: new Date().toISOString()
  }

  currentDay.value.items.push(todo)

  // 重置表单
  newTodo.title = ''
  newTodo.detail = ''
  newTodo.priority = 'medium'

  await saveData()
  toast.add({
    title: '添加成功',
    color: 'success'
  })
}

// 切换完成状态
async function toggleTodo(todo: TodoItem) {
  todo.completed = !todo.completed
  todo.completedAt = todo.completed ? new Date().toISOString() : undefined
  await saveData()
}

// 编辑待办
function editTodo(todo: TodoItem) {
  editingTodo.value = { ...todo }
  showEditModal.value = true
}

// 保存编辑
async function saveEdit() {
  if (!editingTodo.value.id || !editingTodo.value.title?.trim()) {
    toast.add({
      title: '请输入待办标题',
      color: 'warning'
    })
    return
  }

  if (!currentDay.value) return

  const index = currentDay.value.items.findIndex((i: TodoItem) => i.id === editingTodo.value.id)
  if (index >= 0) {
    currentDay.value.items[index] = {
      ...currentDay.value.items[index],
      title: editingTodo.value.title.trim(),
      detail: editingTodo.value.detail?.trim() || undefined,
      priority: editingTodo.value.priority as TodoPriority
    }

    await saveData()
    showEditModal.value = false
    toast.add({
      title: '更新成功',
      color: 'success'
    })
  }
}

// 删除待办
async function deleteTodo(id: string) {
  if (!currentDay.value) return

  const index = currentDay.value.items.findIndex((i: TodoItem) => i.id === id)
  if (index >= 0) {
    currentDay.value.items.splice(index, 1)
    deleteTodoPopover.value[id] = false
    await saveData()
    toast.add({
      title: '删除成功',
      color: 'success'
    })
  }
}

// 获取优先级颜色
function getPriorityColor(priority: TodoPriority): string {
  const colorMap: Record<TodoPriority, string> = {
    high: 'error',
    medium: 'warning',
    low: 'success'
  }
  return colorMap[priority] || 'neutral'
}

// 获取优先级标签
function getPriorityLabel(priority: TodoPriority): string {
  const labelMap: Record<TodoPriority, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labelMap[priority] || '中'
}

// 获取待办卡片样式
function getTodoCardClass(todo: TodoItem): string {
  if (todo.completed) {
    return 'bg-gray-50 border border-gray-100'
  }
  const classMap: Record<TodoPriority, string> = {
    high: 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-100',
    medium: 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100',
    low: 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100'
  }
  return classMap[todo.priority] || 'bg-white border border-gray-100'
}

// 初始化
onMounted(() => {
  loadData()
})
</script>
